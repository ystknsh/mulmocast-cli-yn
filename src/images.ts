import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { GraphAI, GraphData } from "graphai";
import type { GraphOptions } from "graphai/lib/type";
import * as agents from "@graphai/agents";
import { MulmoScript, MulmoBeat, Text2imageParams } from "./type";
import { readMulmoScriptFile, getOutputFilePath, mkdir } from "./utils/file";
import { fileCacheAgentFilter } from "./utils/filters";
import { createOrUpdateStudioData } from "./utils/preprocess";
import imageGoogleAgent from "./agents/image_google_agent";
import imageOpenaiAgent from "./agents/image_openai_agent";

import { ImageGoogleConfig } from "./agents/image_google_agent";

dotenv.config();
// const openai = new OpenAI();
import { GoogleAuth } from "google-auth-library";

const preprocess_agent = async (namedInputs: { beat: MulmoBeat; index: number; suffix: string; script: MulmoScript }) => {
  const { beat, index, suffix, script } = namedInputs;
  const imageParams = { ...script.imageParams, ...beat.imageParams };
  const prompt = (beat.imagePrompt || beat.text) + "\n" + (imageParams.style || "");
  console.log(`prompt: ${prompt}`);
  const relativePath = `./images/${script.filename}/${index}${suffix}.png`;
  return { path: path.resolve(relativePath), prompt, imageParams };
};

const graph_data: GraphData = {
  version: 0.5,
  concurrency: 2,
  nodes: {
    script: { value: {} },
    text2imageAgent: { value: "" },
    map: {
      agent: "mapAgent",
      inputs: { rows: ":script.beats", script: ":script", text2imageAgent: ":text2imageAgent" },
      isResult: true,
      params: {
        compositeResult: true,
      },
      graph: {
        nodes: {
          preprocessor: {
            agent: preprocess_agent,
            inputs: {
              beat: ":row",
              index: ":__mapIndex",
              script: ":script",
              suffix: "p",
            },
          },
          imageGenerator: {
            agent: ":text2imageAgent",
            params: {
              model: ":preprocessor.imageParams.model",
              size: ":preprocessor.imageParams.size",
              aspectRatio: ":preprocessor.imageParams.aspectRatio",
            },
            inputs: {
              prompt: ":preprocessor.prompt",
              file: ":preprocessor.path", // only for fileCacheAgentFilter
              text: ":preprocessor.prompt", // only for fileCacheAgentFilter
            },
          },
          output: {
            agent: "copyAgent",
            inputs: {
              result: ":imageGenerator",
              image: ":preprocessor.path",
            },
            output: {
              image: ".image",
            },
            isResult: true,
          },
        },
      },
    },
  },
};

const googleAuth = async () => {
  const auth = new GoogleAuth({
    scopes: ["https://www.googleapis.com/auth/cloud-platform"],
  });
  const client = await auth.getClient();
  const accessToken = await client.getAccessToken();
  return accessToken.token!;
};

const main = async () => {
  const arg2 = process.argv[2];
  const studio = createOrUpdateStudioData(arg2);

  // const { fileName } = readMulmoScriptFile(arg2, "ERROR: File does not exist " + arg2);
  // const outputFilePath = getOutputFilePath(fileName + ".json");
  // const { mulmoData: outputScript } = readMulmoScriptFile(outputFilePath, "ERROR: File does not exist outputs/" + fileName + ".json");

  mkdir(`images/${studio.filename}`);

  const agentFilters = [
    {
      name: "fileCacheAgentFilter",
      agent: fileCacheAgentFilter,
      nodeIds: ["imageGenerator"],
    },
  ];

  const options: GraphOptions = {
    agentFilters,
  };

  const injections: Record<string, string | MulmoScript | Text2imageParams | undefined> = {
    script: studio.script,
    text2imageAgent: "imageOpenaiAgent",
  };

  if (studio.script.imageParams?.provider === "google") {
    console.log("google was specified as text2image engine");
    const google_config: ImageGoogleConfig = {
      projectId: process.env.GOOGLE_PROJECT_ID,
      token: "",
    };
    google_config.token = await googleAuth();
    options.config = {
      imageGoogleAgent: google_config,
    };
    injections.text2image = "imageGoogleAgent";
  }

  const graph = new GraphAI(graph_data, { ...agents, imageGoogleAgent, imageOpenaiAgent }, options);
  Object.keys(injections).forEach((key: string) => {
    graph.injectValue(key, injections[key]);
  });
  const results = await graph.run<{ output: MulmoBeat[] }>();
  console.log(results.map);
  if (results.map?.output) {
    results.map?.output.forEach((update, index) => {
      const beat = studio.beats[index];
      studio.beats[index] = { ...beat, ...update };
    });
    fs.writeFileSync(`./output/$:studio.filename}_studio.json`, JSON.stringify(studio, null, 2));
  }
};

main();
