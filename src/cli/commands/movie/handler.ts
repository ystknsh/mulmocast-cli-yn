import { audio, images, movie, captions } from "../../../actions/index.js";
import { CliArgs } from "@/src/types/cli_types.js";
import { initializeContext, runTranslateIfNeeded } from "@/src/cli/helpers.js";

export const handler = async (argv: CliArgs<{ a?: string; i?: string; c?: string }>) => {
  const context = await initializeContext(argv);
  await runTranslateIfNeeded(context, argv);
  await audio(context);
  await images(context);
  if (context.caption) {
    await captions(context);
  }
  await movie(context);
};
