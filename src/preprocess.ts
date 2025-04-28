import "dotenv/config";
import { GraphAI } from "graphai";
import type { GraphData, AgentFilterFunction } from "graphai";
import * as agents from "@graphai/agents";
import { fileWriteAgent } from "@graphai/vanilla_node_agents";

import { recursiveSplitJa, replacementsJa, replacePairsJa } from "./utils/string";
import { readMulmoScriptFile, getOutputFilePath } from "./utils/file";
import { MulmoScript, LANG, LocalizedText } from "./type";

const translateGraph: GraphData = {
  version: 0.5,
  nodes: {
    mulmoScript: {},
    defaultLang: {},
    lang: {
      agent: "stringUpdateTextAgent",
      inputs: {
        newText: ":mulmoScript.lang",
        oldText: ":defaultLang",
      },
    },
    targetLangs: {},
    fileName: {},
    mergeResult: {
      isResult: true,
      agent: "mergeObjectAgent",
      inputs: {
        items: [":mulmoScript", { filename: ":fileName" }, { beats: ":beatsMap.mergeBeatData" }],
      },
    },
    beatsMap: {
      agent: "mapAgent",
      inputs: {
        targetLangs: ":targetLangs",
        rows: ":mulmoScript.beats",
        lang: ":lang",
      },
      params: {
        compositeResult: true,
      },
      graph: {
        version: 0.5,
        nodes: {
          preprocessBeats: {
            agent: "mapAgent",
            inputs: {
              beat: ":row",
              rows: ":targetLangs",
              lang: ":lang.text",
            },
            params: {
              compositeResult: true,
            },
            graph: {
              version: 0.5,
              nodes: {
                localizedTexts: {
                  // console: { before: true},
                  inputs: {
                    targetLang: ":row",
                    beat: ":beat",
                    lang: ":lang",
                    system: "Please translate the given text into the language specified in language (in locale format, like en, ja, fr, ch).",
                    prompt: ["## Original Language", ":lang", "", "## Language", ":row", "", "## Target", ":beat.text"],
                  },
                  passThrough: {
                    lang: ":row",
                  },
                  output: {
                    text: ".text",
                  },
                  agent: "openAIAgent",
                },
                splitText: {
                  agent: (namedInputs: { localizedText: LocalizedText; targetLang: LANG }) => {
                    const { localizedText, targetLang } = namedInputs;
                    // Cache
                    if (localizedText.texts) {
                      return localizedText;
                    }
                    if (targetLang === "ja") {
                      return {
                        ...localizedText,
                        texts: recursiveSplitJa(localizedText.text),
                      };
                    }
                    // not split
                    return {
                      ...localizedText,
                      texts: [localizedText.text],
                    };
                  },
                  inputs: {
                    targetLang: ":row",
                    localizedText: ":localizedTexts",
                  },
                },
                ttsTexts: {
                  agent: (namedInputs: { localizedText: LocalizedText; targetLang: LANG }) => {
                    const { localizedText, targetLang } = namedInputs;
                    // cache
                    if (localizedText.ttsTexts) {
                      return localizedText;
                    }
                    if (targetLang === "ja") {
                      return {
                        ...localizedText,
                        ttsTexts: localizedText.texts.map((text: string) => replacePairsJa(text, replacementsJa)),
                      };
                    }
                    return {
                      ...localizedText,
                      ttsTexts: localizedText.texts,
                    };
                  },
                  inputs: {
                    targetLang: ":row",
                    localizedText: ":splitText",
                  },
                  isResult: true,
                },
              },
            },
          },
          /*
          imagePrompt: {
            agent: (namedInputs) => {
              const { beat } = namedInputs;
              if (beat.imagePrompt) {
                return beat.imagePrompt;
              }
              return "not implemented";
            },
            inputs: {
              beat: ":row",
              lang: ":lang",
            },
          },
          */
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
              items: [":row", { multiLingualTexts: ":mergeLocalizedText" }],
              // imagePrompt: ":imagePrompt",
            },
            // console: {before: true, after: true},
          },
        },
      },
    },
    debug: {
      agent: "fileWriteAgent",
      inputs: {
        file: "./output/${:fileName}.json",
        text: ":mergeResult.toJSON()",
      },
      params: { baseDir: __dirname + "/../" },
    },
  },
};

const localizedTextCacheAgentFilter: AgentFilterFunction = async (context, next) => {
  const { namedInputs } = context;

  const { targetLang, beat, lang } = namedInputs;
  if (beat.multiLingualTexts && beat.multiLingualTexts[targetLang]) {
    return beat.multiLingualTexts[targetLang];
  }
  if (targetLang === lang) {
    return { text: beat.text, lang: targetLang };
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

const translateText = async (mulmoScript: MulmoScript, fileName: string, defaultLang: LANG, targetLangs: LANG[]) => {
  const graph = new GraphAI(translateGraph, { ...agents, fileWriteAgent }, { agentFilters });
  graph.injectValue("mulmoScript", mulmoScript);
  graph.injectValue("defaultLang", defaultLang);
  graph.injectValue("targetLangs", targetLangs);
  graph.injectValue("fileName", fileName);

  const results = await graph.run();
  return results.mergeResult;
};

export const updateMultiLingualTexts = (originalMulmoData: MulmoScript, mulmoData: MulmoScript): MulmoScript => {
  mulmoData.beats = mulmoData.beats.map((beat, index) => {
    const originalBeat = originalMulmoData?.beats[index];
    if (originalBeat?.text === beat?.text) {
      return beat;
    }
    return originalBeat;
  }).filter(beat => beat);
  return mulmoData;
};

const defaultLang = "en";
const targetLangs = ["ja", "en", "fr-FR", "zh-CN"];

const main = async () => {
  const arg2 = process.argv[2];
  const readData = readMulmoScriptFile(arg2, "ERROR: File does not exist " + arg2);
  const { mulmoData: originalMulmoData, fileName } = readData;

  const outputFilePath = getOutputFilePath(fileName + ".json");
  const { mulmoData } = readMulmoScriptFile(outputFilePath) ?? { mulmoData: originalMulmoData };

  const targetMulmoData = updateMultiLingualTexts(originalMulmoData, mulmoData);

  const mulmoDataResult = await translateText(targetMulmoData, fileName, defaultLang, targetLangs);

  console.log(JSON.stringify(mulmoDataResult, null, 2));

  // console.log(mulmoData, originalMulmoData);
};

if (process.argv[1] === __filename) {
  main();
}
