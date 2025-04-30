import { readMulmoScriptFile, getOutputFilePath } from "./file";
import { MulmoBeat, MulmoStudio, MulmoStudioBeat, SpeakerDictonary, Text2speechParams } from "../type";
import { text2hash } from "./text_hash";

export const createOrUpdateStudioData = (mulmoFile: string) => {
  const readData = readMulmoScriptFile(mulmoFile, "ERROR: File does not exist " + mulmoFile)!;
  const { mulmoData, fileName } = readData;

  // Create or update MulmoStudio file with MulmoScript
  const outputFilePath = getOutputFilePath(fileName + "_studio.json");
  const info = readMulmoScriptFile<MulmoStudio>(outputFilePath);
  const studio: MulmoStudio = info?.mulmoData ?? {
    script: mulmoData,
    filename: fileName,
    beats: Array(mulmoData.beats.length).fill({}),
  };
  studio.script = mulmoData; // update the script
  studio.beats.length = mulmoData.beats.length; // In case it became shorter
  mulmoData.beats.forEach((beat: MulmoStudioBeat, index: number) => {
    studio.beats[index] = { ...studio.beats[index], ...beat, filename: `${fileName}_${index}_${text2hash(beat.text)}` };
  });
  return studio;
}  
