import { GraphAILogger } from "graphai";
import fs from "fs";
import path from "path";
import clipboardy from "clipboardy";
import {
  getBaseDirPath,
  getFullPath,
  getOutputStudioFilePath,
  resolveDirPath,
  mkdir,
  getOutputMultilingualFilePath,
  generateTimestampedFileName,
} from "../utils/file.js";
import { isHttp } from "../utils/utils.js";
import { outDirName, imageDirName, audioDirName } from "../utils/const.js";

import { translate } from "../actions/translate.js";

import { initializeContextFromFiles } from "../utils/context.js";
import type { CliArgs } from "../types/cli_types.js";
import { FileObject, InitOptions, MulmoStudioContext } from "../types/index.js";

export const runTranslateIfNeeded = async (context: MulmoStudioContext, argv: { l?: string; c?: string }) => {
  if (argv.l || context.studio.script.captionParams?.lang) {
    GraphAILogger.log("run translate");
    await translate(context);
  }
};

export const setGraphAILogger = (verbose: boolean | undefined, logValues?: Record<string, unknown>) => {
  if (verbose) {
    if (logValues) {
      Object.entries(logValues).forEach(([key, value]) => {
        GraphAILogger.info(`${key}:`, value);
      });
    }
  } else {
    GraphAILogger.setLevelEnabled("error", false);
    GraphAILogger.setLevelEnabled("log", false);
    GraphAILogger.setLevelEnabled("warn", false);
  }
};

export const getFileObject = (args: {
  basedir?: string;
  outdir?: string;
  imagedir?: string;
  audiodir?: string;
  presentationStyle?: string;
  file: string;
}): FileObject => {
  const { basedir, outdir, imagedir, audiodir, file, presentationStyle } = args;
  const baseDirPath = getBaseDirPath(basedir);
  const outDirPath = getFullPath(baseDirPath, outdir ?? outDirName);
  const { fileOrUrl, fileName } = (() => {
    if (file === "__clipboard") {
      // We generate a new unique script file from clipboard text in the output directory
      const fileName = generateTimestampedFileName("script");
      const clipboardText = clipboardy.readSync();
      const fileOrUrl = resolveDirPath(outDirPath, `${fileName}.json`);
      mkdir(outDirPath);
      fs.writeFileSync(fileOrUrl, clipboardText, "utf8");
      return { fileOrUrl, fileName };
    }
    const fileOrUrl = file ?? "";
    const fileName = path.parse(fileOrUrl).name;
    return { fileOrUrl, fileName };
  })();
  const isHttpPath = isHttp(fileOrUrl);
  const mulmoFilePath = isHttpPath ? "" : getFullPath(baseDirPath, fileOrUrl);
  const mulmoFileDirPath = path.dirname(isHttpPath ? baseDirPath : mulmoFilePath);
  const imageDirPath = getFullPath(outDirPath, imagedir ?? imageDirName);
  const audioDirPath = getFullPath(outDirPath, audiodir ?? audioDirName);
  const outputStudioFilePath = getOutputStudioFilePath(outDirPath, fileName);
  const outputMultilingualFilePath = getOutputMultilingualFilePath(outDirPath, fileName);
  const presentationStylePath = presentationStyle ? getFullPath(baseDirPath, presentationStyle) : undefined;
  return {
    baseDirPath,
    mulmoFilePath,
    mulmoFileDirPath,
    outDirPath,
    imageDirPath,
    audioDirPath,
    isHttpPath,
    fileOrUrl,
    outputStudioFilePath,
    outputMultilingualFilePath,
    presentationStylePath,
    fileName,
  };
};

export const initializeContext = async (argv: CliArgs<InitOptions>, raiseError: boolean = false): Promise<MulmoStudioContext | null> => {
  const files = getFileObject({
    basedir: argv.b,
    outdir: argv.o,
    imagedir: argv.i,
    audiodir: argv.a,
    presentationStyle: argv.p,
    file: argv.file ?? "",
  });
  setGraphAILogger(verbose, { files });

  return await initializeContextFromFiles(files, raiseError, Boolean(argv.f), argv.c, argv.l);
};
