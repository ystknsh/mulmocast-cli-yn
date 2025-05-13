import "dotenv/config";
import ffmpeg from "fluent-ffmpeg";

import { GraphAI, GraphAILogger } from "graphai";
import type { GraphData } from "graphai";
import * as agents from "@graphai/vanilla";
import ttsNijivoiceAgent from "../agents/tts_nijivoice_agent.js";
import addBGMAgent from "../agents/add_bgm_agent.js";
import combineAudioFilesAgent from "../agents/combine_audio_files_agent.js";
import ttsOpenaiAgent from "../agents/tts_openai_agent.js";
import { fileWriteAgent } from "@graphai/vanilla_node_agents";
import { MulmoScriptMethods, MulmoStudioContextMethods } from "../methods/index.js";

import { MulmoStudioContext, MulmoBeat, SpeakerDictonary } from "../types/index.js";
import { fileCacheAgentFilter } from "../utils/filters.js";
import {
  getAudioArtifactFilePath,
  getAudioSegmentDirPath,
  getAudioCombinedFilePath,
  getOutputStudioFilePath,
  defaultBGMPath,
  mkdir,
  writingMessage,
  getAudioSegmentFilePath,
} from "../utils/file.js";
import { text2hash } from "../utils/utils.js";

const { default: __, ...vanillaAgents } = agents;

// const rion_takanashi_voice = "b9277ce3-ba1c-4f6f-9a65-c05ca102ded0"; // たかなし りおん
// const ben_carter_voice = "bc06c63f-fef6-43b6-92f7-67f919bd5dae"; // ベン・カーター
const provider_to_agent = {
  nijivoice: "ttsNijivoiceAgent",
  openai: "ttsOpenaiAgent",
};

const getDuration = (filePath: string) => {
  return new Promise<number>((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) {
        GraphAILogger.info("Error while getting metadata:", err);
        reject(err);
      } else {
        // TODO: Remove this hard-coded 0.3
        resolve(metadata.format.duration! + 0.3);
      }
    });
  });
};

const resolveAudioFilePath = (context: MulmoStudioContext, beat: MulmoBeat, audioFile: string, audioDirPath: string): string => {
  if (beat.audio?.type === "audio") {
    const { source } = beat.audio;
    if (source.kind === "path") {
      return MulmoStudioContextMethods.resolveAssetPath(context, source.path);
    }
    if (source.kind === "url") {
      return source.url;
    }
  }
  return getAudioSegmentFilePath(audioDirPath, context.studio.filename, audioFile);
};

const preprocessor = async (namedInputs: { beat: MulmoBeat; index: number; context: MulmoStudioContext; speakers: SpeakerDictonary; audioDirPath: string }) => {
  const { beat, index, context, speakers, audioDirPath } = namedInputs;
  const studioBeat = context.studio.beats[index];
  const voiceId = context.studio.script.speechParams.speakers[beat.speaker].voiceId;
  const speechOptions = MulmoScriptMethods.getSpeechOptions(context.studio.script, beat);
  const hash_string = `${beat.text}${voiceId}${speechOptions?.instruction ?? ""}${speechOptions?.speed ?? 1.0}`;
  const audioFile = `${context.studio.filename}_${index}_${text2hash(hash_string)}`;
  const audioPath = resolveAudioFilePath(context, beat, audioFile, audioDirPath);
  console.log(`***_${index}`, audioPath);
  // studioBeat.duration = await getDuration(audioPath);
  studioBeat.audioFile = audioPath;
  return {
    ttsAgent: provider_to_agent[context.studio.script.speechParams.provider],
    studioBeat,
    voiceId: speakers[beat.speaker].voiceId,
    speechOptions: MulmoScriptMethods.getSpeechOptions(context.studio.script, beat),
    audioPath,
  };
};

const graph_tts: GraphData = {
  nodes: {
    preprocessor: {
      agent: preprocessor,
      inputs: {
        beat: ":beat",
        index: ":__mapIndex",
        context: ":context",
        speakers: ":studio.script.speechParams.speakers",
        audioDirPath: ":audioDirPath",
      },
    },
    tts: {
      unless: ":beat.audio",
      agent: ":preprocessor.ttsAgent",
      inputs: {
        text: ":beat.text",
        file: ":preprocessor.audioPath",
        force: ":context.force",
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
      inputs: {
        rows: ":context.studio.script.beats",
        studio: ":context.studio",
        audioDirPath: ":audioDirPath",
        audioSegmentDirPath: ":audioSegmentDirPath",
        context: ":context",
      },
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
  const audioSegmentDirPath = getAudioSegmentDirPath(audioDirPath, studio.filename);
  const audioCombinedFilePath = getAudioCombinedFilePath(audioDirPath, studio.filename);
  const outputStudioFilePath = getOutputStudioFilePath(outDirPath, studio.filename);
  mkdir(outDirPath);
  mkdir(audioSegmentDirPath);

  graph_data.concurrency = concurrency;
  const graph = new GraphAI(
    graph_data,
    {
      ...vanillaAgents,
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
