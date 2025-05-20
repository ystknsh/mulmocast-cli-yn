import { ToolCliArgs } from "@/src/types/cli_types.js";
import { getBaseDirPath, getFullPath } from "@/src/utils/file.js";
import { GraphAILogger } from "graphai";
import { outDirName, cacheDirName } from "../../../utils/const.js";
import { getUrlsIfNeeded, selectTemplate } from "@/src/utils/inquirer.js";
import { createMulmoScriptFromUrl } from "../../../tools/create_mulmo_script_from_url.js";
import { createMulmoScriptInteractively } from "../../../tools/create_mulmo_script_interactively.js";

export const handler = async (
  argv: ToolCliArgs<{
    o?: string;
    b?: string;
    u?: string[];
    interactive?: boolean;
    template?: string;
    cache?: string;
    script: string;
    llm_agent?: string;
    llm_model?: string;
  }>,
) => {
  const { o: outdir, b: basedir, v: verbose, interactive, script: filename, cache, llm_agent, llm_model } = argv;
  let { template } = argv;
  const urls = argv.u || [];

  const baseDirPath = getBaseDirPath(basedir as string);
  const outDirPath = getFullPath(baseDirPath, (outdir as string) ?? outDirName);
  const cacheDirPath = getFullPath(outDirPath, (cache as string) ?? cacheDirName);

  if (!template) {
    template = await selectTemplate();
  }

  if (verbose) {
    GraphAILogger.info("baseDirPath:", baseDirPath);
    GraphAILogger.info("outDirPath:", outDirPath);
    GraphAILogger.info("cacheDirPath:", cacheDirPath);
    GraphAILogger.info("template:", template);
    GraphAILogger.info("urls:", urls);
    GraphAILogger.info("interactive:", interactive);
    GraphAILogger.info("filename:", filename);
    GraphAILogger.info("llm_agent:", llm_agent);
    GraphAILogger.info("llm_model:", llm_model);
  } else {
    GraphAILogger.setLevelEnabled("error", false);
    GraphAILogger.setLevelEnabled("log", false);
    GraphAILogger.setLevelEnabled("warn", false);
  }

  const context = { outDirPath, templateName: template, urls, filename, cacheDirPath, llm_model, llm_agent };

  if (interactive) {
    await createMulmoScriptInteractively(context);
  } else {
    context.urls = await getUrlsIfNeeded(urls);
    await createMulmoScriptFromUrl(context);
  }
};
