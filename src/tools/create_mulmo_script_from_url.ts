import "dotenv/config";
import { GraphAI, GraphData } from "graphai";
import { openAIAgent } from "@graphai/openai_agent";
import * as agents from "@graphai/vanilla";
import { fileWriteAgent } from "@graphai/vanilla_node_agents";
import { browserlessAgent } from "@graphai/browserless_agent";
import validateSchemaAgent from "../agents/validate_schema_agent.js";
import { readTemplatePrompt, mkdir, writingMessage } from "../utils/file.js";
import { browserlessCacheGenerator } from "../utils/filters.js";
import { mulmoScriptSchema, urlsSchema } from "../types/schema.js";
import { ScriptingParams } from "../types/index.js";
import { cliLoadingPlugin } from "../utils/plugins.js";
import { graphDataScriptFromUrlPrompt } from "../utils/prompt.js";

const { default: __, ...vanillaAgents } = agents;
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
          },
          copyAgent: {
            agent: "copyAgent",
            inputs: {
              text: '{ url: "${:row}", text: "${:fetcher.text}" }',
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
              prompt: graphDataScriptFromUrlPrompt("${:sourceText.text}"),
            },
          },
          validateSchemaAgent: {
            agent: "validateSchemaAgent",
            inputs: {
              text: ":openAIAgent.text.codeBlock()",
              schema: mulmoScriptSchema,
            },
            isResult: true,
          },
          continue: {
            agent: ({ isValid, counter }) => {
              return !isValid && counter < 3;
            },
            inputs: {
              isValid: ":validateSchemaAgent.isValid",
              counter: ":counter",
            },
          },
        },
      },
    },
    writeJSON: {
      if: ":mulmoScript.validateSchemaAgent.isValid",
      agent: "fileWriteAgent",
      inputs: {
        file: "${:outdir}/${:fileName}-${@now}.json",
        text: ":mulmoScript.validateSchemaAgent.data.toJSON()",
      },
      isResult: true,
    },
  },
};

export const createMulmoScriptFromUrl = async ({ urls, templateName, outDirPath, filename, cacheDirPath }: ScriptingParams) => {
  mkdir(outDirPath);
  mkdir(cacheDirPath);
  const parsedUrls = urlsSchema.parse(urls);

  const browserlessCache = browserlessCacheGenerator(cacheDirPath);
  const agentFilters = [
    {
      name: "browserlessCache",
      agent: browserlessCache,
      nodeIds: ["fetcher"],
    },
  ];

  const graph = new GraphAI(
    graphData,
    {
      ...vanillaAgents,
      openAIAgent,
      browserlessAgent,
      validateSchemaAgent,
      fileWriteAgent,
    },
    { agentFilters },
  );

  graph.injectValue("urls", parsedUrls);
  graph.injectValue("prompt", readTemplatePrompt(templateName));
  graph.injectValue("outdir", outDirPath);
  graph.injectValue("fileName", filename);
  graph.registerCallback(cliLoadingPlugin({ nodeId: "mulmoScript", message: "Generating script..." }));

  const result = await graph.run<{ path: string }>();
  writingMessage(result?.writeJSON?.path ?? "");
};
