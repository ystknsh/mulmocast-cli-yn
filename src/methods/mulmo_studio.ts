import { MulmoStudio } from "../types/index.js";
import { GraphAILogger } from "graphai";

type SessionType = "audio" | "image" | "video" | "multiLingual" | "caption" | "pdf";
type BeatSessionType = "audio" | "image" | "multiLingual" | "caption";

const notifyStateChange = (studio: MulmoStudio, sessionType: SessionType) => {
  const prefix = studio.state.inSession[sessionType] ? "<" : " >";
  GraphAILogger.info(`${prefix} ${sessionType}`);
};

const notifyBeatStateChange = (studio: MulmoStudio, sessionType: BeatSessionType, index: number) => {
  const prefix = studio.state.inBeatSession[sessionType].has(index) ? "{" : " }";
  GraphAILogger.info(`${prefix} ${sessionType} ${index}`);
};

export const MulmoStudioMethods = {
  setSessionState(studio: MulmoStudio, sessionType: SessionType, value: boolean) {
    studio.state.inSession[sessionType] = value;
    notifyStateChange(studio, sessionType);
  },
  setBeatSessionState(studio: MulmoStudio, sessionType: BeatSessionType, index: number, value: boolean) {
    if (value) {
      studio.state.inBeatSession[sessionType].add(index);
    } else {
      studio.state.inBeatSession[sessionType].delete(index);
    }
    notifyBeatStateChange(studio, sessionType, index);
  },
};
