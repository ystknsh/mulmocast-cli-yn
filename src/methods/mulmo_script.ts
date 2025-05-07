import { MulmoDimension, MulmoScript, MulmoBeat, SpeechOptions } from "../types";

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

export const MulmoScriptMethods = {
  getPadding(script: MulmoScript): number {
    return script.videoParams?.padding ?? 1000; // msec
  },

  getCanvasSize(script: MulmoScript): MulmoDimension {
    return script.canvasSize ?? { width: 1280, height: 720 };
  },
  getAspectRatio(script: MulmoScript): string {
    // Google's text2image specific parameter
    const size = this.getCanvasSize(script);
    return size.width > size.height ? "16:9" : "9:16";
  },
  getSpeechProvider(script: MulmoScript): string {
    return script.speechParams?.provider ?? "openai";
  },
  getImageProvider(script: MulmoScript): string {
    return script.imageParams?.provider ?? "openai";
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

  getText2imageAgent(script: MulmoScript): string {
    return this.getImageProvider(script) === "google" ? "imageGoogleAgent" : "imageOpenaiAgent";
  },
};
