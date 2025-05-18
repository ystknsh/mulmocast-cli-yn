import path from "path";
import { getBaseDirPath, getTemplateFilePath } from "../utils/file.js";
import { mulmoScriptTemplateSchema, mulmoStoryboardSchema } from "../types/schema.js";
import { MulmoStoryboard } from "../types/index.js";
import { GraphAI, GraphData } from "graphai";
import { openAIAgent } from "@graphai/openai_agent";
import * as agents from "@graphai/vanilla";
import { graphDataScriptGeneratePrompt, storyToScriptPrompt } from "../utils/prompt.js";

const { default: __, ...vanillaAgents } = agents;

const graphData: GraphData = {
  version: 0.5,
  nodes: {
    scenes: {
      value: [],
    },
    prompt: {
      value: "",
    },
    script: {
      agent: "mapAgent",
      inputs: {
        rows: ":scenes",
        prompt: ":prompt",
      },
      params: {
        compositeResult: true,
      },
      graph: {
        nodes: {
          llm: {
            agent: "openAIAgent",
            inputs: {
              model: "gpt-4o",
              system: ":prompt",
              prompt: graphDataScriptGeneratePrompt("${:row}"),
            },
          },
          json: {
            agent: "copyAgent",
            inputs: {
              json: ":llm.text.codeBlock().jsonParse()",
            },
            params: {
              namedKey: "json",
            },
            isResult: true,
          },
        },
      },
    },
    beats: {
      agent: "arrayFlatAgent",
      inputs: {
        array: ":script.json",
      },
      isResult: true,
    },
  },
};

const generatePrompt = async (templateName: string, beatsPerScene: number, allScenes: string) => {
  const templatePath = getTemplateFilePath(templateName);
  const rowTemplate = await import(path.resolve(templatePath), { assert: { type: "json" } }).then((mod) => mod.default);
  const template = mulmoScriptTemplateSchema.parse(rowTemplate);

  const sampleBeats = template.script?.beats ?? [];

  return storyToScriptPrompt({ sampleBeats, beatsPerScene, allScenes });
};

const storyToScript = async ({ story, beatsPerScene, templateName }: { story: MulmoStoryboard; beatsPerScene: number; templateName: string }) => {
  const allScenes = story.scenes.map((scene) => scene.description).join("\n");
  const prompt = await generatePrompt(templateName, beatsPerScene, allScenes);

  const graph = new GraphAI(graphData, { ...vanillaAgents, openAIAgent });
  graph.injectValue("prompt", prompt);
  graph.injectValue("scenes", story.scenes);

  const result = await graph.run();
  // eslint-disable-next-line no-console
  console.log(JSON.stringify(result.beats, null, 2));
};

const main = async () => {
  const beatsPerScene = 3;
  const templateName = "business";
  const storyPath = "./assets/storyboards/attention.json";

  const storyRaw = await import(path.resolve(getBaseDirPath(), storyPath), { assert: { type: "json" } }).then((mod) => mod.default);
  const story = mulmoStoryboardSchema.parse(storyRaw);

  await storyToScript({ story, beatsPerScene, templateName });
};

main();
