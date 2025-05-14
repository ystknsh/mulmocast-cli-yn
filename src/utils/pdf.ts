import { PDFFont } from "pdf-lib";
export const fontSize = 12;
export const textMargin = 6;

export const drawSize = (fitWidth: boolean, expectWidth: number, expectHeight: number, origWidth: number, origHeight: number) => {
  if (fitWidth) {
    const drawWidth = expectWidth;
    const scale = drawWidth / origWidth;
    const drawHeight = origHeight * scale;
    return {
      drawWidth,
      drawHeight,
    };
  }
  const drawHeight = expectHeight;
  const scale = drawHeight / origHeight;
  const drawWidth = origWidth * scale;
  return {
    drawWidth,
    drawHeight,
  };
};

export const wrapText = (text: string, font: PDFFont, fontSize: number, maxWidth: number) => {
  const words = text.split(" ");
  const lines = [];
  let currentLine = "";

  for (const word of words) {
    const nextLine = currentLine ? `${currentLine} ${word}` : word;
    // console.log(nextLine);
    const width = font.widthOfTextAtSize(nextLine ?? "", fontSize);
    if (width <= maxWidth) {
      currentLine = nextLine;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines;
};
