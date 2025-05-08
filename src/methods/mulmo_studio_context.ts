import path from "path";
import { MulmoStudioContext } from "../types/index.js";

export const MulmoStudioContextMethods = {
  resolveAssetPath(context: MulmoStudioContext, relativePath: string): string {
    return path.resolve(context.fileDirs.mulmoFileDirPath, relativePath);
  },
};
