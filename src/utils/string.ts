export function splitIntoSentencesJa(paragraph: string, divider: string, minimum: number): string[] {
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

export const recursiveSplitJa = (text: string) => {
  const delimiters = ["。", "？", "！", "、"];
  return delimiters.reduce<string[]>(
    (textData, delimiter) => {
      return textData.map((text) => splitIntoSentencesJa(text, delimiter, 7)).flat(1);
    },
    [text],
  )
    .flat(1);
};
