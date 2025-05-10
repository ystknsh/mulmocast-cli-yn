import { ImageProcessorParams } from "../../types/index.js";
import { getHTMLFile } from "../file.js";
import { renderHTMLToImage, interpolate } from "../markdown.js";
import { isMulmoImageMermaild } from "./type_guards.js";

export const imageType = "mermaid";

const processMermaid = async (params: ImageProcessorParams) => {
  const { beat, imagePath, canvasSize } = params;
  if (!isMulmoImageMermaild(beat.image)) return;

  const template = getHTMLFile("mermaid");
  if (beat.image.code.kind === "text") {
    const htmlData = interpolate(template, {
      title: beat.image.title,
      diagram_code: beat.image.code.text,
    });
    await renderHTMLToImage(htmlData, imagePath, canvasSize.width, canvasSize.height);
  }
};

export const process = processMermaid;
