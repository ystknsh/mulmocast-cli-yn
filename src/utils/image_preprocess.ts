import { ImageProcessorParams } from "../types/index.js";

import * as pluginImage from "./image_plugins/image.js";
import * as pluginChart from "./image_plugins/chart.js";
import * as pluginMermaid from "./image_plugins/mermaid.js";

import { renderMarkdownToImage, renderHTMLToImage, interpolate } from "./markdown.js";


export const processTextSlide = async (params: ImageProcessorParams) => {
  const { beat, imagePath, textSlideStyle, canvasSize } = params;
  if (!beat.image || beat.image.type !== "textSlide") return;

  const slide = beat.image.slide;
  const markdown = `# ${slide.title}\n` + slide.bullets.map((text) => `- ${text}`).join("\n");
  await renderMarkdownToImage(markdown, textSlideStyle, imagePath, canvasSize.width, canvasSize.height);
};

export const processMarkdown = async (params: ImageProcessorParams) => {
  const { beat, imagePath, textSlideStyle, canvasSize } = params;
  if (!beat.image || beat.image.type !== "markdown") return;

  const markdown = Array.isArray(beat.image.markdown) ? beat.image.markdown.join("\n") : beat.image.markdown;
  await renderMarkdownToImage(markdown, textSlideStyle, imagePath, canvasSize.width, canvasSize.height);
};



export const imagePlugins = [
  { imageType: "textSlide", process: processTextSlide },
  { imageType: "markdown", process: processMarkdown },
  pluginImage,
  pluginChart,
  pluginMermaid,
];
