import { GraphAILogger } from "graphai";
import { ImageProcessorParams } from "../../types/index.js";
import { MulmoStudioContextMethods } from "../../methods/index.js";

export const imageType = "image";

const processImage = (params: ImageProcessorParams) => {
  const { beat, context } = params;
  if (!beat.image || beat.image.type !== imageType) return;

  if (beat.image.source.kind === "url") {
    return beat.image.source.url;
  } else if (beat.image.source.kind === "path") {
    return MulmoStudioContextMethods.resolveAssetPath(context, beat.image.source.path);
  }
  GraphAILogger.error("Image Plugin unknown image source type:", beat.image);
  throw new Error("ERROR: unknown image source type");
};

export const process = processImage;
