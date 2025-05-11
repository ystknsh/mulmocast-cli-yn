import "dotenv/config";
import { MulmoCanvasDimension, MulmoScript, MulmoBeat, SpeechOptions, Text2ImageProvider, MulmoImageParams, Text2SpeechProvider } from "../types/index.js";
import { text2ImageProviderSchema, text2SpeechProviderSchema, mulmoCanvasDimensionSchema } from "../types/schema.js";

const defaultTextSlideStyles = [
  "body { margin: 40px; margin-top: 60px; color:#333; font-size: 48px }",
  "h1 { font-size: 60px; text-align: center }",
  "ul { margin-left: 40px } ",
  "pre { margin-left: 40px; font-size: 32px }",
  "p { margin-left: 40px }",
  "table { font-size: 40px; margin: auto; border: 1px solid gray; border-collapse: collapse }",
  "th { border-bottom: 1px solid gray }",
  "td, th { padding: 8px }",
  "tr:nth-child(even) { background-color: #eee }",
];

export type Text2ImageAgentInfo = {
  provider: Text2ImageProvider;
  agent: string;
  imageParams: MulmoImageParams;
};

export type BeatMediaType = "movie" | "image";

export const MulmoScriptMethods = {
  getPadding(script: MulmoScript): number {
    return script.videoParams?.padding ?? 1000; // msec
  },

  getCanvasSize(script: MulmoScript): MulmoCanvasDimension {
    return mulmoCanvasDimensionSchema.parse(script.canvasSize);
  },
  getAspectRatio(script: MulmoScript): string {
    // Google's text2image specific parameter
    const size = this.getCanvasSize(script);
    return size.width > size.height ? "16:9" : "9:16";
  },
  getSpeechProvider(script: MulmoScript): Text2SpeechProvider {
    return text2SpeechProviderSchema.parse(script.speechParams?.provider);
  },
  getTextSlideStyle(script: MulmoScript, beat: MulmoBeat): string {
    const styles = script.textSlideParams?.cssStyles ?? defaultTextSlideStyles;
    // NOTES: Taking advantage of CSS override rule (you can redefine it to override)
    const extraStyles = beat.textSlideParams?.cssStyles ?? [];
    return [...styles, ...extraStyles].join("\n");
  },
  getSpeechOptions(script: MulmoScript, beat: MulmoBeat): SpeechOptions | undefined {
    return { ...script.speechParams.speakers[beat.speaker].speechOptions, ...beat.speechOptions };
  },

  getImageAgentInfo(script: MulmoScript): Text2ImageAgentInfo {
    // Notice that we copy imageParams from script and update
    // provider and model appropriately.
    const provider = text2ImageProviderSchema.parse(script.imageParams?.provider);
    const defaultImageParams: MulmoImageParams = {
      model: provider === "openai" ? process.env.DEFAULT_OPENAI_IMAGE_MODEL : undefined,
    };
    return {
      provider,
      agent: provider === "google" ? "imageGoogleAgent" : "imageOpenaiAgent",
      imageParams: { ...defaultImageParams, ...script.imageParams },
    };
  },
  getImageType(_: MulmoScript, beat: MulmoBeat): BeatMediaType {
    return beat.image?.type == "movie" ? "movie" : "image";
  },
};
