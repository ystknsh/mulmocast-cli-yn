import { ToolCliArgs } from "@/src/types/cli_types.js";
import { selectTemplate } from "@/src/utils/inquirer.js";
import { dumpPromptFromTemplate } from "../../../tools/dump_prompt.js";

export const handler = async (argv: ToolCliArgs<{ template?: string }>) => {
  let { template } = argv;
  if (!template) {
    template = await selectTemplate();
  }
  await dumpPromptFromTemplate({ templateName: template });
};
