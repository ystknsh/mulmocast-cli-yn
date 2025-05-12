import { ImageProcessorParams } from "../../types/index.js";
import { MulmoMediaSourceMethods } from "../../methods/index.js";
import { getHTMLFile } from "../file.js";
import { renderHTMLToImage, interpolate } from "../markdown.js";

export const imageType = "mermaid";

const processMermaid = async (params: ImageProcessorParams) => {
  const { beat, imagePath, canvasSize, context, textSlideStyle } = params;
  if (!beat.image || beat.image.type !== imageType) return;

  const template = getHTMLFile("mermaid");
  const diagram_code = await MulmoMediaSourceMethods.getText(beat.image.code, context);
  if (diagram_code) {
    const htmlData = interpolate(template, {
      title: beat.image.title,
      style: textSlideStyle,
      diagram_code: `${diagram_code}\n${beat.image.appendix?.join("\n") ?? ""}`,
    });
    await renderHTMLToImage(htmlData, imagePath, canvasSize.width, canvasSize.height);
  }
  return imagePath;
};

export const process = processMermaid;
