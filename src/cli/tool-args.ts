import yargs from "yargs";
import { hideBin } from "yargs/helpers";

export const args = yargs(hideBin(process.argv))
  .scriptName("mulmocast-tool")
  .option("u", {
    alias: "url",
    description: "URLs to reference",
    demandOption: true,
    type: "array",
    string: true,
  })
  .option("t", {
    alias: "template",
    description: "Template name to use",
    demandOption: false,
    type: "string",
  })
  .option("b", {
    alias: "basedir",
    description: "base dir",
    demandOption: false,
    type: "string",
  })
  .option("o", {
    alias: "outdir",
    description: "output dir",
    demandOption: false,
    type: "string",
  })
  .option("v", {
    alias: "verbose",
    description: "verbose log",
    demandOption: false,
    type: "boolean",
  })
  .command("$0 <action>", "Run mulmocast tool", (yargs) => {
    return yargs.positional("action", {
      describe: "action to perform",
      choices: ["scripting"] as const,
      type: "string",
    });
  })
  .strict()
  .help()
  .parseSync();
