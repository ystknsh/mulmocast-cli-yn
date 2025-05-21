import { images } from "../../../actions/index.js";
import { CliArgs } from "../../../types/cli_types.js";
import { initializeContext, runTranslateIfNeeded } from "../../../cli/helpers.js";

export const handler = async (argv: CliArgs<{ i?: string }>) => {
  const context = await initializeContext(argv);
  await runTranslateIfNeeded(context, argv);
  await images(context);
};
