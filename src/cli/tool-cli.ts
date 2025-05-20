#!/usr/bin/env node

import "dotenv/config";
import yargs from "yargs/yargs";
import { hideBin } from "yargs/helpers";
import { GraphAILogger } from "graphai";
import * as scriptingCmd from "./tool_commands/scripting/index.js";
import * as promptCmd from "./tool_commands/prompt/index.js";
import * as schemaCmd from "./tool_commands/schema/index.js";

const cli = yargs(hideBin(process.argv))
  .scriptName("mulmo-tool")
  .usage("$0 <command> [args]")
  .option("v", {
    alias: "verbose",
    describe: "verbose log",
    demandOption: true,
    default: false,
    type: "boolean",
  })
  // TODO: fix type error
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  .command(scriptingCmd as any)
  .command(promptCmd)
  .command(schemaCmd)
  .demandCommand()
  .strict()
  .help()
  .alias("help", "h");

const main = async () => {
  await cli.parseAsync();
};

main().catch((error) => {
  GraphAILogger.error("An unexpected error occurred:", error);
  process.exit(1);
});
