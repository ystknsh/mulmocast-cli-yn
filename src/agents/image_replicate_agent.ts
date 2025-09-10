import { AgentFunction, AgentFunctionInfo, GraphAILogger } from "graphai";
import Replicate from "replicate";

import type { AgentBufferResult, ImageAgentInputs, ImageAgentParams, AgentConfig } from "../types/agent.js";

// Common Replicate image generation models
const REPLICATE_IMAGE_MODELS = {
  "black-forest-labs/flux-1.1-pro": {
    aspectRatios: ["1:1", "16:9", "9:16", "2:3", "3:2", "4:5", "5:4"],
    maxOutputSize: 2048,
  },
  "black-forest-labs/flux-schnell": {
    aspectRatios: ["1:1", "16:9", "9:16", "2:3", "3:2", "4:5", "5:4"],
    maxOutputSize: 1024,
  },
  "stability-ai/stable-diffusion-3": {
    aspectRatios: ["1:1", "16:9", "9:16", "2:3", "3:2", "4:5", "5:4"],
    maxOutputSize: 1024,
  },
  "bytedance/sdxl-lightning-4step": {
    aspectRatios: ["1:1", "16:9", "9:16"],
    maxOutputSize: 1024,
  },
} as const;

type ReplicateImageModel = keyof typeof REPLICATE_IMAGE_MODELS;

export type ReplicateImageAgentParams = ImageAgentParams & {
  model?: ReplicateImageModel;
};

export type ReplicateImageAgentConfig = AgentConfig;

export const imageReplicateAgent: AgentFunction<ReplicateImageAgentParams, AgentBufferResult, ImageAgentInputs, ReplicateImageAgentConfig> = async ({
  namedInputs,
  params,
  config,
}) => {
  const { prompt } = namedInputs;
  const { canvasSize, model } = params;
  const apiKey = config?.apiKey;
  if (!apiKey) {
    throw new Error("Replicate API key is required (REPLICATE_API_TOKEN)");
  }
  const replicate = new Replicate({
    auth: apiKey,
  });

  // Default model
  const selectedModel: ReplicateImageModel = model ?? "black-forest-labs/flux-schnell";

  // Validate model
  if (!REPLICATE_IMAGE_MODELS[selectedModel]) {
    throw new Error(`Model ${selectedModel} is not supported. Available models: ${Object.keys(REPLICATE_IMAGE_MODELS).join(", ")}`);
  }

  const input = {
    prompt,
    width: canvasSize.width,
    height: canvasSize.height,
  };

  // Add image if provided (for image-to-image generation)
  /*
  if (imagePath) {
    const buffer = readFileSync(imagePath);
    const base64Image = `data:image/png;base64,${buffer.toString("base64")}`;
    const start_image = provider2MovieAgent.replicate.modelParams[model]?.start_image;
    if (start_image === "first_frame_image" || start_image === "image" || start_image === "start_image") {
      input[start_image] = base64Image;
    } else if (start_image === undefined) {
      throw new Error(`Model ${model} does not support image-to-video generation`);
    } else {
      input.image = base64Image;
    }
  }
  */

  try {
    const output = await replicate.run(model, { input });

    // Download the generated video
    if (output && typeof output === "object" && "url" in output) {
      const imageUrl = (output.url as () => URL)();
      const imageResponse = await fetch(imageUrl);

      if (!imageResponse.ok) {
        throw new Error(`Error downloading video: ${imageResponse.status} - ${imageResponse.statusText}`);
      }

      const arrayBuffer = await imageResponse.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      return { buffer };
    }
    throw new Error("ERROR: generateImage returned undefined");
  } catch (error) {
    GraphAILogger.info("Replicate generation error:", error);
    throw error;
  }
};

const imageReplicateAgentInfo: AgentFunctionInfo = {
  name: "imageReplicateAgent",
  agent: imageReplicateAgent,
  mock: imageReplicateAgent,
  samples: [],
  description: "Replicate Image agent using FLUX and other models",
  category: ["image"],
  author: "Receptron Team",
  repository: "https://github.com/receptron/mulmocast-cli/",
  license: "MIT",
  environmentVariables: ["REPLICATE_API_TOKEN"],
};

export default imageReplicateAgentInfo;
