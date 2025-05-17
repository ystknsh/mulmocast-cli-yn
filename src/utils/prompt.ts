import { MulmoBeat } from "../types/index.js";

export const imagePrompt = (beat: MulmoBeat, style?: string) => {
  return (beat.imagePrompt || `generate image appropriate for the text. text: ${beat.text}`) + "\n" + (style || "");
};

// sourceTextInput: ${:sourceText.text}
export const graphDataScriptFromUrlPrompt = (sourceTextInput: string) => {
  return `Please create a script using the information from the following URLs as reference: ${sourceTextInput}`;
};
