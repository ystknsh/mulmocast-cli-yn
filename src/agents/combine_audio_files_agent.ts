import { GraphAILogger } from "graphai";
import type { AgentFunction, AgentFunctionInfo } from "graphai";
import ffmpeg from "fluent-ffmpeg";
import { MulmoStudio, MulmoStudioContext, MulmoBeat } from "../types/index.js";
import { silentPath, silentLastPath, getAudioSegmentFilePath } from "../utils/file.js";
import { MulmoStudioContextMethods } from "../methods/index.js";

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

  const resolveAudioFilePath = (context: MulmoStudioContext, mulmoBeat: MulmoBeat, audioDirPath: string): string => {
    if (mulmoBeat.audio?.type === "audio") {
      const { source } = mulmoBeat.audio;
      if (source.kind === "path") {
        return MulmoStudioContextMethods.resolveAssetPath(context, source.path);
      }
      if (source.kind === "url") {
        return source.url;
      }
    }
    return getAudioSegmentFilePath(audioDirPath, context.studio.filename, mulmoBeat.audioFile ?? "");
  };

  await Promise.all(
    context.studio.script.beats.map(async (mulmoBeat: MulmoBeat, index: number) => {
      const filePath = resolveAudioFilePath(context, mulmoBeat, audioDirPath);
      const isLast = index === context.studio.beats.length - 2;
      command.input(filePath);
      command.input(isLast ? silentLastPath : silentPath);

      // Measure and log the timestamp of each section
      context.studio.beats[index]["duration"] = await getDuration(filePath, isLast);
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
