import { ImageProcessorParams, MulmoMermaidMedia, MulmoMermaidMediaSchema } from "../../types/index.js";
import { getHTMLFile } from "../file.js";
import { renderHTMLToImage, interpolate } from "../markdown.js";

export const imageType = "mermaid";

function isMulmoImageMermaild(value: unknown): value is MulmoMermaidMedia {
  const result = MulmoMermaidMediaSchema.safeParse(value);
  return result.success;
}

const processMermaid = async (params: ImageProcessorParams) => {
  const { beat, imagePath, canvasSize } = params;
  if (!isMulmoImageMermaild(beat.image)) return;
  // if (!beat.image || beat.image.type !== "mermaid") return;

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
