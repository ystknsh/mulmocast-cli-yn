import { z } from "zod";

export const langSchema = z.string()

export const mediaSourceSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("url"), url: z.string() }),
  z.object({ kind: z.literal("data"), data: z.string() }),
  z.object({ kind: z.literal("file"), filename: z.string() }),
]);

export const mulmoMediaSchema = z.union([
  z.object({ type: z.literal("markdown"), markdown: z.string() }),
  z.object({ type: z.literal("web"), url: z.string() }),
  z.object({ type: z.literal("pdf"), source: mediaSourceSchema }),
  z.object({ type: z.literal("image"), source: mediaSourceSchema }),
  z.object({ type: z.literal("svg"), source: mediaSourceSchema }),
  z.object({ type: z.literal("movie"), source: mediaSourceSchema }),
]);

export const localizedTextSchema = z.object({
  text: z.string(),
  lang: z.string(),
  texts: z.array(z.string()),
  ttsTexts: z.array(z.string()),
  duration: z.number(),
  filename: z.string(),
});

export const speakerDataSchema = z.object({
  displayName: z.record(z.string(), z.string()),
  voiceId: z.string(),
});

export const speakerDictionarySchema = z.record(z.string(), speakerDataSchema);

export const text2imageParamsSchema = z.object({
  model: z.string().optional(),
  size: z.string().optional(),
  aspectRatio: z.string().optional(),
  style: z.string().optional(),
});

export const text2speechParamsSchema = z.object({
  speed: z.number().optional(),
  instruction: z.string().optional(),
});

export const mulmoBeatSchema = z.object({
  speaker: z.string(),
  text: z.string(),
  multiLingualTexts: z.record(z.string(), localizedTextSchema),
  media: mulmoMediaSchema.optional(),
  imageParams: text2imageParamsSchema.optional(),
  speechParams: text2speechParamsSchema.optional(),
  imagePrompt: z.string().optional(),
  image: z.string().optional(),
  filename: z.string(),
  duration: z.number().optional(),
});

export const mulmoScriptSchema = z.object({
  title: z.string(),
  description: z.string(),
  reference: z.string(),
  lang: langSchema,
  filename: z.string(),
  beats: z.array(mulmoBeatSchema),
  speechParams: text2speechParamsSchema.extend({
    provider: z.string().optional(),
    speakers: speakerDictionarySchema,
  }).optional(),
  imageParams: text2imageParamsSchema.extend({
    provider: z.string().optional(),
  }).optional(),
  imagePath: z.string().optional(),
  omitCaptions: z.boolean().optional(),
  padding: z.number().optional(),
});
