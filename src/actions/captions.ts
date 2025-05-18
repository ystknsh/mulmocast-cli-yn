import { MulmoStudioContext, MulmoBeat } from "../types/index.js";
import { GraphAI, GraphAILogger, GraphData } from "graphai";
import * as agents from "@graphai/vanilla";
import { getHTMLFile } from "../utils/file.js";
import { renderHTMLToImage, interpolate } from "../utils/markdown.js";

const { default: __, ...vanillaAgents } = agents;

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
          test: {
            agent: async (namedInputs: { beat: MulmoBeat; context: MulmoStudioContext; index: number }) => {
              const { beat, context, index } = namedInputs;
              const { fileDirs } = namedInputs.context;
              const { imageDirPath } = fileDirs;
              const { canvasSize } = context.studio.script;
              const imagePath = `${imageDirPath}/${context.studio.filename}/${index}_caption.png`;
              const template = getHTMLFile("mermaid");
              const htmlData = interpolate(template, {});
              await renderHTMLToImage(htmlData, imagePath, canvasSize.width, canvasSize.height, true);
              return imagePath;
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
  const { caption } = context;
  GraphAILogger.info("*** DEBUG: captions:", caption);
  const graph = new GraphAI(graph_data, { ...vanillaAgents });
  graph.injectValue("context", context);
  const result = await graph.run();
  GraphAILogger.info("*** DEBUG: captions result:", result.map);
};
