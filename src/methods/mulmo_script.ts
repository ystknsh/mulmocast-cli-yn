import { MulmoDimension, MulmoScript } from "../types";

const defaultTextSlideStyles = [
  "body { margin: 40px; margin-top: 60px; color:#333 }",
  "h1 { font-size: 60px; text-align: center }",
  "ul { margin-left: 40px } ",
  "li { font-size: 48px }",
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
  getTextSlideStyle(script: MulmoScript): string {
    const styles = script.textSlideParams?.cssStyles ?? defaultTextSlideStyles;
    return styles.join('\n');
  }
};
