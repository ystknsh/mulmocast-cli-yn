#!/usr/bin/env node

import "dotenv/config";
import { args } from "./tool-args";
import { outDirName } from "../utils/const";
import { createMulmoScriptFromUrl } from "../tools/seed_from_url";
import { getBaseDirPath, getFullPath } from "../utils/file";

const main = async () => {
  const { o: outdir, t: template, u: urls, b: basedir, action, v: verbose } = args;

  const baseDirPath = getBaseDirPath(basedir as string);
  const outDirPath = getFullPath(baseDirPath, (outdir as string) ?? outDirName);

  if (verbose) {
    console.log("baseDirPath:", baseDirPath);
    console.log("outDirPath:", outDirPath);
    console.log("template:", template);
    console.log("urls:", urls);
    console.log("action:", action);
  }

  if (action === "scripting") {
    await createMulmoScriptFromUrl({ urls, template_name: template, outdir: outDirPath });
  } else {
    throw new Error(`Unknown or unsupported action: ${action}`);
  }
};

main().catch((error) => {
  console.error("An unexpected error occurred:", error);
  process.exit(1);
});
