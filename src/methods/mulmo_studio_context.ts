import path from "path";
import { MulmoStudioContext } from "../types/index.js";
import { GraphAILogger } from "graphai";

type SessionType = "audio" | "image" | "video" | "multiLingual" | "caption" | "pdf";
type BeatSessionType = "audio" | "image" | "multiLingual" | "caption" | "movie";

type SessionProgressEvent =
  | { kind: "session"; sessionType: SessionType; inSession: boolean }
  | { kind: "beat"; sessionType: BeatSessionType; index: number; inSession: boolean };

type SessionProgressCallback = (change: SessionProgressEvent) => void;

const sessionProgressCallbacks = new Set<SessionProgressCallback>();

export const addSessionProgressCallback = (cb: SessionProgressCallback) => {
  sessionProgressCallbacks.add(cb);
};
export const removeSessionProgressCallback = (cb: SessionProgressCallback) => {
  sessionProgressCallbacks.delete(cb);
};

const notifyStateChange = (context: MulmoStudioContext, sessionType: SessionType) => {
  const inSession = context.sessionState.inSession[sessionType] ?? false;
  const prefix = inSession ? "<" : " >";
  GraphAILogger.info(`${prefix} ${sessionType}`);
  for (const callback of sessionProgressCallbacks) {
    callback({ kind: "session", sessionType, inSession });
  }
};

const notifyBeatStateChange = (context: MulmoStudioContext, sessionType: BeatSessionType, index: number) => {
  const inSession = context.sessionState.inBeatSession[sessionType][index] ?? false;
  const prefix = inSession ? "{" : " }";
  GraphAILogger.info(`${prefix} ${sessionType} ${index}`);
  for (const callback of sessionProgressCallbacks) {
    callback({ kind: "beat", sessionType, index, inSession });
  }
};

export const MulmoStudioContextMethods = {
  resolveAssetPath(context: MulmoStudioContext, relativePath: string): string {
    return path.resolve(context.fileDirs.mulmoFileDirPath, relativePath);
  },
  getAudioDirPath(context: MulmoStudioContext): string {
    return context.fileDirs.audioDirPath;
  },
  getImageDirPath(context: MulmoStudioContext): string {
    return context.fileDirs.imageDirPath;
  },
  getOutDirPath(context: MulmoStudioContext): string {
    return context.fileDirs.outDirPath;
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
