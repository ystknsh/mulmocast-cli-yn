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
export declare const getOutputFilePath: (fileName: string) => string;
export declare const getOutputStudioFilePath: (fileName: string) => string;
export declare const getScratchpadFilePath: (fileName: string) => string;
export declare const getBaseDirPath: () => string;
export declare const mkdir: (dirPath: string) => void;
export declare const silentPath: string;
export declare const silentLastPath: string;
