import { AgentFunction, AgentFunctionInfo, GraphAILogger } from "graphai";
import fs from "fs";
import { silent60secPath, mulmoCreditPath } from "../utils/file.js";

export const mediaMockAgent: AgentFunction = async ({ namedInputs }) => {
  if (namedInputs.media === "audio") {
    const buffer = fs.readFileSync(silent60secPath());
    return { buffer };
  }
  if (namedInputs.media === "image") {
    const buffer = fs.readFileSync(mulmoCreditPath());
    return { buffer };
  }
  if (namedInputs.media === "movie") {
    const url = "https://github.com/receptron/mulmocast-media/raw/refs/heads/main/test/pingpong.mov";
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Failed to fetch: ${res.status} ${res.statusText}`);
    }
    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    return { buffer };
  }
  GraphAILogger.debug("agent dryRun");
  return { buffer: Buffer.from([]) };
};

const mediaMockAgentInfo: AgentFunctionInfo = {
  name: "mediaMockAgent",
  agent: mediaMockAgent,
  mock: mediaMockAgent,
  samples: [],
  description: "Image mock agent",
  category: ["image"],
  author: "Receptron Team",
  repository: "https://github.com/receptron/mulmocast-cli/",
  license: "MIT",
  environmentVariables: [],
};

export default mediaMockAgentInfo;
