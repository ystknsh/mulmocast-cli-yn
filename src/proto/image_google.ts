import "dotenv/config";
import { GraphAI, GraphData } from "graphai";
import * as agents from "@graphai/agents";
import imageGoogleAgent from "../agents/image_google_agent";
import { fileWriteAgent } from "@graphai/vanilla_node_agents";

const graph_data: GraphData = {
  version: 0.5,
  nodes: {
    imageGenerator: {
      agent: "imageGoogleAgent",
      inputs: {
        prompt: "Beatiful sunset in Hawaii",
      },
    },
    fileWriter: {
      agent: "fileWriteAgent",
      inputs: {
        file: "./output/hawaii.png",
        buffer: ":imageGenerator.buffer",
      },
      params: { baseDir: __dirname + "/../../" },
      isResult: true,
    },
  },
};

const main = async () => {
  const options = {
    config: {
      imageGoogleAgent: {
        projectId: process.env.GOOGLE_PROJECT_ID
      }
    }
  };
  const graph = new GraphAI(graph_data, {
    ...agents,
    imageGoogleAgent,
    fileWriteAgent,
  }, options);
  const results = await graph.run();
  console.log(results);
};

main();
