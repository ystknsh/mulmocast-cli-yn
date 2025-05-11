import { ImageProcessorParams } from "../../types/index.js";
import { MulmoMediaSourceMethods } from "../../methods/index.js";
import { getHTMLFile } from "../file.js";
import { renderHTMLToImage, interpolate } from "../markdown.js";

export const imageType = "mermaid";
export const outputMode = "generate";

const processMermaid = async (params: ImageProcessorParams) => {
  const { beat, imagePath, canvasSize } = params;
  if (!beat.image || beat.image.type !== imageType) return;

  const template = getHTMLFile("mermaid");
  const text = await MulmoMediaSourceMethods.getMediaSourceText(beat.image.code);
  if (text) {
    const htmlData = interpolate(template, {
      title: beat.image.title,
      diagram_code: text,
    });
    await renderHTMLToImage(htmlData, imagePath, canvasSize.width, canvasSize.height);
  }
};

export const process = processMermaid;
