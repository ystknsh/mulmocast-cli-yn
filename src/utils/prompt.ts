import { MulmoBeat, MulmoScriptTemplate } from "../types/index.js";
import { mulmoScriptSchema } from "../types/schema.js";
import { zodToJsonSchema } from "zod-to-json-schema";

export const imagePrompt = (beat: MulmoBeat, style?: string) => {
  return (beat.imagePrompt || `generate image appropriate for the text. text: ${beat.text}`) + "\n" + (style || "");
};

// sourceTextInput: ${:sourceText.text}
export const graphDataScriptFromUrlPrompt = (sourceTextInput: string) => {
  return `Please create a script using the information from the following URLs as reference: ${sourceTextInput}`;
};

export const getMulmoScriptTemplateSystemPrompt = (template: MulmoScriptTemplate) => {
  // script is provided, use it as a script template
  if (template.script) {
    return `${template.systemPrompt}\n\`\`\`JSON\n${JSON.stringify(template.script)}\n\`\`\``;
  }

  // script is not provided, use the default schema
  const defaultSchema = zodToJsonSchema(mulmoScriptSchema, {
    strictUnions: true,
  });

  const specificOutputPrompt = `The output should follow the JSON schema specified below. Please provide your response as valid JSON within \`\`\`json code blocks for clarity.`;
  return `${template.systemPrompt}\n\n${specificOutputPrompt}\n\n\`\`\`JSON\n${JSON.stringify(defaultSchema)}\n\`\`\``;
};

export const interactiveClarificationPrompt = `If there are any unclear points, be sure to ask the user questions and clarify them before generating the script.`;
