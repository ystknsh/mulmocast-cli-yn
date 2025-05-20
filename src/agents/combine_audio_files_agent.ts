import { GraphAILogger } from "graphai";
import type { AgentFunction, AgentFunctionInfo } from "graphai";
import { MulmoStudio, MulmoStudioContext, MulmoStudioBeat } from "../types/index.js";
import { silent60secPath } from "../utils/file.js";
import { FfmpegContextInit, FfmpegContextGenerateOutput, FfmpegContextInputFormattedAudio, ffmpegGetMediaDuration } from "../utils/ffmpeg_utils.js";

const combineAudioFilesAgent: AgentFunction<null, { studio: MulmoStudio }, { context: MulmoStudioContext; combinedFileName: string }> = async ({
  namedInputs,
}) => {
  const { context, combinedFileName } = namedInputs;
  const ffmpegContext = FfmpegContextInit();
  const longSilentId = FfmpegContextInputFormattedAudio(ffmpegContext, silent60secPath);

  // We cannot reuse longSilentId. We need to explicitly split it for each beat.
  const silentIds = context.studio.beats.map((_, index) => `[ls_${index}]`);
  ffmpegContext.filterComplex.push(`${longSilentId}asplit=${silentIds.length}${silentIds.join("")}`);

  const inputIds = (
    await Promise.all(
      context.studio.beats.map(async (studioBeat: MulmoStudioBeat, index: number) => {
        const isClosingGap = index === context.studio.beats.length - 2;
        if (studioBeat.audioFile) {
          const audioId = FfmpegContextInputFormattedAudio(ffmpegContext, studioBeat.audioFile);
          const padding = (() => {
            if (index === context.studio.beats.length - 1) {
              return 0;
            }
            return isClosingGap ? context.studio.script.audioParams.closingPadding : context.studio.script.audioParams.padding;
          })();
          studioBeat.duration = (await ffmpegGetMediaDuration(studioBeat.audioFile)) + padding;
          if (padding > 0) {
            const silentId = silentIds.pop();
            ffmpegContext.filterComplex.push(`${silentId}atrim=start=0:end=${padding}[padding_${index}]`);
            return [audioId, `[padding_${index}]`];
          } else {
            return [audioId];
          }
        } else {
          // NOTE: We come here when the text is empty and no audio property is specified.
          studioBeat.duration = context.studio.script.beats[index].duration ?? 1.0;
          const silentId = silentIds.pop();
          ffmpegContext.filterComplex.push(`${silentId}atrim=start=0:end=${studioBeat.duration}[silent_${index}]`);
          return [`[silent_${index}]`];
        }
      }),
    )
  ).flat();

  // HACK: Because the last beat may not use an silent audio, we need to consume it to make ffmpeg happy.
  if (silentIds.length > 1) {
    throw new Error("UNEXPECTED: silentIds.length > 1");
  }
  silentIds.forEach((silentId) => {
    GraphAILogger.log(`Using extra silentId: ${silentId}`);
    ffmpegContext.filterComplex.push(`${silentId}atrim=start=0:end=${0.01}[silent_extra]`);
    inputIds.push("[silent_extra]");
  });

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
