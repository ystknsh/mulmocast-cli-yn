import { MulmoStudio, MulmoStudioContext, MulmoCanvasDimension, BeatMediaType } from "../types/index.js";
import { GraphAILogger } from "graphai";

export const captions = async (context: MulmoStudioContext) => {
  const { caption, studio, fileDirs } = context;
  const { outDirPath } = fileDirs;
  GraphAILogger.log("*** DEBUG: captions:", caption);
};
  