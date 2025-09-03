import { parrotingImagePath } from "./utils.js";
import { htmlPlugin } from "mulmocast-vision";

export const imageType = "vision";

const toCreateName = (str: string): string => {
  return "create" + str.charAt(0).toUpperCase() + str.slice(1);
};

const processVision = async (params: ImageProcessorParams) => {
  const { beat, imagePath } = params;

  const handler = new htmlPlugin({});

  await handler[toCreateName(beat.image.name)](beat.image.data, {
    name: beat.image.name,
    imageFilePath: imagePath,
    htmlFilePath: imagePath.replace(/\.png$/, ".html")
  });

  return imagePath
}

export const process = processVision;
export const path = parrotingImagePath;
