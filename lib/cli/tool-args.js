"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.args = void 0;
const yargs_1 = __importDefault(require("yargs"));
const helpers_1 = require("yargs/helpers");
exports.args = (0, yargs_1.default)((0, helpers_1.hideBin)(process.argv))
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
        choices: ["scripting"],
        type: "string",
    });
})
    .strict()
    .help()
    .parseSync();
