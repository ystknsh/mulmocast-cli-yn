import { ImageProcessorParams } from "../../types/index.js";
import { renderMarkdownToImage } from "../markdown.js";
import { isMulmoImageMarkdown } from "./type_guards.js";

export const imageType = "markdown";

const processMarkdown = async (params: ImageProcessorParams) => {
  const { beat, imagePath, textSlideStyle, canvasSize } = params;
  if (!isMulmoImageMarkdown(beat.image)) return;

  const markdown = Array.isArray(beat.image.markdown) ? beat.image.markdown.join("\n") : beat.image.markdown;
  await renderMarkdownToImage(markdown, textSlideStyle, imagePath, canvasSize.width, canvasSize.height);
};

export const process = processMarkdown;
