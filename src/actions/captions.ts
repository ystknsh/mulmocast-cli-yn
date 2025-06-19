import { MulmoStudioContext, MulmoBeat } from "../types/index.js";
import { GraphAI, GraphAILogger } from "graphai";
import type { GraphData, CallbackFunction } from "graphai";
import * as agents from "@graphai/vanilla";
import { getHTMLFile } from "../utils/file.js";
import { renderHTMLToImage, interpolate } from "../utils/markdown.js";
import { MulmoStudioContextMethods, MulmoPresentationStyleMethods } from "../methods/index.js";

const vanillaAgents = agents.default ?? agents;

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
                MulmoStudioContextMethods.setBeatSessionState(context, "caption", index, true);
                const imageDirPath = MulmoStudioContextMethods.getImageDirPath(context);
                const caption = MulmoStudioContextMethods.getCaption(context);
                const canvasSize = MulmoPresentationStyleMethods.getCanvasSize(context.presentationStyle);
                const imagePath = `${imageDirPath}/${context.studio.filename}/${index}_caption.png`;
                const template = getHTMLFile("caption");
                const text = (() => {
                  const multiLingual = context.multiLingual;
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
                MulmoStudioContextMethods.setBeatSessionState(context, "caption", index, false);
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

export const captions = async (context: MulmoStudioContext, callbacks?: CallbackFunction[]) => {
  if (context.caption) {
    try {
      MulmoStudioContextMethods.setSessionState(context, "caption", true);
      const graph = new GraphAI(graph_data, { ...vanillaAgents });
      graph.injectValue("context", context);
      if (callbacks) {
        callbacks.forEach((callback) => {
          graph.registerCallback(callback);
        });
      }
      await graph.run();
    } finally {
      MulmoStudioContextMethods.setSessionState(context, "caption", false);
    }
  }
  return context;
};
