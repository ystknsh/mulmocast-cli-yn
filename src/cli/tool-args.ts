import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { commonOptions } from "./common.js";
import { GraphAILogger } from "graphai";
import { getAvailableTemplates } from "../utils/file.js";

GraphAILogger.setLevelEnabled("error", false);

const availableTemplateNames = getAvailableTemplates().map((template) => template.filename);

export const args = commonOptions(yargs(hideBin(process.argv)))
  .scriptName("mulmo-tool")
  .option("u", {
    alias: "url",
    description: "URLs to reference (required when not in interactive mode)",
    demandOption: false,
    default: [],
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
    choices: availableTemplateNames,
    type: "string",
  })
  .option("c", {
    alias: "cache",
    description: "cache dir",
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
      choices: ["scripting", "prompt"] as const,
      type: "string",
    });
  })
  .strict()
  .help()
  .parseSync();
