"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOrUpdateStudioData = void 0;
const file_1 = require("./file");
const text_hash_1 = require("./text_hash");
const createOrUpdateStudioData = (mulmoFile, files) => {
    const { outDirPath } = files;
    const readData = (0, file_1.readMulmoScriptFile)(mulmoFile, "ERROR: File does not exist " + mulmoFile);
    const { mulmoData: mulmoScript, fileName } = readData;
    // Create or update MulmoStudio file with MulmoScript
    const outputStudioFilePath = (0, file_1.getOutputStudioFilePath)(outDirPath, fileName);
    const currentStudio = (0, file_1.readMulmoScriptFile)(outputStudioFilePath);
    const studio = currentStudio?.mulmoData ?? {
        script: mulmoScript,
        filename: fileName,
        beats: Array(mulmoScript.beats.length).fill({}),
    };
    if (!studio.beats) {
        studio.beats = [];
    }
    studio.script = mulmoScript; // update the script
    studio.beats.length = mulmoScript.beats.length; // In case it became shorter
    mulmoScript.beats.forEach((beat, index) => {
        studio.beats[index] = { ...studio.beats[index], ...beat, filename: `${fileName}_${index}_${(0, text_hash_1.text2hash)(beat.text)}` };
    });
    return studio;
};
exports.createOrUpdateStudioData = createOrUpdateStudioData;
