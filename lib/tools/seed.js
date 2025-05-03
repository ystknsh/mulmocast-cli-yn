"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMulmoScriptWithInteractive = void 0;
require("dotenv/config");
const graphai_1 = require("graphai");
const agents = __importStar(require("@graphai/agents"));
const prompts_data_1 = require("../agents/prompts_data");
const vanilla_node_agents_1 = require("@graphai/vanilla_node_agents");
const graphData = {
    version: 0.5,
    loop: {
        while: true,
    },
    nodes: {
        fileName: {
            update: ":fileName",
        },
        outdir: {
            update: ":outdir",
        },
        messages: {
            value: [
                {
                    role: "system",
                    content: prompts_data_1.prompts.prompt_seed,
                },
            ],
            update: ":llm.messages",
        },
        userInput: {
            agent: "textInputAgent",
            params: {
                message: "You:",
                required: true,
            },
        },
        llm: {
            agent: "openAIAgent",
            params: {
                model: "gpt-4o",
            },
            inputs: {
                messages: ":messages",
                prompt: ":userInput.text",
            },
            console: {
                after: { message: ".text" },
                // after: true,
            },
        },
        json: {
            agent: "copyAgent",
            inputs: {
                json: ":llm.text.codeBlock().jsonParse()",
                text: ":llm.text.codeBlock()",
            },
            console: { after: true },
        },
        writeJSON: {
            if: ":json.json",
            agent: "fileWriteAgent",
            inputs: {
                file: "${:outdir}/${:fileName}-${@now}.json",
                text: ":json.text",
            },
            console: { after: true, before: true },
        },
    },
};
const createMulmoScriptWithInteractive = async ({ outdir }) => {
    const graph = new graphai_1.GraphAI(graphData, { ...agents, fileWriteAgent: vanilla_node_agents_1.fileWriteAgent });
    // FIXME: Temporarily fixed value. Need to verify if this is actually needed
    graph.injectValue("fileName", "script");
    graph.injectValue("outdir", outdir);
    await graph.run();
};
exports.createMulmoScriptWithInteractive = createMulmoScriptWithInteractive;
