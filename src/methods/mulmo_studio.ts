import { MulmoStudio } from "../types/index.js";
import { GraphAILogger } from "graphai";

type SessionType = "audio" | "image" | "video" | "multiLingual" | "caption" | "pdf";

const notifyStateChange = (studio: MulmoStudio, sessionType: SessionType) => {
  const prefix = studio.state.inSession[sessionType] ? "<" : ">";
  GraphAILogger.info(`${prefix} ${sessionType}`);
};

export const MulmoStudioMethods = {
  setSessionState(studio: MulmoStudio, sessionType: SessionType, value: boolean) {
    studio.state.inSession[sessionType] = value;
    notifyStateChange(studio, sessionType);
  },
};
