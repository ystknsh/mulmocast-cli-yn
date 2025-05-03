import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { commonOptions } from "./common";

export const args = commonOptions(yargs(hideBin(process.argv)))
  .scriptName("mulmocast-tool")
  .option("u", {
    alias: "url",
    description: "URLs to reference (required when not in interactive mode)",
    demandOption: false,
    type: "array",
    string: true,
  })
  .option("i", {
    alias: "interactive",
    description: "Generate script in interactive mode with user prompts",
    demandOption: false,
    type: "boolean",
  })
  .option("t", {
    alias: "template",
    description: "Template name to use",
    demandOption: false,
    type: "string",
  })
  .option("f", {
    alias: "filename",
    description: "output filename",
    demandOption: false,
    default: "script",
    type: "string",
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
