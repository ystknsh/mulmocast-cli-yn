import "dotenv/config";
import { MulmoStudio } from "../types";
export declare const translate: (studio: MulmoStudio, files: {
    outFilePath: string;
}) => Promise<void>;
