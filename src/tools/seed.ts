import "dotenv/config";
import { GraphAI } from "graphai";
import * as agents from "@graphai/agents";
import { fileWriteAgent } from "@graphai/vanilla_node_agents";
import { readTemplatePrompt } from "../utils/file";
import { ScriptingParams } from "../types";

const graphData = {
  version: 0.5,
  loop: {
    while: true,
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
      console: {
        after: { message: ".text" },
        // after: true,
      },
    },
    json: {
      agent: "copyAgent",
      inputs: {
        json: ":llm.text.codeBlock().jsonParse()",
        text: ":llm.text.codeBlock()",
      },
      console: { after: true },
    },
    writeJSON: {
      if: ":json.json",
      agent: "fileWriteAgent",
      inputs: {
        file: "${:outdir}/${:fileName}-${@now}.json",
        text: ":json.text",
      },
      console: { after: true, before: true },
    },
  },
};

export const createMulmoScriptWithInteractive = async ({
  outDirPath,
  filename,
  templateName,
}: Omit<ScriptingParams, "urls">) => {
  const graph = new GraphAI(graphData, { ...agents, fileWriteAgent });

  const prompt = readTemplatePrompt(templateName ?? "seed_interactive");
  graph.injectValue("messages", [
    {
      role: "system",
      content: prompt,
    },
  ]);
  graph.injectValue("outdir", outDirPath);
  graph.injectValue("fileName", filename);

  await graph.run();
};
