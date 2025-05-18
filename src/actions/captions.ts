import { options } from "yargs";
import { MulmoStudio, MulmoStudioContext, MulmoCanvasDimension, BeatMediaType, MulmoBeat } from "../types/index.js";
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
            agent: (namedInputs: { beat: MulmoBeat }) => {
              return namedInputs.beat.text;
            },
            inputs: {
              beat: ":beat"
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
  