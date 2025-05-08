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

const isHttp = (fileOrUrl: string) => {
  return fileOrUrl.startsWith("http");
};
const getFileObject = () => {
  const { basedir, file, outdir, imagedir, audiodir } = args;
  const baseDirPath = getBaseDirPath(basedir as string);

  const fileOrUrl = (file as string) ?? "";
  const isHttpPath = isHttp(fileOrUrl);
  const mulmoFilePath = getFullPath(baseDirPath, isHttpPath ?  "" : fileOrUrl);
  const mulmoFileDirPath = path.dirname(mulmoFilePath);

  const outDirPath = getFullPath(baseDirPath, (outdir as string) ?? outDirName);
  const imageDirPath = getFullPath(outDirPath, (imagedir as string) ?? imageDirName);
  const audioDirPath = getFullPath(outDirPath, (audiodir as string) ?? audioDirName);

  return { baseDirPath, mulmoFilePath, mulmoFileDirPath, outDirPath, imageDirPath, audioDirPath, isHttpPath };
};
const main = async () => {
  const files = getFileObject();
  const { mulmoFilePath, mulmoFileDirPath, isHttpPath } = files;

  if (args.v) {
    GraphAILogger.info(files);
  } else {
    GraphAILogger.setLevelEnabled("error", false);
    GraphAILogger.setLevelEnabled("log", false);
    GraphAILogger.setLevelEnabled("warn", false);
  }

  const { action, force } = args;

  const readData = await (async () => {
    if (isHttpPath) {
      const url = args.file as string;
      const res = await fetch(url);
      if (!res.ok) {
        GraphAILogger.info(`HTTP error! ${res.status} ${url}`);
      }
      const script = await res.json();
      return {
        mulmoData: script,
        mulmoDataPath: mulmoFileDirPath,
        fileName: path.parse(url).name,
      };
    } else {
      if (!fs.existsSync(mulmoFilePath)) {
        GraphAILogger.info("ERROR: File not exists " + mulmoFilePath);
        process.exit(1);
      }
      return readMulmoScriptFile(mulmoFilePath, "ERROR: File does not exist " + mulmoFilePath);
    }
  })();

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
    force: Boolean(force),
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
