import { GraphAILogger } from "graphai";
import { translate } from "../../../actions/index.js";
import { initializeContext } from "@/src/cli/helpers.js";
import { CliArgs } from "@/src/types/cli_types.js";

export const handler = async (argv: CliArgs<{ i?: string }>) => {
  GraphAILogger.log("Running translate command", argv);
  const context = await initializeContext(argv);
  await translate(context);
};
