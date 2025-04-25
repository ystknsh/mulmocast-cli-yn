import "dotenv/config";
import { GraphAI, GraphData } from "graphai";
import * as agents from "@graphai/agents";

import { readMulmoScriptFile, getOutputFilePath } from "./utils";
import { MulmoScript, LANG } from "./type";

// text -> (言語翻訳) multiLingualText.text ->  分割(split) multiLingualText.texts -> よみの変換 multiLingualText.ttsTexts

// 画像のprompt作成
// text -> imagePrompt


// outファイルを開く -> なければコピー
// それぞれのstepをみて判断していく
// defaultの言語、変換対象の言語

const granslateGraph: GraphData = {
  version: 0.5,
  nodes: {
    mulmoScript: {},
    lang: {},
    targetLangs: {},
    beatsMap: {
      agent: "mapAgent",
      inputs: {
        targetLangs: ":targetLangs",
        rows: ":mulmoScript.beats",
        lang: ":lang",
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
                  },
                  isResult: true,
                  agent: (namedInputs) => {
                    const { targetLang, beat } = namedInputs;
                    if (beat.multiLingualText && beat.multiLingualText[targetLang]) {
                      return beat;
                    }
                    // TODO translate
                    return { text: beat.text, lang: targetLang };
                  },
                },
                splitText: {
                  agent: (namedInputs) => {
                    const { beat } = namedInputs;
                    // TODO split text
                    const ret = {
                      ...beat,
                      texts: [],
                    };
                    return ret;
                  },
                  inputs: {
                    beat: ":localizedTexts",
                  },
                },
                ttsTexts: {
                  agent: (namedInputs) => {
                    const { beat } = namedInputs;
                    // TODO ttstext
                    const ret = {
                      ...beat,
                      ttsTexts: [],
                    };
                    return ret;
                  },
                  inputs: {
                    beat: ":splitText",
                  },
                  isResult: true,
                }
              }
            },
          },
          mergeResult: {
            console: { after: true},
            agent: (namedInputs) => {
              const { localizedTexts, beat } = namedInputs;
              const multiLingualText = localizedTexts.reduce((tmp, translateResult) => {
                const { lang } = translateResult;
                tmp[lang] = translateResult;
                return tmp;
              }, {});
              beat.multiLingualText = multiLingualText;
              return beat;
            },
            inputs: {
              "localizedTexts": ":preprocessBeats.ttsTexts",
              "beat": ":row"
            },
          },
        },
      },
    }
  },
};
const translateText = async (mulmoScript: MulmoScript, lang: LANG, targetLangs: LANG[]) => {
  const graph = new GraphAI(granslateGraph, { ...agents});
  graph.injectValue("mulmoScript", mulmoScript);
  graph.injectValue("lang", lang);
  graph.injectValue("targetLangs", targetLangs);
  
  const results = await graph.run();
  console.log(results);
};

const defaultLang = "ja";
const targetLangs = ["ja", "en"];

const main = async() => {
  const arg2 = process.argv[2];
  const readData = readMulmoScriptFile(arg2, "ERROR: File does not exist " + arg2);
  const { mulmoData: originalMulmoData, fileName } = readData;

  const outputFilePath = getOutputFilePath(fileName + ".json");
  const { mulmoData } = readMulmoScriptFile(outputFilePath) ?? { mulmoData: originalMulmoData };

  const lang = mulmoData.lang ?? defaultLang;
  console.log(lang);
  const translatedMulmoData = translateText(mulmoData, defaultLang, targetLangs);
  // console.log(mulmoData, originalMulmoData);
  
  
};

main();
