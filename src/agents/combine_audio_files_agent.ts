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

  // First, get the audio durations of all beats, taking advantage of multi-threading capability of ffmpeg.
  const mediaDurations = await Promise.all(
    context.studio.beats.map(async (studioBeat: MulmoStudioBeat, index: number) => {
      const beat = context.studio.script.beats[index];
      const movieDuration = await getMovieDulation(beat);
      const audioDuration = studioBeat.audioFile ? await ffmpegGetMediaDuration(studioBeat.audioFile) : 0;
      return {
        movieDuration,
        audioDuration,
        hasMadia: movieDuration + audioDuration > 0,
        silenceDuration: 0,
      };
    }),
  );

  const beatDurations: number[] = [];

  context.studio.script.beats.forEach((beat: MulmoBeat, index: number) => {
    const { audioDuration, movieDuration } = mediaDurations[index];
    // Check if the current beat has media and the next beat does not have media.
    if (audioDuration > 0 && index < context.studio.beats.length - 1 && !mediaDurations[index + 1].hasMadia) {
      const group = [index];
      for (let i = index + 1; i < context.studio.beats.length && !mediaDurations[i].hasMadia; i++) {
        group.push(i);
      }
      const specifiedSum = group
        .map((idx) => context.studio.script.beats[idx].duration)
        .filter((d) => d !== undefined)
        .reduce((a, b) => a + b, 0);
      const unspecified = group.filter((idx) => context.studio.script.beats[idx].duration === undefined);
      const minTotal = 1.0 * unspecified.length;
      const rest = Math.max(audioDuration - specifiedSum, minTotal);
      const durationForUnspecified = rest / (unspecified.length || 1);

      const durations = group.map((idx) => {
        const duration = context.studio.script.beats[idx].duration;
        if (duration === undefined) {
          return durationForUnspecified;
        }
        return duration;
      });
      const total = durations.reduce((a, b) => a + b, 0);
      if (total < audioDuration) {
        durations[durations.length - 1] += audioDuration - total;
      }
      console.log("***DEBUG0***", group, specifiedSum, unspecified, durations, audioDuration, total);
      beatDurations.push(...durations);
    } else {
      if (audioDuration > 0) {
        // This beat has its own audio
        assert(beatDurations.length === index, "beatDurations.length !== index");
        // padding is the amount of audio padding specified in the script.
        const padding = getPadding(context, beat, index);
        // totalPadding is the amount of audio padding to be added to the audio file.
        const totalPadding = getTotalPadding(padding, movieDuration, audioDuration, beat.duration);
        const beatDuration = audioDuration + totalPadding;
        console.log("***DEBUG1***", index, beatDuration);
        beatDurations.push(beatDuration);
        if (totalPadding > 0) {
          mediaDurations[index].silenceDuration = totalPadding;
        }
      } else if (movieDuration > 0) {
        beatDurations.push(movieDuration);
      } else if (beatDurations.length === index) {
        // The current beat has no audio, nor no spilled over audio
        const beatDuration = beat.duration ?? (movieDuration > 0 ? movieDuration : 1.0);
        console.log("***DEBUG2***", index, beatDuration);
        beatDurations.push(beatDuration);
        mediaDurations[index].silenceDuration = beatDuration;
      }
    }
  });
  assert(beatDurations.length === context.studio.beats.length, "beatDurations.length !== studio.beats.length");
  console.log("***DEBUG***", beatDurations.map((d) => d.toFixed(2)).join(","));

  const inputIds: string[] = [];

  context.studio.beats.forEach((studioBeat: MulmoStudioBeat, index: number) => {
    const { silenceDuration } = mediaDurations[index];
    const paddingId = `[padding_${index}]`;
    if (studioBeat.audioFile) {
      const audioId = FfmpegContextInputFormattedAudio(ffmpegContext, studioBeat.audioFile);
      inputIds.push(audioId);
    }
    if (silenceDuration > 0) {
      const silentId = silentIds.pop();
      ffmpegContext.filterComplex.push(`${silentId}atrim=start=0:end=${silenceDuration}${paddingId}`);
      inputIds.push(paddingId);
    }
  });

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
