import { readMulmoScriptFile, getOutputStudioFilePath } from "./file.js";
import { MulmoStudio, MulmoBeat, MulmoScript, mulmoScriptSchema, mulmoBeatSchema } from "../types/index.js";

export const createOrUpdateStudioData = (_mulmoScript: MulmoScript, fileName: string, files: { outDirPath: string }) => {
  const { outDirPath } = files;

  const mulmoScript = mulmoScriptSchema.parse(_mulmoScript); // validate and insert default value

  // Create or update MulmoStudio file with MulmoScript
  const outputStudioFilePath = getOutputStudioFilePath(outDirPath, fileName);
  const currentStudio = readMulmoScriptFile<MulmoStudio>(outputStudioFilePath);
  const studio: MulmoStudio = currentStudio?.mulmoData ?? {
    script: mulmoScript,
    filename: fileName,
    beats: [...Array(mulmoScript.beats.length)].map(() => ({})),
  };
  if (!studio.beats) {
    studio.beats = [];
  }

  // Addition cloing credit
  if (mulmoScript.$mulmocast.credit === "closing") {
    mulmoScript.beats.push({
      speaker: mulmoScript.beats[0].speaker, // First speaker
      text: "",
      image: {
        type: "image",
        source: {
          kind: "url",
          url: "https://github.com/receptron/mulmocast-cli/raw/refs/heads/main/assets/images/mulmocast_credit.png",
        },
      },
      audio: {
        type: "audio",
        source: {
          kind: "url",
          url: "https://github.com/receptron/mulmocast-cli/raw/refs/heads/main/assets/audio/silent300.mp3",
        },
      },
    });
  }

  studio.script = mulmoScriptSchema.parse(mulmoScript); // update the script
  studio.beats = studio.script.beats.map((_, index) => studio.beats[index] ?? {});
  mulmoScript.beats.forEach((beat: MulmoBeat, index: number) => {
    // Filling the default values
    studio.script.beats[index] = mulmoBeatSchema.parse(beat);
  });
  return studio;
};
