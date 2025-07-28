import { getMulmoScriptTemplateSystemPrompt } from "./prompt.js";
import type { MulmoScript, MulmoPromptTemplate, MulmoPromptTemplateFile } from "../types/type.js";
import { promptTemplates, scriptTemplates } from "../data/index.js";

// script and prompt template
export const readScriptTemplateFile = (scriptTemplateFileName: string): MulmoScript => {
  // NOTE: We don't want to schema parse the script here to eliminate default values.
  const scriptTemplate = scriptTemplates.find((template) => template.filename === scriptTemplateFileName);
  if (!scriptTemplate) {
    throw new Error(`Script template not found: ${scriptTemplateFileName}`);
  }
  const { filename: __, ...retValue } = scriptTemplate;
  return retValue as unknown as MulmoScript;
};

const readPromptTemplateFile = (promptTemplateFileName: string): MulmoPromptTemplateFile => {
  // NOTE: We don't want to schema parse the template here to eliminate default values.
  const promptTemplate = (promptTemplates as MulmoPromptTemplateFile[]).find(
    (template: MulmoPromptTemplateFile) => template.filename === promptTemplateFileName,
  );
  if (!promptTemplate) {
    throw new Error(`Prompt template not found: ${promptTemplateFileName}`);
  }
  return promptTemplate;
};

const mulmoScriptTemplate2Script = (scriptTemplate: MulmoPromptTemplate): MulmoScript | undefined => {
  if (scriptTemplate.scriptName) {
    const scriptTemplateData = readScriptTemplateFile(scriptTemplate.scriptName);
    return { ...scriptTemplateData, ...(scriptTemplate.presentationStyle ?? {}) };
  }
  return undefined;
};

export const readTemplatePrompt = (promptTemplateFileName: string): string => {
  const promptTemplate = readPromptTemplateFile(promptTemplateFileName);
  const script = mulmoScriptTemplate2Script(promptTemplate);
  const prompt = getMulmoScriptTemplateSystemPrompt(promptTemplate, script);
  return prompt;
};
