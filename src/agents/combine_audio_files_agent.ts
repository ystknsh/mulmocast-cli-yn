import { GraphAILogger } from "graphai";
import type { AgentFunction, AgentFunctionInfo } from "graphai";
import { MulmoStudio, MulmoStudioContext, MulmoStudioBeat, MulmoBeat } from "../types/index.js";
import { silent60secPath } from "../utils/file.js";
import { FfmpegContextInit, FfmpegContextGenerateOutput, FfmpegContextInputFormattedAudio, ffmpegGetMediaDuration } from "../utils/ffmpeg_utils.js";

const getMovieDulation = async (beat: MulmoBeat) => {
  if (beat.image?.type === "movie" && (beat.image.source.kind === "url" || beat.image.source.kind === "path")) {
    const pathOrUrl = beat.image.source.kind === "url" ? beat.image.source.url : beat.image.source.path;
    return await ffmpegGetMediaDuration(pathOrUrl);
  }
  return 0;
};

const getPadding = (context: MulmoStudioContext, beat: MulmoBeat, index: number) => {
  if (beat.audioParams?.padding !== undefined) {
    return beat.audioParams.padding;
  }
  if (index === context.studio.beats.length - 1) {
    return 0;
  }
  const isClosingGap = index === context.studio.beats.length - 2;
  return isClosingGap ? context.presentationStyle.audioParams.closingPadding : context.presentationStyle.audioParams.padding;
};

const getTotalPadding = (padding: number, movieDuration: number, audioDuration: number, duration?: number) => {
  if (movieDuration > 0) {
    return padding + (movieDuration - audioDuration);
  } else if (duration && duration > audioDuration) {
    return padding + (duration - audioDuration);
  }
  return padding;
};

const combineAudioFilesAgent: AgentFunction<null, { studio: MulmoStudio }, { context: MulmoStudioContext; combinedFileName: string }> = async ({
  namedInputs,
}) => {
  const { context, combinedFileName } = namedInputs;
  const ffmpegContext = FfmpegContextInit();
  const longSilentId = FfmpegContextInputFormattedAudio(ffmpegContext, silent60secPath());

  // We cannot reuse longSilentId. We need to explicitly split it for each beat.
  const silentIds = context.studio.beats.map((_, index) => `[ls_${index}]`);
  ffmpegContext.filterComplex.push(`${longSilentId}asplit=${silentIds.length}${silentIds.join("")}`);

  const inputIds = (
    await Promise.all(
      context.studio.beats.map(async (studioBeat: MulmoStudioBeat, index: number) => {
        const beat = context.studio.script.beats[index];
        const movieDuration = await getMovieDulation(beat);
        if (studioBeat.audioFile) {
          const audioId = FfmpegContextInputFormattedAudio(ffmpegContext, studioBeat.audioFile);
          const padding = getPadding(context, beat, index);
          const audioDuration = await ffmpegGetMediaDuration(studioBeat.audioFile);
          const totalPadding = getTotalPadding(padding, movieDuration, audioDuration, beat.duration);
          studioBeat.duration = audioDuration + totalPadding; // TODO
          if (totalPadding > 0) {
            const silentId = silentIds.pop();
            ffmpegContext.filterComplex.push(`${silentId}atrim=start=0:end=${totalPadding}[padding_${index}]`);
            return [audioId, `[padding_${index}]`];
          } else {
            return [audioId];
          }
        } else {
          // NOTE: We come here when the text is empty and no audio property is specified.
          studioBeat.duration = beat.duration ?? (movieDuration > 0 ? movieDuration : 1.0); // TODO
          const silentId = silentIds.pop();
          ffmpegContext.filterComplex.push(`${silentId}atrim=start=0:end=${studioBeat.duration}[silent_${index}]`);
          return [`[silent_${index}]`];
        }
      }),
    )
  ).flat();

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
