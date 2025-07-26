import { MulmoScript, MulmoPromptTemplate } from "../types/index.js";
import { getMulmoScriptTemplateSystemPrompt } from "../utils/prompt.js";

export const MulmoScriptTemplateMethods = {
  getSystemPrompt(template: MulmoPromptTemplate, script?: MulmoScript): string {
    return getMulmoScriptTemplateSystemPrompt(template, script);
  },
};
