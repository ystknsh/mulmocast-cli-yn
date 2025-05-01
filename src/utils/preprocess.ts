import { readMulmoScriptFile, getOutputStudioFilePath } from "./file";
import { MulmoStudio, MulmoStudioBeat } from "../types";
import { text2hash } from "./text_hash";

export const createOrUpdateStudioData = (mulmoFile: string, files: { outDirPath: string }) => {
  const { outDirPath } = files;

  const readData = readMulmoScriptFile(mulmoFile, "ERROR: File does not exist " + mulmoFile)!;
  const { mulmoData: mulmoScript, fileName } = readData;

  // Create or update MulmoStudio file with MulmoScript
  const outputStudioFilePath = getOutputStudioFilePath(outDirPath, fileName);
  const currentStudio = readMulmoScriptFile<MulmoStudio>(outputStudioFilePath);
  const studio: MulmoStudio = currentStudio?.mulmoData ?? {
    script: mulmoScript,
    filename: fileName,
    beats: Array(mulmoScript.beats.length).fill({}),
  };
  if (!studio.beats) {
    studio.beats = [];
  }
  studio.script = mulmoScript; // update the script
  studio.beats.length = mulmoScript.beats.length; // In case it became shorter
  mulmoScript.beats.forEach((beat: MulmoStudioBeat, index: number) => {
    studio.beats[index] = { ...studio.beats[index], ...beat, filename: `${fileName}_${index}_${text2hash(beat.text)}` };
  });
  return studio;
};
