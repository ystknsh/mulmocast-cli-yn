import dotenv from "dotenv";
import fs from "fs";
import { GraphAI, GraphAILogger } from "graphai";
import type { GraphOptions, GraphData } from "graphai";
import * as agents from "@graphai/vanilla";
import { fileWriteAgent } from "@graphai/vanilla_node_agents";

import { MulmoStudioContext, MulmoBeat, MulmoScript, MulmoStudioBeat, MulmoImageParams, Text2ImageAgentInfo } from "../types/index.js";
import { getOutputStudioFilePath, mkdir } from "../utils/file.js";
import { fileCacheAgentFilter } from "../utils/filters.js";
import imageGoogleAgent from "../agents/image_google_agent.js";
import imageOpenaiAgent from "../agents/image_openai_agent.js";
import movieGoogleAgent from "../agents/movie_google_agent.js";
import { MulmoScriptMethods, MulmoStudioContextMethods } from "../methods/index.js";
import { imagePlugins } from "../utils/image_plugins/index.js";

import { imagePrompt } from "../utils/prompt.js";

const { default: __, ...vanillaAgents } = agents;

dotenv.config();
// const openai = new OpenAI();
import { GoogleAuth } from "google-auth-library";
import { MulmoStudioMethods } from "../methods/mulmo_studio.js";

const htmlStyle = (script: MulmoScript, beat: MulmoBeat) => {
  return {
    canvasSize: MulmoScriptMethods.getCanvasSize(script),
    textSlideStyle: MulmoScriptMethods.getTextSlideStyle(script, beat),
  };
};

const imagePreprocessAgent = async (namedInputs: {
  context: MulmoStudioContext;
  beat: MulmoBeat;
  index: number;
  suffix: string;
  imageDirPath: string;
  imageAgentInfo: Text2ImageAgentInfo;
  imageRefs: Record<string, string>;
}) => {
  const { context, beat, index, suffix, imageDirPath, imageAgentInfo, imageRefs } = namedInputs;
  const imageParams = { ...imageAgentInfo.imageParams, ...beat.imageParams };
  const imagePath = `${imageDirPath}/${context.studio.filename}/${index}${suffix}.png`;
  const returnValue = {
    aspectRatio: MulmoScriptMethods.getAspectRatio(context.studio.script),
    imageParams,
  };

  if (beat.image) {
    const plugin = imagePlugins.find((plugin) => plugin.imageType === beat?.image?.type);
    if (plugin) {
      try {
        MulmoStudioMethods.setBeatSessionState(context.studio, "image", index, true);
        const processorParams = { beat, context, imagePath, ...htmlStyle(context.studio.script, beat) };
        const path = await plugin.process(processorParams);
        // undefined prompt indicates that image generation is not needed
        return { path, ...returnValue };
      } finally {
        MulmoStudioMethods.setBeatSessionState(context.studio, "image", index, false);
      }
    }
  }

  const prompt = imagePrompt(beat, imageParams.style);
  const images = (() => {
    const imageNames = beat.imageNames ?? Object.keys(imageRefs); // use all images if imageNames is not specified
    const sources = imageNames.map((name) => imageRefs[name]);
    return sources.filter((source) => source !== undefined);
  })();
  return { path: imagePath, prompt, ...returnValue, images };
};

const graph_data: GraphData = {
  version: 0.5,
  concurrency: 4,
  nodes: {
    context: {},
    imageDirPath: {},
    imageAgentInfo: {},
    outputStudioFilePath: {},
    imageRefs: {},
    map: {
      agent: "mapAgent",
      inputs: {
        rows: ":context.studio.script.beats",
        context: ":context",
        imageAgentInfo: ":imageAgentInfo",
        imageDirPath: ":imageDirPath",
        imageRefs: ":imageRefs",
      },
      isResult: true,
      params: {
        rowKey: "beat",
        compositeResult: true,
      },
      graph: {
        nodes: {
          preprocessor: {
            agent: imagePreprocessAgent,
            inputs: {
              context: ":context",
              beat: ":beat",
              index: ":__mapIndex",
              suffix: "p",
              imageDirPath: ":imageDirPath",
              imageAgentInfo: ":imageAgentInfo",
              imageRefs: ":imageRefs",
            },
          },
          imageGenerator: {
            if: ":preprocessor.prompt",
            agent: ":imageAgentInfo.agent",
            retry: 3,
            inputs: {
              prompt: ":preprocessor.prompt",
              file: ":preprocessor.path", // only for fileCacheAgentFilter
              text: ":preprocessor.prompt", // only for fileCacheAgentFilter
              force: ":context.force",
              studio: ":context.studio", // for cache
              index: ":__mapIndex", // for cache
              sessionType: "image", // for cache
              params: {
                model: ":preprocessor.imageParams.model",
                size: ":preprocessor.imageParams.size",
                moderation: ":preprocessor.imageParams.moderation",
                aspectRatio: ":preprocessor.aspectRatio",
                images: ":preprocessor.images",
              },
            },
            defaultValue: {},
          },
          prepareMovie: {
            agent: (namedInputs: { imagePath: string; beat: MulmoBeat; imageDirPath: string; index: number; suffix: string; context: MulmoStudioContext }) => {
              const { beat, imageDirPath, index, suffix, context } = namedInputs;
              if (beat.moviePrompt) {
                const movieFile = `${imageDirPath}/${context.studio.filename}/${index}.mov`;
                return { movieFile };
              }
              return {};
            },
            inputs: {
              result: ":imageGenerator", // to wait for imageGenerator to finish
              imagePath: ":preprocessor.path",
              beat: ":beat",
              imageDirPath: ":imageDirPath",
              index: ":__mapIndex",
              context: ":context",
            },
          },
          movieGenerator: {
            if: ":prepareMovie.movieFile",
            agent: "movieGoogleAgent",
            inputs: {
              prompt: ":beat.moviePrompt",
              imagePath: ":preprocessor.path",
              file: ":prepareMovie.movieFile",
              studio: ":context.studio", // for cache
              index: ":__mapIndex", // for cache
              sessionType: "movie", // for cache
              params: {
                model: ":beat.movieParams.model",
                size: ":preprocessor.imageParams.size",
                moderation: ":preprocessor.imageParams.moderation",
                aspectRatio: ":preprocessor.aspectRatio",
                images: ":preprocessor.images",
              }
            },
            defaultValue: {},
          },
          output: {
            agent: "copyAgent",
            inputs: {
              onComplete: ":movieGenerator",
              imageFile: ":preprocessor.path",
              movieFile: ":prepareMovie.movieFile",
            },
            isResult: true,
          },
        },
      },
    },
    mergeResult: {
      agent: (namedInputs: { array: { imageFile: string, moveFile: string }[]; context: MulmoStudioContext }) => {
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

const generateImages = async (context: MulmoStudioContext) => {
  const { studio, fileDirs } = context;
  const { outDirPath, imageDirPath } = fileDirs;
  mkdir(`${imageDirPath}/${studio.filename}`);

  const agentFilters = [
    {
      name: "fileCacheAgentFilter",
      agent: fileCacheAgentFilter,
      nodeIds: ["imageGenerator", "movieGenerator"],
    },
  ];

  const options: GraphOptions = {
    agentFilters,
  };

  const imageAgentInfo = MulmoScriptMethods.getImageAgentInfo(studio.script);

  // We need to get google's auth token only if the google is the text2image provider.
  if (imageAgentInfo.provider === "google" || studio.script.movieParams?.provider === "google") {
    GraphAILogger.log("google was specified as text2image engine");
    const token = await googleAuth();
    options.config = {
      imageGoogleAgent: {
        projectId: process.env.GOOGLE_PROJECT_ID,
        token,
      },
      movieGoogleAgent: {
        projectId: process.env.GOOGLE_PROJECT_ID,
        token,
      },
    };
  }
  if (imageAgentInfo.provider === "openai") {
    // NOTE: Here are the rate limits of OpenAI's text2image API (1token = 32x32 patch).
    // dall-e-3: 7,500 RPM、15 images per minute (4 images for max resolution)
    // gpt-image-1：3,000,000 TPM、150 images per minute
    graph_data.concurrency = imageAgentInfo.imageParams.model === "dall-e-3" ? 4 : 16;
  }

  const imageRefs: Record<string, string> = {};
  const images = studio.script.imageParams?.images;
  if (images) {
    await Promise.all(
      Object.keys(images).map(async (key) => {
        const image = images[key];
        if (image.source.kind === "path") {
          imageRefs[key] = MulmoStudioContextMethods.resolveAssetPath(context, image.source.path);
        } else if (image.source.kind === "url") {
          const response = await fetch(image.source.url);
          if (!response.ok) {
            throw new Error(`Failed to download image: ${image.source.url}`);
          }
          const buffer = Buffer.from(await response.arrayBuffer());
          const imagePath = `${imageDirPath}/${context.studio.filename}/${key}.png`;
          await fs.promises.writeFile(imagePath, buffer);
          imageRefs[key] = imagePath;
        }
      }),
    );
  }

  GraphAILogger.info(`text2image: provider=${imageAgentInfo.provider} model=${imageAgentInfo.imageParams.model}`);
  const injections: Record<string, Text2ImageAgentInfo | string | MulmoImageParams | MulmoStudioContext | undefined> = {
    context,
    imageAgentInfo,
    outputStudioFilePath: getOutputStudioFilePath(outDirPath, studio.filename),
    imageDirPath,
    imageRefs,
  };
  const graph = new GraphAI(graph_data, { ...vanillaAgents, imageGoogleAgent, movieGoogleAgent, imageOpenaiAgent, fileWriteAgent }, options);
  Object.keys(injections).forEach((key: string) => {
    graph.injectValue(key, injections[key]);
  });
  await graph.run<{ output: MulmoStudioBeat[] }>();
};

export const images = async (context: MulmoStudioContext) => {
  try {
    MulmoStudioMethods.setSessionState(context.studio, "image", true);
    await generateImages(context);
  } finally {
    MulmoStudioMethods.setSessionState(context.studio, "image", false);
  }
};
