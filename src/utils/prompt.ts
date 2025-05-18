import { MulmoBeat, MulmoScript, MulmoScriptTemplate } from "../types/index.js";
import { mulmoScriptSchema } from "../types/schema.js";
import { zodToJsonSchema } from "zod-to-json-schema";

export const imagePrompt = (beat: MulmoBeat, style?: string) => {
  return (beat.imagePrompt || `generate image appropriate for the text. text: ${beat.text}`) + "\n" + (style || "");
};

// sourceTextInput: ${:sourceText.text}
export const graphDataScriptFromUrlPrompt = (sourceTextInput: string) => {
  return `Please create a script using the information from the following URLs as reference: ${sourceTextInput}`;
};

export const graphDataScriptGeneratePrompt = (scene: string) => {
  return `Please generate a script from the following scenes: ${scene}`;
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

export const prefixPrompt = "Here is the web content that can be used as reference material for the script:";

export const translateSystemPrompt = "Please translate the given text into the language specified in language (in locale format, like en, ja, fr, ch).";

export const translatePrompts = ["## Original Language", ":lang", "", "## Language", ":targetLang", "", "## Target", ":beat.text"];

export const storyToScriptPrompt = ({
  sampleBeats,
  beatsPerScene,
  allScenes,
}: {
  sampleBeats: MulmoScript["beats"];
  beatsPerScene: number;
  allScenes: string;
}) => {
  return `Generate scripts for the given scenes, following the structure of the sample scripts below.
\`\`\`JSON
${JSON.stringify(sampleBeats)}
\`\`\`
From the content of each scene, generate exactly ${beatsPerScene} scripts (beats).
The scripts should be created considering the overall content of the scenes.
The scenes are as follows:
\`\`\`
${allScenes}
\`\`\`
Please provide your response as valid JSON within \`\`\`json code blocks for clarity.`.trim();
};
