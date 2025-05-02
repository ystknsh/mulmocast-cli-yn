"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFullPath = exports.getBaseDirPath = exports.defaultBGMPath = exports.silentLastPath = exports.silentPath = exports.mkdir = exports.getTemplateFilePath = exports.getScratchpadFilePath = exports.getOutputAudioFilePath = exports.getOutputVideoFilePath = exports.getOutputBGMFilePath = exports.getOutputStudioFilePath = void 0;
exports.readMulmoScriptFile = readMulmoScriptFile;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
function readMulmoScriptFile(arg2, errorMessage) {
    const scriptPath = path_1.default.resolve(arg2);
    if (!fs_1.default.existsSync(scriptPath)) {
        if (errorMessage) {
            console.error(errorMessage);
            process.exit(1);
        }
        return null;
    }
    const scriptData = fs_1.default.readFileSync(scriptPath, "utf-8");
    const script = JSON.parse(scriptData);
    const parsedPath = path_1.default.parse(scriptPath);
    return {
        mulmoData: script,
        mulmoDataPath: scriptPath,
        fileName: parsedPath.name,
    };
}
const getOutputStudioFilePath = (outDirPath, fileName) => {
    return path_1.default.resolve(outDirPath, fileName + "_studio.json");
};
exports.getOutputStudioFilePath = getOutputStudioFilePath;
const getOutputBGMFilePath = (outDirPath, fileName) => {
    return path_1.default.resolve(outDirPath, fileName + "_bgm.mp3");
};
exports.getOutputBGMFilePath = getOutputBGMFilePath;
const getOutputVideoFilePath = (outDirPath, fileName) => {
    return path_1.default.resolve(outDirPath, fileName + ".mp4");
};
exports.getOutputVideoFilePath = getOutputVideoFilePath;
const getOutputAudioFilePath = (outDirPath, fileName) => {
    return path_1.default.resolve(outDirPath, fileName + ".mp3");
};
exports.getOutputAudioFilePath = getOutputAudioFilePath;
const getScratchpadFilePath = (scratchpadDirName, fileName) => {
    return path_1.default.resolve(scratchpadDirName, fileName + ".mp3");
};
exports.getScratchpadFilePath = getScratchpadFilePath;
const getTemplateFilePath = (templateName) => {
    return path_1.default.resolve(__dirname, "../../assets/templates/" + templateName + ".json");
};
exports.getTemplateFilePath = getTemplateFilePath;
const mkdir = (dirPath) => {
    if (!fs_1.default.existsSync(dirPath)) {
        fs_1.default.mkdirSync(dirPath, { recursive: true });
    }
};
exports.mkdir = mkdir;
exports.silentPath = path_1.default.resolve(__dirname, "../../assets/music/silent300.mp3");
exports.silentLastPath = path_1.default.resolve(__dirname, "../../assets/music/silent800.mp3");
exports.defaultBGMPath = path_1.default.resolve(__dirname, "../../assets/music/StarsBeyondEx.mp3");
// for cli
const getBaseDirPath = (basedir) => {
    if (!basedir) {
        return process.cwd();
    }
    if (path_1.default.isAbsolute(basedir)) {
        return path_1.default.normalize(basedir);
    }
    return path_1.default.resolve(process.cwd(), basedir);
};
exports.getBaseDirPath = getBaseDirPath;
const getFullPath = (baseDirPath, file) => {
    if (path_1.default.isAbsolute(file)) {
        return path_1.default.normalize(file);
    }
    if (baseDirPath) {
        return path_1.default.resolve(baseDirPath, file);
    }
    return path_1.default.resolve(file);
};
exports.getFullPath = getFullPath;
