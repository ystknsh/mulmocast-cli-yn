import { readTemplatePrompt } from "../utils/file";

export const dumpPromptFromTemplate = async ({ templateName }: { templateName: string }) => {
  const prompt = readTemplatePrompt(templateName);
  console.log(prompt);
};
