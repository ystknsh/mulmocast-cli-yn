import fs from "fs";
import { ScriptData } from "./type";
import { readPodcastScriptFile } from "./utils";

export function splitIntoSentences(paragraph: string, divider: string, minimum: number): string[] {
  const sentences = paragraph
    .split(divider) // Split by the Japanese full stop
    .map((sentence) => sentence.trim()) // Trim whitespace
    .filter((sentence) => sentence.length > 0); // Remove empty sentences

  return sentences
    .reduce<string[]>((acc, sentence) => {
      if (acc.length > 0 && acc[acc.length - 1].length < minimum) {
        acc[acc.length - 1] += divider + sentence;
      } else {
        acc.push(sentence);
      }
      return acc;
    }, [])
    .map((sentence, index, array) => (index < array.length - 1 || paragraph.endsWith(divider) ? sentence + divider : sentence));
}

export const recursiveSplit = (scripts: ScriptData[]) => {
  const delimiters = ["。", "？", "！", "、"];
  return scripts.reduce<ScriptData[]>((prev, script) => {
    const sentences = delimiters
      .reduce<string[]>(
        (textData, delimiter) => {
          return textData.map((text) => splitIntoSentences(text, delimiter, 7)).flat(1);
        },
        [script.text],
      )
      .flat(1);
    sentences.forEach((sentence) => {
      return prev.push({ ...script, text: sentence });
    });
    return prev;
  }, []);
};

/*
interface Replacement {
  from: string;
  to: string;
}

function replacePairs(str: string, replacements: Replacement[]): string {
  replacements.forEach(({ from, to }) => {
    // Escape any special regex characters in the 'from' string.
    const escapedFrom = from.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(escapedFrom, "g");
    str = str.replace(regex, to);
  });
  return str;
}

const replacements: Replacement[] = [
  { from: "Anthropic", to: "アンスロピック" },
];
*/

const main = async () => {
  const arg2 = process.argv[2];

  const readData = readPodcastScriptFile(arg2, "ERROR: File does not exist " + arg2)!;
  const { podcastData, podcastDataPath } = readData;

  if (podcastData.images === undefined) {
    // Transfer imagePrompts to images.
    podcastData.images = [];
    podcastData.script.forEach((element, index) => {
      element.imageIndex = index;
      podcastData.images.push({
        imagePrompt: element.imagePrompt,
        index,
        image: undefined,
      });
      delete element.imagePrompt;
    });
  }

  podcastData.script = recursiveSplit(podcastData.script);
  fs.writeFileSync(podcastDataPath, JSON.stringify(podcastData, null, 2));
};

if (process.argv[1] === __filename) {
  main();
}
