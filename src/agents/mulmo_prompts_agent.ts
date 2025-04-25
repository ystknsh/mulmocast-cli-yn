import { AgentFunction, AgentFunctionInfo } from "graphai";
import { prompts } from "./prompts_data";

export const mulmoPromptsAgent: AgentFunction<{ promptKey: keyof typeof prompts }> = async ({ params }) => {
  const { promptKey } = params;
  if (promptKey) {
    const prompt = prompts[promptKey];
    if (prompt) {
      return {
        text: prompt,
      };
    }
  }
  return prompts;
};

const mulmoPromptsAgentInfo: AgentFunctionInfo = {
  name: "mulmoPromptsAgent",
  agent: mulmoPromptsAgent,
  mock: mulmoPromptsAgent,
  samples: [
    {
      inputs: {},
      params: {
        promptKey: "abstract",
      },
      result: {
        text: "We need to add a summary at the beginning of script, which summarizes this episode, which is very engaging. Please come up with a few sentences for the announcer to read, enter them into this script, and present it as an artifact.",
      },
    },
  ],
  description: "Prompts Agent",
  category: ["prompt"],
  author: "Receptron team",
  repository: "https://github.com/receptron/mulmocast-cli",
  source: "https://github.com/receptron/mulmocast-cli/tree/main/src/agents/prompts_agent.ts",
  // package: "@graphai/prompts",
  license: "MIT",
};

export default mulmoPromptsAgentInfo;
