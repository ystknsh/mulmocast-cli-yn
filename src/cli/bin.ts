#!/usr/bin/env node

import "dotenv/config";
import yargs from "yargs/yargs";
import { hideBin } from "yargs/helpers";
import * as translateCmd from "./commands/translate/index.js";
import * as audioCmd from "./commands/audio/index.js";
import * as imagesCmd from "./commands/image/index.js";
import * as movieCmd from "./commands/movie/index.js";
import * as pdfCmd from "./commands/pdf/index.js";
import * as toolCmd from "./commands/tool/index.js";
import { GraphAILogger } from "graphai";

export const main = async () => {
  const cli = yargs(hideBin(process.argv))
    .scriptName("mulmo")
    .version()
    .usage("$0 <command> [options]")
    .option("v", {
      alias: "verbose",
      describe: "verbose log",
      demandOption: true,
      default: false,
      type: "boolean",
    })
    .command(translateCmd)
    .command(audioCmd)
    .command(imagesCmd)
    .command(movieCmd)
    .command(pdfCmd)
    .command(toolCmd)
    .demandCommand()
    .strict()
    .help()
    .alias("help", "h");

  await cli.parseAsync();
};

main().catch((error) => {
  GraphAILogger.info("An unexpected error occurred:", error);
  process.exit(1);
});
