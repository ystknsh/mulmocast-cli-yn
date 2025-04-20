import "dotenv/config";
import { GraphAI, AgentFilterFunction, GraphData } from "graphai";
import * as agents from "@graphai/agents";
import imageOpenaiAgent from "../agents/image_openai_agent";

const graph_data: GraphData = {
  version: 0.5,
  nodes: {
		image: {
			agent: "imageOpenaiAgent",
			inputs: {
				prompt: "Beatiful sunset in Hawaii"
			},
			isResult: true
		}
	}
};

const test = async () => {
	const graph = new GraphAI(
		graph_data,
		{
			...agents,
			imageOpenaiAgent,
		}
	);
	const results = await graph.run();
	console.log(results);
}

test();