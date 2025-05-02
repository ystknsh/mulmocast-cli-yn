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
exports.translate = void 0;
require("dotenv/config");
const graphai_1 = require("graphai");
const agents = __importStar(require("@graphai/agents"));
const vanilla_node_agents_1 = require("@graphai/vanilla_node_agents");
const string_1 = require("../utils/string");
const file_1 = require("../utils/file");
const translateGraph = {
    version: 0.5,
    nodes: {
        studio: {},
        defaultLang: {},
        outDirPath: {},
        outputStudioFilePath: {},
        lang: {
            agent: "stringUpdateTextAgent",
            inputs: {
                newText: ":studio.script.lang",
                oldText: ":defaultLang",
            },
        },
        targetLangs: {}, // TODO
        mergeStudioResult: {
            isResult: true,
            agent: "mergeObjectAgent",
            inputs: {
                items: [":studio", { beats: ":beatsMap.mergeBeatData" }],
            },
        },
        beatsMap: {
            agent: "mapAgent",
            inputs: {
                targetLangs: ":targetLangs",
                rows: ":studio.beats",
                lang: ":lang",
            },
            params: {
                rowKey: "beat",
                compositeResult: true,
            },
            graph: {
                version: 0.5,
                nodes: {
                    preprocessBeats: {
                        agent: "mapAgent",
                        inputs: {
                            beat: ":beat",
                            rows: ":targetLangs",
                            lang: ":lang.text",
                        },
                        params: {
                            compositeResult: true,
                            rowKey: "targetLang",
                        },
                        graph: {
                            version: 0.5,
                            nodes: {
                                localizedTexts: {
                                    inputs: {
                                        targetLang: ":targetLang",
                                        beat: ":beat",
                                        lang: ":lang",
                                        system: "Please translate the given text into the language specified in language (in locale format, like en, ja, fr, ch).",
                                        prompt: ["## Original Language", ":lang", "", "## Language", ":targetLang", "", "## Target", ":beat.text"],
                                    },
                                    passThrough: {
                                        lang: ":targetLang",
                                    },
                                    output: {
                                        text: ".text",
                                    },
                                    // return { lang, text } <- localizedText
                                    agent: "openAIAgent",
                                },
                                splitText: {
                                    agent: (namedInputs) => {
                                        const { localizedText, targetLang } = namedInputs;
                                        // Cache
                                        if (localizedText.texts) {
                                            return localizedText;
                                        }
                                        if (targetLang === "ja") {
                                            return {
                                                ...localizedText,
                                                texts: (0, string_1.recursiveSplitJa)(localizedText.text),
                                            };
                                        }
                                        // not split
                                        return {
                                            ...localizedText,
                                            texts: [localizedText.text],
                                        };
                                        // return { lang, text, texts }
                                    },
                                    inputs: {
                                        targetLang: ":targetLang",
                                        localizedText: ":localizedTexts",
                                    },
                                },
                                ttsTexts: {
                                    agent: (namedInputs) => {
                                        const { localizedText, targetLang } = namedInputs;
                                        // cache
                                        if (localizedText.ttsTexts) {
                                            return localizedText;
                                        }
                                        if (targetLang === "ja") {
                                            return {
                                                ...localizedText,
                                                ttsTexts: localizedText?.texts?.map((text) => (0, string_1.replacePairsJa)(text, string_1.replacementsJa)),
                                            };
                                        }
                                        return {
                                            ...localizedText,
                                            ttsTexts: localizedText.texts,
                                        };
                                    },
                                    inputs: {
                                        targetLang: ":targetLang",
                                        localizedText: ":splitText",
                                    },
                                    isResult: true,
                                },
                            },
                        },
                    },
                    mergeLocalizedText: {
                        agent: "arrayToObjectAgent",
                        inputs: {
                            items: ":preprocessBeats.ttsTexts",
                        },
                        params: {
                            key: "lang",
                        },
                    },
                    mergeBeatData: {
                        isResult: true,
                        agent: "mergeObjectAgent",
                        inputs: {
                            items: [":beat", { multiLingualTexts: ":mergeLocalizedText" }],
                        },
                    },
                },
            },
        },
        writeOutout: {
            console: { before: true },
            agent: "fileWriteAgent",
            inputs: {
                file: ":outputStudioFilePath",
                text: ":mergeStudioResult.toJSON()",
            },
        },
    },
};
const localizedTextCacheAgentFilter = async (context, next) => {
    const { namedInputs } = context;
    const { targetLang, beat, lang } = namedInputs;
    // The original text is unchanged and the target language text is present
    if (beat.multiLingualTexts &&
        beat.multiLingualTexts[lang] &&
        beat.multiLingualTexts[lang].text === beat.text &&
        beat.multiLingualTexts[targetLang] &&
        beat.multiLingualTexts[targetLang].text) {
        return { text: beat.multiLingualTexts[targetLang].text };
    }
    // same language
    if (targetLang === lang) {
        return { text: beat.text };
    }
    return await next(context);
};
const agentFilters = [
    {
        name: "localizedTextCacheAgentFilter",
        agent: localizedTextCacheAgentFilter,
        nodeIds: ["localizedTexts"],
    },
];
const defaultLang = "en";
const targetLangs = ["ja", "en"];
const translate = async (studio, files) => {
    const { outDirPath } = files;
    const outputStudioFilePath = (0, file_1.getOutputStudioFilePath)(outDirPath, studio.filename);
    const graph = new graphai_1.GraphAI(translateGraph, { ...agents, fileWriteAgent: vanilla_node_agents_1.fileWriteAgent }, { agentFilters });
    graph.injectValue("studio", studio);
    graph.injectValue("defaultLang", defaultLang);
    graph.injectValue("targetLangs", targetLangs);
    graph.injectValue("outDirPath", outDirPath);
    graph.injectValue("outputStudioFilePath", outputStudioFilePath);
    await graph.run();
    // const results = await graph.run();
    // const mulmoDataResult = results.mergeResult;
    // console.log(JSON.stringify(mulmoDataResult, null, 2));
};
exports.translate = translate;
