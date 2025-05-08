#!/usr/bin/env node

import "dotenv/config";
import { GraphAILogger } from "graphai";

import { args } from "./tool-args";
import { outDirName, cacheDirName } from "../utils/const";
import { createMulmoScriptFromUrl } from "../tools/seed_from_url";
import { getBaseDirPath, getFullPath } from "../utils/file";
import { createMulmoScriptWithInteractive } from "../tools/seed";
import { dumpPromptFromTemplate } from "../tools/dump_prompt";
import { getUrlsIfNeeded, selectTemplate } from "../utils/inquirer";

const main = async () => {
  const { o: outdir, b: basedir, action, v: verbose, i: interactive, f: filename, cache } = args;
  let { t: template } = args;
  let { u: urls } = args;

  const baseDirPath = getBaseDirPath(basedir as string);
  const outDirPath = getFullPath(baseDirPath, (outdir as string) ?? outDirName);
  const cacheDirPath = getFullPath(outDirPath, (cache as string) ?? cacheDirName);

  if (verbose) {
    console.log("baseDirPath:", baseDirPath);
    console.log("outDirPath:", outDirPath);
    console.log("cacheDirPath:", cacheDirPath);
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
      await createMulmoScriptWithInteractive({ outDirPath, templateName: template, urls, filename, cacheDirPath });
    } else {
      urls = await getUrlsIfNeeded(urls);
      await createMulmoScriptFromUrl({ urls, templateName: template, outDirPath, filename, cacheDirPath });
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
