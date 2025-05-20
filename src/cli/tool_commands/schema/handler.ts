import { mulmoScriptSchema } from "@/src/types/schema.js";
import { zodToJsonSchema } from "zod-to-json-schema";
import { GraphAILogger } from "graphai";
import { ToolCliArgs } from "@/src/types/cli_types.js";

export const handler = async (argv: ToolCliArgs) => {
  const { v: verbose } = argv;
  if (!verbose) {
    GraphAILogger.setLevelEnabled("error", false);
    GraphAILogger.setLevelEnabled("log", false);
    GraphAILogger.setLevelEnabled("warn", false);
  }

  const defaultSchema = zodToJsonSchema(mulmoScriptSchema, {
    strictUnions: true,
  });
  GraphAILogger.info(JSON.stringify(defaultSchema, null, 2));
};
