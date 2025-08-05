import { AgentFunction, AgentFunctionInfo, GraphAILogger } from "graphai";
import fs from "fs";
import { silent60secPath } from "../utils/file.js";

export const mediaMockAgent: AgentFunction = async ({ namedInputs }) => {
  if (namedInputs.media === "audio") {
    const buffer = fs.readFileSync(silent60secPath());
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
