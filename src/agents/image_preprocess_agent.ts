import { MulmoStudioBeat, MulmoStudioContext } from "../types/index.js";
import { MulmoScriptMethods, MulmoStudioContextMethods, Text2ImageAgentInfo } from "../methods/index.js";
import { getHTMLFile } from "../utils/file.js";
import { renderMarkdownToImage, renderHTMLToImage, interpolate } from "../utils/markdown.js";

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

  if (beat.image) {
    const canvasSize = MulmoScriptMethods.getCanvasSize(context.studio.script);
    if (beat.image.type === "textSlide") {
      const slide = beat.image.slide;
      const markdown: string = `# ${slide.title}\n` + slide.bullets.map((text) => `- ${text}`).join("\n");
      await renderMarkdownToImage(markdown, MulmoScriptMethods.getTextSlideStyle(context.studio.script, beat), imagePath, canvasSize.width, canvasSize.height);
    } else if (beat.image.type === "markdown") {
      const markdown: string = Array.isArray(beat.image.markdown) ? beat.image.markdown.join("\n") : beat.image.markdown;
      await renderMarkdownToImage(markdown, MulmoScriptMethods.getTextSlideStyle(context.studio.script, beat), imagePath, canvasSize.width, canvasSize.height);
    } else if (beat.image.type === "image") {
      if (beat.image.source.kind === "url") {
        // undefined prompt indicates "no need to generate image"
        return { path: beat.image.source.url, prompt: undefined, imageParams, aspectRatio };
      } else if (beat.image.source.kind === "path") {
        const path = MulmoStudioContextMethods.resolveAssetPath(context, beat.image.source.path);
        return { path, prompt: undefined, imageParams, aspectRatio };
      }
    } else if (beat.image.type === "chart") {
      const template = getHTMLFile("chart");
      const htmlData = interpolate(template, {
        title: beat.image.title,
        width: Math.round(canvasSize.width * 0.625).toString(),
        chart_data: JSON.stringify(beat.image.chartData),
      });
      await renderHTMLToImage(htmlData, imagePath, canvasSize.width, canvasSize.height);
    } else if (beat.image?.type === "mermaid") {
      const template = getHTMLFile("mermaid");
      const htmlData = interpolate(template, { title: beat.image.title, diagram_code: beat.image.code });
      await renderHTMLToImage(htmlData, imagePath, canvasSize.width, canvasSize.height);
    }
  }
  return { path: imagePath, prompt, imageParams, aspectRatio };
};
