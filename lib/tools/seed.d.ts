import "dotenv/config";
import { ScriptingParams } from "../types";
export declare const createMulmoScriptWithInteractive: ({ outDirPath, filename, templateName }: Omit<ScriptingParams, "urls">) => Promise<void>;
