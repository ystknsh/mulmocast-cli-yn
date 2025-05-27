import fs from "fs";
import { AgentFunction, AgentFunctionInfo } from "graphai";
import OpenAI, { toFile } from "openai";

// NOTE: gpt-image-1 supports only '1024x1024', '1024x1536', '1536x1024'
type OpenAIImageSize = "1792x1024" | "auto" | "1024x1024" | "1536x1024" | "1024x1536" | "256x256";
type OpenAIModeration = "low" | "auto";
type OpenAIImageOptions = {
  model: string;
  prompt: string;
  n: number;
  size: OpenAIImageSize;
  moderation?: "low" | "auto";
};

// https://platform.openai.com/docs/guides/image-generation

export const imageOpenaiAgent: AgentFunction<
  {
    apiKey: string;
    model: string; // dall-e-3 or gpt-image-1
    size: OpenAIImageSize | null | undefined;
    moderation: OpenAIModeration | null | undefined;
  },
  { buffer: Buffer },
  { prompt: string }
> = async ({ namedInputs, params }) => {
  const { prompt } = namedInputs;
  const { apiKey, model, size, moderation } = params;
  const openai = new OpenAI({ apiKey });

  const imageOptions: OpenAIImageOptions = {
    model: model ?? "dall-e-3",
    prompt,
    n: 1,
    size: size || model === "gpt-image-1" ? "1536x1024" : "1792x1024",
  };
  if (model === "gpt-image-1") {
    imageOptions.moderation = moderation || "auto";
  }

  const imageFiles = ["/Users/satoshi/git/ai/mulmo/tmp/shota_ghibli.png"];
  const images = await Promise.all(
    imageFiles.map(async (file) =>
        await toFile(fs.createReadStream(file), null, {
            type: "image/png",
        })
    ),
  );

  const response = await (async () => {
    if (images.length > 0 && (size === "1536x1024" || size === "1024x1536" || size === "1024x1024")) {
      return await openai.images.edit({ ...imageOptions, size, image: images });
    } else {
      return await openai.images.generate(imageOptions);
    }
  })();
  
  if (!response.data) {
    throw new Error(`response.data is undefined: ${response}`);
  }
  const url = response.data[0].url;
  if (!url) {
    // For gpt-image-1
    const image_base64 = response.data[0].b64_json;
    if (!image_base64) {
      throw new Error(`response.data[0].b64_json is undefined: ${response}`);
    }
    return { buffer: Buffer.from(image_base64, "base64") };
  }

  // For dall-e-3
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch ${url}: ${res.status} ${res.statusText}`);
  }

  // 2. Read the response as an ArrayBuffer
  const arrayBuffer = await res.arrayBuffer();

  // 3. Convert the ArrayBuffer to a Node.js Buffer and return it along with url
  return { buffer: Buffer.from(arrayBuffer) };
};

const imageOpenaiAgentInfo: AgentFunctionInfo = {
  name: "imageOpenaiAgent",
  agent: imageOpenaiAgent,
  mock: imageOpenaiAgent,
  samples: [],
  description: "OpenAI Image agent",
  category: ["image"],
  author: "Receptron Team",
  repository: "https://github.com/receptron/mulmocast-cli/",
  // source: "https://github.com/receptron/mulmocast-cli/blob/main/src/agents/image_openai_agent.ts",
  license: "MIT",
  environmentVariables: ["OPENAI_API_KEY"],
};

export default imageOpenaiAgentInfo;
