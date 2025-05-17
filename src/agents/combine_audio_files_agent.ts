import { GraphAILogger } from "graphai";
import type { AgentFunction, AgentFunctionInfo } from "graphai";
import ffmpeg from "fluent-ffmpeg";
import { MulmoStudio, MulmoStudioContext, MulmoStudioBeat } from "../types/index.js";
import { silentPath, silentLastPath } from "../utils/file.js";

const combineAudioFilesAgent: AgentFunction<
  null,
  { studio: MulmoStudio },
  { context: MulmoStudioContext; combinedFileName: string; audioDirPath: string }
> = async ({ namedInputs }) => {
  const { context, combinedFileName, audioDirPath } = namedInputs;
  const ffmpegContext = {
    command: ffmpeg(),
    inputCount: 0,
  };

  function addInput(input: string) {
    ffmpegContext.command = ffmpegContext.command.input(input);
    ffmpegContext.inputCount++;
    return ffmpegContext.inputCount - 1; // returned the index of the input
  }

  const getDuration = (filePath: string, isLastGap: boolean) => {
    return new Promise<number>((resolve, reject) => {
      ffmpeg.ffprobe(filePath, (err, metadata) => {
        if (err) {
          GraphAILogger.info("Error while getting metadata:", err);
          reject(err);
        } else {
          // TODO: Remove hard-coded 0.8 and 0.3
          resolve(metadata.format.duration! + (isLastGap ? 0.8 : 0.3));
        }
      });
    });
  };

  const inputIds = (await Promise.all(
    context.studio.beats.map(async (studioBeat: MulmoStudioBeat, index: number) => {
      const isLastGap = index === context.studio.beats.length - 2;
      if (studioBeat.audioFile) {
        const inputId = `[${addInput(studioBeat.audioFile)}:a]`;
        const silentInputId = `[${addInput(isLastGap ? silentLastPath : silentPath)}:a]`;
        studioBeat.duration = await getDuration(studioBeat.audioFile, isLastGap);
        return [inputId, silentInputId];
      } else {
        GraphAILogger.error("Missing studioBeat.audioFile:", index);
        return [];
      }
    }),
  )).flat();
  const complexFilters: string[] = [];
  complexFilters.push(`${inputIds.join("")}concat=n=${inputIds.length}:v=0:a=1[aout]`);
  console.log(`complexFilters: ${complexFilters}`);
  
  await new Promise((resolve, reject) => {
    ffmpegContext.command
      .complexFilter(complexFilters)
      .outputOptions(['-map', '[aout]'])
      .output(combinedFileName)
      .on("end", () => {
        resolve(0);
      })
      .on("error", (err: unknown) => {
        GraphAILogger.info("Error while combining MP3 files:", err);
        reject(err);
      })
      .run()
  });

  return {
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
