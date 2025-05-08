import "dotenv/config";
import fs from "fs";
import path from "path";
import fsPromise from "fs/promises";
import type { AgentFilterFunction } from "graphai";
import { GraphAILogger } from "graphai";
import { writingMessage } from "./file.js";
import { text2hash } from "./text_hash.js";

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

export const browserlessCacheGenerator = (cacheDir: string) => {
  const browserlessCache: AgentFilterFunction = async (context, next) => {
    const cacheKey = text2hash(context?.namedInputs?.url);
    const cachePath = path.resolve(cacheDir, cacheKey + ".txt");
    if (fs.existsSync(cachePath)) {
      // console.log("cache hit!!");
      const text = fs.readFileSync(cachePath, "utf-8");
      return { text };
    }
    // console.log("cache not hit!!");
    const result = (await next(context)) as unknown as { text: string };
    fs.writeFileSync(cachePath, result?.text, "utf8");
    return result;
  };
  return browserlessCache;
};
