"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mulmoScriptTemplateSchema = exports.mulmoStudioSchema = exports.mulmoStudioBeatSchema = exports.mulmoScriptSchema = exports.mulmoDimensionSchema = exports.mulmoBeatSchema = exports.videoParamsSchema = exports.textSlideParamsSchema = exports.text2speechParamsSchema = exports.text2imageParamsSchema = exports.mulmoMediaSchema = exports.speakerDictionarySchema = exports.multiLingualTextsSchema = exports.localizedTextSchema = exports.langSchema = void 0;
const zod_1 = require("zod");
exports.langSchema = zod_1.z.string();
const URLStringSchema = zod_1.z.string().url();
exports.localizedTextSchema = zod_1.z.object({
    text: zod_1.z.string(),
    lang: zod_1.z.string(),
    // caption: z.string(),
    texts: zod_1.z.array(zod_1.z.string()).optional(),
    ttsTexts: zod_1.z.array(zod_1.z.string()).optional(),
    duration: zod_1.z.number().optional(), // generated // video duration time(ms)
    filename: zod_1.z.string(), // generated //
});
exports.multiLingualTextsSchema = zod_1.z.record(exports.langSchema, exports.localizedTextSchema);
const speakerIdSchema = zod_1.z.string();
const speakerDataSchema = zod_1.z.object({
    displayName: zod_1.z.record(exports.langSchema, zod_1.z.string()),
    voiceId: zod_1.z.string(),
});
exports.speakerDictionarySchema = zod_1.z.record(speakerIdSchema, speakerDataSchema);
const mediaSourceSchema = zod_1.z.discriminatedUnion("kind", [
    zod_1.z.object({ kind: zod_1.z.literal("url"), url: URLStringSchema }), // https://example.com/foo.pdf
    zod_1.z.object({ kind: zod_1.z.literal("data"), data: zod_1.z.string() }), // base64
    zod_1.z.object({ kind: zod_1.z.literal("file"), filename: zod_1.z.string() }), // foo.pdf
]);
const MulmoMarkdownMediaSchema = zod_1.z.object({
    type: zod_1.z.literal("markdown"),
    markdown: zod_1.z.array(zod_1.z.string()),
});
const MulmoWebMediaSchema = zod_1.z.object({
    type: zod_1.z.literal("web"),
    url: URLStringSchema,
});
const MulmoPdfMediaSchema = zod_1.z.object({
    type: zod_1.z.literal("pdf"),
    source: mediaSourceSchema,
});
const MulmoImageMediaSchema = zod_1.z.object({
    type: zod_1.z.literal("image"),
    source: mediaSourceSchema,
});
const MulmoSvgMediaSchema = zod_1.z.object({
    type: zod_1.z.literal("svg"),
    source: mediaSourceSchema,
});
const MulmoMovieMediaSchema = zod_1.z.object({
    type: zod_1.z.literal("movie"),
    source: mediaSourceSchema,
});
const MulmoTextSlideMediaSchema = zod_1.z.object({
    type: zod_1.z.literal("textSlide"),
    slide: zod_1.z.object({
        title: zod_1.z.string(),
        bullets: zod_1.z.array(zod_1.z.string()),
    }),
});
exports.mulmoMediaSchema = zod_1.z.union([
    MulmoMarkdownMediaSchema,
    MulmoWebMediaSchema,
    MulmoPdfMediaSchema,
    MulmoImageMediaSchema,
    MulmoSvgMediaSchema,
    MulmoMovieMediaSchema,
    MulmoTextSlideMediaSchema,
]);
exports.text2imageParamsSchema = zod_1.z.object({
    model: zod_1.z.string().optional(), // default: provider specific
    size: zod_1.z.string().optional(), // default: provider specific
    style: zod_1.z.string().optional(), // optional image style
});
exports.text2speechParamsSchema = zod_1.z.object({
    speed: zod_1.z.number().optional(), // default: 1.0
    instruction: zod_1.z.string().optional(),
});
exports.textSlideParamsSchema = zod_1.z.object({
    cssStyles: zod_1.z.array(zod_1.z.string()),
});
exports.videoParamsSchema = zod_1.z.object({
    padding: zod_1.z.number().optional(), // msec
});
exports.mulmoBeatSchema = zod_1.z.object({
    speaker: speakerIdSchema,
    text: zod_1.z.string(),
    media: exports.mulmoMediaSchema.optional(),
    imageParams: exports.text2imageParamsSchema.optional(), // beat specific parameters
    speechParams: exports.text2speechParamsSchema.optional(),
    imagePrompt: zod_1.z.string().optional(), // specified or inserted by preprocessor
    image: zod_1.z.string().optional(), // path to the image
});
exports.mulmoDimensionSchema = zod_1.z.object({
    width: zod_1.z.number(),
    height: zod_1.z.number(),
});
// export const voiceMapSchema = z.record(speakerIdSchema, z.string())
exports.mulmoScriptSchema = zod_1.z.object({
    // global settings
    title: zod_1.z.string(),
    description: zod_1.z.string().optional(),
    reference: zod_1.z.string().optional(),
    lang: exports.langSchema.optional(), // default "en"
    canvasSize: exports.mulmoDimensionSchema.optional(),
    // page/slide
    beats: zod_1.z.array(exports.mulmoBeatSchema),
    // for text2speech
    speechParams: exports.text2speechParamsSchema
        .extend({
        provider: zod_1.z.string().optional(),
        speakers: exports.speakerDictionarySchema,
    })
        .optional(),
    // for text2image
    imageParams: exports.text2imageParamsSchema
        .extend({
        provider: zod_1.z.string().optional(),
    })
        .optional(),
    // for textSlides
    textSlideParams: exports.textSlideParamsSchema.optional(),
    videoParams: exports.videoParamsSchema.optional(),
    // images: ImageInfo[] // generated
    imagePath: zod_1.z.string().optional(), // for keynote images movie ??
    omitCaptions: zod_1.z.boolean().optional(), // default is false
});
exports.mulmoStudioBeatSchema = exports.mulmoBeatSchema.extend({
    multiLingualTexts: exports.multiLingualTextsSchema.optional(),
    hash: zod_1.z.string().optional(),
    duration: zod_1.z.number().optional(),
    filename: zod_1.z.string().optional(),
});
exports.mulmoStudioSchema = zod_1.z.object({
    script: exports.mulmoScriptSchema,
    filename: zod_1.z.string(),
    beats: zod_1.z.array(exports.mulmoStudioBeatSchema),
});
exports.mulmoScriptTemplateSchema = zod_1.z.object({
    systemPrompt: zod_1.z.string(),
    script: exports.mulmoScriptSchema,
});
