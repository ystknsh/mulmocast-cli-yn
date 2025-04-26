import "dotenv/config";
import { GraphAI } from "graphai";
import type { GraphData, AgentFilterFunction } from "graphai";
import * as agents from "@graphai/agents";
import { fileWriteAgent } from "@graphai/vanilla_node_agents";

import { recursiveSplitJa, replacementsJa, replacePairsJa } from "./utils/string";
import { readMulmoScriptFile, getOutputFilePath } from "./utils/file";
import { MulmoScript, LANG, MultiLingualTexts, LocalizedText, MulmoBeat } from "./type";


const granslateGraph: GraphData = {
  version: 0.5,
  nodes: {
    mulmoScript: {},
    lang: {},
    targetLangs: {},
    fileName: {},
    mergeResult: {
      isResult: true,
      agent: (namedInputs: {mulmoScript: MulmoScript, beats: MulmoBeat[], fileName: string}) => {
        const { mulmoScript, beats, fileName } = namedInputs;
        return {
          fileName,
          ...mulmoScript,
          beats,
        };
      },
      inputs: {
        mulmoScript: ":mulmoScript",
        beats: ":beatsMap.mergeResult",
        fileName: ":fileName",
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
              lang: ":lang",
            },
            params: {
              compositeResult: true,
            },
            graph: {
              version: 0.5,
              nodes: {
                localizedTexts: {
                  inputs: {
                    targetLang: ":row",
                    beat: ":beat",
                    lang: ":lang",
                    system: "Please translate the given text into the language specified in language (in locale format, like en, ja, fr, ch).",
                    prompt: ["## Language", ":row", "## Target", ":beat.text"],
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
                  agent: (namedInputs: {localizedText: LocalizedText, targetLang: LANG}) => {
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
                  agent: (namedInputs:  {localizedText: LocalizedText, targetLang: LANG}) => {
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
          mergeBeat: {
            agent: (namedInputs:  {localizedTexts: LocalizedText[], beat: MulmoBeat }) => {
              const { localizedTexts, beat } = namedInputs;
              const multiLingualTexts = localizedTexts.reduce((tmp: MultiLingualTexts, translateResult: LocalizedText) => {
                const { lang } = translateResult;
                tmp[lang] = translateResult;
                return tmp;
              }, {});
              beat.multiLingualTexts = multiLingualTexts;
              return beat;
            },
            inputs: {
              localizedTexts: ":preprocessBeats.ttsTexts",
              beat: ":row",
            },
          },
          mergeResult: {
            isResult: true,
            agent: (namedInputs: {beat: MulmoBeat}) => {
              // const { beats, imagePrompt } = namedInputs;
              const { beat } = namedInputs;
              return {
                ...beat,
                //imagePrompt,
              };
            },
            inputs: {
              beat: ":mergeBeat",
              // imagePrompt: ":imagePrompt",
            },
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

const translateText = async (mulmoScript: MulmoScript, fileName: string, lang: LANG, targetLangs: LANG[]) => {
  const graph = new GraphAI(granslateGraph, { ...agents, fileWriteAgent }, { agentFilters });
  graph.injectValue("mulmoScript", mulmoScript);
  graph.injectValue("lang", lang);
  graph.injectValue("targetLangs", targetLangs);
  graph.injectValue("fileName", fileName);

  const results = await graph.run();
  return results.mergeResult;
};

const defaultLang = "ja";
const targetLangs = ["ja", "en", "fr-FR", "zh-CN"];

const main = async () => {
  const arg2 = process.argv[2];
  const readData = readMulmoScriptFile(arg2, "ERROR: File does not exist " + arg2);
  const { mulmoData: originalMulmoData, fileName } = readData;

  const outputFilePath = getOutputFilePath(fileName + ".json");
  const { mulmoData } = readMulmoScriptFile(outputFilePath) ?? { mulmoData: originalMulmoData };

  const mulmoDataResult = await translateText(mulmoData, fileName, defaultLang, targetLangs);

  console.log(JSON.stringify(mulmoDataResult, null, 2));

  // console.log(mulmoData, originalMulmoData);
};

main();
