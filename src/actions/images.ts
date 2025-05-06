import dotenv from "dotenv";
import { GraphAI, GraphData } from "graphai";
import type { GraphOptions } from "graphai/lib/type";
import * as agents from "@graphai/vanilla";
import { fileWriteAgent } from "@graphai/vanilla_node_agents";

import { MulmoStudioContext, MulmoStudioBeat, MulmoImageParams } from "../types";
import { getOutputStudioFilePath, mkdir } from "../utils/file";
import { fileCacheAgentFilter } from "../utils/filters";
import { convertMarkdownToImage } from "../utils/markdown";
import imageGoogleAgent from "../agents/image_google_agent";
import imageOpenaiAgent from "../agents/image_openai_agent";
import { MulmoScriptMethods, MulmoStudioContextMethods } from "../methods";

dotenv.config();
// const openai = new OpenAI();
import { GoogleAuth } from "google-auth-library";

const preprocess_agent = async (namedInputs: { context: MulmoStudioContext; beat: MulmoStudioBeat; index: number; suffix: string; imageDirPath: string }) => {
  const { context, beat, index, suffix, imageDirPath } = namedInputs;
  const imageParams = { ...context.studio.script.imageParams, ...beat.imageParams };
  const prompt = (beat.imagePrompt || beat.text) + "\n" + (imageParams.style || "");
  const imagePath = `${imageDirPath}/${context.studio.filename}/${index}${suffix}.png`;
  const aspectRatio = MulmoScriptMethods.getAspectRatio(context.studio.script);

  if (beat.media) {
    if (beat.media.type === "textSlide") {
      const slide = beat.media.slide;
      const markdown: string = `# ${slide.title}` + slide.bullets.map((text) => `- ${text}`).join("\n");
      await convertMarkdownToImage(markdown, MulmoScriptMethods.getTextSlideStyle(context.studio.script, beat), imagePath);
    } else if (beat.media.type === "markdown") {
      const markdown: string = Array.isArray(beat.media.markdown) ? beat.media.markdown.join("\n") : beat.media.markdown;
      await convertMarkdownToImage(markdown, MulmoScriptMethods.getTextSlideStyle(context.studio.script, beat), imagePath);
    } else if (beat.media.type === "image") {
      if (beat.media.source.kind === "url") {
        // undefined prompt indicates "no need to generate image"
        return { path: beat.media.source.url, prompt: undefined, imageParams, aspectRatio };
      } else if (beat.media.source.kind === "path") {
        const path = MulmoStudioContextMethods.resolveAssetPath(context, beat.media.source.path);
        return { path, prompt: undefined, imageParams, aspectRatio };
      }
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
    text2imageAgent: {},
    outputStudioFilePath: {},
    map: {
      agent: "mapAgent",
      inputs: { rows: ":context.studio.beats", context: ":context", text2imageAgent: ":text2imageAgent", imageDirPath: ":imageDirPath" },
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
            },
          },
          imageGenerator: {
            if: ":preprocessor.prompt",
            agent: ":text2imageAgent",
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
              image: ".imageFile",
            },
            isResult: true,
          },
        },
      },
    },
    mergeResult: {
      agent: (namedInputs: { array: { image: string }[]; context: MulmoStudioContext }) => {
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
  // We need to get google's auth token only if the google is the text2image provider.
  if (MulmoScriptMethods.getImageProvider(studio.script) === "google") {
    console.log("google was specified as text2image engine");
    const token = await googleAuth();
    options.config = {
      imageGoogleAgent: {
        projectId: process.env.GOOGLE_PROJECT_ID,
        token,
      },
    };
  }

  const injections: Record<string, string | MulmoImageParams | MulmoStudioContext | undefined> = {
    context,
    text2imageAgent: MulmoScriptMethods.getText2imageAgent(studio.script),
    outputStudioFilePath: getOutputStudioFilePath(outDirPath, studio.filename),
    imageDirPath,
  };
  const graph = new GraphAI(graph_data, { ...agents, imageGoogleAgent, imageOpenaiAgent, fileWriteAgent }, options);
  Object.keys(injections).forEach((key: string) => {
    graph.injectValue(key, injections[key]);
  });
  await graph.run<{ output: MulmoStudioBeat[] }>();
};
