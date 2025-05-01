import "dotenv/config";
import { MulmoStudio } from "../types";
export declare const audio: (studio: MulmoStudio, concurrency: number) => Promise<void>;
