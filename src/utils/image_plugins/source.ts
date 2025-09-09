import fs from "fs";
import { GraphAILogger } from "graphai";
import { ImageProcessorParams } from "../../types/index.js";
import { MulmoMediaSourceMethods } from "../../methods/mulmo_media_source.js";

type ImageType = "image" | "movie";

export const processSource = (imageType: ImageType) => {
  return async (params: ImageProcessorParams) => {
    const { beat, context } = params;
    if (!beat?.image || beat.image.type !== imageType) return;

    if (beat.image.source.kind === "url") {
      const response = await fetch(beat.image.source.url);
      if (!response.ok) {
        throw new Error(`Failed to download image: ${beat.image.source.url}`);
      }
      const buffer = Buffer.from(await response.arrayBuffer());

      // Detect file extension from Content-Type header or URL
      await fs.promises.writeFile(params.imagePath, buffer);
      return params.imagePath;
    }
    const path = MulmoMediaSourceMethods.resolve(beat.image.source, context);
    if (path) {
      return path;
    }
    GraphAILogger.error(`Image Plugin unknown ${imageType} source type:`, beat.image);
    throw new Error(`ERROR: unknown ${imageType} source type`);
  };
};

export const pathSource = (imageType: ImageType) => {
  return (params: ImageProcessorParams) => {
    const { beat, context } = params;
    if (beat.image?.type == "image") {
      if (beat.image.source?.kind === "url") {
        if (imageType === "image") {
          return params.imagePath;
        }
        return params.imagePath.replace(/\.png$/, ".mov");
      }
      const path = MulmoMediaSourceMethods.resolve(beat.image.source, context);
      if (path) {
        return path;
      }
    }
    return undefined;
  };
};
