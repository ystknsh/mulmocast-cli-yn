"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MulmoScriptMethods = void 0;
const defaultTextSlideStyles = [
    "body { margin: 40px; margin-top: 60px; color:#333 }",
    "h1 { font-size: 60px; text-align: center }",
    "ul { margin-left: 40px } ",
    "li { font-size: 48px }",
];
exports.MulmoScriptMethods = {
    getPadding(script) {
        return script.videoParams?.padding ?? 1000; // msec
    },
    getCanvasSize(script) {
        return script.canvasSize ?? { width: 1280, height: 720 };
    },
    getAspectRatio(script) {
        // Google's text2image specific parameter
        const size = this.getCanvasSize(script);
        return size.width > size.height ? "16:9" : "9:16";
    },
    getSpeechProvider(script) {
        return script.speechParams?.provider ?? "openai";
    },
    getTextSlideStyle(script, beat) {
        const styles = script.textSlideParams?.cssStyles ?? defaultTextSlideStyles;
        // NOTES: Taking advantage of CSS override rule (you can redefine it to override)
        const extraStyles = beat.textSlideParams?.cssStyles ?? [];
        return [...styles, ...extraStyles].join("\n");
    },
};
