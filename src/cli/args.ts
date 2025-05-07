import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { commonOptions } from "./common";

export const args = commonOptions(yargs(hideBin(process.argv)))
  .scriptName("mulmo")
  .option("s", {
    alias: "scratchpaddir",
    description: "scratchpad dir",
    demandOption: false,
    type: "string",
  })
  .option("i", {
    alias: "imagedir",
    description: "image dir",
    demandOption: false,
    type: "string",
  })
  .command("$0 <action> <file>", "Run mulmocast", (yargs) => {
    return yargs
      .positional("action", {
        describe: "action to perform",
        choices: ["translate", "audio", "images", "movie", "preprocess"] as const,
        type: "string",
      })
      .positional("file", {
        describe: "Mulmo Script File",
        type: "string",
      });
  })
  .strict()
  .help()
  .parseSync();
