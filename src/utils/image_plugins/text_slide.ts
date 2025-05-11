import { ImageProcessorParams } from "../../types/index.js";
import { renderMarkdownToImage } from "../markdown.js";

export const imageType = "textSlide";
export const outputMode = "generate";

const processTextSlide = async (params: ImageProcessorParams) => {
  const { beat, imagePath, textSlideStyle, canvasSize } = params;
  if (!beat.image || beat.image.type !== imageType) return;

  const slide = beat.image.slide;
  const markdown = `# ${slide.title}\n` + slide.bullets.map((text) => `- ${text}`).join("\n");
  await renderMarkdownToImage(markdown, textSlideStyle, imagePath, canvasSize.width, canvasSize.height);
};

export const process = processTextSlide;
