import { assert } from "graphai";
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

const getTotalPadding = (padding: number, movieDuration: number, audioDuration: number, duration?: number, canSpillover: boolean = false) => {
  if (movieDuration > 0) {
    return padding + (movieDuration - audioDuration);
  } else if (duration && duration > audioDuration) {
    return padding + (duration - audioDuration);
  } else if (canSpillover && duration && audioDuration > duration) {
    return duration - audioDuration; // negative value to indicate that there is a spill over.
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

  // First, get the audio durations of all beats, taking advantage of multi-threading capability of ffmpeg.
  const mediaDurations = await Promise.all(
    context.studio.beats.map(async (studioBeat: MulmoStudioBeat, index: number) => {
      const beat = context.studio.script.beats[index];
      const movieDuration = await getMovieDulation(beat);
      const audioDuration = studioBeat.audioFile ? await ffmpegGetMediaDuration(studioBeat.audioFile) : 0;
      return {
        movieDuration,
        audioDuration,
      };
    }),
  );

  const inputIds: string[] = [];
  const beatDurations: number[] = [];

  context.studio.beats.reduce((spillover: number, studioBeat: MulmoStudioBeat, index: number) => {
    const beat = context.studio.script.beats[index];
    const { audioDuration, movieDuration } = mediaDurations[index];
    const paddingId = `[padding_${index}]`;
    const canSpillover = index < context.studio.beats.length - 1 && mediaDurations[index + 1].movieDuration + mediaDurations[index + 1].audioDuration === 0;
    if (studioBeat.audioFile) {
      const audioId = FfmpegContextInputFormattedAudio(ffmpegContext, studioBeat.audioFile);
      // padding is the amount of audio padding specified in the script.
      const padding = getPadding(context, beat, index);
      // totalPadding is the amount of audio padding to be added to the audio file.
      const totalPadding = getTotalPadding(padding, movieDuration, audioDuration, beat.duration, canSpillover);
      beatDurations.push(audioDuration + totalPadding);
      if (totalPadding > 0) {
        const silentId = silentIds.pop();
        ffmpegContext.filterComplex.push(`${silentId}atrim=start=0:end=${totalPadding}${paddingId}`);
        inputIds.push(audioId, paddingId);
      } else {
        inputIds.push(audioId);
        if (totalPadding < 0) {
          return -totalPadding;
        }
      }
    } else {
      // NOTE: We come here when the text is empty and no audio property is specified.
      const beatDuration = (() => {
        const duration = beat.duration ?? (movieDuration > 0 ? movieDuration : 1.0);
        if (!canSpillover && duration < spillover) {
          return spillover; // We need to consume the spillover here.
        }
        return duration;
      })();

      beatDurations.push(beatDuration);
      if (beatDuration <= spillover) {
        return spillover - beatDuration;
      }

      const silentId = silentIds.pop();
      ffmpegContext.filterComplex.push(`${silentId}atrim=start=0:end=${beatDuration - spillover}${paddingId}`);
      inputIds.push(paddingId);
    }
    return 0;
  }, 0);
  assert(beatDurations.length === context.studio.beats.length, "beatDurations.length !== studio.beats.length");

  // We need to "consume" extra silentIds.
  silentIds.forEach((silentId, index) => {
    const extraId = `[silent_extra_${index}]`;
    ffmpegContext.filterComplex.push(`${silentId}atrim=start=0:end=${0.01}${extraId}`);
    inputIds.push(extraId);
  });

  // Finally, combine all audio files.
  ffmpegContext.filterComplex.push(`${inputIds.join("")}concat=n=${inputIds.length}:v=0:a=1[aout]`);
  await FfmpegContextGenerateOutput(ffmpegContext, combinedFileName, ["-map", "[aout]"]);

  const result = {
    studio: {
      ...context.studio,
      beats: context.studio.beats.map((studioBeat, index) => ({ ...studioBeat, duration: beatDurations[index] })),
    },
  };
  // context.studio = result.studio; // TODO: removing this breaks test/test_movie.ts
  return {
    ...context,
    ...result,
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
