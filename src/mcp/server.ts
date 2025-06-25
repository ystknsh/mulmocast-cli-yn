#!/usr/bin/env node

import "dotenv/config";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, CallToolRequest, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import fs from "fs";
import path from "path";
import { audio, images, movie, captions, pdf } from "../actions/index.js";
import { initializeContext, runTranslateIfNeeded } from "../cli/helpers.js";
import { outDirName } from "../utils/const.js";
import { resolveDirPath, mkdir } from "../utils/file.js";
import { mulmoScriptSchema } from "../types/schema.js";
import type { MulmoScript } from "../types/type.js";

const server = new Server(
  {
    name: "mulmocast-mcp",
    version: "0.1.0",
  },
  {
    capabilities: {
      tools: {},
    },
  },
);

// Complete MulmoScript JSON Schema (generated from Zod schema)
const MULMO_SCRIPT_JSON_SCHEMA = {
  type: "object",
  properties: {
    $mulmocast: {
      type: "object",
      properties: {
        version: {
          type: "string",
          const: "1.0",
        },
        credit: {
          type: "string",
          const: "closing",
        },
      },
      required: ["version"],
      additionalProperties: false,
    },
    canvasSize: {
      type: "object",
      properties: {
        width: { type: "number" },
        height: { type: "number" },
      },
      required: ["width", "height"],
      additionalProperties: false,
      default: { width: 1280, height: 720 },
    },
    speechParams: {
      type: "object",
      properties: {
        provider: {
          type: "string",
          enum: ["openai", "nijivoice", "google", "elevenlabs"],
          default: "openai",
        },
        speakers: {
          type: "object",
          additionalProperties: {
            type: "object",
            properties: {
              displayName: {
                type: "object",
                additionalProperties: { type: "string" },
              },
              voiceId: { type: "string" },
              speechOptions: {
                type: "object",
                properties: {
                  speed: { type: "number" },
                  instruction: { type: "string" },
                },
                additionalProperties: false,
              },
              provider: {
                type: "string",
                enum: ["openai", "nijivoice", "google", "elevenlabs"],
              },
            },
            required: ["voiceId"],
            additionalProperties: false,
          },
        },
      },
      required: ["speakers"],
      additionalProperties: false,
    },
    imageParams: {
      type: "object",
      properties: {
        model: { type: "string" },
        style: { type: "string" },
        moderation: { type: "string" },
        provider: {
          type: "string",
          enum: ["openai", "google"],
          default: "openai",
        },
      },
      additionalProperties: false,
    },
    movieParams: {
      type: "object",
      properties: {
        provider: {
          type: "string",
          enum: ["openai", "google", "replicate"],
          default: "google",
        },
        model: { type: "string" },
        transition: {
          type: "object",
          properties: {
            type: {
              type: "string",
              enum: ["fade", "slideout_left"],
            },
            duration: {
              type: "number",
              minimum: 0,
              maximum: 2,
              default: 0.3,
            },
          },
          required: ["type"],
          additionalProperties: false,
        },
        fillOption: {
          type: "object",
          properties: {
            style: {
              type: "string",
              enum: ["aspectFit", "aspectFill"],
              default: "aspectFit",
            },
          },
          additionalProperties: false,
        },
      },
      additionalProperties: false,
    },
    htmlImageParams: {
      type: "object",
      properties: {
        model: { type: "string" },
        provider: {
          type: "string",
          enum: ["openai", "anthropic"],
          default: "openai",
        },
      },
      additionalProperties: false,
    },
    textSlideParams: {
      type: "object",
      properties: {
        cssStyles: {
          anyOf: [
            { type: "string" },
            {
              type: "array",
              items: { type: "string" },
            },
          ],
        },
      },
      required: ["cssStyles"],
      additionalProperties: false,
    },
    captionParams: {
      type: "object",
      properties: {
        lang: { type: "string" },
        styles: {
          type: "array",
          items: { type: "string" },
          default: [],
        },
      },
      additionalProperties: false,
    },
    audioParams: {
      type: "object",
      properties: {
        padding: { type: "number", default: 0.3 },
        introPadding: { type: "number", default: 1 },
        closingPadding: { type: "number", default: 0.8 },
        outroPadding: { type: "number", default: 1 },
        bgmVolume: { type: "number", default: 0.2 },
        audioVolume: { type: "number", default: 1 },
      },
      additionalProperties: false,
    },
    title: { type: "string" },
    description: { type: "string" },
    references: {
      type: "array",
      items: {
        type: "object",
        properties: {
          url: { type: "string", format: "uri" },
          title: { type: "string" },
          description: { type: "string" },
          type: {
            type: "string",
            enum: ["article", "paper", "image", "video", "audio"],
            default: "article",
          },
        },
        required: ["url"],
        additionalProperties: false,
      },
    },
    lang: { type: "string" },
    beats: {
      type: "array",
      items: {
        type: "object",
        properties: {
          speaker: { type: "string", default: "Presenter" },
          text: { type: "string", default: "" },
          id: { type: "string" },
          description: { type: "string" },
          image: {
            anyOf: [
              {
                type: "object",
                properties: {
                  type: { type: "string", const: "markdown" },
                  markdown: {
                    anyOf: [{ type: "string" }, { type: "array", items: { type: "string" } }],
                  },
                },
                required: ["type", "markdown"],
                additionalProperties: false,
              },
              {
                type: "object",
                properties: {
                  type: { type: "string", const: "textSlide" },
                  slide: {
                    type: "object",
                    properties: {
                      title: { type: "string" },
                      subtitle: { type: "string" },
                      bullets: {
                        type: "array",
                        items: { type: "string" },
                      },
                    },
                    required: ["title"],
                    additionalProperties: false,
                  },
                },
                required: ["type", "slide"],
                additionalProperties: false,
              },
            ],
          },
          audio: {
            type: "object",
            properties: {
              type: { type: "string", const: "audio" },
              source: {
                anyOf: [
                  {
                    type: "object",
                    properties: {
                      kind: { type: "string", const: "url" },
                      url: { type: "string", format: "uri" },
                    },
                    required: ["kind", "url"],
                    additionalProperties: false,
                  },
                  {
                    type: "object",
                    properties: {
                      kind: { type: "string", const: "path" },
                      path: { type: "string" },
                    },
                    required: ["kind", "path"],
                    additionalProperties: false,
                  },
                ],
              },
            },
            required: ["type", "source"],
            additionalProperties: false,
          },
          duration: { type: "number" },
          imagePrompt: { type: "string" },
          moviePrompt: { type: "string" },
        },
        additionalProperties: false,
      },
      minItems: 1,
    },
    imagePath: { type: "string" },
    __test_invalid__: { type: "boolean" },
  },
  required: ["$mulmocast", "beats"],
  additionalProperties: false,
};

// Helper function to save MulmoScript content to output directory
const saveMulmoScriptToOutput = async (mulmoScript: MulmoScript, basedir?: string, outdir?: string): Promise<string> => {
  const baseDirPath = process.cwd();
  const outputDirPath = path.resolve(baseDirPath, outdir ?? outDirName);

  // Create timestamp-based filename similar to __clipboard handling
  const now = new Date();
  const pad = (n: number) => n.toString().padStart(2, "0");
  const fileName = `mcp_script_${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;

  // Ensure output directory exists
  mkdir(outputDirPath);

  // Save MulmoScript to file
  const filePath = resolveDirPath(outputDirPath, `${fileName}.json`);
  fs.writeFileSync(filePath, JSON.stringify(mulmoScript, null, 2), "utf8");

  return filePath;
};

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "generate",
        description: "Generate movie or PDF from MulmoScript content",
        inputSchema: {
          type: "object",
          properties: {
            cmd: {
              type: "string",
              enum: ["movie", "pdf"],
              description: "Command to execute: 'movie' to generate video, 'pdf' to generate PDF",
            },
            mulmoScript: MULMO_SCRIPT_JSON_SCHEMA,
            options: {
              type: "object",
              description: "Optional generation parameters",
              properties: {
                basedir: { type: "string", description: "Base directory path" },
                outdir: { type: "string", description: "Output directory path" },
                imagedir: { type: "string", description: "Image directory path" },
                audiodir: { type: "string", description: "Audio directory path" },
                pdfMode: { type: "string", enum: ["simple", "detailed"], description: "PDF generation mode (for PDF only)" },
                pdfSize: { type: "string", enum: ["A4", "Letter", "Legal"], description: "PDF page size (for PDF only)" },
                lang: { type: "string", description: "Language for translation" },
                caption: { type: "string", description: "Caption language" },
                force: { type: "boolean", description: "Force regeneration" },
                verbose: { type: "boolean", description: "Enable verbose logging" },
              },
              additionalProperties: false,
            },
          },
          required: ["cmd", "mulmoScript"],
          additionalProperties: false,
        },
      },
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request: CallToolRequest) => {
  const { name, arguments: args } = request.params;

  try {
    if (name !== "generate") {
      throw new Error(`Unknown tool: ${name}`);
    }

    const {
      cmd,
      mulmoScript,
      options = {},
    } = args as {
      cmd: "movie" | "pdf";
      mulmoScript: MulmoScript;
      options?: {
        basedir?: string;
        outdir?: string;
        imagedir?: string;
        audiodir?: string;
        pdfMode?: string;
        pdfSize?: string;
        lang?: string;
        caption?: string;
        force?: boolean;
        verbose?: boolean;
      };
    };

    // Validate MulmoScript schema
    const validatedScript = mulmoScriptSchema.parse(mulmoScript);

    // Save MulmoScript to output directory
    const filePath = await saveMulmoScriptToOutput(validatedScript, options.basedir, options.outdir);

    // Create argv-like object for CLI compatibility
    const argv = {
      file: filePath,
      b: options.basedir,
      o: options.outdir,
      i: options.imagedir,
      a: options.audiodir,
      l: options.lang,
      c: options.caption,
      f: options.force || false,
      v: options.verbose || false,
      pdf_mode: options.pdfMode || "simple",
      pdf_size: options.pdfSize || "A4",
      _: [],
      $0: "mcp-server",
    };

    // Initialize context using the saved file
    const context = await initializeContext(argv);
    if (!context) {
      throw new Error("Failed to initialize context from MulmoScript");
    }

    // Run translation if needed
    await runTranslateIfNeeded(context, argv);

    // Execute the requested command
    switch (cmd) {
      case "movie":
        // Generate movie (audio + images + captions + movie)
        await audio(context).then(images).then(captions).then(movie);
        return {
          content: [
            {
              type: "text",
              text: `Movie generated successfully from MulmoScript. Output saved to: ${context.fileDirs.outDirPath}`,
            },
          ],
        };

      case "pdf":
        // Generate images first, then PDF
        await images(context);
        await pdf(context, options.pdfMode || "simple", options.pdfSize || "A4");
        return {
          content: [
            {
              type: "text",
              text: `PDF generated successfully from MulmoScript. Output saved to: ${context.fileDirs.outDirPath}`,
            },
          ],
        };

      default:
        throw new Error(`Unknown command: ${cmd}. Supported commands: movie, pdf`);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      content: [
        {
          type: "text",
          text: `Error: ${errorMessage}`,
        },
      ],
      isError: true,
    };
  }
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("MulmoCast MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Failed to start MCP server:", error);
  process.exit(1);
});
