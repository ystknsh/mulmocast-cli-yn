"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.silentLastPath = exports.silentPath = exports.mkdir = exports.getBaseDirPath = exports.getScratchpadFilePath = exports.getOutputStudioFilePath = exports.getOutputFilePath = void 0;
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
const getOutputFilePath = (fileName) => {
    const filePath = path_1.default.resolve("./output/" + fileName);
    return filePath;
};
exports.getOutputFilePath = getOutputFilePath;
const getOutputStudioFilePath = (fileName) => {
    return (0, exports.getOutputFilePath)(fileName + "_studio.json");
};
exports.getOutputStudioFilePath = getOutputStudioFilePath;
const getScratchpadFilePath = (fileName) => {
    const filePath = path_1.default.resolve("./scratchpad/" + fileName);
    return filePath;
};
exports.getScratchpadFilePath = getScratchpadFilePath;
const getBaseDirPath = () => {
    return path_1.default.resolve("./");
};
exports.getBaseDirPath = getBaseDirPath;
const mkdir = (dirPath) => {
    const currentDir = process.cwd();
    const imagesDir = path_1.default.join(currentDir, dirPath);
    if (!fs_1.default.existsSync(imagesDir)) {
        fs_1.default.mkdirSync(imagesDir, { recursive: true });
    }
};
exports.mkdir = mkdir;
exports.silentPath = path_1.default.resolve(__dirname, "../../music/silent300.mp3");
exports.silentLastPath = path_1.default.resolve(__dirname, "../../music/silent800.mp3");
