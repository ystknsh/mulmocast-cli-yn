// for image agent

// NOTE: gpt-image-1 supports only '1024x1024', '1024x1536', '1536x1024'
export type OpenAIImageSize = "1792x1024" | "1024x1792" | "1024x1024" | "1536x1024" | "1024x1536";
export type OpenAIImageModeration = "low" | "auto";
export type OpenAIImageOptions = {
  model: string;
  prompt: string;
  n: number;
  size: OpenAIImageSize;
  moderation?: OpenAIImageModeration;
};

export type AgentBufferResult = { buffer: Buffer };
export type AgentPromptInputs = { prompt: string };

export type ImageAgentParams = { model: string; canvasSize: { width: number; height: number } };
export type OpenAIImageAgentParams = ImageAgentParams & { moderation: OpenAIImageModeration | null | undefined };
export type OpenAIImageAgentConfig = { baseURL?: string; apiKey?: string };
export type OpenAIImageAgentInputs = AgentPromptInputs & { referenceImages: string[] | null | undefined };

export type GoogleImageAgentConfig = {
  projectId?: string;
  token?: string;
};
export type GoogleMovieAgentInputs = AgentPromptInputs & { imagePath?: string };
export type GoogleMovieAgentParams = ImageAgentParams & { duration?: number };

// end of image agent
