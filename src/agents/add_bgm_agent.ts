import { GraphAILogger } from "graphai";
import type { AgentFunction, AgentFunctionInfo } from "graphai";
import ffmpeg from "fluent-ffmpeg";
import { MulmoScript } from "../types/index.js";
import { MulmoScriptMethods } from "../methods/index.js";
import {
  FfmpegContextAddInput,
  FfmpegContextInit,
  FfmpegContextPushFormattedAudio,
  FfmpegContextGenerateOutput,
  ffmPegGetMediaDuration,
} from "../utils/ffmpeg_utils.js";

const addBGMAgent: AgentFunction<{ musicFile: string }, string, { voiceFile: string; outputFile: string; script: MulmoScript }> = async ({
  namedInputs,
  params,
}) => {
  const { voiceFile, outputFile, script } = namedInputs;
  const { musicFile } = params;

  const speechDuration = await ffmPegGetMediaDuration(voiceFile);
  const padding = MulmoScriptMethods.getPadding(script);
  const totalDuration = (padding * 2) / 1000 + Math.round(speechDuration ?? 0);
  GraphAILogger.log("totalDucation:", speechDuration, totalDuration);

  const ffmpegContext = FfmpegContextInit();
  const musicInputIndex = FfmpegContextAddInput(ffmpegContext, musicFile);
  const voiceInputIndex = FfmpegContextAddInput(ffmpegContext, voiceFile);
  ffmpegContext.filterComplex.push(`[${musicInputIndex}:a]aformat=sample_fmts=fltp:sample_rates=44100:channel_layouts=stereo, volume=0.2[music]`);
  ffmpegContext.filterComplex.push(`[${voiceInputIndex}:a]aformat=sample_fmts=fltp:sample_rates=44100:channel_layouts=stereo, volume=2, adelay=${padding}|${padding}[voice]`);
  ffmpegContext.filterComplex.push(`[music][voice]amix=inputs=2:duration=longest[mixed]`);
  ffmpegContext.filterComplex.push(`[mixed]atrim=start=0:end=${totalDuration}[trimmed]`);
  const fadeOutDuration = 1.0; // TODO: parameterize it
  const fadeStartTime = totalDuration - fadeOutDuration;
  ffmpegContext.filterComplex.push(`[trimmed]afade=t=out:st=${fadeStartTime}:d=${fadeOutDuration}[faded]`);
  await FfmpegContextGenerateOutput(ffmpegContext, outputFile, ["-map", "[faded]"]);

  return outputFile;
};
const addBGMAgentInfo: AgentFunctionInfo = {
  name: "addBGMAgent",
  agent: addBGMAgent,
  mock: addBGMAgent,
  samples: [],
  description: "addBGMAgent",
  category: ["ffmpeg"],
  author: "satoshi nakajima",
  repository: "https://github.com/snakajima/ai-podcaster",
  license: "MIT",
};

export default addBGMAgentInfo;
