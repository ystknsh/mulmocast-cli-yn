import { GraphAILogger } from "graphai";
import fs from "fs";
import path from "path";
import clipboardy from "clipboardy";
import { getBaseDirPath, getFullPath, readMulmoScriptFile, fetchMulmoScriptFile, getOutputStudioFilePath, resolveDirPath } from "../utils/file.js";
import { isHttp } from "../utils/utils.js";
import { createOrUpdateStudioData } from "../utils/preprocess.js";
import { outDirName, imageDirName, audioDirName } from "../utils/const.js";
import type { MulmoStudio } from "../types/type.js";
import type { MulmoStudioContext } from "../types/type.js";
import type { CliArgs } from "../types/cli_types.js";
import { translate } from "../actions/translate.js";

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

export interface FileObject {
  baseDirPath: string;
  mulmoFilePath: string;
  mulmoFileDirPath: string;
  outDirPath: string;
  imageDirPath: string;
  audioDirPath: string;
  isHttpPath: boolean;
  fileOrUrl: string;
  outputStudioFilePath: string;
  fileName: string;
}

export const getFileObject = (args: { basedir?: string; outdir?: string; imagedir?: string; audiodir?: string; file: string }): FileObject => {
  const { basedir, outdir, imagedir, audiodir, file } = args;
  const baseDirPath = getBaseDirPath(basedir);
  const outDirPath = getFullPath(baseDirPath, outdir ?? outDirName);
  const { fileOrUrl, fileName } = (() => {
    if (file === "__clipboard") {
      // We generate a new unique script file from clipboard text in the output directory
      const now = new Date();
      const pad = (n: number) => n.toString().padStart(2, "0");
      const fileName = `script_${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
      const clipboardText = clipboardy.readSync();
      const fileOrUrl = resolveDirPath(outDirPath, `${fileName}.json`);
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
    fileName,
  };
};

export const fetchScript = async (isHttpPath: boolean, mulmoFilePath: string, fileOrUrl: string) => {
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

type InitOptions = {
  b?: string;
  o?: string;
  i?: string;
  a?: string;
  file?: string;
  l?: string;
  c?: string;
};

export const initializeContext = async (argv: CliArgs<InitOptions>): Promise<MulmoStudioContext> => {
  const files = getFileObject({
    basedir: argv.b,
    outdir: argv.o,
    imagedir: argv.i,
    audiodir: argv.a,
    file: argv.file ?? "",
  });
  const { fileName, isHttpPath, fileOrUrl, mulmoFilePath, outputStudioFilePath } = files;

  setGraphAILogger(argv.v, {
    files,
  });

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
  return {
    studio,
    fileDirs: files,
    force: Boolean(argv.f),
    lang: argv.l,
    caption: argv.c,
  };
};

export const runTranslateIfNeeded = async (context: MulmoStudioContext, argv: { l?: string; c?: string }) => {
  if (argv.l || argv.c) {
    GraphAILogger.log("run translate");
    await translate(context);
  }
};
