import "dotenv/config";
import fs from "fs";
import { GraphAI, GraphData } from "graphai";
import * as agents from "@graphai/agents";
import { fileWriteAgent } from "@graphai/vanilla_node_agents";
import { browserlessAgent } from "@graphai/browserless_agent";
import validateMulmoScriptAgent from "../agents/validate_mulmo_script_agent";
import { getTemplateFilePath } from "../utils/file";
import { MulmoScriptTemplateMethods } from "../methods/mulmo_script_template";
import { mulmoScriptTemplateSchema, urlsSchema } from "../types/schema";

const graphData: GraphData = {
  version: 0.5,
  // Execute sequentially because the free version of browserless API doesn't support concurrent execution.
  concurrency: 1,
  nodes: {
    urls: {
      value: [],
    },
    prompt: {
      value: "",
    },
    outdir: {
      value: "",
    },
    fileName: {
      value: "",
    },
    // get the text content of the urls
    fetchResults: {
      agent: "mapAgent",
      inputs: {
        rows: ":urls",
      },
      params: {
        compositeResult: true,
      },
      graph: {
        nodes: {
          fetcher: {
            agent: "browserlessAgent",
            inputs: {
              url: ":row",
              text_content: true,
            },
            params: {
              throwError: true,
            },
          },
          copyAgent: {
            agent: "copyAgent",
            inputs: {
              text: "{ url: ${:row}, text: ${:fetcher.text} }",
            },
            params: {
              namedKey: "text",
            },
            isResult: true,
          },
        },
      },
    },
    // join the text content
    sourceText: {
      agent: "arrayJoinAgent",
      inputs: {
        array: ":fetchResults.copyAgent",
      },
      params: {
        separator: ",",
      },
    },
    // generate the mulmo script
    mulmoScript: {
      agent: "nestedAgent",
      inputs: {
        sourceText: ":sourceText",
        prompt: ":prompt",
      },
      graph: {
        loop: {
          // If the script is not valid and the counter is less than 3, continue the loop
          while: ":continue",
        },
        nodes: {
          counter: {
            value: 0,
            update: ":counter.add(1)",
          },
          openAIAgent: {
            agent: "openAIAgent",
            inputs: {
              model: "gpt-4o",
              system: ":prompt",
              prompt: ":sourceText.text",
            },
          },
          validateMulmoScriptAgent: {
            agent: "validateMulmoScriptAgent",
            inputs: {
              text: ":openAIAgent.text.codeBlock()",
            },
            isResult: true,
          },
          continue: {
            agent: ({ isValid, counter }) => {
              return !isValid && counter < 3;
            },
            inputs: {
              isValid: ":validateMulmoScriptAgent.isValid",
              counter: ":counter",
            },
          },
        },
      },
    },
    writeJSON: {
      if: ":mulmoScript.validateMulmoScriptAgent.isValid",
      agent: "fileWriteAgent",
      inputs: {
        file: "${:outdir}/${:fileName}-${@now}.json",
        text: ":mulmoScript.validateMulmoScriptAgent.data.toJSON()",
      },
      isResult: true,
    },
  },
};

export const createMulmoScriptFromUrl = async ({
  urls,
  template_name,
  outdir,
  filename,
}: {
  urls: string[];
  outdir: string;
  template_name?: string;
  filename: string;
}) => {
  const parsedUrls = urlsSchema.parse(urls);

  const graph = new GraphAI(graphData, {
    ...agents,
    browserlessAgent,
    validateMulmoScriptAgent,
    fileWriteAgent,
  });

  graph.injectValue("urls", parsedUrls);

  const templatePath = getTemplateFilePath(template_name ?? "seed_materials");
  const scriptData = fs.readFileSync(templatePath, "utf-8");
  const template = mulmoScriptTemplateSchema.parse(JSON.parse(scriptData));
  const prompt = MulmoScriptTemplateMethods.getSystemPrompt(template);

  graph.injectValue("prompt", prompt);
  graph.injectValue("outdir", outdir);
  graph.injectValue("fileName", filename);

  await graph.run();
};
