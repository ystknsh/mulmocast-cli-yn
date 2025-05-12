import { ImageProcessorParams } from "../../types/index.js";
import { getHTMLFile } from "../file.js";
import { renderHTMLToImage, interpolate } from "../markdown.js";

export const imageType = "chart";

const processChart = async (params: ImageProcessorParams) => {
  const { beat, imagePath, canvasSize, textSlideStyle } = params;
  if (!beat.image || beat.image.type !== imageType) return;

  const template = getHTMLFile("chart");
  const htmlData = interpolate(template, {
    title: beat.image.title,
    style: textSlideStyle,
    width: Math.round(canvasSize.width * 0.625).toString(),
    chart_data: JSON.stringify(beat.image.chartData),
  });
  await renderHTMLToImage(htmlData, imagePath, canvasSize.width, canvasSize.height);
  return imagePath;
};

export const process = processChart;
