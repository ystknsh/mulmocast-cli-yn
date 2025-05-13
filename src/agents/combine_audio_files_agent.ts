import { GraphAILogger } from "graphai";
import type { AgentFunction, AgentFunctionInfo } from "graphai";
import ffmpeg from "fluent-ffmpeg";
import { MulmoStudio, MulmoStudioContext, MulmoBeat, MulmoStudioBeat } from "../types/index.js";
import { silentPath, silentLastPath, getAudioSegmentFilePath } from "../utils/file.js";
import { MulmoStudioContextMethods } from "../methods/index.js";

const combineAudioFilesAgent: AgentFunction<
  null,
  { studio: MulmoStudio },
  { context: MulmoStudioContext; combinedFileName: string; audioDirPath: string }
> = async ({ namedInputs }) => {
  const { context, combinedFileName, audioDirPath } = namedInputs;
  const command = ffmpeg();

  await Promise.all(
    context.studio.beats.map(async (studioBeat: MulmoStudioBeat, index: number) => {
      const isLast = index === context.studio.beats.length - 2;
      if (studioBeat.audioFile) {
        console.log(`###_${index}`, studioBeat.audioFile);
        command.input(studioBeat.audioFile);
        command.input(isLast ? silentLastPath : silentPath);
        studioBeat.duration = await getDuration(studioBeat.audioFile, isLast);
      } else {
        console.log("*** missing audio file");
      }
    }),
  );

  await new Promise((resolve, reject) => {
    command
      .on("end", () => {
        resolve(0);
      })
      .on("error", (err: unknown) => {
        GraphAILogger.info("Error while combining MP3 files:", err);
        reject(err);
      })
      .mergeToFile(combinedFileName, audioDirPath);
  });

  return {
    studio: context.studio,
  };
};

const combineAudioFilesAgentInfo: AgentFunctionInfo = {
  name: "combineAudioFilesAgent",
  agent: combineAudioFilesAgent,
  mock: combineAudioFilesAgent,
  samples: [],
  description: "combineAudioFilesAgent",
  category: ["ffmpeg"],
  author: "satoshi nakajima",
  repository: "https://github.com/snakajima/ai-podcaster",
  license: "MIT",
};

export default combineAudioFilesAgentInfo;
