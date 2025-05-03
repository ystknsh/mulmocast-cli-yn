import "dotenv/config";
import { GraphAI } from "graphai";
import * as agents from "@graphai/agents";
import { fileWriteAgent } from "@graphai/vanilla_node_agents";
import { readTemplatePrompt } from "../utils/file";
import { ScriptingParams } from "../types";

const agentHeader = "\x1b[34m● \x1b[0m\x1b[1mAgent\x1b[0m:\x1b[0m";

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
      update: ":llm.messages",
    },
    userInput: {
      agent: "textInputAgent",
      params: {
        message: "You:",
        required: true,
      },
    },
    llm: {
      agent: "openAIAgent",
      params: {
        model: "gpt-4o",
      },
      inputs: {
        messages: ":messages",
        prompt: ":userInput.text",
      },
    },
    json: {
      agent: "copyAgent",
      inputs: {
        json: ":llm.text.codeBlock().jsonParse()",
        text: ":llm.text.codeBlock()",
      },
    },
    writeJSON: {
      if: ":json.json",
      agent: "fileWriteAgent",
      inputs: {
        file: "${:outdir}/${:fileName}-${@now}.json",
        text: ":json.text",
      },
      console: {
        after: "\n\x1b[32m🎉 Script file generated successfully! Type /bye to exit.\x1b[0m\n",
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
      agent: "copyAgent",
      inputs: {
        text: "\n" + agentHeader + " ${:llm.text}\n",
      },
      params: {
        namedKey: "text",
      },
      console: { after: true },
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

export const createMulmoScriptWithInteractive = async ({ outDirPath, filename, templateName }: Omit<ScriptingParams, "urls">) => {
  const graph = new GraphAI(graphData, { ...agents, fileWriteAgent });

  const prompt = readTemplatePrompt(templateName ?? "seed_interactive");
  graph.injectValue("messages", [
    {
      role: "system",
      content: `${prompt}\n\n${interactiveClarificationPrompt}`,
    },
  ]);
  graph.injectValue("outdir", outDirPath);
  graph.injectValue("fileName", filename);

  console.log(`${agentHeader} Hi! What topic would you like me to generate about?\n`);
  await graph.run();
};
