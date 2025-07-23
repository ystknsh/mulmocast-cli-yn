import { readFileSync } from "fs";
import { GraphAILogger } from "graphai";
import type { AgentFunction, AgentFunctionInfo } from "graphai";
import Replicate from "replicate";

import type { AgentBufferResult, SoundEffectAgentInputs, ReplicateSoundEffectAgentParams, ReplicateSoundEffectAgentConfig } from "../types/agent.js";

export const soundEffectReplicateAgent: AgentFunction<
  ReplicateSoundEffectAgentParams,
  AgentBufferResult,
  SoundEffectAgentInputs,
  ReplicateSoundEffectAgentConfig
> = async ({ namedInputs, params, config }) => {
  const { prompt, soundEffectFile, movieFile } = namedInputs; 
  const apiKey = config?.apiKey;
  // const model = params.model;
  console.log("**** soundEffectReplicateAgent movieFile:", prompt, movieFile, soundEffectFile);

  if (!apiKey) {
    throw new Error("REPLICATE_API_TOKEN environment variable is required");
  }
  const replicate = new Replicate({
    auth: apiKey,
  });

  const buffer = readFileSync(movieFile);
  const uri = `data:image/png;base64,${buffer.toString("base64")}`;

  const input = {
    // seed: -1,
    video: uri,
    prompt,
    // duration: 8,
    // num_steps: 25,
    // cfg_strength: 4.5,
    // negative_prompt: "music"
  };

  try {
    const output = await replicate.run("zsxkib/mmaudio:62871fb59889b2d7c13777f08deb3b36bdff88f7e1d53a50ad7694548a41b484", {
      input,
    });

    if (output && typeof output === "object" && "url" in output) {
      const videoUrl = (output.url as () => URL)();
      const videoResponse = await fetch(videoUrl);

      if (!videoResponse.ok) {
        throw new Error(`Error downloading video: ${videoResponse.status} - ${videoResponse.statusText}`);
      }

      const arrayBuffer = await videoResponse.arrayBuffer();
      return { buffer: Buffer.from(arrayBuffer) };
    }
    return undefined;
  } catch (error) {
    GraphAILogger.info("Failed to generate movie:", (error as Error).message);
    throw error;
  }
};

const soundEffectReplicateAgentInfo: AgentFunctionInfo = {
  name: "soundEffectReplicateAgent",
  agent: soundEffectReplicateAgent,
  mock: soundEffectReplicateAgent,
  samples: [],
  description: "Replicate Sound Effect agent (movie to movie)",
  category: ["movie"],
  author: "Receptron Team",
  repository: "https://github.com/receptron/mulmocast-cli/",
  license: "MIT",
  environmentVariables: ["REPLICATE_API_TOKEN"],
};

export default soundEffectReplicateAgentInfo;
