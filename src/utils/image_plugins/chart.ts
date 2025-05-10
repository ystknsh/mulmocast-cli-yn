import { ImageProcessorParams } from "../../types/index.js";
import { getHTMLFile } from "../file.js";
import { renderHTMLToImage, interpolate } from "../markdown.js";
import { isMulmoImageChart } from "./type_guards.js";

export const imageType = "chart";

const processChart = async (params: ImageProcessorParams) => {
  const { beat, imagePath, canvasSize } = params;
  if (!isMulmoImageChart(beat.image)) return;

  const template = getHTMLFile("chart");
  const htmlData = interpolate(template, {
    title: beat.image.title,
    width: Math.round(canvasSize.width * 0.625).toString(),
    chart_data: JSON.stringify(beat.image.chartData),
  });
  await renderHTMLToImage(htmlData, imagePath, canvasSize.width, canvasSize.height);
};

export const process = processChart;
