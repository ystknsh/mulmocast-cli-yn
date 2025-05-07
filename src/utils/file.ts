import fs from "fs";
import path from "path";
import { GraphAILogger } from "graphai";
import { MulmoScript, MulmoScriptTemplate } from "../types";
import { MulmoScriptTemplateMethods } from "../methods/mulmo_script_template";
import { mulmoScriptTemplateSchema } from "../types/schema";

export function readMulmoScriptFile<T = MulmoScript>(
  path: string,
  errorMessage: string,
): {
  mulmoData: T;
  mulmoDataPath: string;
  fileName: string;
};

export function readMulmoScriptFile<T = MulmoScript>(
  path: string,
): {
  mulmoData: T;
  mulmoDataPath: string;
  fileName: string;
} | null;

export function readMulmoScriptFile<T = MulmoScript>(arg2: string, errorMessage?: string) {
  const scriptPath = path.resolve(arg2);
  if (!fs.existsSync(scriptPath)) {
    if (errorMessage) {
      console.error(errorMessage);
      process.exit(1);
    }
    return null;
  }
  const scriptData = fs.readFileSync(scriptPath, "utf-8");
  const script = JSON.parse(scriptData) as T;
  const parsedPath = path.parse(scriptPath);

  return {
    mulmoData: script,
    mulmoDataPath: scriptPath,
    fileName: parsedPath.name,
  };
}

export const getOutputStudioFilePath = (outDirPath: string, fileName: string) => {
  return path.resolve(outDirPath, fileName + "_studio.json");
};
export const getOutputBGMFilePath = (outDirPath: string, fileName: string) => {
  return path.resolve(outDirPath, fileName + "_bgm.mp3");
};
export const getOutputVideoFilePath = (outDirPath: string, fileName: string) => {
  return path.resolve(outDirPath, fileName + ".mp4");
};
export const getOutputAudioFilePath = (audioDirPath: string, fileName: string) => {
  return path.resolve(audioDirPath, fileName + ".mp3");
};
export const getAudioFilePath = (audioDirPath: string, fileName: string) => {
  return path.resolve(audioDirPath, fileName + ".mp3");
};
export const getTemplateFilePath = (templateName: string) => {
  return path.resolve(__dirname, "../../assets/templates/" + templateName + ".json");
};

export const mkdir = (dirPath: string) => {
  if (!fs.existsSync(dirPath)) {
    console.info("mkdir: " + dirPath);
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

export const silentPath = path.resolve(__dirname, "../../assets/audio/silent300.mp3");
export const silentLastPath = path.resolve(__dirname, "../../assets/audio/silent800.mp3");
export const defaultBGMPath = path.resolve(__dirname, "../../assets/music/StarsBeyondEx.mp3");

// for cli
export const getBaseDirPath = (basedir?: string) => {
  if (!basedir) {
    return process.cwd();
  }
  if (path.isAbsolute(basedir)) {
    return path.normalize(basedir);
  }
  return path.resolve(process.cwd(), basedir);
};

export const getFullPath = (baseDirPath: string | undefined, file: string) => {
  if (path.isAbsolute(file)) {
    return path.normalize(file);
  }
  if (baseDirPath) {
    return path.resolve(baseDirPath, file);
  }
  return path.resolve(file);
};

export const readTemplatePrompt = (templateName: string) => {
  const templatePath = getTemplateFilePath(templateName);
  const scriptData = fs.readFileSync(templatePath, "utf-8");
  const template = mulmoScriptTemplateSchema.parse(JSON.parse(scriptData));
  const prompt = MulmoScriptTemplateMethods.getSystemPrompt(template);
  return prompt;
};

export const getAvailableTemplates = (): (MulmoScriptTemplate & { filename: string })[] => {
  const templatesDir = path.resolve(__dirname, "../../assets/templates");

  if (!fs.existsSync(templatesDir)) {
    return [];
  }

  const files = fs.readdirSync(templatesDir);
  return files.map((file) => {
    const template = JSON.parse(fs.readFileSync(path.resolve(templatesDir, file), "utf-8"));
    return {
      ...mulmoScriptTemplateSchema.parse(template),
      filename: file.replace(/\.json$/, ""),
    };
  });
};

export const writingMessage = (filePath: string) => {
  GraphAILogger.info(`writing: ${filePath}`);
};
