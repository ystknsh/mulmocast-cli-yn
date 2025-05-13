import ffmpeg from "fluent-ffmpeg";
import { GraphAILogger } from "graphai";
import { MulmoStudio, MulmoStudioContext, MulmoCanvasDimension, BeatMediaType } from "../types/index.js";
import { MulmoScriptMethods } from "../methods/index.js";
import { getAudioArtifactFilePath, getOutputVideoFilePath, writingMessage } from "../utils/file.js";

export const getParts = (index: number, mediaType: BeatMediaType, duration: number, canvasInfo: MulmoCanvasDimension) => {
  return (
    `[${index}:v]` +
    [
      mediaType === "image" ? "loop=loop=-1:size=1:start=0" : "",
      `trim=duration=${duration}`,
      "fps=30",
      "setpts=PTS-STARTPTS",
      `scale=${canvasInfo.width}:${canvasInfo.height}`,
      "setsar=1",
      "format=yuv420p",
    ]
      .filter((a) => a)
      .join(",") +
    `[v${index}]`
  );
};

const getOutputOption = (audioIndex: number) => {
  return [
    "-preset veryfast", // Faster encoding
    "-map [v]", // Map the video stream
    `-map ${audioIndex}:a`, // Map the audio stream
    "-c:v h264_videotoolbox", // Set video codec
    "-threads 8",
    "-filter_threads 8",
    "-b:v 5M", // bitrate (only for videotoolbox)
    "-bufsize",
    "10M", // Add buffer size for better quality
    "-maxrate",
    "7M", // Maximum bitrate
    "-r 30", // Set frame rate
    "-pix_fmt yuv420p", // Set pixel format for better compatibility
  ];
};

const createVideo = (audioArtifactFilePath: string, outputVideoPath: string, studio: MulmoStudio) => {
  return new Promise((resolve, reject) => {
    const start = performance.now();
    const ffmpegContext = {
      command: ffmpeg(),
      inputCount: 0,
    };

    function addInput(input: string) {
      ffmpegContext.command = ffmpegContext.command.input(input);
      ffmpegContext.inputCount++;
      return ffmpegContext.inputCount - 1; // returned the index of the input
    }

    if (studio.beats.some((beat) => !beat.imageFile)) {
      GraphAILogger.info("beat.imageFile is not set. Please run `yarn run images ${file}` ");
      return;
    }

    // Add each image input
    const concatInput = studio.beats
      .map((beat, index) => {
        if (!beat.imageFile) {
          throw new Error(`beat.imageFile is not set: index=${index}`);
        }
        const inputIndex = addInput(beat.imageFile);
        return `[v${inputIndex}]`;
      })
      .join("");

    const canvasInfo = MulmoScriptMethods.getCanvasSize(studio.script);

    const padding = MulmoScriptMethods.getPadding(studio.script) / 1000;
    const filterComplexParts: string[] = studio.beats.map((beat, index) => {
      // Resize background image to match canvas dimensions
      const mediaType = MulmoScriptMethods.getImageType(studio.script, studio.script.beats[index]);
      const addPadding = index === 0 || index === studio.beats.length - 1;
      const duration = beat.duration! + (addPadding ? padding : 0);
      return getParts(index, mediaType, duration, canvasInfo);
    });

    // Concatenate the trimmed images
    filterComplexParts.push(`${concatInput}concat=n=${studio.beats.length}:v=1:a=0[v]`);

    const audioIndex = addInput(audioArtifactFilePath); // Add audio input

    // Apply the filter complex for concatenation and map audio input
    ffmpegContext.command
      .complexFilter(filterComplexParts)
      .outputOptions(getOutputOption(audioIndex))
      .on("start", (__cmdLine) => {
        GraphAILogger.log("Started FFmpeg ..."); // with command:', cmdLine);
      })
      .on("error", (err, stdout, stderr) => {
        GraphAILogger.error("Error occurred:", err);
        GraphAILogger.error("FFmpeg stdout:", stdout);
        GraphAILogger.error("FFmpeg stderr:", stderr);
        GraphAILogger.info("Video creation failed. An unexpected error occurred.");
        reject();
      })
      .on("end", () => {
        const end = performance.now();
        GraphAILogger.info(`Video created successfully! ${Math.round(end - start) / 1000} sec`);
        resolve(0);
      })
      .output(outputVideoPath)
      .run();
  });
};

export const movie = async (context: MulmoStudioContext) => {
  const { studio, fileDirs } = context;
  const { outDirPath } = fileDirs;
  const audioArtifactFilePath = getAudioArtifactFilePath(outDirPath, studio.filename);
  const outputVideoPath = getOutputVideoFilePath(outDirPath, studio.filename);

  await createVideo(audioArtifactFilePath, outputVideoPath, studio);
  writingMessage(outputVideoPath);
};
