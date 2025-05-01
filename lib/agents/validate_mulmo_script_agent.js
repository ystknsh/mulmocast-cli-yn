"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateMulmoScriptAgent = void 0;
const schema_1 = require("../types/schema");
/**
 * MulmoScript JSON validation agent
 * Validates if a JSON string conforms to the MulmoScript schema
 */
const validateMulmoScriptAgent = async ({ namedInputs, }) => {
    const { text } = namedInputs;
    try {
        const jsonData = JSON.parse(text);
        const parsed = schema_1.mulmoScriptSchema.parse(jsonData);
        return {
            isValid: true,
            data: parsed,
        };
    }
    catch (error) {
        return {
            isValid: false,
            error: error instanceof Error ? error.message : String(error),
        };
    }
};
exports.validateMulmoScriptAgent = validateMulmoScriptAgent;
const validateMulmoScriptAgentInfo = {
    name: "validateMulmoScriptAgent",
    agent: exports.validateMulmoScriptAgent,
    mock: exports.validateMulmoScriptAgent,
    samples: [],
    description: "Validates if a JSON string conforms to the MulmoScript schema",
    category: ["validation"],
    author: "Receptron Team",
    repository: "https://github.com/receptron/mulmocast-cli/tree/main/src/agents/validate_script_agent.ts",
    license: "MIT",
};
exports.default = validateMulmoScriptAgentInfo;
