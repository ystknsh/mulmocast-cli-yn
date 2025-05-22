import { MulmoStudio } from "../types/index.js";
import { GraphAILogger } from "graphai";

type ChangeType = "generatingAudio" | "generatingImage" | "generatingVideo" | "generatingMultiLingual" | "generatingCaption" | "generatingPDF";

const notifyStateChange = (studio: MulmoStudio, changeType: ChangeType) => {
  const prefix = studio.state[changeType] ? "<" : ">";
  GraphAILogger.info(`${prefix} ${changeType}`);
};

export const MulmoStudioMethods = {
  setSessionState(studio: MulmoStudio, changeType: ChangeType, value: boolean) {
    studio.state[changeType] = value;
    notifyStateChange(studio, changeType);
  },
};
