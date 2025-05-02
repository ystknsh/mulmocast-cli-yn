import "dotenv/config";
import { GraphAI, GraphData } from "graphai";
import * as agents from "@graphai/agents";
import { prompts } from "../agents/prompts_data";
import { fileWriteAgent } from "@graphai/vanilla_node_agents";
import { browserlessAgent } from "@graphai/browserless_agent";
import validateMulmoScriptAgent from "../agents/validate_mulmo_script_agent";
import { z } from "zod";

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
    // get the text content of the urls
    fetchResults: {
      agent: "mapAgent",
      inputs: {
        rows: ":urls"
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
          }
        },
      }
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
            update: ":counter.add(1)"
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
        }
      },
    },
    writeJSON: {
      if: ":mulmoScript.validateMulmoScriptAgent.isValid",
      agent: "fileWriteAgent",
      inputs: {
        file: "./output/script-${@now}.json",
        text: ":mulmoScript.validateMulmoScriptAgent.data.toJSON()",
      },
      isResult: true,
    },
  }
};


const createMulmoScriptFromUrl = async (urls: string[]) => {
  const urlsSchema = z.array(z.string().url({ message: "Invalid URL format" }));
  const parsedUrls = urlsSchema.parse(urls);

  const graph = new GraphAI(graphData, {
    ...agents,
    browserlessAgent,
    validateMulmoScriptAgent,
    fileWriteAgent,
  });

  graph.injectValue("urls", parsedUrls);
  // TODO: Allow injecting a custom prompt from parameters if provided, otherwise use the default
  graph.injectValue("prompt", prompts.prompt_seed_from_materials);

  await graph.run();
}


// temporary main function
const main = async () => {
  const urlsFromArgs = process.argv.slice(2);

  if (urlsFromArgs.length === 0) {
    console.error("Usage: yarn run seed_from_url <url1> [url2] ...");
    process.exit(1);
  }

  try {
    await createMulmoScriptFromUrl(urlsFromArgs);
  } catch (error) {
    console.error("Error:", error);
    process.exitCode = 1;
  }
};

main();
