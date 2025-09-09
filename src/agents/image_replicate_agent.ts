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
  aspectRatio?: string;
  outputSize?: number;
  steps?: number;
  guidanceScale?: number;
};

export type ReplicateImageAgentConfig = AgentConfig;

const getAspectRatio = (canvasSize: { width: number; height: number }): string => {
  const ratio = canvasSize.width / canvasSize.height;

  if (Math.abs(ratio - 1) < 0.1) return "1:1";
  if (Math.abs(ratio - 16 / 9) < 0.1) return "16:9";
  if (Math.abs(ratio - 9 / 16) < 0.1) return "9:16";
  if (Math.abs(ratio - 2 / 3) < 0.1) return "2:3";
  if (Math.abs(ratio - 3 / 2) < 0.1) return "3:2";
  if (Math.abs(ratio - 4 / 5) < 0.1) return "4:5";
  if (Math.abs(ratio - 5 / 4) < 0.1) return "5:4";

  // Default fallback based on orientation
  if (ratio > 1) return "16:9";
  if (ratio < 1) return "9:16";
  return "1:1";
};

async function generateImage(
  model: ReplicateImageModel,
  apiKey: string,
  prompt: string,
  aspectRatio: string,
  outputSize: number,
  steps?: number,
  guidanceScale?: number,
): Promise<Buffer> {
  const replicate = new Replicate({
    auth: apiKey,
  });

  const input: Record<string, unknown> = {
    prompt,
    aspect_ratio: aspectRatio,
    output_format: "png",
    output_quality: 90,
  };

  // Add model-specific parameters
  if (model === "black-forest-labs/flux-1.1-pro") {
    input.width = outputSize;
    input.height = outputSize;
    input.safety_tolerance = 2;
    if (steps) input.steps = steps;
    if (guidanceScale) input.guidance = guidanceScale;
  } else if (model === "black-forest-labs/flux-schnell") {
    input.width = outputSize;
    input.height = outputSize;
    if (steps) input.num_inference_steps = steps;
  } else if (model === "stability-ai/stable-diffusion-3") {
    input.width = outputSize;
    input.height = outputSize;
    if (steps) input.num_inference_steps = steps;
    if (guidanceScale) input.guidance_scale = guidanceScale;
  } else if (model === "bytedance/sdxl-lightning-4step") {
    input.width = outputSize;
    input.height = outputSize;
    if (guidanceScale) input.guidance_scale = guidanceScale;
  }

  try {
    const output = await replicate.run(model, { input });

    // Handle different output formats
    let imageUrl: string;
    if (Array.isArray(output) && output.length > 0) {
      imageUrl = output[0] as string;
    } else if (typeof output === "string") {
      imageUrl = output;
    } else if (output && typeof output === "object" && "url" in output) {
      imageUrl = (output.url as () => URL)().toString();
    } else {
      throw new Error("Unexpected output format from Replicate");
    }

    // Download the generated image
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      throw new Error(`Error downloading image: ${imageResponse.status} - ${imageResponse.statusText}`);
    }

    const arrayBuffer = await imageResponse.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch (error) {
    GraphAILogger.info("Replicate image generation error:", error);
    throw error;
  }
}

export const imageReplicateAgent: AgentFunction<ReplicateImageAgentParams, AgentBufferResult, ImageAgentInputs, ReplicateImageAgentConfig> = async ({
  namedInputs,
  params,
  config,
}) => {
  const { prompt } = namedInputs;
  const { canvasSize, model, aspectRatio, outputSize, steps, guidanceScale } = params;

  // Default model
  const selectedModel: ReplicateImageModel = model ?? "black-forest-labs/flux-schnell";

  // Validate model
  if (!REPLICATE_IMAGE_MODELS[selectedModel]) {
    throw new Error(`Model ${selectedModel} is not supported. Available models: ${Object.keys(REPLICATE_IMAGE_MODELS).join(", ")}`);
  }

  // Determine aspect ratio
  const targetAspectRatio = aspectRatio ?? getAspectRatio(canvasSize);
  const modelConfig = REPLICATE_IMAGE_MODELS[selectedModel];

  // Validate aspect ratio support
  if (!modelConfig.aspectRatios.includes(targetAspectRatio as (typeof modelConfig.aspectRatios)[number])) {
    GraphAILogger.info(`Warning: Aspect ratio ${targetAspectRatio} not officially supported by ${selectedModel}, using anyway`);
  }

  // Determine output size
  const targetOutputSize = outputSize ?? Math.min(modelConfig.maxOutputSize, Math.max(canvasSize.width, canvasSize.height));

  const apiKey = config?.apiKey;
  if (!apiKey) {
    throw new Error("Replicate API key is required (REPLICATE_API_TOKEN)");
  }

  try {
    const buffer = await generateImage(selectedModel, apiKey, prompt, targetAspectRatio, targetOutputSize, steps, guidanceScale);

    return { buffer };
  } catch (error) {
    GraphAILogger.info("Failed to generate image:", (error as Error).message);
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
