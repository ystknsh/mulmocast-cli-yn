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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMulmoScriptFromUrl = void 0;
require("dotenv/config");
const graphai_1 = require("graphai");
const agents = __importStar(require("@graphai/agents"));
const vanilla_node_agents_1 = require("@graphai/vanilla_node_agents");
const browserless_agent_1 = require("@graphai/browserless_agent");
const validate_mulmo_script_agent_1 = __importDefault(require("../agents/validate_mulmo_script_agent"));
const file_1 = require("../utils/file");
const schema_1 = require("../types/schema");
const graphData = {
    version: 0.5,
    // Execute sequentially because the free version of browserless API doesn't support concurrent execution.
    concurrency: 1,
    nodes: {
        urls: {
            value: [],
        },
        prompt: {
            value: "",
        },
        outdir: {
            value: "",
        },
        fileName: {
            value: "",
        },
        // get the text content of the urls
        fetchResults: {
            agent: "mapAgent",
            inputs: {
                rows: ":urls",
            },
            params: {
                compositeResult: true,
            },
            graph: {
                nodes: {
                    fetcher: {
                        agent: "browserlessAgent",
                        inputs: {
                            url: ":row",
                            text_content: true,
                        },
                        params: {
                            throwError: true,
                        },
                    },
                    copyAgent: {
                        agent: "copyAgent",
                        inputs: {
                            text: "{ url: ${:row}, text: ${:fetcher.text} }",
                        },
                        params: {
                            namedKey: "text",
                        },
                        isResult: true,
                    },
                },
            },
        },
        // join the text content
        sourceText: {
            agent: "arrayJoinAgent",
            inputs: {
                array: ":fetchResults.copyAgent",
            },
            params: {
                separator: ",",
            },
        },
        // generate the mulmo script
        mulmoScript: {
            agent: "nestedAgent",
            inputs: {
                sourceText: ":sourceText",
                prompt: ":prompt",
            },
            graph: {
                loop: {
                    // If the script is not valid and the counter is less than 3, continue the loop
                    while: ":continue",
                },
                nodes: {
                    counter: {
                        value: 0,
                        update: ":counter.add(1)",
                    },
                    openAIAgent: {
                        agent: "openAIAgent",
                        inputs: {
                            model: "gpt-4o",
                            system: ":prompt",
                            prompt: ":sourceText.text",
                        },
                    },
                    validateMulmoScriptAgent: {
                        agent: "validateMulmoScriptAgent",
                        inputs: {
                            text: ":openAIAgent.text.codeBlock()",
                        },
                        isResult: true,
                    },
                    continue: {
                        agent: ({ isValid, counter }) => {
                            return !isValid && counter < 3;
                        },
                        inputs: {
                            isValid: ":validateMulmoScriptAgent.isValid",
                            counter: ":counter",
                        },
                    },
                },
            },
        },
        writeJSON: {
            if: ":mulmoScript.validateMulmoScriptAgent.isValid",
            agent: "fileWriteAgent",
            inputs: {
                file: "${:outdir}/${:fileName}-${@now}.json",
                text: ":mulmoScript.validateMulmoScriptAgent.data.toJSON()",
            },
            isResult: true,
        },
    },
};
const createMulmoScriptFromUrl = async ({ urls, templateName, outDirPath, filename }) => {
    const parsedUrls = schema_1.urlsSchema.parse(urls);
    const graph = new graphai_1.GraphAI(graphData, {
        ...agents,
        browserlessAgent: browserless_agent_1.browserlessAgent,
        validateMulmoScriptAgent: validate_mulmo_script_agent_1.default,
        fileWriteAgent: vanilla_node_agents_1.fileWriteAgent,
    });
    graph.injectValue("urls", parsedUrls);
    graph.injectValue("prompt", (0, file_1.readTemplatePrompt)(templateName ?? "seed_materials"));
    graph.injectValue("outdir", outDirPath);
    graph.injectValue("fileName", filename);
    await graph.run();
};
exports.createMulmoScriptFromUrl = createMulmoScriptFromUrl;
