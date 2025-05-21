import { images } from "../../../actions/index.js";
import { CliArgs } from "@/src/types/cli_types.js";
import { initializeContext } from "@/src/cli/helpers.js";

export const handler = async (argv: CliArgs<{ i?: string }>) => {
  const context = await initializeContext(argv);
  await images(context);
};
