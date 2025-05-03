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
const vanilla_node_agents_1 = require("@graphai/vanilla_node_agents");
const file_1 = require("../utils/file");
const agentHeader = "\x1b[34m● \x1b[0m\x1b[1mAgent\x1b[0m:\x1b[0m";
const graphData = {
    version: 0.5,
    loop: {
        while: ":continue",
    },
    nodes: {
        fileName: {
            update: ":fileName",
        },
        outdir: {
            update: ":outdir",
        },
        messages: {
            value: [],
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
        },
        json: {
            agent: "copyAgent",
            inputs: {
                json: ":llm.text.codeBlock().jsonParse()",
                text: ":llm.text.codeBlock()",
            },
        },
        writeJSON: {
            if: ":json.json",
            agent: "fileWriteAgent",
            inputs: {
                file: "${:outdir}/${:fileName}-${@now}.json",
                text: ":json.text",
            },
            console: {
                after: "\n\x1b[32m🎉 Script file generated successfully! Type /bye to exit.\x1b[0m\n",
            },
        },
        shouldResponse: {
            agent: "compareAgent",
            inputs: {
                array: [[":json.json", "==", undefined], "&&", [":userInput.text", "!=", "/bye"]],
            },
        },
        agentResponse: {
            if: ":shouldResponse.result",
            agent: "copyAgent",
            inputs: {
                text: "\n" + agentHeader + " ${:llm.text}\n",
            },
            params: {
                namedKey: "text",
            },
            console: { after: true },
        },
        checkInput: {
            agent: "compareAgent",
            inputs: { array: [":userInput.text", "!=", "/bye"] },
        },
        continue: {
            value: true,
            update: ":checkInput.result",
        },
    },
};
const interactiveClarificationPrompt = `If there are any unclear points, be sure to ask the user questions and clarify them before generating the script.`;
const createMulmoScriptWithInteractive = async ({ outDirPath, filename, templateName }) => {
    const graph = new graphai_1.GraphAI(graphData, { ...agents, fileWriteAgent: vanilla_node_agents_1.fileWriteAgent });
    const prompt = (0, file_1.readTemplatePrompt)(templateName ?? "seed_interactive");
    graph.injectValue("messages", [
        {
            role: "system",
            content: `${prompt}\n\n${interactiveClarificationPrompt}`,
        },
    ]);
    graph.injectValue("outdir", outDirPath);
    graph.injectValue("fileName", filename);
    console.log(`${agentHeader} Hi! What topic would you like me to generate about?\n`);
    await graph.run();
};
exports.createMulmoScriptWithInteractive = createMulmoScriptWithInteractive;
