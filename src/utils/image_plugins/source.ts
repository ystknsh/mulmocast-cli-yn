import { GraphAILogger } from "graphai";
import { ImageProcessorParams } from "../../types/index.js";
import { resolveMediaSource } from "../../utils/file.js";

type ImageType = "image" | "movie";

export const processSource = (imageType: ImageType) => {
  return (params: ImageProcessorParams) => {
    const { beat, context } = params;
    if (!beat.image || beat.image.type !== imageType) return;

    const path = resolveMediaSource(beat.image.source, context);
    if (path) {
      return path;
    }
    GraphAILogger.error(`Image Plugin unknown ${imageType} source type:`, beat.image);
    throw new Error(`ERROR: unknown ${imageType} source type`);
  };
};
