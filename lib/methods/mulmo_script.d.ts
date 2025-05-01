import { MulmoDimension, MulmoScript } from "../types";
export declare const MulmoScriptMethods: {
    getPadding(script: MulmoScript): number;
    getCanvasSize(script: MulmoScript): MulmoDimension;
    getAspectRatio(script: MulmoScript): string;
    getSpeechProvider(script: MulmoScript): string;
};
