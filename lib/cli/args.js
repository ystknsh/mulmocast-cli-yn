"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.args = void 0;
const yargs_1 = __importDefault(require("yargs"));
const helpers_1 = require("yargs/helpers");
const common_1 = require("./common");
exports.args = (0, common_1.commonOptions)((0, yargs_1.default)((0, helpers_1.hideBin)(process.argv)))
    .scriptName("mulmocast")
    .option("scratchpaddir", {
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
        choices: ["translate", "audio", "images", "movie", "preprocess"],
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
