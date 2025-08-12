import { GraphAILogger } from "graphai";
import { readTemplatePrompt } from "../utils/file.js";
import clipboardy from "clipboardy";

const firstStatement = "Generate a script for a presentation of the given topic. ";

export const dumpPromptFromTemplate = async ({ templateName, suppressFirstStatement }: { templateName: string; suppressFirstStatement: boolean }) => {
  const prompt = suppressFirstStatement ? "" : firstStatement + readTemplatePrompt(templateName);
  GraphAILogger.info(prompt);
  clipboardy.write(prompt);
};
