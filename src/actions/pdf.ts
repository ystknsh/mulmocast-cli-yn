import fs from "fs";
import path from "path";
import { rgb, PDFDocument } from "pdf-lib";

import { chunkArray } from "../utils/utils.js";
import { getOutputPdfFilePath, writingMessage } from "../utils/file.js";

import { MulmoStudioContext, PDFMode, PDFSize } from "../types/index.js";
import { MulmoScriptMethods } from "../methods/index.js";

const imagesPerPage = 4;
const offset = 10;
const handoutImageRatio = 0.5;

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
const pdfTalk = async (imageWidth: number, imageHeight: number, imagePaths: string[], pdfDoc: PDFDocument) => {
  const targetWidth = imageWidth * 0.7;
  const targetHeight = imageHeight * 0.7;

  const x = (imageWidth - targetWidth) / 2;
  const y = imageHeight - targetHeight;

  for (const imagePath of imagePaths) {
    const image = await readImage(imagePath, pdfDoc);
    const page = pdfDoc.addPage([imageWidth, imageHeight]);
    const pos = {
      x,
      y,
      width: targetWidth,
      height: targetHeight,
    };
    page.drawImage(image, pos);
    page.drawRectangle({
      ...pos,
      borderColor: rgb(0, 0, 0),
      borderWidth: 1,
    });
  }
};

const pdfHandout = async (
  imageWidth: number,
  imageHeight: number,
  pageWidth: number,
  pageHeight: number,
  imagePaths: string[],
  pdfDoc: PDFDocument,
  isLandscapeImage: boolean,
) => {
  const cellRatio = (pageHeight / imagesPerPage - offset) / (pageWidth * handoutImageRatio - offset);

  for (const chunkPaths of chunkArray<string>(imagePaths, imagesPerPage)) {
    const page = pdfDoc.addPage([pageWidth, pageHeight]);
    for (let i = 0; i < chunkPaths.length; i++) {
      const imagePath = chunkPaths[i];
      const image = await readImage(imagePath, pdfDoc);

      const { width: origWidth, height: origHeight } = image.scale(1);
      const originalRatio = origHeight / origWidth;

      const ratio = originalRatio / cellRatio;
      // console.log({handoutImageRatio, cellRatio, ratio,  imageHeight, origHeight});
      const pos = (() => {
        if (isLandscapeImage) {
          const cellHeight = pageHeight / imagesPerPage - offset;

          const { drawWidth, drawHeight } = (() => {
            if (ratio < 1) {
              const drawWidth = (pageWidth - offset) * handoutImageRatio;
              const scale = drawWidth / origWidth;
              const drawHeight = origHeight * scale;
              return {
                drawWidth,
                drawHeight,
              };
            }
            const drawHeight = cellHeight - offset;
            const scale = drawHeight / origHeight;
            const drawWidth = origWidth * scale;
            return {
              drawWidth,
              drawHeight,
            };
          })();

          const x = offset;
          const y = pageHeight - (i + 1) * cellHeight + (cellHeight - drawHeight) * handoutImageRatio;
          return {
            x,
            y,
            width: drawWidth,
            height: drawHeight,
          };
        } else {
          const cellWidth = pageWidth / imagesPerPage;
          const { drawHeight, drawWidth } = (() => {
            if (ratio < 1) {
              const drawHeight = (pageHeight - offset) * handoutImageRatio;
              const scale = drawHeight / origHeight;
              const drawWidth = origWidth * scale;
              return { drawHeight, drawWidth };
            }
            const drawWidth = cellWidth - offset;
            const scale = drawWidth / origWidth;
            const drawHeight = origHeight * scale;
            return { drawHeight, drawWidth };
          })();

          const x = pageWidth - (imagesPerPage - i) * cellWidth + (cellWidth - drawWidth) * handoutImageRatio;
          const y = pageHeight - drawHeight - offset;

          return {
            x,
            y,
            width: drawWidth,
            height: drawHeight,
          };
        }
      })();
      page.drawRectangle({
        ...pos,
        borderColor: rgb(0, 0, 0),
        borderWidth: 1,
      });
      page.drawImage(image, pos);
    }
  }
};

const outputSize = (pdfSize: PDFSize, isLandscapeImage: boolean) => {
  // console.log(pdfSize);
  if (pdfSize === "a4") {
    if (isLandscapeImage) {
      return { width: 595.28, height: 841.89 };
    }
    return { width: 841.89, height: 595.28 };
  }
  // letter
  if (isLandscapeImage) {
    return { width: 612, height: 792 };
  }
  return { width: 792, height: 612 };
};

export const pdf = async (context: MulmoStudioContext, pdfMode: PDFMode, pdfSize: PDFSize) => {
  const { studio, fileDirs } = context;
  const { outDirPath } = fileDirs;

  const { width: imageWidth, height: imageHeight } = MulmoScriptMethods.getCanvasSize(studio.script);
  const isLandscapeImage = imageWidth > imageHeight;
  const { width: pageWidth, height: pageHeight } = outputSize(pdfSize, isLandscapeImage);
  // console.log(pageWidth, pageHeight);
  const imagePaths = studio.beats.map((beat) => beat.imageFile!);

  const outputPdfPath = getOutputPdfFilePath(outDirPath, studio.filename);

  const pdfDoc = await PDFDocument.create();

  if (pdfMode === "handout") {
    await pdfHandout(imageWidth, imageHeight, pageWidth, pageHeight, imagePaths, pdfDoc, isLandscapeImage);
  }
  if (pdfMode === "slide") {
    await pdfSlide(imageWidth, imageHeight, imagePaths, pdfDoc);
  }
  if (pdfMode === "talk") {
    await pdfTalk(imageWidth, imageHeight, imagePaths, pdfDoc);
  }

  const pdfBytes = await pdfDoc.save();
  fs.writeFileSync(outputPdfPath, pdfBytes);
  writingMessage(outputPdfPath);
};
