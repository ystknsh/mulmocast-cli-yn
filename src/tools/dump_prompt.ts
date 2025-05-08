import { GraphAILogger } from "graphai";
import { readTemplatePrompt } from "../utils/file.js";

export const dumpPromptFromTemplate = async ({ templateName }: { templateName: string }) => {
  const prompt = readTemplatePrompt(templateName);
  GraphAILogger.info(prompt);
};
