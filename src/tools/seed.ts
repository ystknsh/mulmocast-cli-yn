import "dotenv/config";
import { GraphAI } from "graphai";
import { textInputAgent } from "@graphai/input_agents";

import { openAIAgent } from "@graphai/openai_agent";
import * as vanilla from "@graphai/vanilla";

import { fileWriteAgent } from "@graphai/vanilla_node_agents";
import { readTemplatePrompt, mkdir } from "../utils/file";
import { browserlessCacheGenerator } from "../utils/filters";
import { ScriptingParams } from "../types";
import { browserlessAgent } from "@graphai/browserless_agent";
import validateMulmoScriptAgent from "../agents/validate_mulmo_script_agent";

const agentHeader = "\x1b[34m● \x1b[0m\x1b[1mAgent\x1b[0m:\x1b[0m";

const graphDataForScraping = {
  version: 0.5,
  nodes: {
    urls: {
      value: [],
    },
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
    sourceText: {
      agent: "arrayJoinAgent",
      inputs: {
        array: ":fetchResults.copyAgent",
      },
      params: {
        separator: ",",
      },
      isResult: true,
    },
  },
};

const graphData = {
  version: 0.5,
  loop: {
    while: ":continue",
  },
  nodes: {
    fileName: {
      update: ":fileName",
    },
    outdir: {
      update: ":outdir",
    },
    messages: {
      value: [],
      update: ":reply.llmAgent.messages",
    },
    userInput: {
      agent: "textInputAgent",
      params: {
        message: "You:",
        required: true,
      },
    },
    reply: {
      agent: "nestedAgent",
      inputs: {
        messages: ":messages",
        prompt: ":userInput.text",
      },
      graph: {
        loop: {
          while: ":continue",
        },
        nodes: {
          counter: {
            value: 0,
            update: ":counter.add(1)",
          },
          llmAgent: {
            agent: "openAIAgent",
            params: {
              model: "gpt-4o",
            },
            inputs: {
              messages: ":messages",
              prompt: ":prompt",
            },
            isResult: true,
          },
          validateMulmoScriptAgent: {
            agent: "validateMulmoScriptAgent",
            inputs: {
              text: ":llmAgent.text.codeBlock()",
            },
          },
          continue: {
            agent: ({ codeBlock, isValid, counter }: { codeBlock: string | undefined; isValid: boolean; counter: number }) => {
              if (counter >= 3) {
                console.error("\n" + agentHeader + " \x1b[31mFailed to generate a valid script. Please try again.\n");
                return false;
              }
              return !!codeBlock && !isValid;
            },
            inputs: {
              counter: ":counter",
              codeBlock: ":llmAgent.text.codeBlock()",
              isValid: ":validateMulmoScriptAgent.isValid",
            },
          },
        },
      },
    },
    json: {
      agent: "copyAgent",
      inputs: {
        json: ":reply.llmAgent.text.codeBlock().jsonParse()",
        text: ":reply.llmAgent.text.codeBlock()",
      },
    },
    writeJSON: {
      if: ":json.json",
      agent: "fileWriteAgent",
      inputs: {
        file: "${:outdir}/${:fileName}-${@now}.json",
        text: ":json.text",
      },
    },
    writeLog: {
      agent: "consoleAgent",
      inputs: {
        text: "\n\x1b[32m🎉 Script file generated successfully! Type /bye to exit.\x1b[0m\nwriting: ${:writeJSON.path}",
        waiting: ":writeJSON",
      },
    },
    shouldResponse: {
      agent: "compareAgent",
      inputs: {
        array: [[":json.json", "==", undefined], "&&", [":userInput.text", "!=", "/bye"]],
      },
    },
    agentResponse: {
      if: ":shouldResponse.result",
      agent: "consoleAgent",
      inputs: {
        text: "\n" + agentHeader + " ${:reply.llmAgent.text}\n",
      },
    },
    checkInput: {
      agent: "compareAgent",
      inputs: { array: [":userInput.text", "!=", "/bye"] },
    },
    continue: {
      value: true,
      update: ":checkInput.result",
    },
  },
};

const interactiveClarificationPrompt = `If there are any unclear points, be sure to ask the user questions and clarify them before generating the script.`;

const scrapeWebContent = async (urls: string[], cacheDirPath: string) => {
  mkdir(cacheDirPath);
  console.log(`${agentHeader} Scraping ${urls.length} URLs...\n`);

  const browserlessCache = browserlessCacheGenerator(cacheDirPath);
  const agentFilters = [
    {
      name: "browserlessCache",
      agent: browserlessCache,
      nodeIds: ["fetcher"],
    },
  ];

  const graph = new GraphAI(graphDataForScraping, { ...vanilla, openAIAgent, textInputAgent, fileWriteAgent, browserlessAgent }, { agentFilters });
  graph.injectValue("urls", urls);

  const result = (await graph.run()) as { sourceText: { text: string } };
  if (!result?.sourceText?.text) {
    return "";
  }
  const prefixPrompt = "Here is the web content that can be used as reference material for the script:";
  return `\n\n${prefixPrompt}\n${result?.sourceText.text}`;
};

export const createMulmoScriptWithInteractive = async ({ outDirPath, cacheDirPath, filename, templateName, urls }: ScriptingParams) => {
  mkdir(outDirPath);
  // if urls is not empty, scrape web content and reference it in the prompt
  const webContentPrompt = urls.length > 0 ? await scrapeWebContent(urls, cacheDirPath) : "";

  const graph = new GraphAI(graphData, { ...vanilla, openAIAgent, textInputAgent, fileWriteAgent, validateMulmoScriptAgent });

  const prompt = readTemplatePrompt(templateName);
  graph.injectValue("messages", [
    {
      role: "system",
      content: `${prompt}\n\n${interactiveClarificationPrompt}${webContentPrompt}`,
    },
  ]);
  graph.injectValue("outdir", outDirPath);
  graph.injectValue("fileName", filename);

  console.log(`${agentHeader} Hi! What topic would you like me to generate about?\n`);
  await graph.run();
};
