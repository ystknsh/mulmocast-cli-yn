#!/usr/bin/env node

import "dotenv/config";
import fs from "fs";
import path from "path";
import { GraphAILogger } from "graphai";

import { args } from "./args.js";

import { createOrUpdateStudioData } from "../utils/preprocess.js";
import { outDirName, imageDirName, audioDirName } from "../utils/const.js";
import { MulmoScriptMethods } from "../methods/index.js";

import { translate } from "../actions/translate.js";
import { images } from "../actions/images.js";
import { audio } from "../actions/audio.js";
import { movie } from "../actions/movie.js";

import { getBaseDirPath, getFullPath, readMulmoScriptFile } from "../utils/file.js";
import { mulmoScriptSchema } from "../types/schema.js";

const getFileObject = () => {
  const { basedir, file, outdir, imagedir, scratchpaddir } = args;
  const baseDirPath = getBaseDirPath(basedir as string);

  const mulmoFilePath = getFullPath(baseDirPath, (file as string) ?? "");
  const mulmoFileDirPath = path.dirname(mulmoFilePath);

  const outDirPath = getFullPath(baseDirPath, (outdir as string) ?? outDirName);
  const imageDirPath = getFullPath(outDirPath, (imagedir as string) ?? imageDirName);
  const audioDirPath = getFullPath(outDirPath, (scratchpaddir as string) ?? audioDirName); // audio

  return { baseDirPath, mulmoFilePath, mulmoFileDirPath, outDirPath, imageDirPath, audioDirPath };
};
const main = async () => {
  const files = getFileObject();
  const { mulmoFilePath } = files;

  if (args.v) {
    GraphAILogger.info(files);
  } else {
    GraphAILogger.setLevelEnabled("error", false);
    GraphAILogger.setLevelEnabled("log", false);
    GraphAILogger.setLevelEnabled("warn", false);
  }

  if (!fs.existsSync(mulmoFilePath)) {
    GraphAILogger.info("File not exists");
    process.exit(1);
  }

  // TODO some option process
  const { action } = args;

  const readData = readMulmoScriptFile(mulmoFilePath, "ERROR: File does not exist " + mulmoFilePath);
  const { mulmoData: mulmoScript, fileName } = readData;

  // validate mulmoStudioSchema. skip if __test_invalid__ is true
  try {
    if (!mulmoScript?.__test_invalid__) {
      mulmoScriptSchema.parse(mulmoScript);
    }
  } catch (error) {
    GraphAILogger.info(`Error: invalid MulmoScript Schema: ${mulmoFilePath} \n ${error}`);
    process.exit(1);
  }

  const studio = createOrUpdateStudioData(mulmoScript, fileName, files);

  const context = {
    studio,
    fileDirs: files,
  };
  if (action === "translate") {
    await translate(context);
  }
  if (action === "audio") {
    await audio(context, MulmoScriptMethods.getSpeechProvider(studio.script) === "nijivoice" ? 1 : 8);
  }
  if (action === "images") {
    await images(context);
  }
  if (action === "movie") {
    await audio(context, MulmoScriptMethods.getSpeechProvider(studio.script) === "nijivoice" ? 1 : 8);
    await images(context);
    await movie(context);
  }
};
main();
