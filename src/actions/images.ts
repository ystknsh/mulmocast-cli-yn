import dotenv from "dotenv";
import { GraphAI, GraphAILogger } from "graphai";
import type { GraphOptions, GraphData } from "graphai";
import * as agents from "@graphai/vanilla";
import { fileWriteAgent } from "@graphai/vanilla_node_agents";

import { MulmoStudioContext, MulmoStudioBeat, MulmoImageParams } from "../types/index.js";
import { getOutputStudioFilePath, mkdir, getHTMLFile } from "../utils/file.js";
import { fileCacheAgentFilter } from "../utils/filters.js";
import { renderMarkdownToImage, renderHTMLToImage, interpolate } from "../utils/markdown.js";
import imageGoogleAgent from "../agents/image_google_agent.js";
import imageOpenaiAgent from "../agents/image_openai_agent.js";
import { MulmoScriptMethods, MulmoStudioContextMethods, Text2ImageAgentInfo } from "../methods/index.js";

const { default: __, ...vanillaAgents } = agents;

dotenv.config();
// const openai = new OpenAI();
import { GoogleAuth } from "google-auth-library";

const preprocess_agent = async (namedInputs: {
  context: MulmoStudioContext;
  beat: MulmoStudioBeat;
  index: number;
  suffix: string;
  imageDirPath: string;
  imageAgentInfo: Text2ImageAgentInfo;
}) => {
  const { context, beat, index, suffix, imageDirPath, imageAgentInfo } = namedInputs;
  const imageParams = { ...imageAgentInfo.imageParams, ...beat.imageParams };
  const prompt = (beat.imagePrompt || beat.text) + "\n" + (imageParams.style || "");
  const imagePath = `${imageDirPath}/${context.studio.filename}/${index}${suffix}.png`;
  const aspectRatio = MulmoScriptMethods.getAspectRatio(context.studio.script);

  if (beat.image) {
    const canvasSize = MulmoScriptMethods.getCanvasSize(context.studio.script);
    if (beat.image.type === "textSlide") {
      const slide = beat.image.slide;
      const markdown: string = `# ${slide.title}\n` + slide.bullets.map((text) => `- ${text}`).join("\n");
      await renderMarkdownToImage(markdown, MulmoScriptMethods.getTextSlideStyle(context.studio.script, beat), imagePath, canvasSize.width, canvasSize.height);
    } else if (beat.image.type === "markdown") {
      const markdown: string = Array.isArray(beat.image.markdown) ? beat.image.markdown.join("\n") : beat.image.markdown;
      await renderMarkdownToImage(markdown, MulmoScriptMethods.getTextSlideStyle(context.studio.script, beat), imagePath, canvasSize.width, canvasSize.height);
    } else if (beat.image.type === "image") {
      if (beat.image.source.kind === "url") {
        // undefined prompt indicates "no need to generate image"
        return { path: beat.image.source.url, prompt: undefined, imageParams, aspectRatio };
      } else if (beat.image.source.kind === "path") {
        const path = MulmoStudioContextMethods.resolveAssetPath(context, beat.image.source.path);
        return { path, prompt: undefined, imageParams, aspectRatio };
      }
    } else if (beat.image.type === "chart") {
      const template = getHTMLFile("chart");
      const htmlData = interpolate(template, { title: beat.image.title, chart_data: JSON.stringify(beat.image.chartData) });
      await renderHTMLToImage(htmlData, imagePath, canvasSize.width, canvasSize.height);
    } else if (beat.image?.type === "mermaid") {
      const template = getHTMLFile("mermaid");
      const htmlData = interpolate(template, { title: beat.image.title, diagram_code: beat.image.code });
      await renderHTMLToImage(htmlData, imagePath, canvasSize.width, canvasSize.height);
    }
  }
  return { path: imagePath, prompt, imageParams, aspectRatio };
};

const graph_data: GraphData = {
  version: 0.5,
  concurrency: 2,
  nodes: {
    context: {},
    imageDirPath: {},
    imageAgentInfo: {},
    outputStudioFilePath: {},
    map: {
      agent: "mapAgent",
      inputs: { rows: ":context.studio.beats", context: ":context", imageAgentInfo: ":imageAgentInfo", imageDirPath: ":imageDirPath" },
      isResult: true,
      params: {
        rowKey: "beat",
        compositeResult: true,
      },
      graph: {
        nodes: {
          preprocessor: {
            agent: preprocess_agent,
            inputs: {
              context: ":context",
              beat: ":beat",
              index: ":__mapIndex",
              suffix: "p",
              imageDirPath: ":imageDirPath",
              imageAgentInfo: ":imageAgentInfo",
            },
          },
          imageGenerator: {
            if: ":preprocessor.prompt",
            agent: ":imageAgentInfo.agent",
            params: {
              model: ":preprocessor.imageParams.model",
              size: ":preprocessor.imageParams.size",
              moderation: ":preprocessor.imageParams.moderation",
              aspectRatio: ":preprocessor.aspectRatio",
            },
            inputs: {
              prompt: ":preprocessor.prompt",
              file: ":preprocessor.path", // only for fileCacheAgentFilter
              text: ":preprocessor.prompt", // only for fileCacheAgentFilter
              force: ":context.force",
            },
            defaultValue: {},
          },
          output: {
            agent: "copyAgent",
            inputs: {
              result: ":imageGenerator",
              image: ":preprocessor.path",
            },
            output: {
              imageFile: ".image",
            },
            isResult: true,
          },
        },
      },
    },
    mergeResult: {
      agent: (namedInputs: { array: { imageFile: string }[]; context: MulmoStudioContext }) => {
        const { array, context } = namedInputs;
        const { studio } = context;
        array.forEach((update, index) => {
          const beat = studio.beats[index];
          studio.beats[index] = { ...beat, ...update };
        });
        // console.log(namedInputs);
        return { studio };
      },
      inputs: {
        array: ":map.output",
        context: ":context",
      },
    },
    writeOutout: {
      // console: { before: true },
      agent: "fileWriteAgent",
      inputs: {
        file: ":outputStudioFilePath",
        text: ":mergeResult.studio.toJSON()",
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

export const images = async (context: MulmoStudioContext) => {
  const { studio, fileDirs } = context;
  const { outDirPath, imageDirPath } = fileDirs;
  mkdir(`${imageDirPath}/${studio.filename}`);

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

  const imageAgentInfo = MulmoScriptMethods.getImageAgentInfo(studio.script);

  // We need to get google's auth token only if the google is the text2image provider.
  if (imageAgentInfo.provider === "google") {
    GraphAILogger.log("google was specified as text2image engine");
    const token = await googleAuth();
    options.config = {
      imageGoogleAgent: {
        projectId: process.env.GOOGLE_PROJECT_ID,
        token,
      },
    };
  }

  GraphAILogger.info(`text2image: provider=${imageAgentInfo.provider} model=${imageAgentInfo.imageParams.model}`);
  const injections: Record<string, Text2ImageAgentInfo | string | MulmoImageParams | MulmoStudioContext | undefined> = {
    context,
    imageAgentInfo,
    outputStudioFilePath: getOutputStudioFilePath(outDirPath, studio.filename),
    imageDirPath,
  };
  const graph = new GraphAI(graph_data, { ...vanillaAgents, imageGoogleAgent, imageOpenaiAgent, fileWriteAgent }, options);
  Object.keys(injections).forEach((key: string) => {
    graph.injectValue(key, injections[key]);
  });
  await graph.run<{ output: MulmoStudioBeat[] }>();
};
