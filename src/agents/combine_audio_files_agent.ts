import { AgentFunction, AgentFunctionInfo } from "graphai";
import ffmpeg from "fluent-ffmpeg";
import { MulmoStudio, MulmoStudioContext, MulmoStudioBeat } from "../types";
import { silentPath, silentLastPath, getScratchpadFilePath } from "../utils/file";
import { MulmoStudioContextMethods } from "../methods";

const combineAudioFilesAgent: AgentFunction<
  null,
  { studio: MulmoStudio },
  { context: MulmoStudioContext; combinedFileName: string; scratchpadDirPath: string }
> = async ({ namedInputs }) => {
  const { context, combinedFileName, scratchpadDirPath } = namedInputs;
  const command = ffmpeg();
  context.studio.beats.forEach((mulmoBeat: MulmoStudioBeat, index: number) => {
    const audioPath = (mulmoBeat.audio?.kind === "path") ? MulmoStudioContextMethods.resolveAssetPath(context, mulmoBeat.audio.path) : undefined;
    const filePath = audioPath ?? getScratchpadFilePath(scratchpadDirPath, mulmoBeat.filename ?? "");
    console.log("***", filePath);
    const isLast = index === context.studio.beats.length - 2;
    command.input(filePath);
    command.input(isLast ? silentLastPath : silentPath);
    // Measure and log the timestamp of each section
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) {
        console.error("Error while getting metadata:", err);
      } else {
        context.studio.beats[index]["duration"] = metadata.format.duration! + (isLast ? 0.8 : 0.3);
      }
    });
  });

  const promise = new Promise((resolve, reject) => {
    command
      .on("end", () => {
        resolve(0);
      })
      .on("error", (err: unknown) => {
        console.error("Error while combining MP3 files:", err);
        reject(err);
      })
      .mergeToFile(combinedFileName, scratchpadDirPath);
  });

  await promise;

  return {
    // fileName: combinedFileName,
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
