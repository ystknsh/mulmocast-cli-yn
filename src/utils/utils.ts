import * as crypto from "crypto";

export const llmAgents = ["openAIAgent", "anthropicAgent", "geminiAgent", "groqAgent"];

type LLMAgent = (typeof llmAgents)[number];

const defaultModels: Record<LLMAgent, string> = {
  anthropicAgent: "claude-3-7-sonnet-20250219",
  geminiAgent: "gemini-1.5-flash",
  groqAgent: "llama3-8b-8192",
  openAIAgent: "gpt-4o",
};

const longMaxTokens: Record<LLMAgent, number> = {
  anthropicAgent: 8192,
  geminiAgent: 8192,
  groqAgent: 4096,
  openAIAgent: 8192,
};

export const defaultOpenAIModel = defaultModels["openAIAgent"];

export const llmPair = (_agent?: LLMAgent, _model?: string) => {
  const agent: LLMAgent = _agent && llmAgents.includes(_agent ?? "") ? _agent : ("openAIAgent" as const);
  const model = _model ?? defaultModels[agent ?? ""];
  const max_tokens = longMaxTokens[agent];

  return { agent, model, max_tokens };
};

export const chunkArray = <T>(array: T[], size = 3): T[][] => {
  const chunks = [];
  const copy = [...array];
  while (copy.length) chunks.push(copy.splice(0, size));
  return chunks;
};

export const text2hash = (input: string): string => {
  return crypto.createHash("sha256").update(input).digest("hex");
};
