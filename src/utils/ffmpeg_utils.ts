import ffmpeg from "fluent-ffmpeg";

export type FfmpegContext = {
  command: ffmpeg.FfmpegCommand;
  inputCount: number;
  audioFilters: string[];
};

export const FfmpegContextInit = (): FfmpegContext => {
  return {
    command: ffmpeg(),
    inputCount: 0,
    audioFilters: [],
  };
};

export const FfmpegContextAddInput = (context: FfmpegContext, input: string) => {
  context.command.input(input);
  context.inputCount++;
  return context.inputCount - 1; // returned the index of the input
};

export const FfmpegContextAddFormattedAudio = (context: FfmpegContext, input: string) => {
  const index = FfmpegContextAddInput(context, input);
  const audioId = `[a${index}]`;
  context.audioFilters.push(`[${index}:a]aformat=sample_fmts=fltp:sample_rates=44100:channel_layouts=stereo${audioId}`);
  return audioId;
};



