#!/usr/bin/env node

import "dotenv/config";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { GraphAILogger } from "graphai";

import { getArgs } from "./args.js";

import { createOrUpdateStudioData } from "../utils/preprocess.js";
import { outDirName, imageDirName, audioDirName } from "../utils/const.js";
import { MulmoScriptMethods } from "../methods/index.js";

import { translate, audio, images, movie, pdf } from "../../src/actions/index.js";

import { getBaseDirPath, getFullPath, readMulmoScriptFile, fetchMulmoScriptFile, getOutputStudioFilePath } from "../utils/file.js";
import { isHttp } from "../utils/utils.js";
import { mulmoScriptSchema } from "../types/schema.js";
import { MulmoStudio } from "../types/type.js";

export const getFileObject = (_args: { [x: string]: unknown }) => {
  const { basedir, file, outdir, imagedir, audiodir } = _args;
  const baseDirPath = getBaseDirPath(basedir as string);

  const fileOrUrl = (file as string) ?? "";
  const fileName = path.parse(fileOrUrl).name;
  const isHttpPath = isHttp(fileOrUrl);

  const mulmoFilePath = isHttpPath ? "" : getFullPath(baseDirPath, fileOrUrl);
  const mulmoFileDirPath = path.dirname(isHttpPath ? baseDirPath : mulmoFilePath);

  const outDirPath = getFullPath(baseDirPath, (outdir as string) ?? outDirName);
  const imageDirPath = getFullPath(outDirPath, (imagedir as string) ?? imageDirName);
  const audioDirPath = getFullPath(outDirPath, (audiodir as string) ?? audioDirName);
  const outputStudioFilePath = getOutputStudioFilePath(outDirPath, fileName);

  return { baseDirPath, mulmoFilePath, mulmoFileDirPath, outDirPath, imageDirPath, audioDirPath, isHttpPath, fileOrUrl, outputStudioFilePath, fileName };
};

const main = async () => {
  const args = getArgs();
  const files = getFileObject(args);
  const { mulmoFilePath, isHttpPath, fileOrUrl, fileName, outputStudioFilePath } = files;

  if (args.v) {
    GraphAILogger.info(files);
  } else {
    GraphAILogger.setLevelEnabled("error", false);
    GraphAILogger.setLevelEnabled("log", false);
    GraphAILogger.setLevelEnabled("warn", false);
  }

  const { action, force, pdf_mode, pdf_size } = args;
  const readData = await (async () => {
    if (isHttpPath) {
      const res = await fetchMulmoScriptFile(fileOrUrl);
      if (!res.result || !res.script) {
        GraphAILogger.info(`ERROR: HTTP error! ${res.status} ${fileOrUrl}`);
        process.exit(1);
      }
      return {
        mulmoData: res.script,
        fileName,
      };
    }
    if (!fs.existsSync(mulmoFilePath)) {
      GraphAILogger.info("ERROR: File not exists " + mulmoFilePath);
      process.exit(1);
    }
    return readMulmoScriptFile(mulmoFilePath, "ERROR: File does not exist " + mulmoFilePath);
  })();

  const { mulmoData: mulmoScript } = readData;
  // validate mulmoStudioSchema. skip if __test_invalid__ is true
  try {
    if (!mulmoScript?.__test_invalid__) {
      mulmoScriptSchema.parse(mulmoScript);
    }
  } catch (error) {
    GraphAILogger.info(`Error: invalid MulmoScript Schema: ${isHttpPath ? fileOrUrl : mulmoFilePath} \n ${error}`);
    process.exit(1);
  }

  // Create or update MulmoStudio file with MulmoScript
  const currentStudio = readMulmoScriptFile<MulmoStudio>(outputStudioFilePath);
  const studio = createOrUpdateStudioData(mulmoScript, fileName, currentStudio?.mulmoData);

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
  if (action === "pdf") {
    await images(context);
    await pdf(context, pdf_mode, pdf_size);
  }
};

const __filename = fileURLToPath(import.meta.url);
if (process.argv[1] === __filename) {
  main();
}
