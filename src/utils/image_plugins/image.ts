import { ImageProcessorParams } from "../../types/index.js";
import { MulmoStudioContextMethods } from "../../methods/index.js";

export const imageType = "image";

const processImage = (params: ImageProcessorParams) => {
  const { beat, context } = params;
  if (!beat.image || beat.image.type !== "image") return;

  if (beat.image.source.kind === "url") {
    return beat.image.source.url;
  } else if (beat.image.source.kind === "path") {
    return MulmoStudioContextMethods.resolveAssetPath(context, beat.image.source.path);
  }
};

export const process = processImage;
