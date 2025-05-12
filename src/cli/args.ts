import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { commonOptions } from "./common.js";

export const args = commonOptions(yargs(hideBin(process.argv)))
  .scriptName("mulmo")
  .option("a", {
    alias: "audiodir",
    description: "audio dir",
    demandOption: false,
    type: "string",
  })
  .option("i", {
    alias: "imagedir",
    description: "image dir",
    demandOption: false,
    type: "string",
  })
  .option("f", {
    alias: "force",
    description: "force generate",
    demandOption: false,
    default: false,
    type: "boolean",
  })
  .command("$0 <action> <file>", "Run mulmocast", (yargs) => {
    return yargs
      .positional("action", {
        describe: "action to perform",
        choices: ["translate", "audio", "images", "movie", "pdf", "preprocess"] as const,
        type: "string",
      })
      .positional("file", {
        describe: "Mulmo Script File",
        type: "string",
      });
  })
  .strict()
  .help()
  .alias("help", "h")
  .parseSync();
