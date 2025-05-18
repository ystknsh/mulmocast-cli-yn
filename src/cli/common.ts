import type { Argv } from "yargs";
import { languages } from "../utils/const.js";

export const commonOptions = (yargs: Argv) => {
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
    })
    .option("l", {
      alias: "lang",
      description: "target language",
      choices: languages,
      demandOption: false,
      type: "string",
    });
};
