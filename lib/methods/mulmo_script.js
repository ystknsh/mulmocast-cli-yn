"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MulmoScriptMethods = void 0;
exports.MulmoScriptMethods = {
    getPadding(script) {
        return script.videoParams?.padding ?? 1000; // msec
    },
};
