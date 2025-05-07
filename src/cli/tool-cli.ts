#!/usr/bin/env node

import "dotenv/config";
import { GraphAILogger } from "graphai";
import inquirer from "inquirer";

import { args } from "./tool-args";
import { outDirName } from "../utils/const";
import { createMulmoScriptFromUrl } from "../tools/seed_from_url";
import { getAvailableTemplates, getBaseDirPath, getFullPath } from "../utils/file";
import { createMulmoScriptWithInteractive } from "../tools/seed";
import { dumpPromptFromTemplate } from "../tools/dump_prompt";

const selectTemplate = async (): Promise<string> => {
  const availableTemplates = getAvailableTemplates();
  const answers = await inquirer.prompt([
    {
      type: "list",
      name: "templateName",
      message: "Select a template to use",
      choices: availableTemplates.map((t) => ({
        name: `${t.filename} - ${t.description}`,
        value: t.filename,
      })),
    },
  ]);
  return answers.templateName;
};

const main = async () => {
  const { o: outdir, u: urls, b: basedir, action, v: verbose, i: interactive, f: filename } = args;
  let { t: template } = args;

  const baseDirPath = getBaseDirPath(basedir as string);
  const outDirPath = getFullPath(baseDirPath, (outdir as string) ?? outDirName);

  if (verbose) {
    console.log("baseDirPath:", baseDirPath);
    console.log("outDirPath:", outDirPath);
    console.log("template:", template);
    console.log("urls:", urls);
    console.log("action:", action);
    console.log("interactive:", interactive);
    console.log("filename:", filename);
  } else {
    GraphAILogger.setLevelEnabled("error", false);
    GraphAILogger.setLevelEnabled("log", false);
    GraphAILogger.setLevelEnabled("warn", false);
  }

  // If template is not specified, show the selection prompt
  if (!template) {
    template = await selectTemplate();
    if (verbose) {
      console.log("Selected template:", template);
    }
  }

  if (action === "scripting") {
    if (interactive) {
      await createMulmoScriptWithInteractive({ outDirPath, templateName: template, urls: urls, filename });
    } else if (urls.length > 0) {
      await createMulmoScriptFromUrl({ urls, templateName: template, outDirPath, filename });
    } else {
      throw new Error("urls is required when not in interactive mode");
    }
  } else if (action === "prompt") {
    await dumpPromptFromTemplate({ templateName: template });
  } else {
    throw new Error(`Unknown or unsupported action: ${action}`);
  }
};

main().catch((error) => {
  console.error("An unexpected error occurred:", error);
  process.exit(1);
});
