import { MulmoScriptTemplate } from "../types/index.js";
import { getMulmoScriptTemplateSystemPrompt } from "../utils/prompt.js";

export const MulmoScriptTemplateMethods = {
  getSystemPrompt(template: MulmoScriptTemplate): string {
    return getMulmoScriptTemplateSystemPrompt(template);
  },
};
