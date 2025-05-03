"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.commonOptions = void 0;
const commonOptions = (yargs) => {
    return yargs
        .option("v", {
        alias: "verbose",
        describe: "verbose log",
        demandOption: true,
        default: false,
        type: "boolean",
    })
        .option("o", {
        alias: "outdir",
        description: "output dir",
        demandOption: false,
        type: "string",
    })
        .option("b", {
        alias: "basedir",
        description: "base dir",
        demandOption: false,
        type: "string",
    });
};
exports.commonOptions = commonOptions;
