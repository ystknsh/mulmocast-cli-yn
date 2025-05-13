import ffmpeg from "fluent-ffmpeg";
import { GraphAILogger } from "graphai";
import { MulmoStudio, MulmoStudioContext, MulmoCanvasDimension, BeatMediaType } from "../types/index.js";
import { MulmoScriptMethods } from "../methods/index.js";
import { getAudioArtifactFilePath, getOutputVideoFilePath, writingMessage } from "../utils/file.js";

export const getPart = (inputIndex: number, mediaType: BeatMediaType, duration: number, canvasInfo: MulmoCanvasDimension) => {
  const videoId = `v${inputIndex}`;
  return {
    videoId,
    part:
      `[${inputIndex}:v]` +
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
      `[${videoId}]`,
  };
};

const getOutputOption = (audioId: string) => {
  return [
    "-preset veryfast", // Faster encoding
    "-map [v]", // Map the video stream
    `-map ${audioId}`, // Map the audio stream
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
      audioId: "",
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

    const canvasInfo = MulmoScriptMethods.getCanvasSize(studio.script);
    const padding = MulmoScriptMethods.getPadding(studio.script) / 1000;

    // Add each image input
    const partsFromBeats = studio.beats.reduce(
      (acc, beat, index) => {
        if (!beat.imageFile || !beat.duration) {
          throw new Error(`beat.imageFile is not set: index=${index}`);
        }
        const inputIndex = addInput(beat.imageFile);
        const mediaType = MulmoScriptMethods.getImageType(studio.script, studio.script.beats[index]);
        const addPadding = index === 0 || index === studio.beats.length - 1;
        const duration = beat.duration + (addPadding ? padding : 0);
        const { videoId, part } = getPart(inputIndex, mediaType, duration, canvasInfo);
        if (mediaType === "movie") {
          const outputAudioId = `a${inputIndex}`;
          // const delay = acc.timestamp * 1000;
          // TODO: add audio from video
          // acc.parts.push(`[${inputIndex}:a]adelay=${delay}|${delay},aformat=sample_fmts=fltp:sample_rates=44100:channel_layouts=stereo[${outputAudioId}]`);
          acc.audioIds.push(outputAudioId);
        }
        return { ...acc, timestamp: acc.timestamp + beat.duration!, videoIds: [...acc.videoIds, videoId], parts: [...acc.parts, part] };
      },
      { timestamp: 0, videoIds: [] as string[], parts: [] as string[], audioIds: [] as string[] },
    );
    // console.log("*** images", images.audioIds);

    const filterComplexParts = partsFromBeats.parts;

    // Concatenate the trimmed images
    filterComplexParts.push(`${partsFromBeats.videoIds.map((id) => `[${id}]`).join("")}concat=n=${studio.beats.length}:v=1:a=0[v]`);

    const audioIndex = addInput(audioArtifactFilePath); // Add audio input
    ffmpegContext.audioId = `${audioIndex}:a`;

    if (partsFromBeats.audioIds.length > 0) {
      filterComplexParts.push(`[${ffmpegContext.audioId}]aformat=sample_fmts=fltp:sample_rates=44100:channel_layouts=stereo[mainaudio]`);
      ffmpegContext.audioId = "[mainaudio]"; // notice that we need to use [mainaudio] instead of mainaudio
    }

    // Apply the filter complex for concatenation and map audio input
    ffmpegContext.command
      .complexFilter(filterComplexParts)
      .outputOptions(getOutputOption(ffmpegContext.audioId))
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
