import path from "path";
import { getBaseDirPath, getTemplateFilePath } from "../utils/file.js";
import { mulmoScriptTemplateSchema, mulmoStoryboardSchema } from "../types/schema.js";
import { MulmoStoryboard } from "../types/index.js";
import { GraphAI, GraphData } from "graphai";
import { openAIAgent } from "@graphai/openai_agent";
import * as agents from "@graphai/vanilla";

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
      graph: {
        nodes: {
          llm: {
            agent: "openAIAgent",
            inputs: {
              model: "gpt-4o",
              system: ":prompt",
              prompt: "Please generate a script from the following scenes: ${:row}",
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
    beatJoin: {
      agent: ({ array }: { array: { json: unknown[] }[] }) => {
        return array.map((item) => item.json).flat();
      },
      inputs: {
        array: ":script",
      },
      isResult: true,
    },
    // TODO: create script file and write it
  },
};

// TODO: refactor this part
const generatePrompt = async (templateName: string, beatsPerScene: number, allScenes: string) => {
  const templatePath = getTemplateFilePath(templateName);
  const rowTemplate = await import(path.resolve(templatePath), { assert: { type: "json" } }).then((mod) => mod.default);
  const template = mulmoScriptTemplateSchema.parse(rowTemplate);

  const sampleBeats = template.script?.beats;

  return `
Generate a script for the given scenes, following the structure of the sample script below.
\`\`\`JSON
${JSON.stringify(sampleBeats)}
\`\`\`
For each scene, you must generate exactly ${beatsPerScene} beats.
The beats should be created considering the overall content of the scenes.
The scenes are as follows:
\`\`\`
${allScenes}
\`\`\`
Please provide your response as valid JSON within \`\`\`json code blocks for clarity.
`.trim();
};

const storyToScript = async ({ story, beatsPerScene, templateName }: { story: MulmoStoryboard; beatsPerScene: number; templateName: string }) => {
  const allScenes = story.scenes.map((scene) => scene.description).join("\n");
  const prompt = await generatePrompt(templateName, beatsPerScene, allScenes);

  const graph = new GraphAI(graphData, { ...vanillaAgents, openAIAgent });
  graph.injectValue("prompt", prompt);
  graph.injectValue("scenes", story.scenes);

  const result = await graph.run();
  // eslint-disable-next-line no-console
  console.log(JSON.stringify(result.beatJoin, null, 2));
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
