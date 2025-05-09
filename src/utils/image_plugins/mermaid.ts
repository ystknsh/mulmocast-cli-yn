import { ImageProcessorParams } from "../../types/index.js";
import { getHTMLFile } from "../file.js";
import { renderHTMLToImage, interpolate } from "../markdown.js";

export const imageType = "mermaid";

export const processMermaid = async (params: ImageProcessorParams) => {
  const { beat, imagePath, canvasSize } = params;
  if (!beat.image || beat.image.type !== "mermaid") return;

  const template = getHTMLFile("mermaid");
  const htmlData = interpolate(template, {
    title: beat.image.title,
    diagram_code: beat.image.code,
  });
  await renderHTMLToImage(htmlData, imagePath, canvasSize.width, canvasSize.height);
};

export const process = processMermaid;
