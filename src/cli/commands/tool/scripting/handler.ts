import { ToolCliArgs } from "@/src/types/cli_types.js";
import { getBaseDirPath, getFullPath } from "@/src/utils/file.js";
import { outDirName, cacheDirName } from "../../../../utils/const.js";
import { getUrlsIfNeeded, selectTemplate } from "@/src/utils/inquirer.js";
import { createMulmoScriptFromUrl } from "../../../../tools/create_mulmo_script_from_url.js";
import { createMulmoScriptInteractively } from "../../../../tools/create_mulmo_script_interactively.js";
import { setGraphAILogger } from "@/src/cli/helpers.js";

export const handler = async (
  argv: ToolCliArgs<{
    o?: string;
    b?: string;
    u?: string[];
    i?: boolean;
    t?: string;
    c?: string;
    s?: string;
    llm_agent?: string;
    llm_model?: string;
  }>,
) => {
  const { o: outdir, b: basedir, v: verbose, i: interactive, c: cache, s: filename, llm_agent, llm_model } = argv;
  let { t: template } = argv;
  const urls = argv.u || [];

  const baseDirPath = getBaseDirPath(basedir as string);
  const outDirPath = getFullPath(baseDirPath, (outdir as string) ?? outDirName);
  const cacheDirPath = getFullPath(outDirPath, (cache as string) ?? cacheDirName);

  if (!template) {
    template = await selectTemplate();
  }

  setGraphAILogger(verbose, {
    baseDirPath,
    outDirPath,
    cacheDirPath,
    template,
    urls,
    interactive,
    filename,
    llm_agent,
    llm_model,
  });

  const context = { outDirPath, templateName: template, urls, filename: filename as string, cacheDirPath, llm_model, llm_agent };

  if (interactive) {
    await createMulmoScriptInteractively(context);
  } else {
    context.urls = await getUrlsIfNeeded(urls);
    await createMulmoScriptFromUrl(context);
  }
};
