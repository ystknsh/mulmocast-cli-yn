import "dotenv/config";
import {
  MulmoCanvasDimension,
  MulmoScript,
  MulmoBeat,
  SpeechOptions,
  MulmoImageParams,
  Text2SpeechProvider,
  Text2ImageAgentInfo,
  BeatMediaType,
} from "../types/index.js";
import { text2ImageProviderSchema, text2SpeechProviderSchema, mulmoCanvasDimensionSchema } from "../types/schema.js";

const defaultTextSlideStyles = [
  '*,*::before,*::after{box-sizing:border-box}body,h1,h2,h3,h4,p,figure,blockquote,dl,dd{margin:0}ul[role="list"],ol[role="list"]{list-style:none}html:focus-within{scroll-behavior:smooth}body{min-height:100vh;text-rendering:optimizeSpeed;line-height:1.5}a:not([class]){text-decoration-skip-ink:auto}img,picture{max-width:100%;display:block}input,button,textarea,select{font:inherit}@media(prefers-reduced-motion:reduce){html:focus-within{scroll-behavior:auto}*,*::before,*::after{animation-duration:.01ms !important;animation-iteration-count:1 !important;transition-duration:.01ms !important;scroll-behavior:auto !important}}',
  "body { margin: 60px; margin-top: 40px; color:#333; font-size: 30px; font-family: Arial, sans-serif; box-sizing: border-box; height: 100vh }",
  "h1 { font-size: 56px; margin-bottom: 20px; text-align: center }",
  "h2 { font-size: 48px; text-align: center }",
  "h3 { font-size: 36px }",
  "ul { margin-left: 40px } ",
  "pre { background: #eeeecc; font-size: 16px; padding:4px }",
  "p { margin-left: 40px }",
  "table { font-size: 36px; margin: auto; border: 1px solid gray; border-collapse: collapse }",
  "th { border-bottom: 1px solid gray }",
  "td, th { padding: 8px }",
  "tr:nth-child(even) { background-color: #eee }",
];

export const MulmoScriptMethods = {
  getCanvasSize(script: MulmoScript): MulmoCanvasDimension {
    return mulmoCanvasDimensionSchema.parse(script.canvasSize);
  },
  getSpeechProvider(script: MulmoScript): Text2SpeechProvider {
    return text2SpeechProviderSchema.parse(script.speechParams?.provider);
  },
  getTextSlideStyle(script: MulmoScript, beat: MulmoBeat): string {
    const styles = script.textSlideParams?.cssStyles ?? [];
    // NOTES: Taking advantage of CSS override rule (you can redefine it to override)
    const extraStyles = beat.textSlideParams?.cssStyles ?? [];
    // This code allows us to support both string and array of strings for cssStyles
    return [...defaultTextSlideStyles, ...[styles], ...[extraStyles]].flat().join("\n");
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
