import { GraphAILogger } from "graphai";
import type { AgentFunction, AgentFunctionInfo } from "graphai";
import { getAspectRatio } from "./movie_google_agent.js";
import { provider2ImageAgent } from "../utils/provider2agent.js";
import type { AgentBufferResult, ImageAgentInputs, ImageAgentParams, GenAIImageAgentConfig } from "../types/agent.js";
import { GoogleGenAI, PersonGeneration } from "@google/genai";

export const imageGenAIAgent: AgentFunction<ImageAgentParams, AgentBufferResult, ImageAgentInputs, GenAIImageAgentConfig> = async ({
  namedInputs,
  params,
  config,
}) => {
  const { prompt } = namedInputs;
  const aspectRatio = getAspectRatio(params.canvasSize);
  const model = params.model ?? provider2ImageAgent["google"].defaultModel;
  const apiKey = config?.apiKey;

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateImages({
      model,
      prompt,
      config: {
        numberOfImages: 1, // default is 4!
        aspectRatio,
        personGeneration: PersonGeneration.ALLOW_ALL,
        // safetyFilterLevel: SafetyFilterLevel.BLOCK_ONLY_HIGH,
      },
    });
    if (!response.generatedImages || response.generatedImages.length === 0) {
      throw new Error("ERROR: generateImage returned no generated images");
    }
    const image = response.generatedImages[0].image;
    if (image && image.imageBytes) {
      return { buffer: Buffer.from(image.imageBytes, "base64") };
    }
    throw new Error("ERROR: generateImage returned no image bytes");
  } catch (error) {
    GraphAILogger.info("Failed to generate image:", error);
    throw error;
  }
};

const imageGenAIAgentInfo: AgentFunctionInfo = {
  name: "imageGenAIAgent",
  agent: imageGenAIAgent,
  mock: imageGenAIAgent,
  samples: [],
  description: "Google Image agent",
  category: ["image"],
  author: "Receptron Team",
  repository: "https://github.com/receptron/mulmocast-cli/",
  // source: "https://github.com/receptron/mulmocast-cli/blob/main/src/agents/image_google_agent.ts",
  license: "MIT",
  environmentVariables: [],
};

export default imageGenAIAgentInfo;
