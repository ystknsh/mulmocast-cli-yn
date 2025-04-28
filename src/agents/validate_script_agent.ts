import type { AgentFunction, AgentFunctionInfo, DefaultConfigData } from "graphai";
import { mulmoScriptSchema } from "../schema";
import { MulmoScript } from "../type";

interface ValidateScriptInputs {
  jsonString: string;
}

interface ValidateScriptResponse {
  isValid: boolean;
  data?: MulmoScript;
  error?: string;
}

/**
 * MulmoScript JSON validation agent
 * Validates if a JSON string conforms to the MulmoScript schema
 */
export const validateScriptAgent: AgentFunction<object, ValidateScriptResponse, ValidateScriptInputs, DefaultConfigData> = async ({ namedInputs }) => {
  const { jsonString } = namedInputs;
  try {
    const jsonData = JSON.parse(jsonString);
    const parsed = mulmoScriptSchema.parse(jsonData);
    return {
      isValid: true,
      data: parsed,
    };
  } catch (error) {
    return {
      isValid: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
};

const validateScriptAgentInfo: AgentFunctionInfo = {
  name: "validateScriptAgent",
  agent: validateScriptAgent,
  mock: validateScriptAgent,
  samples: [],
  description: "Validates if a JSON string conforms to the MulmoScript schema using valibot",
  category: ["validation"],
  author: "Receptron Team",
  repository: "https://github.com/receptron/mulmocast-cli/tree/main/src/agents/validate_script_agent.ts",
  license: "MIT",
};

export default validateScriptAgentInfo;
