"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.imageOpenaiAgent = void 0;
const openai_1 = __importDefault(require("openai"));
// https://platform.openai.com/docs/guides/image-generation
const imageOpenaiAgent = async ({ namedInputs, params }) => {
    const { prompt } = namedInputs;
    const { apiKey, model, size } = params;
    const openai = new openai_1.default({ apiKey });
    const response = await openai.images.generate({
        model: model ?? "dall-e-3",
        prompt,
        n: 1,
        size: size || "1792x1024",
    });
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
exports.imageOpenaiAgent = imageOpenaiAgent;
const imageOpenaiAgentInfo = {
    name: "imageOpenaiAgent",
    agent: exports.imageOpenaiAgent,
    mock: exports.imageOpenaiAgent,
    samples: [],
    description: "OpenAI Image agent",
    category: ["image"],
    author: "Receptron Team",
    repository: "https://github.com/receptron/mulmocast-cli/",
    // source: "https://github.com/receptron/mulmocast-cli/blob/main/src/agents/image_openai_agent.ts",
    license: "MIT",
    environmentVariables: ["OPENAI_API_KEY"],
};
exports.default = imageOpenaiAgentInfo;
