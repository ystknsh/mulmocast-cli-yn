import { GraphAILogger } from "graphai";
import type { AgentFunction, AgentFunctionInfo } from "graphai";
import ffmpeg from "fluent-ffmpeg";
import { MulmoStudio, MulmoStudioContext, MulmoStudioBeat } from "../types/index.js";
import { silentPath, silentLastPath } from "../utils/file.js";
import { FfmpegContextInit, FfmpegContextGenerateOutput, FfmpegContextAddFormattedAudio } from "../utils/ffmpeg_utils.js";

const combineAudioFilesAgent: AgentFunction<null, { studio: MulmoStudio }, { context: MulmoStudioContext; combinedFileName: string }> = async ({
  namedInputs,
}) => {
  const { context, combinedFileName } = namedInputs;

  const ffmpegContext = FfmpegContextInit();

  const getDuration = (filePath: string, isLastGap: boolean) => {
    return new Promise<number>((resolve, reject) => {
      ffmpeg.ffprobe(filePath, (err, metadata) => {
        if (err) {
          GraphAILogger.info("Error while getting metadata:", err);
          reject(err);
        } else {
          // TODO: Remove hard-coded 0.8 and 0.3
          resolve(metadata.format.duration! + (isLastGap ? 0.8 : 0.3));
        }
      });
    });
  };

  const inputIds = (
    await Promise.all(
      context.studio.beats.map(async (studioBeat: MulmoStudioBeat, index: number) => {
        const isLastGap = index === context.studio.beats.length - 2;
        if (studioBeat.audioFile) {
          const audioId = FfmpegContextAddFormattedAudio(ffmpegContext, studioBeat.audioFile);
          const silentId = FfmpegContextAddFormattedAudio(ffmpegContext, isLastGap ? silentLastPath : silentPath);
          studioBeat.duration = await getDuration(studioBeat.audioFile, isLastGap);
          return [audioId, silentId];
        } else {
          GraphAILogger.error("Missing studioBeat.audioFile:", index);
          return [];
        }
      }),
    )
  ).flat();
  ffmpegContext.filterComplex.push(`${inputIds.join("")}concat=n=${inputIds.length}:v=0:a=1[aout]`);

  await FfmpegContextGenerateOutput(ffmpegContext, combinedFileName, ["-map", "[aout]"]);

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
