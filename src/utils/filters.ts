import "dotenv/config";
import fsPromise from "fs/promises";
import { AgentFilterFunction } from "graphai";

export const fileCacheAgentFilter: AgentFilterFunction = async (context, next) => {
  const { namedInputs } = context;
  const { file } = namedInputs;
  try {
    await fsPromise.access(file);
    const elements = file.split("/");
    console.log("cache hit: " + elements[elements.length - 1], namedInputs.text.slice(0, 10));
    return true;
  } catch (__e) {
    const output = (await next(context)) as { buffer: Buffer };
    const buffer = output ? output["buffer"] : undefined;
    if (buffer) {
      console.log("writing: " + file);
      await fsPromise.writeFile(file, buffer);
      return true;
    }
    console.log("no cache, no buffer: " + file);
    return false;
  }
};
