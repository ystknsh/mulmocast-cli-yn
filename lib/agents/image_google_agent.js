"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.imageGoogleAgent = void 0;
async function generateImage(projectId, model, token, prompt, aspectRatio) {
    const GOOGLE_IMAGEN_ENDPOINT = `https://us-central1-aiplatform.googleapis.com/v1/projects/${projectId}/locations/us-central1/publishers/google/models/${model}:predict`;
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
        const responseData = await response.json();
        // Parse and return the generated image URL or data
        const predictions = responseData.predictions;
        if (predictions && predictions.length > 0) {
            const base64Image = predictions[0].bytesBase64Encoded;
            if (base64Image) {
                return Buffer.from(base64Image, "base64"); // Decode the base64 image to a buffer
            }
            else {
                throw new Error("No base64-encoded image data returned from the API.");
            }
        }
        else {
            // console.log(response);
            console.log("No predictions returned from the API.", responseData, prompt);
            return undefined;
        }
    }
    catch (error) {
        console.error("Error generating image:", error);
        throw error;
    }
}
const imageGoogleAgent = async ({ namedInputs, params, config, }) => {
    const { prompt } = namedInputs;
    const aspectRatio = params.aspectRatio ?? "16:9";
    const model = params.model ?? "imagen-3.0-fast-generate-001";
    //const projectId = process.env.GOOGLE_PROJECT_ID; // Your Google Cloud Project ID
    const projectId = config?.projectId;
    const token = config?.token;
    try {
        const buffer = await generateImage(projectId, model, token, prompt, aspectRatio);
        if (buffer) {
            return { buffer };
        }
        throw new Error("ERROR: geneateImage returned undefined");
    }
    catch (error) {
        console.error("Failed to generate image:", error);
        throw error;
    }
};
exports.imageGoogleAgent = imageGoogleAgent;
const imageGoogleAgentInfo = {
    name: "imageGoogleAgent",
    agent: exports.imageGoogleAgent,
    mock: exports.imageGoogleAgent,
    samples: [],
    description: "Google Image agent",
    category: ["image"],
    author: "Receptron Team",
    repository: "https://github.com/receptron/mulmocast-cli/",
    // source: "https://github.com/receptron/mulmocast-cli/blob/main/src/agents/image_google_agent.ts",
    license: "MIT",
    environmentVariables: [],
};
exports.default = imageGoogleAgentInfo;
