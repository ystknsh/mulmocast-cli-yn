import { GraphAILogger } from "graphai";
import { ImageProcessorParams } from "../../types/index.js";
import { MulmoStudioContextMethods } from "../../methods/index.js";

export const imageType = "movie";

const processImage = (params: ImageProcessorParams) => {
  const { beat, context } = params;
  if (!beat.image || beat.image.type !== imageType) return;

  if (beat.image.source.kind === "url") {
    return beat.image.source.url;
  } else if (beat.image.source.kind === "path") {
    return MulmoStudioContextMethods.resolveAssetPath(context, beat.image.source.path);
  }
  GraphAILogger.error("Movie Plugin unknown image source type:", beat.image);
  throw new Error("ERROR: unknown movie source type");
};

export const process = processImage;
