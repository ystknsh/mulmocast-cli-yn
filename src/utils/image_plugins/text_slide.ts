import { ImageProcessorParams } from "../../types/index.js";
import { renderMarkdownToImage } from "../markdown.js";
import { isMulmoImageTextSlide } from "./type_guards.js";

export const imageType = "textSlide";

const processTextSlide = async (params: ImageProcessorParams) => {
  const { beat, imagePath, textSlideStyle, canvasSize } = params;
  if (!isMulmoImageTextSlide(beat.image)) return;

  const slide = beat.image.slide;
  const markdown = `# ${slide.title}\n` + slide.bullets.map((text) => `- ${text}`).join("\n");
  await renderMarkdownToImage(markdown, textSlideStyle, imagePath, canvasSize.width, canvasSize.height);
};

export const process = processTextSlide;
