"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MulmoScriptMethods = void 0;
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
        return (size.width > size.height) ? "16:9" : "9:16";
    },
};
