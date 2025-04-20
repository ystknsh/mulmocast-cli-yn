import "dotenv/config";
import { GraphAI, AgentFilterFunction, GraphData } from "graphai";
import * as agents from "@graphai/agents";
import imageOpenaiAgent from "../agents/image_openai_agent";

const graph_data: GraphData = {
  version: 0.5,
  nodes: {
		test: {
			value: 123,
			isResult: true
		},
		foo: {
			agent: "copyAgent",
			inputs: {
				bar: ":test"
			}
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