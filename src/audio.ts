import "dotenv/config";
// import fs from "fs";
import { GraphAI, GraphData } from "graphai";
import * as agents from "@graphai/agents";
import ttsNijivoiceAgent from "./agents/tts_nijivoice_agent";
import addBGMAgent from "./agents/add_bgm_agent";
import combineAudioFilesAgent from "./agents/combine_audio_files_agent";
import ttsOpenaiAgent from "./agents/tts_openai_agent";
import { pathUtilsAgent, fileWriteAgent } from "@graphai/vanilla_node_agents";

import { createOrUpdateStudioData } from "./utils/preprocess";
import { MulmoBeat, SpeakerDictonary, Text2speechParams } from "./type";
import { fileCacheAgentFilter } from "./utils/filters";
// const rion_takanashi_voice = "b9277ce3-ba1c-4f6f-9a65-c05ca102ded0"; // たかなし りおん
// const ben_carter_voice = "bc06c63f-fef6-43b6-92f7-67f919bd5dae"; // ベン・カーター

const graph_tts: GraphData = {
  nodes: {
    path: {
      agent: "pathUtilsAgent",
      params: {
        method: "resolve",
      },
      inputs: {
        dirs: ["scratchpad", "${:row.filename}.mp3"],
      },
    },
    preprocessor: {
      agent: (namedInputs: { beat: MulmoBeat; speakers: SpeakerDictonary; speechParams: Text2speechParams }) => {
        const { beat, speakers, speechParams } = namedInputs;
        return {
          voiceId: speakers[beat.speaker].voiceId,
          speechParams: { ...speechParams, ...beat.speechParams },
        };
      },
      inputs: {
        beat: ":row",
        speechParams: ":script.speechParams",
        speakers: ":script.speechParams.speakers",
      },
    },
    ttsAgent: {
      agent: (namedInputs: { provider: string }) => {
        if (namedInputs.provider === "nijivoice") {
          return "ttsNijivoiceAgent";
        }
        return "ttsOpenaiAgent";
      },
      inputs: {
        provider: ":script.speechParams.provider",
      },
    },
    tts: {
      agent: ":ttsAgent",
      inputs: {
        // text: ":row.ttsText",
        text: ":row.text",
        file: ":path.path",
      },
      params: {
        throwError: true,
        voice: ":preprocessor.voiceId",
        speed: ":preprocessor.speechParams.speed",
        instructions: ":preprocessor.speechParams.instructions",
      },
    },
  },
};

const graph_data: GraphData = {
  version: 0.5,
  concurrency: 8,
  nodes: {
    studio: {
      value: {},
    },
    map: {
      agent: "mapAgent",
      inputs: { rows: ":studio.beats", script: ":studio.script" },
      graph: graph_tts,
    },
    combineFiles: {
      agent: "combineAudioFilesAgent",
      inputs: {
        map: ":map",
        studio: ":studio",
        combinedFileName: "./output/${:studio.filename}.mp3",
      },
      isResult: true,
    },
    fileWrite: {
      agent: "fileWriteAgent",
      inputs: {
        file: "./output/${:studio.filename}_studio.json",
        text: ":combineFiles.studio.toJSON()",
      },
      params: { baseDir: __dirname + "/../" },
    },
    addBGM: {
      agent: "addBGMAgent",
      params: {
        musicFileName: process.env.PATH_BGM ?? "./music/StarsBeyondEx.mp3",
      },
      console: {
        before: true,
      },
      inputs: {
        voiceFile: ":combineFiles.fileName",
        outFileName: "./output/${:studio.filename}_bgm.mp3",
        script: ":studio.script",
      },
      isResult: true,
    },
    title: {
      agent: "copyAgent",
      params: {
        namedKey: "title",
      },
      console: {
        after: true,
      },
      inputs: {
        title: "\n${:studio.script.title}\n\n${:studio.script.description}\nReference: ${:studio.script.reference}\n",
        waitFor: ":addBGM",
      },
    },
  },
};

const agentFilters = [
  {
    name: "fileCacheAgentFilter",
    agent: fileCacheAgentFilter,
    nodeIds: ["tts"],
  },
];

const main = async () => {
  const arg2 = process.argv[2];
  const studio = createOrUpdateStudioData(arg2);

  graph_data.concurrency = studio.script.speechParams?.provider === "nijivoice" ? 1 : 8;

  const graph = new GraphAI(
    graph_data,
    {
      ...agents,
      pathUtilsAgent,
      fileWriteAgent,
      ttsOpenaiAgent,
      ttsNijivoiceAgent,
      addBGMAgent,
      combineAudioFilesAgent,
    },
    { agentFilters },
  );
  graph.injectValue("studio", studio);
  const results = await graph.run();
  const result = results.combineFiles as { fileName: string };
  console.log(`Generated: ${result.fileName}`);
};

main();
