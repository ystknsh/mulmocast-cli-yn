export const provider2TTSAgent = {
  nijivoice: {
    agentName: "ttsNijivoiceAgent",
    hasLimitedConcurrency: true,
  },
  openai: {
    agentName: "ttsOpenaiAgent",
    hasLimitedConcurrency: false,
  },
  google: {
    agentName: "ttsGoogleAgent",
    hasLimitedConcurrency: false,
  },
  elevenlabs: {
    agentName: "ttsElevenlabsAgent",
    hasLimitedConcurrency: true,
  },
  mock: {
    agentName: "mediaMockAgent",
    hasLimitedConcurrency: false,
  },
};

export const provider2ImageAgent = {
  openai: {
    agentName: "imageOpenaiAgent",
    defaultModel: "dall-e-3",
    models: ["dall-e-3", "gpt-image-1"],
  },
  google: {
    agentName: "imageGoogleAgent",
    defaultModel: "imagen-3.0-fast-generate-001",
    models: ["imagen-3.0-fast-generate-001", "imagen-3.0-generate-002", "imagen-3.0-capability-001"],
  },
};

export const provider2MovieAgent = {
  replicate: "movieReplicateAgent",
  google: "movieGoogleAgent",
};
