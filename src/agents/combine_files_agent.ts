import { AgentFunction, AgentFunctionInfo } from "graphai";
import ffmpeg from "fluent-ffmpeg";
import path from "path";
import { MulmoScript, MulmoBeat } from "../type";

const combineFilesAgent: AgentFunction<null, { script: MulmoScript; fileName: string }, { script: MulmoScript; combinedFileName: string }> = async ({
  namedInputs,
}) => {
  const { script, combinedFileName } = namedInputs;
  const outputFile = path.resolve(combinedFileName);
  const silentPath = path.resolve("./music/silent300.mp3");
  const silentLastPath = path.resolve("./music/silent800.mp3");
  const command = ffmpeg();
  script.beats.forEach((mulmoBeat: MulmoBeat, index: number) => {
    const filePath = path.resolve("./scratchpad/" + mulmoBeat.filename + ".mp3");
    const isLast = index === script.beats.length - 2;
    command.input(filePath);
    command.input(isLast ? silentLastPath : silentPath);
    // Measure and log the timestamp of each section
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) {
        console.error("Error while getting metadata:", err);
      } else {
        mulmoBeat["duration"] = metadata.format.duration! + (isLast ? 0.8 : 0.3);
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
      .mergeToFile(outputFile, path.dirname(outputFile));
  });

  await promise;

  return {
    fileName: outputFile,
    script,
  };
};

const combineFilesAgentInfo: AgentFunctionInfo = {
  name: "combineFilesAgent",
  agent: combineFilesAgent,
  mock: combineFilesAgent,
  samples: [],
  description: "combineFilesAgent",
  category: ["ffmpeg"],
  author: "satoshi nakajima",
  repository: "https://github.com/snakajima/ai-podcaster",
  license: "MIT",
};

export default combineFilesAgentInfo;
