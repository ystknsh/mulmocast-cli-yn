import { ToolCliArgs } from "@/src/types/cli_types.js";
import { selectTemplate } from "@/src/utils/inquirer.js";
import { dumpPromptFromTemplate } from "../../../tools/dump_prompt.js";
import { GraphAILogger } from "graphai";

export const handler = async (argv: ToolCliArgs<{ template?: string }>) => {
  let { template } = argv;
  const { v: verbose } = argv;

  if (!template) {
    template = await selectTemplate();
  }

  if (verbose) {
    GraphAILogger.info("template:", template);
  } else {
    GraphAILogger.setLevelEnabled("error", false);
    GraphAILogger.setLevelEnabled("log", false);
    GraphAILogger.setLevelEnabled("warn", false);
  }

  await dumpPromptFromTemplate({ templateName: template });
};
