import path from "path";
import { MulmoStudioContext } from "../types/index.js";
import { GraphAILogger } from "graphai";

type SessionType = "audio" | "image" | "video" | "multiLingual" | "caption" | "pdf";
type BeatSessionType = "audio" | "image" | "multiLingual" | "caption" | "movie";

const notifyStateChange = (context: MulmoStudioContext, sessionType: SessionType) => {
  const prefix = context.sessionState.inSession[sessionType] ? "<" : " >";
  GraphAILogger.info(`${prefix} ${sessionType}`);
};

const notifyBeatStateChange = (context: MulmoStudioContext, sessionType: BeatSessionType, index: number) => {
  const prefix = context.sessionState.inBeatSession[sessionType][index] ? "{" : " }";
  GraphAILogger.info(`${prefix} ${sessionType} ${index}`);
};

export const MulmoStudioContextMethods = {
  resolveAssetPath(context: MulmoStudioContext, relativePath: string): string {
    return path.resolve(context.fileDirs.mulmoFileDirPath, relativePath);
  },
  setSessionState(context: MulmoStudioContext, sessionType: SessionType, value: boolean) {
    context.sessionState.inSession[sessionType] = value;
    notifyStateChange(context, sessionType);
  },
  setBeatSessionState(context: MulmoStudioContext, sessionType: BeatSessionType, index: number, value: boolean) {
    if (value) {
      context.sessionState.inBeatSession[sessionType][index] = true;
    } else {
      // NOTE: Setting to false causes the parse error in rebuildStudio in preprocess.ts
      delete context.sessionState.inBeatSession[sessionType][index];
    }
    notifyBeatStateChange(context, sessionType, index);
  },
};
