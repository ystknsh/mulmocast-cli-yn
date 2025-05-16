import { ImageProcessorParams } from "../../types/index.js";
import { getHTMLFile } from "../file.js";
import { renderHTMLToImage, interpolate } from "../markdown.js";

export const imageType = "tailwind";

const processTailwind = async (params: ImageProcessorParams) => {
  const { beat, imagePath, canvasSize } = params;
  if (!beat.image || beat.image.type !== imageType) return;

  const html = Array.isArray(beat.image.html) ? beat.image.html.join("\n") : beat.image.html;

  const template = getHTMLFile("tailwind");
  const htmlData = interpolate(template, {
    // style: textSlideStyle,
    // width: Math.round(canvasSize.width * 0.625).toString(),
    html_body: html,
  });
  await renderHTMLToImage(htmlData, imagePath, canvasSize.width, canvasSize.height);
  return imagePath;
};

export const process = processTailwind;
