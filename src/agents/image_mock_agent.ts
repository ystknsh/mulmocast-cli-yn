import { AgentFunction, AgentFunctionInfo, GraphAILogger } from "graphai";

export const imageMockAgent: AgentFunction = async () => {
  GraphAILogger.debug("agent dryRun");
  return { buffer: Buffer.from([]) };
};

const imageMockAgentInfo: AgentFunctionInfo = {
  name: "imageMockAgent",
  agent: imageMockAgent,
  mock: imageMockAgent,
  samples: [],
  description: "Image mock agent",
  category: ["image"],
  author: "Receptron Team",
  repository: "https://github.com/receptron/mulmocast-cli/",
  license: "MIT",
  environmentVariables: [],
};

export default imageMockAgentInfo;
