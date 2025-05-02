"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MulmoScriptTemplateMethods = void 0;
exports.MulmoScriptTemplateMethods = {
    getSystemPrompt(template) {
        return `${template.systemPrompt}\n${JSON.stringify(template.script)}`;
    },
};
