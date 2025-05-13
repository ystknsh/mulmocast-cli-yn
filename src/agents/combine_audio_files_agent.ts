import { GraphAILogger } from "graphai";
import type { AgentFunction, AgentFunctionInfo } from "graphai";
import ffmpeg from "fluent-ffmpeg";
import { MulmoStudio, MulmoStudioContext, MulmoStudioBeat } from "../types/index.js";
import { silentPath, silentLastPath } from "../utils/file.js";

const combineAudioFilesAgent: AgentFunction<
  null,
  { studio: MulmoStudio },
  { context: MulmoStudioContext; combinedFileName: string; audioDirPath: string }
> = async ({ namedInputs }) => {
  const { context, combinedFileName, audioDirPath } = namedInputs;
  const command = ffmpeg();

  const getDuration = (filePath: string, isLast: boolean) => {
    return new Promise<number>((resolve, reject) => {
      ffmpeg.ffprobe(filePath, (err, metadata) => {
        if (err) {
          GraphAILogger.info("Error while getting metadata:", err);
          reject(err);
        } else {
          resolve(metadata.format.duration! + (isLast ? 0.8 : 0.3));
        }
      });
    });
  };

  await Promise.all(
    context.studio.beats.map(async (studioBeat: MulmoStudioBeat, index: number) => {
      const isLast = index === context.studio.beats.length - 2;
      if (studioBeat.audioFile) {
        command.input(studioBeat.audioFile);
        command.input(isLast ? silentLastPath : silentPath);
        studioBeat.duration = await getDuration(studioBeat.audioFile, isLast);
      } else {
        GraphAILogger.error("Missing studioBeat.audioFile:", index);
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
