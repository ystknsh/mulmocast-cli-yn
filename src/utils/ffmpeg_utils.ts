import ffmpeg from "fluent-ffmpeg";

export type FfmpegContext = {
  command: ffmpeg.FfmpegCommand;
  inputCount: number;
};

export const FfmpegContextInit = (): FfmpegContext => {
  return {
    command: ffmpeg(),
    inputCount: 0,
  };
};

export const FfmpegContextAddInput = (context: FfmpegContext, input: string) => {
  context.command.input(input);
  context.inputCount++;
  return context.inputCount - 1; // returned the index of the input
};


