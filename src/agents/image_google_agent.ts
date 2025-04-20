import dotenv from "dotenv";
import { AgentFunction, AgentFunctionInfo } from "graphai";

dotenv.config();
import { GoogleAuth } from "google-auth-library";

const GOOGLE_PROJECT_ID = process.env.GOOGLE_PROJECT_ID; // Your Google Cloud Project ID
const GOOGLE_IMAGEN_MODEL = "imagen-3.0-fast-generate-001";
const GOOGLE_IMAGEN_ENDPOINT = `https://us-central1-aiplatform.googleapis.com/v1/projects/${GOOGLE_PROJECT_ID}/locations/us-central1/publishers/google/models/${GOOGLE_IMAGEN_MODEL}:predict`;

type PredictionResponse = {
  predictions?: {
    bytesBase64Encoded?: string;
  }[];
};

const googleAuth = async () => {
  const auth = new GoogleAuth({
    scopes: ["https://www.googleapis.com/auth/cloud-platform"],
  });
  const client = await auth.getClient();
  const accessToken = await client.getAccessToken();
  return accessToken.token!;
};

async function generateImage(token: string, prompt: string, aspectRatio: string): Promise<Buffer | undefined> {
  try {
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
        safetySetting: "block_only_high",
      },
    };

    // Make the API call using fetch
    const response = await fetch(GOOGLE_IMAGEN_ENDPOINT, {
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

    const responseData: PredictionResponse = await response.json();

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
      console.log("No predictions returned from the API.", responseData, prompt);
      return undefined;
    }
  } catch (error) {
    console.error("Error generating image:", error);
    throw error;
  }
}

export const imageGoogleAgent: AgentFunction<{ model: string; aspectRatio: string }, { buffer: Buffer }, { prompt: string }> = async ({
  namedInputs,
  params,
}) => {
  const { prompt } = namedInputs;
  const aspectRatio = params.aspectRatio ?? "16:9";
  const model = params.model ?? "imagen-3.0-fast-generate-001";
  const token = await googleAuth();

  try {
    const buffer = await generateImage(token, prompt, aspectRatio);
    if (buffer) {
      return { buffer };
    }
    throw new Error("ERROR: geneateImage returned undefined");
  } catch (error) {
    console.error("Failed to generate image:", error);
    throw error;
  }
};

const imageGoogleAgentInfo: AgentFunctionInfo = {
  name: "imageGoogleAgent",
  agent: imageGoogleAgent,
  mock: imageGoogleAgent,
  samples: [],
  description: "OpenAI Image agent",
  category: ["image"],
  author: "Receptron Team",
  repository: "https://github.com/receptron/graphai-agents/tree/main/image/image-openai-agent",
  license: "MIT",
  environmentVariables: ["OPENAI_API_KEY"],
};

export default imageGoogleAgentInfo;
