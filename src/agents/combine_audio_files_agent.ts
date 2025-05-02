import { AgentFunction, AgentFunctionInfo } from "graphai";
import ffmpeg from "fluent-ffmpeg";
import path from "path";
import { MulmoStudio, MulmoStudioBeat } from "../types";
import { silentPath, silentLastPath } from "../utils/file";

const combineAudioFilesAgent: AgentFunction<null, { studio: MulmoStudio }, { studio: MulmoStudio; combinedFileName: string }> = async ({ namedInputs }) => {
  const { studio, combinedFileName } = namedInputs;
  const command = ffmpeg();
  studio.beats.forEach((mulmoBeat: MulmoStudioBeat, index: number) => {
    const filePath = path.resolve("./scratchpad/" + mulmoBeat.filename + ".mp3");
    const isLast = index === studio.beats.length - 2;
    command.input(filePath);
    command.input(isLast ? silentLastPath : silentPath);
    // Measure and log the timestamp of each section
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) {
        console.error("Error while getting metadata:", err);
      } else {
        studio.beats[index]["duration"] = metadata.format.duration! + (isLast ? 0.8 : 0.3);
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
      .mergeToFile(combinedFileName, path.dirname(combinedFileName));
  });

  await promise;

  return {
    // fileName: combinedFileName,
    studio,
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
