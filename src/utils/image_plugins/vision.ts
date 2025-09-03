import { ImageProcessorParams } from "../../types/index.js";
import { parrotingImagePath } from "./utils.js";
import { htmlPlugin } from "mulmocast-vision";

let rootDir: string | undefined = undefined;
export const updateVisionRootDir = (dir: string) => {
  rootDir = dir;
};

export const imageType = "vision";

const toCreateName = (str: string): string => {
  return "create" + str.charAt(0).toUpperCase() + str.slice(1);
};

const processVision = async (params: ImageProcessorParams) => {
  const { beat, imagePath } = params;
  if (!beat?.image || beat.image.type !== imageType) return;

  const handler = new htmlPlugin({ rootDir });

  await handler[toCreateName(beat.image.name) as keyof htmlPlugin](beat.image.data, {
    name: beat.image.name,
    imageFilePath: imagePath,
    htmlFilePath: imagePath.replace(/\.png$/, ".html"),
  });

  return imagePath;
};

export const process = processVision;
export const path = parrotingImagePath;
