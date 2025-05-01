import { MulmoScript } from "../types";

export namespace MulmoScriptMethods {
  export const getPadding = (script: MulmoScript) => {
    return script.videoParams?.padding ?? 1000; // msec
  };
}
