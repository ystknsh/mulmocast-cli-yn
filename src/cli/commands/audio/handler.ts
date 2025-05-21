import { audio } from "../../../actions/index.js";
import { initializeContext, runTranslateIfNeeded } from "@/src/cli/helpers.js";
import { CliArgs } from "@/src/types/cli_types.js";

export const handler = async (argv: CliArgs<{ a?: string }>) => {
  const context = await initializeContext(argv);
  await runTranslateIfNeeded(context, argv);
  await audio(context);
};
