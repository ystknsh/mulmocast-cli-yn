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
  google: "imageGoogleAgent",
  openai: "imageOpenaiAgent",
};

export const provider2MovieAgent = {
  replicate: "movieReplicateAgent",
  google: "movieGoogleAgent",
};
