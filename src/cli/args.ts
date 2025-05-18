import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { commonOptions } from "./common.js";

import { pdf_modes, pdf_sizes, languages } from "../utils/const.js";

export const getArgs = () => {
  return commonOptions(yargs(hideBin(process.argv)))
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
    .option("c", {
      alias: "caption",
      description: "Video captions",
      choices: languages,
      demandOption: false,
      type: "string",
    })
    .option("pdf_mode", {
      description: "pdf mode",
      demandOption: false,
      choices: pdf_modes,
      type: "string",
      default: "slide",
    })
    .option("pdf_size", {
      choices: pdf_sizes,
      default: "letter",
      describe: "PDF paper size (default: letter for US standard)",
    })
    .command("$0 <action> <file>", "Run mulmocast", (yargs) => {
      return yargs
        .positional("action", {
          describe: "action to perform",
          choices: ["translate", "audio", "images", "movie", "pdf"] as const,
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
};
