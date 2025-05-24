import { Argv } from "yargs";
import { getAvailableTemplates } from "../../../../utils/file.js";
import { llm } from "../../../../utils/utils.js";
import { story_to_script_modes } from "../../../../utils/const.js";

const availableTemplateNames = getAvailableTemplates().map((template) => template.filename);

export const builder = (yargs: Argv) => {
  return yargs
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
    .option("t", {
      alias: "template",
      description: "Template name to use",
      demandOption: false,
      choices: availableTemplateNames,
      type: "string",
    })
    .option("s", {
      alias: "script",
      description: "script filename",
      demandOption: false,
      default: "script",
      type: "string",
    })
    .option("beats_per_scene", {
      description: "beats per scene",
      demandOption: false,
      default: 3,
      type: "number",
    })
    .option("llm", {
      description: "llm",
      demandOption: false,
      choices: llm,
      type: "string",
    })
    .option("llm_model", {
      description: "llm model",
      demandOption: false,
      type: "string",
    })
    .option("mode", {
      description: "story to script mode",
      demandOption: false,
      choices: Object.values(story_to_script_modes),
      default: story_to_script_modes.step_wise,
      type: "string",
    })
    .positional("file", {
      description: "story file path",
      type: "string",
    });
};
