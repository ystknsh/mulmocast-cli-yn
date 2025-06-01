import { GraphAILogger, sleep } from "graphai";
import type { AgentFunction, AgentFunctionInfo } from "graphai";

async function generateImage(
  projectId: string | undefined,
  model: string,
  token: string | undefined,
  prompt: string,
  aspectRatio: string,
): Promise<Buffer | undefined> {
  const GOOGLE_IMAGEN_ENDPOINT = `https://us-central1-aiplatform.googleapis.com/v1/projects/${projectId}/locations/us-central1/publishers/google/models/${model}`;

  // Prepare the payload for the API request
  const payload = {
    instances: [
      {
        prompt: prompt,
      },
    ],
    parameters: {
      sampleCount: 1,
      aspectRatio: aspectRatio,
      //safetySetting: "block_only_high",
      durationSeconds: 5,
    },
  };

  // Make the API call using fetch
  const response = await fetch(`${GOOGLE_IMAGEN_ENDPOINT}:predictLongRunning`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Error: ${response.status} - ${response.statusText}`);
  }
  const initialResponse = await response.json();
  const fetchBody = {
    operationName: initialResponse.name,
  };

  const completeResponse = await (async () => {
    while (true) {
      GraphAILogger.info("...waiting for movie generation...");
      await sleep(3000);
      const response = await fetch(`${GOOGLE_IMAGEN_ENDPOINT}:fetchPredictOperation`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(fetchBody),
      });
      if (!response.ok) {
        throw new Error(`Error: ${response.status} - ${response.statusText}`);
      }
      const responseData = await response.json();
      if (responseData.done) {
        return responseData.response;
      }
    }
  })();
  const bytesBase64Encoded = completeResponse.videos[0].bytesBase64Encoded;
  if (bytesBase64Encoded) {
    return Buffer.from(bytesBase64Encoded, "base64");
  }
  return undefined;
  /*
    // Parse and return the generated image URL or data
    const predictions = responseData.predictions;
    if (predictions && predictions.length > 0) {
      const base64Image = predictions[0].bytesBase64Encoded;
      if (base64Image) {
        return Buffer.from(base64Image, "base64"); // Decode the base64 image to a buffer
      } else {
        throw new Error("No base64-encoded image data returned from the API.");
      }
    } else {
      // console.log(response);
      GraphAILogger.info("No predictions returned from the API.", responseData, prompt);
      return undefined;
    }
  } catch (error) {
    GraphAILogger.info("Error generating image:", error);
    throw error;
  }
  */
}

export type MovieGoogleConfig = {
  projectId?: string;
  token?: string;
};

export const movieGoogleAgent: AgentFunction<{ model: string; aspectRatio: string }, { buffer: Buffer }, { prompt: string }, MovieGoogleConfig> = async ({
  namedInputs,
  params,
  config,
}) => {
  const { prompt } = namedInputs;
  /*
  if (prompt) {
    const buffer = Buffer.from(prompt);
    return { buffer };
  }
  */
  const aspectRatio = params.aspectRatio ?? "16:9";
  const model = params.model ?? "veo-2.0-generate-001"; // "veo-3.0-generate-preview";
  //const projectId = process.env.GOOGLE_PROJECT_ID; // Your Google Cloud Project ID
  const projectId = config?.projectId;
  const token = config?.token;

  try {
    const buffer = await generateImage(projectId, model, token, prompt, aspectRatio);
    if (buffer) {
      return { buffer };
    }
    throw new Error("ERROR: geneateImage returned undefined");
  } catch (error) {
    GraphAILogger.info("Failed to generate image:", error);
    throw error;
  }
};

const movieGoogleAgentInfo: AgentFunctionInfo = {
  name: "movieGoogleAgent",
  agent: movieGoogleAgent,
  mock: movieGoogleAgent,
  samples: [],
  description: "Google Movie agent",
  category: ["movie"],
  author: "Receptron Team",
  repository: "https://github.com/receptron/mulmocast-cli/",
  // source: "https://github.com/receptron/mulmocast-cli/blob/main/src/agents/image_google_agent.ts",
  license: "MIT",
  environmentVariables: [],
};

export default movieGoogleAgentInfo;
