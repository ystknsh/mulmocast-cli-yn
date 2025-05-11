import {
  MulmoTextSlideMedia,
  MulmoTextSlideMediaSchema,
  MulmoMarkdownMedia,
  MulmoMarkdownMediaSchema,
  MulmoImageMedia,
  MulmoImageMediaSchema,
  MulmoChartMedia,
  MulmoChartMediaSchema,
  MulmoMermaidMedia,
  MulmoMermaidMediaSchema,
} from "../../types/index.js";

export const isMulmoImageTextSlide = (value: unknown): value is MulmoTextSlideMedia => {
  const result = MulmoTextSlideMediaSchema.safeParse(value);
  return result.success;
};

export const isMulmoImageMarkdown = (value: unknown): value is MulmoMarkdownMedia => {
  const result = MulmoMarkdownMediaSchema.safeParse(value);
  return result.success;
};

export const isMulmoImageImage = (value: unknown): value is MulmoImageMedia => {
  const result = MulmoImageMediaSchema.safeParse(value);
  return result.success;
};

export const isMulmoImageChart = (value: unknown): value is MulmoChartMedia => {
  const result = MulmoChartMediaSchema.safeParse(value);
  return result.success;
};

export const isMulmoImageMermaild = (value: unknown): value is MulmoMermaidMedia => {
  const result = MulmoMermaidMediaSchema.safeParse(value);
  return result.success;
};
