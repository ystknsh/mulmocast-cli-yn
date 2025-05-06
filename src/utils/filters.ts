import "dotenv/config";
import fsPromise from "fs/promises";
import type { AgentFilterFunction } from "graphai";
import { GraphAILogger } from "graphai";
import { writingMessage } from "./file";

export const fileCacheAgentFilter: AgentFilterFunction = async (context, next) => {
  const { namedInputs } = context;
  const { file, text } = namedInputs;
  try {
    await fsPromise.access(file);
    const elements = file.split("/");
    GraphAILogger.info("cache hit: " + elements[elements.length - 1], text.slice(0, 10));
    return true;
  } catch (__e) {
    const output = (await next(context)) as { buffer: Buffer };
    const buffer = output ? output["buffer"] : undefined;
    if (buffer) {
      writingMessage(file);
      await fsPromise.writeFile(file, buffer);
      return true;
    }
    GraphAILogger.log("no cache, no buffer: " + file);
    return false;
  }
};
