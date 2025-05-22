import { MulmoStudio } from "../types/index.js";
import { GraphAILogger } from "graphai";

type ChangeType = "generatingAudio" | "generatingImage" | "generatingVideo" | "generatingMultiLingual" | "generatingCaption";

const notifyStateChange = (studio: MulmoStudio, changeType: ChangeType) => {
  GraphAILogger.info(`*** ${changeType} changed to ${studio.state[changeType]}`);
};

export const MulmoStudioMethods = {
  setSessionState(studio: MulmoStudio, changeType: ChangeType, value: boolean) {
    studio.state[changeType] = value;
    notifyStateChange(studio, changeType);
  },
};
