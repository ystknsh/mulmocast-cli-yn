import dotenv from "dotenv";
// import OpenAI from "openai";
import fs from "fs";
import path from "path";
import { GraphAI, GraphData } from "graphai";
import * as agents from "@graphai/agents";
import { MulmoScript, MulmoBeat } from "./type";
import { readMulmoScriptFile, getOutputFilePath, mkdir } from "./utils/file";
import { fileCacheAgentFilter } from "./utils/filters";
import imageGoogleAgent from "./agents/image_google_agent";
import { ImageGoogleConfig } from "./agents/image_google_agent";

dotenv.config();
// const openai = new OpenAI();
import { GoogleAuth } from "google-auth-library";

const GOOGLE_PROJECT_ID = process.env.GOOGLE_PROJECT_ID; // Your Google Cloud Project ID
const GOOGLE_IMAGEN_MODEL = "imagen-3.0-fast-generate-001";
const GOOGLE_IMAGEN_ENDPOINT = `https://us-central1-aiplatform.googleapis.com/v1/projects/${GOOGLE_PROJECT_ID}/locations/us-central1/publishers/google/models/${GOOGLE_IMAGEN_MODEL}:predict`;
const tokenHolder = {
  token: "undefined",
};

type PredictionResponse = {
  predictions?: {
    bytesBase64Encoded?: string;
  }[];
};

async function generateImage(prompt: string, script: MulmoScript): Promise<Buffer | undefined> {
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
        aspectRatio: script.aspectRatio ?? "16:9",
        safetySetting: "block_only_high",
      },
    };

    // Make the API call using fetch
    const response = await fetch(GOOGLE_IMAGEN_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${tokenHolder.token}`,
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

const preprocess_agent = async (namedInputs: {
  row: { imagePrompt: string; text: string; image: string };
  index: number;
  suffix: string;
  script: MulmoScript;
}) => {
  const { row, index, suffix, script } = namedInputs;
  const prompt = row.imagePrompt || row.text;
  const relativePath = `./images/${script.filename}/${index}${suffix}.png`;
  return { path: path.resolve(relativePath), prompt };
};

const image_agent = async (namedInputs: { row: { imagePrompt: string; text: string; image: string }; index: number; suffix: string; script: MulmoScript }) => {
  const { row, index, suffix, script } = namedInputs;
  const prompt = row.imagePrompt || row.text;
  const relativePath = `./images/${script.filename}/${index}${suffix}.png`;
  if (row.image && row.image !== relativePath) {
    console.log("specified", row.image);
    return row.image;
  }
  const imagePath = path.resolve(relativePath);
  if (fs.existsSync(imagePath)) {
    console.log("cached", imagePath);
    return relativePath;
  }

  try {
    console.log("generating", index, prompt);
    const imageBuffer = await generateImage(prompt, script);
    if (imageBuffer) {
      fs.writeFileSync(imagePath, imageBuffer);
      console.log("generated:", imagePath);
    } else {
      return undefined;
    }
  } catch (error) {
    console.error("Failed to generate image:", error);
    throw error;
  }

  /* Dalle.3
  const response = await openai.images.generate({
    model: "dall-e-3",
    prompt: prompt ? `${prompt}\n${keywords}` : row.text,
    n: 1,
    size: "1024x1024", // "1792x1024",
  });

  const imageRes = await fetch(response.data[0].url!);
 
  const writer = fs.createWriteStream(imagePath);
  if (imageRes.body) {
    const reader = imageRes.body.getReader();
    let done = false;

    while (!done) {
      const { value, done: readerDone } = await reader.read();
      if (value) {
        writer.write(Buffer.from(value));
      }
      done = readerDone;
    }

    writer.end();
    console.log("generated", imagePath);
  } else {
    throw new Error("Response body is null or undefined");
  }

  // Return a Promise that resolves when the writable stream is finished
  await new Promise<void>((resolve, reject) => {
    writer.on("finish", resolve);
    writer.on("error", reject);
  });
  */
  return relativePath;
};

const graph_data: GraphData = {
  version: 0.5,
  concurrency: 2,
  nodes: {
    script: {
      value: {},
    },
    map: {
      agent: "mapAgent",
      inputs: { rows: ":script.beats", script: ":script" },
      isResult: true,
      params: {
        compositeResult: true,
      },
      graph: {
        nodes: {
          preprocessor: {
            agent: preprocess_agent,
            inputs: {
              row: ":row",
              index: ":__mapIndex",
              script: ":script",
              suffix: "p",
            },
            isResult: true,
          },
          imageGenerator: {
            agent: "imageGoogleAgent",
            inputs: {
              prompt: ":preprocessor.prompt",
              file: ":preprocessor.path",
            },
          },
          output: {
            agent: "copyAgent",
            inputs: {
              result: ":imageGenerator",
              image: ":preprocessor.path",
            },
            isResult: true,
          },
        },
      },
    },
  },
};

const googleAuth = async () => {
  const auth = new GoogleAuth({
    scopes: ["https://www.googleapis.com/auth/cloud-platform"],
  });
  const client = await auth.getClient();
  const accessToken = await client.getAccessToken();
  return accessToken.token!;
};

const main = async () => {
  tokenHolder.token = await googleAuth();

  const arg2 = process.argv[2];
  const { fileName } = readMulmoScriptFile(arg2, "ERROR: File does not exist " + arg2);
  const outputFilePath = getOutputFilePath(fileName + ".json");
  const { mulmoData: outputScript } = readMulmoScriptFile(outputFilePath, "ERROR: File does not exist outputs/" + fileName + ".json");

  mkdir(`images/${outputScript.filename}`);

  // New way to authenticate google
  const agentFilters = [
    {
      name: "fileCacheAgentFilter",
      agent: fileCacheAgentFilter,
      nodeIds: ["imageGenerator"],
    },
  ];
  const google_config: ImageGoogleConfig = {
    projectId: process.env.GOOGLE_PROJECT_ID,
    token: "",
  };
  google_config.token = await googleAuth();

  const options = {
    agentFilters,
    config: {
      imageGoogleAgent: google_config,
    },
  };

  const graph = new GraphAI(graph_data, { ...agents, imageGoogleAgent }, options);
  graph.injectValue("script", outputScript);
  const results = await graph.run<{ output: MulmoBeat[] }>();
  console.log(results.map);
  if (results.map?.output) {
    results.map?.output.forEach((update, index) => {
      const beat = outputScript.beats[index];
      outputScript.beats[index] = { ...beat, ...update };
    });
    fs.writeFileSync(outputFilePath, JSON.stringify(outputScript, null, 2));
  }
};

main();
