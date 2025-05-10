import { MulmoMermaidMedia, MulmoMermaidMediaSchema } from "../../types/index.js";

export const isMulmoImageMermaild = (value: unknown): value is MulmoMermaidMedia => {
  const result = MulmoMermaidMediaSchema.safeParse(value);
  return result.success;
};
