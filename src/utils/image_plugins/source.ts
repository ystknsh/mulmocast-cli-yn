import { GraphAILogger } from "graphai";
import { ImageProcessorParams } from "../../types/index.js";
import { MulmoStudioContextMethods } from "../../methods/index.js";

type ImageType = "image" | "movie";

export const processSource = (imageType: ImageType) => {
  return (params: ImageProcessorParams) => {
    const { beat, context } = params;
    if (!beat.image || beat.image.type !== imageType) return;

    if (beat.image.source.kind === "url") {
      return beat.image.source.url;
    } else if (beat.image.source.kind === "path") {
      return MulmoStudioContextMethods.resolveAssetPath(context, beat.image.source.path);
    }
    GraphAILogger.error(`Image Plugin unknown ${imageType} source type:`, beat.image);
    throw new Error(`ERROR: unknown ${imageType} source type`);
  };
};
