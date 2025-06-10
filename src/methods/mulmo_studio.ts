import { MulmoStudio } from "../types/index.js";
import { GraphAILogger } from "graphai";

type SessionType = "audio" | "image" | "video" | "multiLingual" | "caption" | "pdf";
type BeatSessionType = "audio" | "image" | "multiLingual" | "caption" | "movie";

const notifyStateChange = (studio: MulmoStudio, sessionType: SessionType) => {
  const prefix = studio.state.inSession[sessionType] ? "<" : " >";
  GraphAILogger.info(`${prefix} ${sessionType}`);
};

const notifyBeatStateChange = (studio: MulmoStudio, sessionType: BeatSessionType, index: number) => {
  const prefix = studio.state.inBeatSession[sessionType][index] ? "{" : " }";
  GraphAILogger.info(`${prefix} ${sessionType} ${index}`);
};

export const MulmoStudioMethods = {
  setSessionState(studio: MulmoStudio, sessionType: SessionType, value: boolean) {
    studio.state.inSession[sessionType] = value;
    notifyStateChange(studio, sessionType);
  },
  setBeatSessionState(studio: MulmoStudio, sessionType: BeatSessionType, index: number, value: boolean) {
    if (value) {
      studio.state.inBeatSession[sessionType][index] = true;
    } else {
      studio.state.inBeatSession[sessionType][index] = false;
    }
    notifyBeatStateChange(studio, sessionType, index);
  },
};
