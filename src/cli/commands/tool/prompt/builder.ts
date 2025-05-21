import { Argv } from "yargs";
import { getAvailableTemplates } from "../../../../utils/file.js";

const availableTemplateNames = getAvailableTemplates().map((template) => template.filename);

export const builder = (yargs: Argv) => {
  return yargs.option("t", {
    alias: "template",
    describe: "Template name to use",
    demandOption: false,
    choices: availableTemplateNames,
    type: "string",
  });
};
