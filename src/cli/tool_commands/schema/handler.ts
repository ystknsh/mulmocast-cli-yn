import { mulmoScriptSchema } from "@/src/types/schema.js";
import { zodToJsonSchema } from "zod-to-json-schema";
import { GraphAILogger } from "graphai";

export const handler = async () => {
  const defaultSchema = zodToJsonSchema(mulmoScriptSchema, {
    strictUnions: true,
  });
  GraphAILogger.info(JSON.stringify(defaultSchema, null, 2));
};
