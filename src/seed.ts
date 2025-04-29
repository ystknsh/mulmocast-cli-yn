import "dotenv/config";
import { GraphAI } from "graphai";
import * as agents from "@graphai/agents";
import { prompts } from "./agents/prompts_data";
import { fileWriteAgent } from "@graphai/vanilla_node_agents";

const graphData = {
  version: 0.5,
  loop: {
    while: true,
  },
  nodes: {
    fileName: {
      update: ":fileName",
    },
    messages: {
      value: [
        {
          role: "system",
          content: prompts.prompt_seed,
        },
      ],
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
        file: "./tmp/${:fileName}-${@now}.json",
        text: ":json.text",
      },
      console: { after: true, before: true },
    },
  },
};
const main = async () => {
  const arg2 = process.argv[2];

  const graph = new GraphAI(graphData, { ...agents, fileWriteAgent });
  graph.injectValue("fileName", arg2);
  await graph.run();
};
main();

// 元ネタがある場合
// 元ネタがない場合(テキストの場合でもmulmoの場合でもよい）

// 現状報告
// 指示
// 作成
