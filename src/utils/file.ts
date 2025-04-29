import fs from "fs";
import path from "path";
import { MulmoScript, MulmoStudio } from "../type";

export function readMulmoScriptFile(
  path: string,
  errorMessage: string,
): {
  mulmoData: MulmoScript;
  mulmoDataPath: string;
  fileName: string;
};

export function readMulmoScriptFile(path: string): {
  mulmoData: MulmoScript;
  mulmoDataPath: string;
  fileName: string;
} | null;

export function readMulmoScriptFile(arg2: string, errorMessage?: string) {
  const scriptPath = path.resolve(arg2);
  if (!fs.existsSync(scriptPath)) {
    if (errorMessage) {
      console.error(errorMessage);
      process.exit(1);
    }
    return null;
  }
  const scriptData = fs.readFileSync(scriptPath, "utf-8");
  const script = JSON.parse(scriptData) as MulmoScript;
  const parsedPath = path.parse(scriptPath);

  return {
    mulmoData: script,
    mulmoDataPath: scriptPath,
    fileName: parsedPath.name,
  };
}

export function readMulmoStudioFile(arg2: string, errorMessage?: string) {
  const scriptPath = path.resolve(arg2);
  if (!fs.existsSync(scriptPath)) {
    if (errorMessage) {
      console.error(errorMessage);
      process.exit(1);
    }
    return null;
  }
  const scriptData = fs.readFileSync(scriptPath, "utf-8");
  const studio = JSON.parse(scriptData) as MulmoStudio;
  const parsedPath = path.parse(scriptPath);

  return {
    mulmoStudio: studio,
    mulmoStrdioPath: scriptPath,
    fileName: parsedPath.name,
  };
}

export const getOutputFilePath = (fileName: string) => {
  const filePath = path.resolve("./output/" + fileName);
  return filePath;
};

export const getScratchpadFilePath = (fileName: string) => {
  const filePath = path.resolve("./scratchpad/" + fileName);
  return filePath;
};

export const getBaseDirPath = () => {
  return path.resolve("./");
};

export const mkdir = (dirPath: string) => {
  const currentDir = process.cwd();
  const imagesDir = path.join(currentDir, dirPath);
  if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true });
  }
};
