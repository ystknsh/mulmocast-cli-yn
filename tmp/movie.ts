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
    studio.beats.forEach((beat, index) => {
      if (index === 1) {
        command = command.input("/Users/satoshi/git/ai/mulmo/tmp/coffee.mov");
      } else {
        command = command.input(beat.imageFile!); // HACK
      }
    });

    // Add main audio input
    command.input(audioArtifactFilePath);

    const imageCount = studio.beats.length;
    const canvasInfo = MulmoScriptMethods.getCanvasSize(studio.script);
    const filterComplexParts: string[] = [];

    // Process video inputs
    studio.beats.forEach((beat, index) => {
      // Resize background image to match canvas dimensions
      const duration = beat.duration! + (index === 0 ? MulmoScriptMethods.getPadding(studio.script) / 1000 : 0);
      if (index === 1) {
        const parts =
          `[${index}:v]` +
          `trim=duration=${duration},` +
          `fps=30,` +
          `setpts=PTS-STARTPTS,` +
          `scale=${canvasInfo.width}:${canvasInfo.height},` +
          `setsar=1,format=yuv420p` +
          `[v${index}]`;
        filterComplexParts.push(parts);
      } else {
        const parts =
          `[${index}:v]loop=loop=-1:size=1:start=0,` +
          `trim=duration=${duration},` +
          `fps=30,` +
          `setpts=PTS-STARTPTS,` +
          `scale=${canvasInfo.width}:${canvasInfo.height},` +
          `setsar=1,format=yuv420p` +
          `[v${index}]`;
        filterComplexParts.push(parts);
      }
    });

    // Concatenate the trimmed images
    const concatInput = studio.beats.map((_, index) => `[v${index}]`).join("");
    filterComplexParts.push(`${concatInput}concat=n=${imageCount}:v=1:a=0[v]`);

    // Handle audio - extract audio from coffee.mov
    // Use the input at index 1 (coffee.mov) and extract its audio
    // This assumes coffee.mov has an audio track
    // Create a simplified approach to handle coffee.mov audio
    if (studio.beats.length > 1) {
      // Calculate the total delay needed for coffee.mov audio
      const paddingSeconds = MulmoScriptMethods.getPadding(studio.script) / 1000;
      const firstBeatDuration = studio.beats[0].duration || 0; // Duration of the first beat

      // Total delay should be padding + first beat duration
      const totalDelayMs = Math.round((paddingSeconds + firstBeatDuration) * 1000);

      // Apply the delay to coffee.mov audio
      filterComplexParts.push(`[1:a]adelay=${totalDelayMs}|${totalDelayMs},aformat=sample_fmts=fltp:sample_rates=44100:channel_layouts=stereo[coffeeaudio]`); // Process main audio
      filterComplexParts.push(`[${imageCount}:a]aformat=sample_fmts=fltp:sample_rates=44100:channel_layouts=stereo[mainaudio]`);

      // Mix both audio streams
      filterComplexParts.push(`[mainaudio][coffeeaudio]amix=inputs=2:duration=first:dropout_transition=2[a]`);
    }

    // Apply the filter complex
    command.complexFilter(filterComplexParts);

    // Set output options
    const outputOptions = [
      "-preset veryfast", // Faster encoding
      "-map [v]", // Map the video stream
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

    // Add audio mapping only if we have the coffee.mov audio
    if (studio.beats.length > 1) {
      outputOptions.push("-map [a]"); // Map the mixed audio stream
    } else {
      outputOptions.push(`-map ${imageCount}:a`); // Map just the main audio stream
    }

    command
      .outputOptions(outputOptions)
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
