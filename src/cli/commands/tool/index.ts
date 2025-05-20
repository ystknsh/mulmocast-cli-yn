import { ToolCliArgs } from "@/src/types/cli_types.js";
import * as scriptingCmd from "./scripting/index.js";
import * as promptCmd from "./prompt/index.js";
import * as schemaCmd from "./schema/index.js";
import { Argv } from "yargs";

export const command = "tool <command>";
export const desc = "Work with tool";

export const builder = (y: Argv) => y.command(scriptingCmd).command(promptCmd).command(schemaCmd).demandCommand().strict();

export const handler = (__argv: ToolCliArgs) => {};
