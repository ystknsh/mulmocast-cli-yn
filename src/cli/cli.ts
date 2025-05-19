#!/usr/bin/env node

import "dotenv/config";
import fs from "fs";
import path from "path";
import { GraphAILogger } from "graphai";

import { getArgs } from "./args.js";

import { createOrUpdateStudioData } from "../utils/preprocess.js";
import { outDirName, imageDirName, audioDirName } from "../utils/const.js";

import { translate, audio, images, movie, pdf, captions } from "../actions/index.js";

import { getBaseDirPath, getFullPath, readMulmoScriptFile, fetchMulmoScriptFile, getOutputStudioFilePath } from "../utils/file.js";
import { isHttp } from "../utils/utils.js";
import { MulmoStudio, MulmoStudioContext } from "../types/type.js";

export const getFileObject = (_args: { [x: string]: unknown }) => {
  const { basedir, file, outdir, imagedir, audiodir } = _args;
  const baseDirPath = getBaseDirPath(basedir as string);

  const { fileOrUrl, fileName } = (() => {
    if (file === "__clipboard") {
      const fileOrUrl = "scripts/test/test_hello.json";
      const now = new Date();
      const pad = (n: number) => n.toString().padStart(2, '0');
      
      const fileName = `script_${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
      return { fileOrUrl, fileName };
    }
    const fileOrUrl = (file as string) ?? "";
    const fileName = path.parse(fileOrUrl).name;
    return { fileOrUrl, fileName };
  })();
  const isHttpPath = isHttp(fileOrUrl);

  const mulmoFilePath = isHttpPath ? "" : getFullPath(baseDirPath, fileOrUrl);
  const mulmoFileDirPath = path.dirname(isHttpPath ? baseDirPath : mulmoFilePath);

  const outDirPath = getFullPath(baseDirPath, (outdir as string) ?? outDirName);
  const imageDirPath = getFullPath(outDirPath, (imagedir as string) ?? imageDirName);
  const audioDirPath = getFullPath(outDirPath, (audiodir as string) ?? audioDirName);
  const outputStudioFilePath = getOutputStudioFilePath(outDirPath, fileName);

  return { baseDirPath, mulmoFilePath, mulmoFileDirPath, outDirPath, imageDirPath, audioDirPath, isHttpPath, fileOrUrl, outputStudioFilePath, fileName };
};

const fetchScript = async (isHttpPath: boolean, mulmoFilePath: string, fileOrUrl: string) => {
  if (isHttpPath) {
    const res = await fetchMulmoScriptFile(fileOrUrl);
    if (!res.result || !res.script) {
      GraphAILogger.info(`ERROR: HTTP error! ${res.status} ${fileOrUrl}`);
      process.exit(1);
    }
    return res.script;
  }
  if (!fs.existsSync(mulmoFilePath)) {
    GraphAILogger.info(`ERROR: File not exists ${mulmoFilePath}`);
    process.exit(1);
  }
  return readMulmoScriptFile(mulmoFilePath, "ERROR: File does not exist " + mulmoFilePath).mulmoData;
};

export const main = async () => {
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

  const { action, f: force, pdf_mode, pdf_size, l: lang, c: caption } = args;
  const mulmoScript = await fetchScript(isHttpPath, mulmoFilePath, fileOrUrl);

  // Create or update MulmoStudio file with MulmoScript
  const currentStudio = readMulmoScriptFile<MulmoStudio>(outputStudioFilePath);
  const studio = (() => {
    try {
      // validate mulmoStudioSchema. skip if __test_invalid__ is true
      return createOrUpdateStudioData(mulmoScript, currentStudio?.mulmoData, fileName);
    } catch (error) {
      GraphAILogger.info(`Error: invalid MulmoScript Schema: ${isHttpPath ? fileOrUrl : mulmoFilePath} \n ${error}`);
      process.exit(1);
    }
  })();

  const context: MulmoStudioContext = {
    studio,
    fileDirs: files,
    force: Boolean(force),
    lang: lang,
    caption: caption,
  };
  if (action === "translate" || lang || caption) {
    GraphAILogger.log("run translate");
    await translate(context);
  }
  if (action === "audio") {
    await audio(context);
  }
  if (action === "images") {
    await images(context);
  }
  if (action === "movie") {
    if (caption) {
      await captions(context);
    }
    await audio(context);
    await images(context);
    await movie(context);
  }
  if (action === "pdf") {
    await images(context);
    await pdf(context, pdf_mode, pdf_size);
  }
};
