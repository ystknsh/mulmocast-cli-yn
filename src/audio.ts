import "dotenv/config";
import fs from "fs";
import { GraphAI, GraphData } from "graphai";
import * as agents from "@graphai/agents";
import ttsNijivoiceAgent from "./agents/tts_nijivoice_agent";
import addBGMAgent from "./agents/add_bgm_agent";
import combineAudioFilesAgent from "./agents/combine_audio_files_agent";
import ttsOpenaiAgent from "./agents/tts_openai_agent";
import { pathUtilsAgent, fileWriteAgent } from "@graphai/vanilla_node_agents";

import { MulmoBeat, SpeakerDictonary, text2speechParams } from "./type";
import { readMulmoScriptFile, getOutputFilePath, getScratchpadFilePath } from "./utils/file";
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
      agent: (namedInputs: { beat: MulmoBeat; speakers: SpeakerDictonary; speechParams: text2speechParams }) => {
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
    script: {
      value: {},
    },
    map: {
      agent: "mapAgent",
      inputs: { rows: ":script.beats", script: ":script" },
      graph: graph_tts,
    },
    combineFiles: {
      agent: "combineAudioFilesAgent",
      inputs: {
        map: ":map",
        script: ":script",
        combinedFileName: "./output/${:script.filename}.mp3",
      },
      isResult: true,
    },
    fileWrite: {
      agent: "fileWriteAgent",
      inputs: {
        file: "./output/${:script.filename}.json",
        text: ":combineFiles.script.toJSON()",
      },
      params: { baseDir: __dirname + "/../" },
    },
    addBGM: {
      agent: "addBGMAgent",
      params: {
        musicFileName: process.env.PATH_BGM ?? "./music/StarsBeyondEx.mp3",
      },
      inputs: {
        voiceFile: ":combineFiles.fileName",
        outFileName: "./output/${:script.filename}_bgm.mp3",
        script: ":script",
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
        title: "\n${:script.title}\n\n${:script.description}\nReference: ${:script.reference}\n",
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
  const readData = readMulmoScriptFile(arg2, "ERROR: File does not exist " + arg2)!;
  const { mulmoData, fileName } = readData;

  mulmoData.filename = fileName;
  mulmoData.beats.forEach((mulmoBeat: MulmoBeat, index: number) => {
    mulmoBeat.filename = mulmoData.filename + index;
    // HACK: In case, the operator skip the "Split" phase.
    /*
    if (!mulmoBeat.ttsText) {
      mulmoBeat.ttsText = mulmoBeat.text;
    }
    */
  });

  // Check if any script changes
  const outputFilePath = getOutputFilePath(mulmoData.filename + ".json");
  const { mulmoData: prevScript } = readMulmoScriptFile(outputFilePath) ?? {};
  if (prevScript) {
    console.log("found output script", prevScript.filename);
    mulmoData.beats.forEach((mulmoBeat: MulmoBeat, index: number) => {
      const prevText = prevScript.beats[index]?.text ?? "";
      if (mulmoBeat.text !== prevText) {
        const scratchpadFilePath = getScratchpadFilePath(mulmoBeat.filename + ".mp3");
        if (fs.existsSync(scratchpadFilePath)) {
          console.log("deleting", mulmoBeat.filename);
          fs.unlinkSync(scratchpadFilePath);
        }
      }
    });
  }

  graph_data.concurrency = mulmoData.speechParams?.provider === "nijivoice" ? 1 : 8;

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
  graph.injectValue("script", mulmoData);
  const results = await graph.run();
  const result = results.combineFiles as { fileName: string };
  console.log(`Generated: ${result.fileName}`);
};

main();
