#!/usr/bin/env node

import "dotenv/config";
import fs from "fs";
import path from "path";
import { GraphAILogger } from "graphai";

import { args } from "./args";

import { createOrUpdateStudioData } from "../utils/preprocess";
import { outDirName, imageDirName, scratchpadDirName } from "../utils/const";
import { MulmoScriptMethods } from "../methods";

import { translate } from "../actions/translate";
import { images } from "../actions/images";
import { audio } from "../actions/audio";
import { movie } from "../actions/movie";

import { getBaseDirPath, getFullPath, readMulmoScriptFile } from "../utils/file";
import { mulmoScriptSchema } from "../types/schema";

const getFileObject = () => {
  const { basedir, file, outdir, imagedir, scratchpaddir } = args;
  const baseDirPath = getBaseDirPath(basedir as string);

  const mulmoFilePath = getFullPath(baseDirPath, (file as string) ?? "");
  const mulmoFileDirPath = path.dirname(mulmoFilePath);

  const outDirPath = getFullPath(baseDirPath, (outdir as string) ?? outDirName);
  const imageDirPath = getFullPath(baseDirPath, (imagedir as string) ?? imageDirName);
  const scratchpadDirPath = getFullPath(baseDirPath, (scratchpaddir as string) ?? scratchpadDirName);

  return { baseDirPath, mulmoFilePath, mulmoFileDirPath, outDirPath, imageDirPath, scratchpadDirPath };
};
const main = async () => {
  const files = getFileObject();
  const { mulmoFilePath } = files;

  if (args.v) {
    console.log(files);
  } else {
    GraphAILogger.setLevelEnabled("error", false);
    GraphAILogger.setLevelEnabled("log", false);
    GraphAILogger.setLevelEnabled("warn", false);
  }

  if (!fs.existsSync(mulmoFilePath)) {
    console.error("File not exists");
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
    console.error(`Error: invalid MulmoScript Schema: ${mulmoFilePath} \n ${error}`);
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
