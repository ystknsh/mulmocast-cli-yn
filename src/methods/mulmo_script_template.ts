import { MulmoScriptTemplate } from "../types";

export const MulmoScriptTemplateMethods = {
  getSystemPrompt(template: MulmoScriptTemplate): string {
    return `${template.systemPrompt}\n${JSON.stringify(template.script)}`;
  },
};
