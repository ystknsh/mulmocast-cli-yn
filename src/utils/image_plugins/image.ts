import { processSource } from "./source.js";
import { parrotingImagePath } from "./utils.js";

export const imageType = "image";
export const process = processSource(imageType);
export const path = parrotingImagePath;
