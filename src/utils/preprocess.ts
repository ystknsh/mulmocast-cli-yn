import { readMulmoScriptFile, getOutputStudioFilePath } from "./file.js";
import { MulmoStudio, MulmoBeat, MulmoScript } from "../types/index.js";
import { text2hash } from "./text_hash.js";
import { MulmoScriptMethods } from "../methods/index.js";

export const createOrUpdateStudioData = (mulmoScript: MulmoScript, fileName: string, files: { outDirPath: string }) => {
  const { outDirPath } = files;

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

  studio.script = mulmoScript; // update the script
  studio.beats.length = mulmoScript.beats.length; // In case it became shorter
  mulmoScript.beats.forEach((beat: MulmoBeat, index: number) => {
    const voiceId = studio.script.speechParams.speakers[beat.speaker].voiceId;
    const speechOptions = MulmoScriptMethods.getSpeechOptions(studio.script, beat);
    const hash_string = `${beat.text}${voiceId}${speechOptions?.instruction ?? ""}${speechOptions?.speed ?? 1.0}`;
    studio.beats[index] = { ...studio.beats[index], ...beat, audioFile: `${fileName}_${index}_${text2hash(hash_string)}` };
  });
  return studio;
};
