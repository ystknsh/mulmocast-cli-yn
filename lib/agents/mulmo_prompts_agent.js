"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mulmoPromptsAgent = void 0;
const prompts_data_1 = require("./prompts_data");
const mulmoPromptsAgent = async ({ params }) => {
    const { promptKey } = params;
    if (promptKey) {
        const prompt = prompts_data_1.prompts[promptKey];
        if (prompt) {
            return {
                text: prompt,
            };
        }
    }
    return prompts_data_1.prompts;
};
exports.mulmoPromptsAgent = mulmoPromptsAgent;
const mulmoPromptsAgentInfo = {
    name: "mulmoPromptsAgent",
    agent: exports.mulmoPromptsAgent,
    mock: exports.mulmoPromptsAgent,
    samples: [
        {
            inputs: {},
            params: {
                promptKey: "abstract",
            },
            result: {
                text: "We need to add a summary at the beginning of script, which summarizes this episode, which is very engaging. Please come up with a few sentences for the announcer to read, enter them into this script, and present it as an artifact.",
            },
        },
    ],
    description: "Prompts Agent",
    category: ["prompt"],
    author: "Receptron team",
    repository: "https://github.com/receptron/mulmocast-cli",
    source: "https://github.com/receptron/mulmocast-cli/tree/main/src/agents/prompts_agent.ts",
    // package: "@graphai/prompts",
    license: "MIT",
};
exports.default = mulmoPromptsAgentInfo;
