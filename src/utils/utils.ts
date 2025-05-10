export const llmAgents = ["openAIAgent", "anthropicAgent", "geminiAgent", "groqAgent"];

type LLMAgent = (typeof llmAgents)[number];

const defaultModels: Record<LLMAgent, string> = {
  anthropicAgent: "claude-3-7-sonnet-20250219",
  geminiAgent: "gemini-1.5-flash",
  groqAgent: "llama3-8b-8192",
  openAIAgent: "gpt-4o",
};

export const defaultOpenAIModel = defaultModels["openAIAgent"];

export const llmPair = (_agent?: LLMAgent, _model?: string) => {
  const agent: LLMAgent = _agent && llmAgents.includes(_agent ?? "") ? _agent : ("openAIAgent" as const);
  const model = _model ?? defaultModels[agent ?? ""];

  return { agent, model };
};
