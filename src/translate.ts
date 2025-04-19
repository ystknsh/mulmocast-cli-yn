import fs from "fs";
import dotenv from "dotenv";
import { GraphAI } from "graphai";
import * as agents from "@graphai/agents";
import { ScriptData, PodcastScript } from "./type";
import { readPodcastScriptFile, getOutputFilePath } from "./utils";

dotenv.config();

const writeTranslatedJson = async (inputs: { jsonData: PodcastScript; name: string }) => {
  const { name, jsonData } = inputs;
  const outputScript = getOutputFilePath(name + "_ja.json");
  const textData: string = JSON.stringify(jsonData, null, 2);
  fs.writeFileSync(outputScript, textData);
  return outputScript;
};

const graph_data = {
  version: 0.5,
  nodes: {
    name: {
      value: "",
    },
    jsonData: {
      value: {},
    },
    translate: {
      agent: "openAIAgent",
      inputs: {
        prompt:
          "このJSONデータに含まれたテキストをすべて日本語に翻訳して、同じJSONフォーマットで返して。ただし、 podcastのタイトル, 'Life is Artificial' は訳さずにそのままで。\n ${:jsonData.toJSON()}",
        response_format: { type: "json_object" },
      },
    },
    writeTranslate: {
      agent: writeTranslatedJson,
      isResult: true,
      inputs: { jsonData: ":translate.text.jsonParse()", name: ":name" },
    },
  },
};

const main = async () => {
  const arg2 = process.argv[2];
  const { podcastData, fileName } = readPodcastScriptFile(arg2, "ERROR: File does not exist " + arg2);

  podcastData.filename = fileName;
  podcastData.script.forEach((scriptData: ScriptData, index: number) => {
    scriptData["key"] = fileName + index;
  });

  const graph = new GraphAI(graph_data, { ...agents });
  graph.injectValue("jsonData", podcastData);
  graph.injectValue("name", fileName);
  const results = await graph.run();
  console.log(results);

  // const voiceFile = await combineFiles(jsonData, name);
  // await addMusic(jsonData, voiceFile, name);
};

main();
