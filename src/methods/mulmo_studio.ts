import { MulmoStudio } from "../types/index.js";
import { GraphAILogger } from "graphai";

type ChangeType = "audio" | "image" | "video" | "multiLingual" | "caption" | "pdf";

const notifyStateChange = (studio: MulmoStudio, changeType: ChangeType) => {
  const prefix = studio.state.inSession[changeType] ? "<" : ">";
  GraphAILogger.info(`${prefix} ${changeType}`);
};

export const MulmoStudioMethods = {
  setSessionState(studio: MulmoStudio, changeType: ChangeType, value: boolean) {
    studio.state.inSession[changeType] = value;
    notifyStateChange(studio, changeType);
  },
};
