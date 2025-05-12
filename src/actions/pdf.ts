import fs from "fs";
import path from "path";
import { rgb, PDFDocument } from "pdf-lib";

import { chunkArray } from "../utils/utils.js";
import { getOutputPdfFilePath, writingMessage } from "../utils/file.js";

import { MulmoStudioContext } from "../types/index.js";
import { MulmoScriptMethods } from "../methods/index.js";

const imagesPerPage = 4;
const xOffset = 10;

const readImage = async (imagePath: string, pdfDoc: PDFDocument) => {
  const imageBytes = fs.readFileSync(imagePath);
  const ext = path.extname(imagePath).toLowerCase();

  return ext === ".jpg" || ext === ".jpeg" ? await pdfDoc.embedJpg(imageBytes) : await pdfDoc.embedPng(imageBytes);
};

const pdfSlide = async (imageWidth: number, imageHeight: number, imagePaths: string[], pdfDoc: PDFDocument) => {
  for (const imagePath of imagePaths) {
    const image = await readImage(imagePath, pdfDoc);
    const page = pdfDoc.addPage([imageWidth, imageHeight]);
    page.drawImage(image, {
      x: 0,
      y: 0,
      width: imageWidth,
      height: imageHeight,
    });
  }
};

const pdfGrid = async (imageWidth: number, imageHeight: number, imagePaths: string[], pdfDoc: PDFDocument) => {
  const isLandscapeImage = imageWidth > imageHeight;

  const pageWidth = imageHeight;
  const pageHeight = imageWidth;

  for (const chunkPaths of chunkArray<string>(imagePaths, imagesPerPage)) {
    const page = pdfDoc.addPage([pageWidth, pageHeight]);
    for (let i = 0; i < chunkPaths.length; i++) {
      const imagePath = chunkPaths[i];
      const image = await readImage(imagePath, pdfDoc);

      const { width: origWidth, height: origHeight } = image.scale(1);
      if (isLandscapeImage) {
        const cellHeight = pageHeight / imagesPerPage;
        const drawWidth = (pageWidth - xOffset) * 0.5;
        const scale = drawWidth / origWidth;
        const drawHeight = origHeight * scale;

        const x = xOffset;
        const y = pageHeight - (i + 1) * cellHeight + (cellHeight - drawHeight) * 0.5;
        const pos = {
          x,
          y,
          width: drawWidth,
          height: drawHeight,
        };

        page.drawRectangle({
          ...pos,
          borderColor: rgb(0, 0, 0),
          borderWidth: 1,
        });

        page.drawImage(image, pos);
      }
    }
  }
};

// "slide", "talk", "grid"
export const pdf = async (context: MulmoStudioContext, pdf_mode: string) => {
  const { studio, fileDirs } = context;
  const { outDirPath } = fileDirs;
  const { width: imageWidth, height: imageHeight } = MulmoScriptMethods.getCanvasSize(studio.script);
  const imagePaths = studio.beats.map((beat) => beat.imageFile!);

  const outputPdfPath = getOutputPdfFilePath(outDirPath, studio.filename);

  const pdfDoc = await PDFDocument.create();

  if (pdf_mode === "grid") {
    await pdfGrid(imageWidth, imageHeight, imagePaths, pdfDoc);
  }
  if (pdf_mode === "slide") {
    await pdfSlide(imageWidth, imageHeight, imagePaths, pdfDoc);
  }

  const pdfBytes = await pdfDoc.save();
  fs.writeFileSync(outputPdfPath, pdfBytes);
  writingMessage(outputPdfPath);
};
