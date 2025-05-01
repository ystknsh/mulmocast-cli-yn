import { MulmoScript } from "../types";

export const MulmoScriptMethods = {
  getPadding(script: MulmoScript): number {
    return script.videoParams?.padding ?? 1000; // msec
  },
};
