import { MulmoScript, MulmoScriptTemplate } from "../types/index.js";
import { getMulmoScriptTemplateSystemPrompt } from "../utils/prompt.js";

export const MulmoScriptTemplateMethods = {
  getSystemPrompt(template: MulmoScriptTemplate, script?: MulmoScript): string {
    return getMulmoScriptTemplateSystemPrompt(template, script);
  },
};
