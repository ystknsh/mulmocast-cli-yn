import type { MulmoScript, MulmoPromptTemplate, MulmoPromptTemplateFile } from "../types/type.js";
import { mulmoScriptSchema } from "../types/schema.js";
import { promptTemplates, scriptTemplates } from "../data/index.js";
import { zodToJsonSchema } from "zod-to-json-schema";

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

const getMulmoScriptTemplateSystemPrompt = (template: MulmoPromptTemplate, script?: MulmoScript) => {
  // script is provided, use it as a script template
  if (script) {
    return `${template.systemPrompt}\n\`\`\`JSON\n${JSON.stringify(script)}\n\`\`\``;
  }

  // script is not provided, use the default schema
  const defaultSchema = zodToJsonSchema(mulmoScriptSchema, {
    strictUnions: true,
  });

  const specificOutputPrompt = `The output should follow the JSON schema specified below. Please provide your response as valid JSON within \`\`\`json code blocks for clarity.`;
  return `${template.systemPrompt}\n\n${specificOutputPrompt}\n\n\`\`\`JSON\n${JSON.stringify(defaultSchema)}\n\`\`\``;
};
