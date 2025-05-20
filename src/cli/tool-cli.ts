#!/usr/bin/env node

import "dotenv/config";
import yargs from "yargs/yargs";
import { hideBin } from "yargs/helpers";
import { GraphAILogger } from "graphai";

const cli = yargs(hideBin(process.argv)).scriptName("mulmo-tool").usage("$0 <command> [args]").option("v", {
  alias: "verbose",
  describe: "verbose log",
  demandOption: true,
  default: false,
  type: "boolean",
});

async function main() {
  // TODO: fix type error
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const scriptingCmd = (await import("./tool_commands/scripting/index.js")) as any;
  const promptCmd = await import("./tool_commands/prompt/index.js");
  const schemaCmd = await import("./tool_commands/schema/index.js");

  cli.command(scriptingCmd).command(promptCmd).command(schemaCmd).demandCommand().strict().help().alias("help", "h");

  await cli.parseAsync();
}

main().catch((error) => {
  GraphAILogger.error("An unexpected error occurred:", error);
  process.exit(1);
});
