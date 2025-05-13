import fs from "fs";
import path from "path";
import { rgb, PDFDocument } from "pdf-lib";

import { chunkArray, isHttp } from "../utils/utils.js";
import { getOutputPdfFilePath, writingMessage } from "../utils/file.js";

import { MulmoStudioContext, PDFMode, PDFSize } from "../types/index.js";
import { MulmoScriptMethods } from "../methods/index.js";

const imagesPerPage = 4;
const offset = 10;
const handoutImageRatio = 0.5;

const readImage = async (imagePath: string, pdfDoc: PDFDocument) => {
  const imageBytes = await (async () => {
    if (isHttp(imagePath)) {
      const res = await fetch(imagePath);
      const arrayBuffer = await res.arrayBuffer();
      return Buffer.from(arrayBuffer);
    }
    return fs.readFileSync(imagePath);
  })();

  const ext = path.extname(imagePath).toLowerCase();

  return ext === ".jpg" || ext === ".jpeg" ? await pdfDoc.embedJpg(imageBytes) : await pdfDoc.embedPng(imageBytes);
};

const pdfSlide = async (pageWidth: number, pageHeight: number, imagePaths: string[], pdfDoc: PDFDocument) => {
  const cellRatio = pageHeight / pageWidth;
  for (const imagePath of imagePaths) {
    const image = await readImage(imagePath, pdfDoc);

    const { width: origWidth, height: origHeight } = image.scale(1);
    const originalRatio = origHeight / origWidth;
    const fitWidth = originalRatio / cellRatio < 1;
    const { drawWidth, drawHeight } = drawSize(fitWidth, pageWidth, pageHeight, origWidth, origHeight);

    const page = pdfDoc.addPage([pageWidth, pageHeight]);
    page.drawImage(image, {
      x: 0,
      y: 0,
      width: drawWidth,
      height: drawHeight,
    });
  }
};
const pdfTalk = async (pageWidth: number, pageHeight: number, imagePaths: string[], pdfDoc: PDFDocument) => {
  const targetWidth = pageWidth * 0.7;
  const targetHeight = pageHeight * 0.7 - offset;

  const cellRatio = targetHeight / targetWidth;

  for (const imagePath of imagePaths) {
    const image = await readImage(imagePath, pdfDoc);

    const { width: origWidth, height: origHeight } = image.scale(1);
    const originalRatio = origHeight / origWidth;
    const fitWidth = originalRatio / cellRatio < 1;
    const { drawWidth, drawHeight } = drawSize(fitWidth, targetWidth, targetHeight, origWidth, origHeight);

    const x = (pageWidth - drawWidth) / 2;
    const y = pageHeight - drawHeight - offset;

    const page = pdfDoc.addPage([pageWidth, pageHeight]);
    const pos = {
      x,
      y,
      width: drawWidth,
      height: drawHeight,
    };
    page.drawImage(image, pos);
    page.drawRectangle({
      ...pos,
      borderColor: rgb(0, 0, 0),
      borderWidth: 1,
    });
  }
};

const drawSize = (fitWidth: boolean, expectWidth: number, expectHeight: number, origWidth: number, origHeight: number) => {
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

const pdfHandout = async (pageWidth: number, pageHeight: number, imagePaths: string[], pdfDoc: PDFDocument, isLandscapeImage: boolean) => {
  const cellRatio = (pageHeight / imagesPerPage - offset) / (pageWidth * handoutImageRatio - offset);

  for (const chunkPaths of chunkArray<string>(imagePaths, imagesPerPage)) {
    const page = pdfDoc.addPage([pageWidth, pageHeight]);
    for (let i = 0; i < chunkPaths.length; i++) {
      const imagePath = chunkPaths[i];
      const image = await readImage(imagePath, pdfDoc);

      const { width: origWidth, height: origHeight } = image.scale(1);
      const originalRatio = origHeight / origWidth;

      const fitWidth = originalRatio / cellRatio < 1;
      // console.log({handoutImageRatio, cellRatio, ratio,  imageHeight, origHeight});
      const pos = (() => {
        if (isLandscapeImage) {
          const cellHeight = pageHeight / imagesPerPage - offset;

          const { drawWidth, drawHeight } = drawSize(fitWidth, (pageWidth - offset) * handoutImageRatio, cellHeight - offset, origWidth, origHeight);

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
          const { drawWidth, drawHeight } = drawSize(fitWidth, cellWidth - offset, (pageHeight - offset) * handoutImageRatio, origWidth, origHeight);

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

const outputSize = (pdfSize: PDFSize, isLandscapeImage: boolean, isRotate: boolean) => {
  // console.log(pdfSize);
  if (pdfSize === "a4") {
    if (isLandscapeImage !== isRotate) {
      return { width: 841.89, height: 595.28 };
    }
    return { width: 595.28, height: 841.89 };
  }
  // letter
  if (isLandscapeImage !== isRotate) {
    return { width: 792, height: 612 };
  }
  return { width: 612, height: 792 };
};

export const pdf = async (context: MulmoStudioContext, pdfMode: PDFMode, pdfSize: PDFSize) => {
  const { studio, fileDirs } = context;
  const { outDirPath } = fileDirs;

  const { width: imageWidth, height: imageHeight } = MulmoScriptMethods.getCanvasSize(studio.script);
  const isLandscapeImage = imageWidth > imageHeight;

  const isRotate = pdfMode === "handout";
  const { width: pageWidth, height: pageHeight } = outputSize(pdfSize, isLandscapeImage, isRotate);

  const imagePaths = studio.beats.map((beat) => beat.imageFile!);

  const outputPdfPath = getOutputPdfFilePath(outDirPath, studio.filename, pdfMode);

  const pdfDoc = await PDFDocument.create();

  if (pdfMode === "handout") {
    await pdfHandout(pageWidth, pageHeight, imagePaths, pdfDoc, isLandscapeImage);
  }
  if (pdfMode === "slide") {
    await pdfSlide(pageWidth, pageHeight, imagePaths, pdfDoc);
  }
  if (pdfMode === "talk") {
    await pdfTalk(pageWidth, pageHeight, imagePaths, pdfDoc);
  }

  const pdfBytes = await pdfDoc.save();
  fs.writeFileSync(outputPdfPath, pdfBytes);
  writingMessage(outputPdfPath);
};
