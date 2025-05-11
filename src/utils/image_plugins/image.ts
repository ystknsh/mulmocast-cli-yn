import { ImageProcessorParams } from "../../types/index.js";
import { MulmoStudioContextMethods } from "../../methods/index.js";
import { isMulmoImageImage } from "./type_guards.js";

export const imageType = "image";

const processImage = (params: ImageProcessorParams) => {
  const { beat, context } = params;
  if (!isMulmoImageImage(beat.image)) return;

  if (beat.image.source.kind === "url") {
    return beat.image.source.url;
  } else if (beat.image.source.kind === "path") {
    return MulmoStudioContextMethods.resolveAssetPath(context, beat.image.source.path);
  }
};

export const process = processImage;
