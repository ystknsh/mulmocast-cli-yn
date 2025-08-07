import select from "@inquirer/select";
import input from "@inquirer/input";

import { getAvailablePromptTemplates } from "./file.js";

export const selectTemplate = async (): Promise<string> => {
  const availableTemplates = getAvailablePromptTemplates();
  const answers = await select({
    message: "Select a template to use",
    choices: availableTemplates.map((t) => ({
      name: `${t.filename} - ${t.description}`,
      value: t.filename,
    })),
  });
  return answers;
};

export const getUrlsIfNeeded = async (urls: string[]): Promise<string[]> => {
  if (urls && urls.length > 0) return urls;
  const answers = await input([
    {
      type: "input",
      name: "urls",
      message: "Enter URLs for scripting references (comma separated):",
      validate: (inputText: string) => inputText.trim().length > 0 || "At least one URL is required",
    },
  ]);
  return answers.urls
    .split(",")
    .map((u: string) => u.trim())
    .filter((u: string) => u.length > 0);
};
