import { MulmoStudioContext } from "../types";

export const MulmoStudioContextMethods = {
  resolveAssetPath(context: MulmoStudioContext): string {
    return context.fileDirs.mulmoFileDirPath;
  },
};
