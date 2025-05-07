import "dotenv/config";

import { GraphAI } from "graphai";
import type { GraphData } from "graphai";
import * as agents from "@graphai/vanilla";
import ttsNijivoiceAgent from "../agents/tts_nijivoice_agent";
import addBGMAgent from "../agents/add_bgm_agent";
import combineAudioFilesAgent from "../agents/combine_audio_files_agent";
import ttsOpenaiAgent from "../agents/tts_openai_agent";
import { fileWriteAgent } from "@graphai/vanilla_node_agents";
import { MulmoScriptMethods } from "../methods";

import { MulmoStudioContext, MulmoScript, MulmoBeat, SpeakerDictonary } from "../types";
import { fileCacheAgentFilter } from "../utils/filters";
import { getAudioArtifactFilePath, getAudioSegmentDirPath, getAudioCombinedFilePath, getOutputStudioFilePath, defaultBGMPath, mkdir, writingMessage } from "../utils/file";

// const rion_takanashi_voice = "b9277ce3-ba1c-4f6f-9a65-c05ca102ded0"; // たかなし りおん
// const ben_carter_voice = "bc06c63f-fef6-43b6-92f7-67f919bd5dae"; // ベン・カーター

const graph_tts: GraphData = {
  nodes: {
    preprocessor: {
      agent: (namedInputs: { beat: MulmoBeat; script: MulmoScript; speakers: SpeakerDictonary }) => {
        const { beat, script, speakers } = namedInputs;
        return {
          voiceId: speakers[beat.speaker].voiceId,
          speechOptions: MulmoScriptMethods.getSpeechOptions(script, beat),
        };
      },
      inputs: {
        beat: ":beat",
        script: ":script",
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
      unless: ":beat.audio",
      agent: ":ttsAgent",
      inputs: {
        text: ":beat.text",
        file: "${:audioSegmentDirPath}/${:beat.audioFile}.mp3", // TODO
      },
      params: {
        voice: ":preprocessor.voiceId",
        speed: ":preprocessor.speechOptions.speed",
        instructions: ":preprocessor.speechOptions.instruction",
      },
    },
  },
};

const graph_data: GraphData = {
  version: 0.5,
  concurrency: 8,
  nodes: {
    context: {},
    audioArtifactFilePath: {},
    audioCombinedFilePath: {},
    outputStudioFilePath: {},
    audioDirPath: {},
    audioSegmentDirPath: {},
    map: {
      agent: "mapAgent",
      inputs: { rows: ":context.studio.beats", script: ":context.studio.script", audioDirPath: ":audioDirPath", audioSegmentDirPath: ":audioSegmentDirPath" },
      params: {
        rowKey: "beat",
      },
      graph: graph_tts,
    },
    combineFiles: {
      agent: "combineAudioFilesAgent",
      inputs: {
        map: ":map",
        context: ":context",
        combinedFileName: ":audioCombinedFilePath",
        audioDirPath: ":audioDirPath",
      },
      isResult: true,
    },
    fileWrite: {
      agent: "fileWriteAgent",
      inputs: {
        file: ":outputStudioFilePath",
        text: ":combineFiles.studio.toJSON()",
      },
    },
    addBGM: {
      agent: "addBGMAgent",
      params: {
        musicFile: process.env.PATH_BGM ?? defaultBGMPath,
      },
      inputs: {
        wait: ":combineFiles",
        voiceFile: ":audioCombinedFilePath",
        outputFile: ":audioArtifactFilePath",
        script: ":context.studio.script",
      },
      isResult: true,
    },
    title: {
      agent: "copyAgent",
      params: {
        namedKey: "title",
      },
      inputs: {
        title: "\n${:context.studio.script.title}\n\n${:context.studio.script.description}\nReference: ${:context.studio.script.reference}\n",
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

export const audio = async (context: MulmoStudioContext, concurrency: number) => {
  const { studio, fileDirs } = context;
  const { outDirPath, audioDirPath } = fileDirs;
  const audioArtifactFilePath = getAudioArtifactFilePath(outDirPath, studio.filename);
  const audioSegmentDirPath = getAudioSegmentDirPath(audioDirPath, studio.filename)
  const audioCombinedFilePath = getAudioCombinedFilePath(audioDirPath, studio.filename);
  const outputStudioFilePath = getOutputStudioFilePath(outDirPath, studio.filename);
  mkdir(outDirPath);
  mkdir(audioSegmentDirPath);

  graph_data.concurrency = concurrency;
  const graph = new GraphAI(
    graph_data,
    {
      ...agents,
      fileWriteAgent,
      ttsOpenaiAgent,
      ttsNijivoiceAgent,
      addBGMAgent,
      combineAudioFilesAgent,
    },
    { agentFilters },
  );
  graph.injectValue("context", context);
  graph.injectValue("audioArtifactFilePath", audioArtifactFilePath);
  graph.injectValue("audioCombinedFilePath", audioCombinedFilePath);
  graph.injectValue("outputStudioFilePath", outputStudioFilePath);
  graph.injectValue("audioSegmentDirPath", audioSegmentDirPath);
  graph.injectValue("audioDirPath", audioDirPath);
  await graph.run();

  writingMessage(audioCombinedFilePath);
};
