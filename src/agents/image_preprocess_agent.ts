import { MulmoStudioBeat, MulmoStudioContext, MulmoCanvasDimension } from "../types/index.js";
import { MulmoScriptMethods, MulmoStudioContextMethods, Text2ImageAgentInfo } from "../methods/index.js";
import { getHTMLFile } from "../utils/file.js";
import { renderMarkdownToImage, renderHTMLToImage, interpolate } from "../utils/markdown.js";

type ImageProcessorParams = {
  beat: MulmoStudioBeat;
  context: MulmoStudioContext;
  imagePath: string;
  textSlideStyle: string;
  canvasSize: MulmoCanvasDimension;
};

const processTextSlide = async (params: ImageProcessorParams) => {
  const { beat, imagePath, textSlideStyle, canvasSize } = params;
  if (!beat.image || beat.image.type !== "textSlide") return;

  const slide = beat.image.slide;
  const markdown = `# ${slide.title}\n` + slide.bullets.map((text) => `- ${text}`).join("\n");
  await renderMarkdownToImage(markdown, textSlideStyle, imagePath, canvasSize.width, canvasSize.height);
};

const processMarkdown = async (params: ImageProcessorParams) => {
  const { beat, imagePath, textSlideStyle, canvasSize } = params;
  if (!beat.image || beat.image.type !== "markdown") return;

  const markdown = Array.isArray(beat.image.markdown) ? beat.image.markdown.join("\n") : beat.image.markdown;
  await renderMarkdownToImage(markdown, textSlideStyle, imagePath, canvasSize.width, canvasSize.height);
};

const processImage = (params: ImageProcessorParams) => {
  const { beat, context } = params;
  if (!beat.image || beat.image.type !== "image") return;

  if (beat.image.source.kind === "url") {
    return beat.image.source.url;
  } else if (beat.image.source.kind === "path") {
    return MulmoStudioContextMethods.resolveAssetPath(context, beat.image.source.path);
  }
};

const processChart = async (params: ImageProcessorParams) => {
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

const processMermaid = async (params: ImageProcessorParams) => {
  const { beat, imagePath, canvasSize } = params;
  if (!beat.image || beat.image.type !== "mermaid") return;

  const template = getHTMLFile("mermaid");
  const htmlData = interpolate(template, {
    title: beat.image.title,
    diagram_code: beat.image.code,
  });
  await renderHTMLToImage(htmlData, imagePath, canvasSize.width, canvasSize.height);
};

export const imagePreprocessAgent = async (namedInputs: {
  context: MulmoStudioContext;
  beat: MulmoStudioBeat;
  index: number;
  suffix: string;
  imageDirPath: string;
  imageAgentInfo: Text2ImageAgentInfo;
}) => {
  const { context, beat, index, suffix, imageDirPath, imageAgentInfo } = namedInputs;
  const imageParams = { ...imageAgentInfo.imageParams, ...beat.imageParams };
  const prompt = (beat.imagePrompt || beat.text) + "\n" + (imageParams.style || "");
  const imagePath = `${imageDirPath}/${context.studio.filename}/${index}${suffix}.png`;
  const aspectRatio = MulmoScriptMethods.getAspectRatio(context.studio.script);
  const textSlideStyle = MulmoScriptMethods.getTextSlideStyle(context.studio.script, beat);

  if (beat.image) {
    const canvasSize = MulmoScriptMethods.getCanvasSize(context.studio.script);
    const processorParams = { beat, context, imagePath, textSlideStyle, canvasSize };

    if (beat.image.type === "textSlide") {
      await processTextSlide(processorParams);
    } else if (beat.image.type === "markdown") {
      await processMarkdown(processorParams);
    } else if (beat.image.type === "image") {
      const path = processImage(processorParams);
      if (path) {
        // undefined prompt indicates that image generation is not needed
        return { path, prompt: undefined, imageParams, aspectRatio };
      }
    } else if (beat.image.type === "chart") {
      await processChart(processorParams);
    } else if (beat.image.type === "mermaid") {
      await processMermaid(processorParams);
    }
  }

  return { path: imagePath, prompt, imageParams, aspectRatio };
};
