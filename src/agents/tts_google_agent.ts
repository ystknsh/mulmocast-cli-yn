import { GraphAILogger } from "graphai";
import type { AgentFunction, AgentFunctionInfo } from "graphai";

export const ttsGoogleAgent: AgentFunction = async ({ namedInputs, params }) => {
  const { text } = namedInputs;
  const { apiKey, model, voice, suppressError, instructions } = params;

  try {
    console.log("ttsGoogleAgent", text);
    return { buffer: Buffer.from("Hello, world!") };
  } catch (e) {
    if (suppressError) {
      return {
        error: e,
      };
    }
    GraphAILogger.info(e);
    throw new Error("TTS Google Error");
  }
};

const ttsGoogleAgentInfo: AgentFunctionInfo = {
  name: "ttsGoogleAgent",
  agent: ttsGoogleAgent,
  mock: ttsGoogleAgent,
  samples: [],
  description: "Google TTS agent",
  category: ["tts"],
  author: "Receptron Team",
  repository: "https://github.com/receptron/graphai-agents/tree/main/tts/tts-openai-agent",
  license: "MIT",
  environmentVariables: ["OPENAI_API_KEY"],
};

export default ttsGoogleAgentInfo;
