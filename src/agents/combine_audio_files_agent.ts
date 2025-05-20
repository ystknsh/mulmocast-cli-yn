import { GraphAILogger } from "graphai";
import type { AgentFunction, AgentFunctionInfo } from "graphai";
import { MulmoStudio, MulmoStudioContext, MulmoStudioBeat } from "../types/index.js";
import { silent60secPath } from "../utils/file.js";
import { FfmpegContextInit, FfmpegContextGenerateOutput, FfmpegContextInputFormattedAudio, ffmPegGetMediaDuration } from "../utils/ffmpeg_utils.js";

const combineAudioFilesAgent: AgentFunction<null, { studio: MulmoStudio }, { context: MulmoStudioContext; combinedFileName: string }> = async ({
  namedInputs,
}) => {
  const { context, combinedFileName } = namedInputs;
  const ffmpegContext = FfmpegContextInit();
  const { audioId: longSilentId } = FfmpegContextInputFormattedAudio(ffmpegContext, silent60secPath);

  const inputIds = (
    await Promise.all(
      context.studio.beats.map(async (studioBeat: MulmoStudioBeat, index: number) => {
        const isClosingGap = index === context.studio.beats.length - 2;
        if (studioBeat.audioFile) {
          const { audioId } = FfmpegContextInputFormattedAudio(ffmpegContext, studioBeat.audioFile);
          // TODO: Remove hard-coded 0.8 and 0.3. Make it controllable by the script.
          const padding = (() => {
            if (index === context.studio.beats.length - 1) {
              return 0;
            }
            return isClosingGap ? context.studio.script.audioParams.closingPadding : context.studio.script.audioParams.padding;
          })();
          studioBeat.duration = (await ffmPegGetMediaDuration(studioBeat.audioFile)) + padding;
          if (padding > 0) {
            ffmpegContext.filterComplex.push(`${longSilentId}atrim=start=0:end=${padding}[padding_${index}]`);
            return [audioId, `[padding_${index}]`];
          } else {
            return [audioId];
          }
        } else {
          // NOTE: We come here when the text is empty and no audio property is specified.
          // TODO: Remove hard-coded 1.0
          studioBeat.duration = context.studio.script.beats[index].duration ?? 1.0;
          GraphAILogger.info(`Missing audio for beat ${index}. Treating it as a silent beat for ${studioBeat.duration} seconds.`);
          ffmpegContext.filterComplex.push(`${longSilentId}atrim=start=0:end=${studioBeat.duration}[silent_${index}]`);
          return [`[silent_${index}]`];
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
