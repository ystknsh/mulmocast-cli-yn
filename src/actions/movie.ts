import ffmpeg from "fluent-ffmpeg";
import { GraphAILogger } from "graphai";
import { MulmoStudio, MulmoStudioContext } from "../types/index.js";
import { MulmoScriptMethods } from "../methods/index.js";
import { getAudioArtifactFilePath, getOutputVideoFilePath, writingMessage } from "../utils/file.js";

const createVideo = (audioArtifactFilePath: string, outputVideoPath: string, studio: MulmoStudio) => {
  return new Promise((resolve, reject) => {
    const start = performance.now();
    let command = ffmpeg();

    if (studio.beats.some((beat) => !beat.imageFile)) {
      GraphAILogger.info("beat.imageFile is not set. Please run `yarn run images ${file}` ");
      return;
    }

    // Add each image input
    studio.beats.forEach((beat) => {
      command = command.input(beat.imageFile!); // HACK
    });
    const imageCount = studio.beats.length;
    const canvasInfo = MulmoScriptMethods.getCanvasSize(studio.script);

    const filterComplexParts: string[] = [];
    const padding = MulmoScriptMethods.getPadding(studio.script) / 1000;
    studio.beats.forEach((beat, index) => {
      // Resize background image to match canvas dimensions
      const mediaType = MulmoScriptMethods.getImageType(studio.script, studio.script.beats[index]);
      const addPadding = index === 0 || index === studio.beats.length - 1;
      const duration = beat.duration! + (addPadding ? padding : 0);
      const parts =
        `[${index}:v]` +
        `${mediaType === "image" ? "loop=loop=-1:size=1:start=0," : ""}` +
        `trim=duration=${duration},` +
        `fps=30,` +
        `setpts=PTS-STARTPTS,` +
        `scale=${canvasInfo.width}:${canvasInfo.height},` +
        `setsar=1,format=yuv420p` +
        `[v${index}]`;
      // console.log(parts);
      filterComplexParts.push(parts);
    });

    // Concatenate the trimmed images
    const concatInput = studio.beats.map((_, index) => `[v${index}]`).join("");
    filterComplexParts.push(`${concatInput}concat=n=${imageCount}:v=1:a=0[v]`);

    // Apply the filter complex for concatenation and map audio input
    command
      .complexFilter(filterComplexParts)
      .input(audioArtifactFilePath) // Add audio input
      .outputOptions([
        "-preset veryfast", // Faster encoding
        "-map [v]", // Map the video stream
        `-map ${imageCount /* + captionCount*/}:a`, // Map the audio stream (audio is the next input after all images)
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
      ])
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
