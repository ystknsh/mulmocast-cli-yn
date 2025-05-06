import zodToJsonSchema from "zod-to-json-schema";
import { MulmoScriptTemplate } from "../types";
import { mulmoScriptSchema } from "../types/schema";


export const MulmoScriptTemplateMethods = {
  getSystemPrompt(template: MulmoScriptTemplate): string {
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
  },
};
