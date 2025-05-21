import { images, pdf } from "../../../actions/index.js";
import { CliArgs } from "@/src/types/cli_types.js";
import { initializeContext, runTranslateIfNeeded } from "@/src/cli/helpers.js";

export const handler = async (argv: CliArgs<{ i?: string; pdf_mode: string; pdf_size: string }>) => {
  const context = await initializeContext(argv);
  await runTranslateIfNeeded(context, argv);
  await images(context);
  await pdf(context, argv.pdf_mode, argv.pdf_size);
};
