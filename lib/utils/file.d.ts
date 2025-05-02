import { MulmoScript } from "../types";
export declare function readMulmoScriptFile<T = MulmoScript>(path: string, errorMessage: string): {
    mulmoData: T;
    mulmoDataPath: string;
    fileName: string;
};
export declare function readMulmoScriptFile<T = MulmoScript>(path: string): {
    mulmoData: T;
    mulmoDataPath: string;
    fileName: string;
} | null;
export declare const getOutputStudioFilePath: (outDirPath: string, fileName: string) => string;
export declare const getOutputBGMFilePath: (outDirPath: string, fileName: string) => string;
export declare const getOutputVideoFilePath: (outDirPath: string, fileName: string) => string;
export declare const getOutputAudioFilePath: (outDirPath: string, fileName: string) => string;
export declare const getScratchpadFilePath: (scratchpadDirName: string, fileName: string) => string;
export declare const getTemplateFilePath: (templateName: string) => string;
export declare const mkdir: (dirPath: string) => void;
export declare const silentPath: string;
export declare const silentLastPath: string;
export declare const defaultBGMPath: string;
export declare const getBaseDirPath: (basedir?: string) => string;
export declare const getFullPath: (baseDirPath: string | undefined, file: string) => string;
