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
    defaultModel: "gpt-image-1",
    models: ["dall-e-3", "gpt-image-1"],
  },
  google: {
    agentName: "imageGoogleAgent",
    defaultModel: "imagen-3.0-fast-generate-001",
    models: ["imagen-3.0-fast-generate-001", "imagen-3.0-generate-002", "imagen-3.0-capability-001"],
  },
};

export const provider2MovieAgent = {
  replicate: {
    agentName: "movieReplicateAgent",
  },
  google: {
    agentName: "movieGoogleAgent",
  },
};

// : Record<LLM, { agent: string; defaultModel: string; max_tokens: number }>
export const provider2LLMAgent = {
  openai: {
    agentName: "openAIAgent",
    defaultModel: "gpt-4o",
    max_tokens: 8192,
  },
  anthropic: {
    agentName: "anthropicAgent",
    defaultModel: "claude-3-7-sonnet-20250219",
    max_tokens: 8192,
  },
  gemini: {
    agentName: "geminiAgent",
    defaultModel: "gemini-1.5-flash",
    max_tokens: 8192,
  },
  groq: {
    agentName: "groqAgent",
    defaultModel: "llama3-8b-8192",
    max_tokens: 4096,
  },
} as const;

export const llm = Object.keys(provider2LLMAgent) as (keyof typeof provider2LLMAgent)[];
export type LLM = keyof typeof provider2LLMAgent;
