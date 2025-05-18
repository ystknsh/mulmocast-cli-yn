import { options } from "yargs";
import { MulmoStudio, MulmoStudioContext, MulmoCanvasDimension, BeatMediaType } from "../types/index.js";
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
        rowValue: ":context.studio.script.beats[beat]",
      },
      graph: {
        "nodes": {
          "test": {
            "agent": "copyAgent",
            "inputs": {
              "text": ":beat.text"
            },
            "console": {
              "before": true
            }
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
  await graph.run();
};
  