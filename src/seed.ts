import "dotenv/config";
import { GraphAI } from "graphai";
import * as agents from "@graphai/agents";
import { prompts } from "./agents/prompts_data";

const graphData = {
  version: 0.5,
  loop: {
    while: true,
  },
  nodes: {
    messages: {
      value: [{
        role: "system",
        content: prompts.prompt,
      }],
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
        json: ":llm.text.codeBlock().jsonParse()"
      },
      console: { after: true},
    },
  },
};
const main = async () => {
  const graph = new GraphAI(graphData, { ...agents });

  const results = await graph.run();
};
main();

// 元ネタがある場合
// 元ネタがない場合(テキストの場合でもmulmoの場合でもよい）

// 現状報告
// 指示
// 作成
