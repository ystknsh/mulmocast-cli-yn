import { MulmoStudioContext, MulmoBeat } from "../types/index.js";
import { GraphAI, GraphAILogger, GraphData } from "graphai";
import * as agents from "@graphai/vanilla";

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
            agent: (namedInputs: { beat: MulmoBeat, context: MulmoStudioContext, index: number }) => {
              const { beat, context, index } = namedInputs;
              const { fileDirs } = namedInputs.context;
              const { imageDirPath } = fileDirs;
              const imagePath = `${imageDirPath}/${context.studio.filename}/${index}_caption.png`;
              return imagePath;
            },
            inputs: {
              beat: ":beat",
              context: ":context",
              index: ":__mapIndex",
            },
            isResult: true
          }
        }
      }
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
  