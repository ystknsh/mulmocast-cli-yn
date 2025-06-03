import { MulmoStudioContext, MulmoBeat } from "../types/index.js";
import { GraphAI, GraphAILogger, GraphData } from "graphai";
import vanillaAgents from "@graphai/vanilla";
import { getHTMLFile } from "../utils/file.js";
import { renderHTMLToImage, interpolate } from "../utils/markdown.js";
import { MulmoStudioMethods } from "../methods/mulmo_studio.js";

// const { default: __, ...vanillaAgents } = agents;

const graph_data: GraphData = {
  version: 0.5,
  nodes: {
    context: {},
    map: {
      agent: "mapAgent",
      inputs: { rows: ":context.studio.script.beats", context: ":context" },
      isResult: true,
      params: {
        rowKey: "beat",
        compositeResult: true,
      },
      graph: {
        nodes: {
          generateCaption: {
            agent: async (namedInputs: { beat: MulmoBeat; context: MulmoStudioContext; index: number }) => {
              const { beat, context, index } = namedInputs;
              try {
                MulmoStudioMethods.setBeatSessionState(context.studio, "caption", index, true);
                const { fileDirs } = namedInputs.context;
                const { caption } = context;
                const { imageDirPath } = fileDirs;
                const { canvasSize } = context.studio.script;
                const imagePath = `${imageDirPath}/${context.studio.filename}/${index}_caption.png`;
                const template = getHTMLFile("caption");
                const text = (() => {
                  const multiLingual = context.studio.multiLingual;
                  if (caption && multiLingual) {
                    return multiLingual[index].multiLingualTexts[caption].text;
                  }
                  GraphAILogger.warn(`No multiLingual caption found for beat ${index}, lang: ${caption}`);
                  return beat.text;
                })();
                const htmlData = interpolate(template, {
                  caption: text,
                  width: `${canvasSize.width}`,
                  height: `${canvasSize.height}`,
                });
                await renderHTMLToImage(htmlData, imagePath, canvasSize.width, canvasSize.height, false, true);
                context.studio.beats[index].captionFile = imagePath;
                return imagePath;
              } finally {
                MulmoStudioMethods.setBeatSessionState(context.studio, "caption", index, false);
              }
            },
            inputs: {
              beat: ":beat",
              context: ":context",
              index: ":__mapIndex",
            },
            isResult: true,
          },
        },
      },
    },
  },
};

export const captions = async (context: MulmoStudioContext) => {
  try {
    MulmoStudioMethods.setSessionState(context.studio, "caption", true);
    const graph = new GraphAI(graph_data, { ...vanillaAgents });
    graph.injectValue("context", context);
    await graph.run();
  } finally {
    MulmoStudioMethods.setSessionState(context.studio, "caption", false);
  }
};
