export const provider2TTSAgent = {
  nijivoice: {
    agentName: "ttsNijivoiceAgent",
    hasLimitedConcurrency: true,
  },
  openai: {
    agentName: "ttsOpenaiAgent",
  },
  google: {
    agentName: "ttsGoogleAgent",
  },
  elevenlabs: {
    agentName: "ttsElevenlabsAgent",
    hasLimitedConcurrency: true,
  },
  mock: {
    agentName: "mediaMockAgent",
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
