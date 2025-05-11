import { ImageProcessorParams } from "../../types/index.js";
import { renderMarkdownToImage } from "../markdown.js";

export const imageType = "markdown";
export const outputMode = "generate";

const processMarkdown = async (params: ImageProcessorParams) => {
  const { beat, imagePath, textSlideStyle, canvasSize } = params;
  if (!beat.image || beat.image.type !== imageType) return;

  const markdown = Array.isArray(beat.image.markdown) ? beat.image.markdown.join("\n") : beat.image.markdown;
  await renderMarkdownToImage(markdown, textSlideStyle, imagePath, canvasSize.width, canvasSize.height);
};

export const process = processMarkdown;
