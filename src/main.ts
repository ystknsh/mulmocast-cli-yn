import "dotenv/config";
import fsPromise from "fs/promises";
import fs from "fs";
import { GraphAI, AgentFilterFunction, GraphData } from "graphai";
import * as agents from "@graphai/agents";
import ttsNijivoiceAgent from "./agents/tts_nijivoice_agent";
import addBGMAgent from "./agents/add_bgm_agent";
import combineFilesAgent from "./agents/combine_files_agent";
import ttsOpenaiAgent from "./agents/tts_openai_agent";
import { pathUtilsAgent, fileWriteAgent } from "@graphai/vanilla_node_agents";

import { MulmoScript, MulmoBeat, SpeakerDictonary } from "./type";
import { readMulmoScriptFile, getOutputFilePath, getScratchpadFilePath } from "./utils";

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
    voice: {
      agent: (namedInputs: { speaker: string; speakers: SpeakerDictonary }) => {
        const { speaker, speakers } = namedInputs;
        return speakers[speaker].voiceId;
      },
      inputs: {
        speaker: ":row.speaker",
        speakers: ":script.speakers",
      },
    },
    tts: {
      agent: ":script.ttsAgent",
      inputs: {
        // text: ":row.ttsText",
        text: ":row.tts",
        file: ":path.path",
      },
      params: {
        throwError: true,
        voice: ":voice",
        speed: ":row.speed",
        speed_global: ":script.speed",
        instructions: ":row.instructions",
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
      inputs: { rows: ":script.script", script: ":script" },
      graph: graph_tts,
      console: { after: true },
    },
    combineFiles: {
      agent: "combineFilesAgent",
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

const fileCacheAgentFilter: AgentFilterFunction = async (context, next) => {
  const { namedInputs } = context;
  const { file } = namedInputs;
  try {
    await fsPromise.access(file);
    const elements = file.split("/");
    console.log("cache hit: " + elements[elements.length - 1], namedInputs.text.slice(0, 10));
    return true;
  } catch (__e) {
    const output = (await next(context)) as { buffer: Buffer };
    const buffer = output ? output["buffer"] : undefined;
    if (buffer) {
      console.log("writing: " + file);
      await fsPromise.writeFile(file, buffer);
      return true;
    }
    console.log("no cache, no buffer: " + file);
    return false;
  }
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
  mulmoData.beats.forEach((mulmoScript: MulmoBeat, index: number) => {
    mulmoScript.filename = mulmoData.filename + index;
    // HACK: In case, the operator skip the "Split" phase.
    /*
    if (!mulmoScript.ttsText) {
      mulmoScript.ttsText = mulmoScript.text;
    }
    */
  });

  // Check if any script changes
  const outputFilePath = getOutputFilePath(mulmoData.filename + ".json");
  const { mulmoData: prevScript } = readMulmoScriptFile(outputFilePath) ?? {};
  if (prevScript) {
    console.log("found output script", prevScript.filename);
    mulmoData.beats.forEach((mulmoScript: MulmoBeat, index: number) => {
      const prevText = prevScript.beats[index]?.text ?? "";
      if (mulmoScript.text !== prevText) {
        const scratchpadFilePath = getScratchpadFilePath(mulmoScript.filename + ".mp3");
        if (fs.existsSync(scratchpadFilePath)) {
          console.log("deleting", mulmoScript.filename);
          fs.unlinkSync(scratchpadFilePath);
        }
      }
    });
  }

  if (mulmoData.tts === "nijivoice") {
    graph_data.concurrency = 1;
    mulmoData.ttsAgent = "ttsNijivoiceAgent";
  } else {
    graph_data.concurrency = 8;
    mulmoData.ttsAgent = "ttsOpenaiAgent";
  }

  const graph = new GraphAI(
    graph_data,
    {
      ...agents,
      pathUtilsAgent,
      fileWriteAgent,
      ttsOpenaiAgent,
      ttsNijivoiceAgent,
      addBGMAgent,
      combineFilesAgent,
    },
    { agentFilters },
  );
  graph.injectValue("script", mulmoData);
  const results = await graph.run();
  const result = results.combineFiles as { fileName: string };
  console.log(`Generated: ${result.fileName}`);
};

main();
