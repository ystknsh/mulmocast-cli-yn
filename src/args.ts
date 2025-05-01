import yargs from "yargs";
import { hideBin } from "yargs/helpers";

type CliArgs = {
  action: string;
  file: string;
  outdir?: string;
  scratchpad?: string;
  basedir?: string;
};

export const args = yargs(hideBin(process.argv))
  .scriptName("mulmocast")
  .option("outdir", {
    description: "output dir",
    demandOption: false,
    type: "string",
  })
  .option("scratchpad", {
    description: "scratchpad dir",
    demandOption: false,
    type: "string",
  })
  .option("basedir", {
    description: "base dir",
    demandOption: false,
    type: "string",
  })
  .command(
    "$0 <action> <file>", // コマンド名は `$0` で、2つの positional 引数を指定
    "Run mulmocast",
    (yargs) => {
      return yargs
        .positional("action", {
          describe: "action to perform",
          choices: ["translate", "audio", "image", "movie"] as const,
          type: "string",
        })
        .positional("file", {
          describe: "Mulmo Script File",
          type: "string",
        });
    },
  )
  .strict()
  .help()
  .parseSync();
