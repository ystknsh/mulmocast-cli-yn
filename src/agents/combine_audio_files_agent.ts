import { AgentFunction, AgentFunctionInfo } from "graphai";
import ffmpeg from "fluent-ffmpeg";
import { MulmoStudio, MulmoStudioContext, MulmoStudioBeat } from "../types";
import { silentPath, silentLastPath, getAudioSegmentFilePath } from "../utils/file";
import { MulmoStudioContextMethods } from "../methods";

const combineAudioFilesAgent: AgentFunction<
  null,
  { studio: MulmoStudio },
  { context: MulmoStudioContext; combinedFileName: string; audioDirPath: string }
> = async ({ namedInputs }) => {
  const { context, combinedFileName, audioDirPath } = namedInputs;
  const command = ffmpeg();

  const promise = new Promise((resolve, reject) => {
    Promise.all(
      context.studio.beats.map(async (mulmoBeat: MulmoStudioBeat, index: number) => {
        const audioPath =
          mulmoBeat.audio?.type === "audio" &&
          ((mulmoBeat.audio?.source.kind === "path" && MulmoStudioContextMethods.resolveAssetPath(context, mulmoBeat.audio.source.path)) ||
            (mulmoBeat.audio?.source.kind === "url" && mulmoBeat.audio.source.url));
        const filePath = audioPath || getAudioSegmentFilePath(audioDirPath, context.studio.filename, mulmoBeat.audioFile ?? "");
        const isLast = index === context.studio.beats.length - 2;
        command.input(filePath);
        command.input(isLast ? silentLastPath : silentPath);
        // Measure and log the timestamp of each section

        const duration = await new Promise<number>((resolveInner, rejectInner) => {
          ffmpeg.ffprobe(filePath, (err, metadata) => {
            if (err) {
              console.error("Error while getting metadata:", err);
              rejectInner(err);
            } else {
              resolveInner(metadata.format.duration! + (isLast ? 0.8 : 0.3));
            }
          });
        });
        context.studio.beats[index]["duration"] = duration;
      }),
    )
      .then(() => {
        command
          .on("end", () => {
            resolve(0);
          })
          .on("error", (err: unknown) => {
            console.error("Error while combining MP3 files:", err);
            reject(err);
          })
          .mergeToFile(combinedFileName, audioDirPath);
      })
      .catch((error) => {
        reject(error);
      });
  });

  await promise;

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
