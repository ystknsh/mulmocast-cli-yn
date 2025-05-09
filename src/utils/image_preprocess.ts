import { MulmoStudioBeat, MulmoStudioContext, MulmoCanvasDimension } from "../types/index.js";
import { MulmoStudioContextMethods } from "../methods/index.js";
import { getHTMLFile } from "./file.js";
import { renderMarkdownToImage, renderHTMLToImage, interpolate } from "./markdown.js";

type ImageProcessorParams = {
  beat: MulmoStudioBeat;
  context: MulmoStudioContext;
  imagePath: string;
  textSlideStyle: string;
  canvasSize: MulmoCanvasDimension;
};

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

export const processImage = (params: ImageProcessorParams) => {
  const { beat, context } = params;
  if (!beat.image || beat.image.type !== "image") return;

  if (beat.image.source.kind === "url") {
    return beat.image.source.url;
  } else if (beat.image.source.kind === "path") {
    return MulmoStudioContextMethods.resolveAssetPath(context, beat.image.source.path);
  }
};

export const processChart = async (params: ImageProcessorParams) => {
  const { beat, imagePath, canvasSize } = params;
  if (!beat.image || beat.image.type !== "chart") return;

  const template = getHTMLFile("chart");
  const htmlData = interpolate(template, {
    title: beat.image.title,
    width: Math.round(canvasSize.width * 0.625).toString(),
    chart_data: JSON.stringify(beat.image.chartData),
  });
  await renderHTMLToImage(htmlData, imagePath, canvasSize.width, canvasSize.height);
};

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
