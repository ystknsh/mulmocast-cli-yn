import { readFileSync } from "fs";
import { GraphAILogger } from "graphai";
import type { AgentFunction, AgentFunctionInfo } from "graphai";
import Replicate from "replicate";

async function generateMovie(
  prompt: string,
  imagePath: string | undefined,
  aspectRatio: string,
  duration: number,
): Promise<Buffer | undefined> {
  const apiToken = process.env.REPLICATE_API_TOKEN;
  
  if (!apiToken) {
    throw new Error("REPLICATE_API_TOKEN environment variable is required");
  }

  const replicate = new Replicate({
    auth: apiToken,
  });

  const input: any = {
    fps: 24,
    prompt: prompt,
    duration: duration,
    resolution: "720p",
    aspect_ratio: aspectRatio,
    camera_fixed: false,
  };

  // Add image if provided (for image-to-video generation)
  if (imagePath) {
    const buffer = readFileSync(imagePath);
    const base64Image = `data:image/png;base64,${buffer.toString("base64")}`;
    input.image = base64Image;
  }

  try {
    GraphAILogger.info("Starting Replicate movie generation...");
    const output = await replicate.run("bytedance/seedance-1-lite", { input });
    
    // Download the generated video
    if (output && typeof output === 'object' && 'url' in output) {
      const videoUrl = (output as any).url();
      const videoResponse = await fetch(videoUrl);
      
      if (!videoResponse.ok) {
        throw new Error(`Error downloading video: ${videoResponse.status} - ${videoResponse.statusText}`);
      }
      
      const arrayBuffer = await videoResponse.arrayBuffer();
      return Buffer.from(arrayBuffer);
    }
    
    return undefined;
  } catch (error) {
    GraphAILogger.info("Replicate generation error:", error);
    throw error;
  }
}

export type MovieReplicateConfig = {};

export const getAspectRatio = (canvasSize: { width: number; height: number }): string => {
  if (canvasSize.width > canvasSize.height) {
    return "16:9";
  } else if (canvasSize.width < canvasSize.height) {
    return "9:16";
  } else {
    return "1:1";
  }
};

export const movieReplicateAgent: AgentFunction<
  { model: string; canvasSize: { width: number; height: number }; duration?: number },
  { buffer: Buffer },
  { prompt: string; imagePath?: string },
  MovieReplicateConfig
> = async ({ namedInputs, params }) => {
  const { prompt, imagePath } = namedInputs;
  const aspectRatio = getAspectRatio(params.canvasSize);
  const duration = params.duration ?? 5;

  try {
    const buffer = await generateMovie(prompt, imagePath, aspectRatio, duration);
    if (buffer) {
      return { buffer };
    }
    throw new Error("ERROR: generateMovie returned undefined");
  } catch (error) {
    GraphAILogger.info("Failed to generate movie:", (error as Error).message);
    throw error;
  }
};

const movieReplicateAgentInfo: AgentFunctionInfo = {
  name: "movieReplicateAgent",
  agent: movieReplicateAgent,
  mock: movieReplicateAgent,
  samples: [],
  description: "Replicate Movie agent using seedance-1-lite",
  category: ["movie"],
  author: "Receptron Team",
  repository: "https://github.com/receptron/mulmocast-cli/",
  license: "MIT",
  environmentVariables: ["REPLICATE_API_TOKEN"],
};

export default movieReplicateAgentInfo;