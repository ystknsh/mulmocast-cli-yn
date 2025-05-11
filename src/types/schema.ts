import { z } from "zod";

export const langSchema = z.string();
const URLStringSchema = z.string().url();

export const localizedTextSchema = z
  .object({
    text: z.string(),
    lang: z.string(),
    // caption: z.string(),
    texts: z.array(z.string()).optional(),
    ttsTexts: z.array(z.string()).optional(),
    duration: z.number().optional(), // generated // video duration time(ms)
    // filename: z.string().optional(), // generated //
  })
  .strict();

export const multiLingualTextsSchema = z.record(langSchema, localizedTextSchema);

export const speechOptionsSchema = z
  .object({
    speed: z.number().optional(), // default: 1.0
    instruction: z.string().optional(),
  })
  .strict();

const speakerIdSchema = z.string();

const speakerDataSchema = z
  .object({
    displayName: z.record(langSchema, z.string()),
    voiceId: z.string(),
    speechOptions: speechOptionsSchema.optional(),
  })
  .strict();

export const speakerDictionarySchema = z.record(speakerIdSchema, speakerDataSchema);

export const mediaSourceSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("url"), url: URLStringSchema }).strict(), // https://example.com/foo.pdf
  z.object({ kind: z.literal("base64"), data: z.string() }).strict(), // base64
  z.object({ kind: z.literal("text"), text: z.string() }).strict(), // plain text
  z.object({ kind: z.literal("path"), path: z.string() }).strict(), // foo.pdf
]);

// String is easier for AI, string array is easier for human
const stringOrStringArray = z.union([z.string(), z.array(z.string())]);

export const mulmoMarkdownMediaSchema = z
  .object({
    type: z.literal("markdown"),
    markdown: stringOrStringArray,
  })
  .strict();

const mulmoWebMediaSchema = z
  .object({
    type: z.literal("web"),
    url: URLStringSchema,
  })
  .strict();

const mulmoPdfMediaSchema = z
  .object({
    type: z.literal("pdf"),
    source: mediaSourceSchema,
  })
  .strict();

export const mulmoImageMediaSchema = z
  .object({
    type: z.literal("image"),
    source: mediaSourceSchema,
  })
  .strict();

const mulmoSvgMediaSchema = z
  .object({
    type: z.literal("svg"),
    source: mediaSourceSchema,
  })
  .strict();

const mulmoMovieMediaSchema = z
  .object({
    type: z.literal("movie"),
    source: mediaSourceSchema,
  })
  .strict();

export const mulmoTextSlideMediaSchema = z
  .object({
    type: z.literal("textSlide"),
    slide: z.object({
      title: z.string(),
      bullets: z.array(z.string()),
    }),
  })
  .strict();

export const mulmoChartMediaSchema = z
  .object({
    type: z.literal("chart"),
    title: z.string(),
    chartData: z.record(z.any()),
  })
  .strict();

export const mulmoMermaidMediaSchema = z
  .object({
    type: z.literal("mermaid"),
    title: z.string().describe("The title of the diagram"),
    code: mediaSourceSchema.describe("The code of the mermaid diagram"),
    appendix: z.array(z.string()).optional().describe("The appendix of the mermaid diagram; typically, style information."),
  })
  .strict();

export const mulmoImageAssetSchema = z.union([
  mulmoMarkdownMediaSchema,
  mulmoWebMediaSchema,
  mulmoPdfMediaSchema,
  mulmoImageMediaSchema,
  mulmoSvgMediaSchema,
  mulmoMovieMediaSchema,
  mulmoTextSlideMediaSchema,
  mulmoChartMediaSchema,
  mulmoMermaidMediaSchema,
]);

const mulmoAudioMediaSchema = z
  .object({
    type: z.literal("audio"),
    source: mediaSourceSchema,
  })
  .strict();

const mulmoMidiMediaSchema = z
  .object({
    type: z.literal("midi"),
    source: z.string(), // TODO: define it later
  })
  .strict();

export const mulmoAudioAssetSchema = z.union([mulmoAudioMediaSchema, mulmoMidiMediaSchema]);

export const mulmoImageParamsSchema = z
  .object({
    model: z.string().optional(), // default: provider specific
    size: z.string().optional(), // default: provider specific
    style: z.string().optional(), // optional image style
    moderation: z.string().optional(), // optional image style
  })
  .strict();

export const textSlideParamsSchema = z
  .object({
    cssStyles: z.array(z.string()),
  })
  .strict();

export const videoParamsSchema = z
  .object({
    padding: z.number().optional(), // msec
  })
  .strict();

export const mulmoBeatSchema = z
  .object({
    speaker: speakerIdSchema.default("Presenter"),
    text: z.string(),
    image: mulmoImageAssetSchema.optional(),
    audio: mulmoAudioAssetSchema.optional(),

    imageParams: mulmoImageParamsSchema.optional(), // beat specific parameters
    speechOptions: speechOptionsSchema.optional(),
    textSlideParams: textSlideParamsSchema.optional(),
    imagePrompt: z.string().optional(), // specified or inserted by preprocessor
  })
  .strict();

export const mulmoCanvasDimensionSchema = z
  .object({
    width: z.number(),
    height: z.number(),
  })
  .default({ width: 1280, height: 720 });

// export const voiceMapSchema = z.record(speakerIdSchema, z.string())

export const mulmoCastCreditSchema = z
  .object({
    version: z.literal("1.0"),
    credit: z.literal("closing").optional(),
  })
  .strict();

export const text2SpeechProviderSchema = z.union([z.literal("openai"), z.literal("nijivoice")]).default("openai");

export const mulmoSpeechParamsSchema = z
  .object({
    provider: text2SpeechProviderSchema, // has default value
    speakers: speakerDictionarySchema,
  })
  .strict();

export const text2ImageProviderSchema = z.union([z.literal("openai"), z.literal("google")]).default("openai");

export const mulmoPresentationStyleSchema = z.object({
  $mulmocast: mulmoCastCreditSchema,
  canvasSize: mulmoCanvasDimensionSchema, // has default value
  speechParams: mulmoSpeechParamsSchema.default({
    speakers: {
      "Presenter": {
        voiceId: "shimmer",
        displayName: {
          en: "Presenter",
        },
      },
    },
  }),
  imageParams: mulmoImageParamsSchema
    .extend({
      provider: text2ImageProviderSchema, // has default value
    })
    .optional(),
  // for textSlides
  textSlideParams: textSlideParamsSchema.optional(),
  videoParams: videoParamsSchema.optional(),

  // TODO: Switch to showCaptions later
  omitCaptions: z.boolean().optional(), // default is false
});

export const mulmoScriptSchema = mulmoPresentationStyleSchema
  .extend({
    title: z.string().optional(),
    description: z.string().optional(),
    reference: z.string().optional(),
    lang: langSchema.optional(), // default "en"
    beats: z.array(mulmoBeatSchema),

    // TODO: Delete it later
    imagePath: z.string().optional(), // for keynote images movie ??

    // for debugging
    __test_invalid__: z.boolean().optional(),
  })
  .strict();

export const mulmoStudioBeatSchema = z
  .object({
    multiLingualTexts: multiLingualTextsSchema.optional(),
    hash: z.string().optional(),
    duration: z.number().optional(),
    audioFile: z.string().optional(),
    imageFile: z.string().optional(), // path to the image
  })
  .strict();

export const mulmoStudioSchema = z
  .object({
    script: mulmoScriptSchema,
    filename: z.string(),
    beats: z.array(mulmoStudioBeatSchema),
  })
  .strict();

export const mulmoScriptTemplateSchema = z
  .object({
    title: z.string(),
    description: z.string(),
    systemPrompt: z.string(),
    script: mulmoScriptSchema.optional(),
  })
  .strict();

export const mulmoStoryboardSceneSchema = z
  .object({
    description: z.string(),
  })
  .describe("A detailed description of the content of the scene, not the presentation style")
  .strict();

export const mulmoStoryboardSchema = z
  .object({
    title: z.string(),
    scenes: z.array(mulmoStoryboardSceneSchema),
  })
  .describe("A storyboard for a presentation, a story, a video, etc.")
  .strict();

export const urlsSchema = z.array(z.string().url({ message: "Invalid URL format" }));
