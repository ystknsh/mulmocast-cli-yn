import {
  langSchema,
  localizedTextSchema,
  mulmoBeatSchema,
  mulmoScriptSchema,
  mulmoStudioSchema,
  mulmoStudioBeatSchema,
  mulmoStoryboardSchema,
  mulmoStoryboardSceneSchema,
  mulmoStudioMultiLingualSchema,
  mulmoStudioMultiLingualDataSchema,
  speakerDictionarySchema,
  mulmoImageParamsSchema,
  mulmoMovieParamsSchema,
  mulmoSpeechParamsSchema,
  textSlideParamsSchema,
  speechOptionsSchema,
  mulmoCanvasDimensionSchema,
  mulmoScriptTemplateSchema,
  text2ImageProviderSchema,
  text2MovieProviderSchema,
  text2SpeechProviderSchema,
  mulmoPresentationStyleSchema,
  multiLingualTextsSchema,
  // for image
  mulmoMermaidMediaSchema,
  mulmoTextSlideMediaSchema,
  mulmoMarkdownMediaSchema,
  mulmoImageMediaSchema,
  mulmoChartMediaSchema,
  mediaSourceSchema,
} from "./schema.js";
import { pdf_modes, pdf_sizes, storyToScriptGenerateMode } from "../utils/const.js";
import { LLM } from "../utils/utils.js";
import { z } from "zod";

export type LANG = z.infer<typeof langSchema>;
export type MulmoBeat = z.infer<typeof mulmoBeatSchema>;
export type SpeakerDictonary = z.infer<typeof speakerDictionarySchema>;
export type MulmoSpeechParams = z.infer<typeof mulmoSpeechParamsSchema>;
export type SpeechOptions = z.infer<typeof speechOptionsSchema>;
export type MulmoImageParams = z.infer<typeof mulmoImageParamsSchema>;
export type TextSlideParams = z.infer<typeof textSlideParamsSchema>;
export type Text2ImageProvider = z.infer<typeof text2ImageProviderSchema>;
export type Text2MovieProvider = z.infer<typeof text2MovieProviderSchema>;
export type Text2SpeechProvider = z.infer<typeof text2SpeechProviderSchema>;
export type LocalizedText = z.infer<typeof localizedTextSchema>;
export type MulmoScript = z.infer<typeof mulmoScriptSchema>;
export type MulmoPresentationStyle = z.infer<typeof mulmoPresentationStyleSchema>;
export type MulmoCanvasDimension = z.infer<typeof mulmoCanvasDimensionSchema>;
export type MulmoStoryboardScene = z.infer<typeof mulmoStoryboardSceneSchema>;
export type MulmoStoryboard = z.infer<typeof mulmoStoryboardSchema>;
export type MulmoStudioBeat = z.infer<typeof mulmoStudioBeatSchema>;
export type MulmoMediaSource = z.infer<typeof mediaSourceSchema>;
export type MulmoStudio = z.infer<typeof mulmoStudioSchema>;
export type MulmoScriptTemplate = z.infer<typeof mulmoScriptTemplateSchema>;
export type MulmoStudioMultiLingual = z.infer<typeof mulmoStudioMultiLingualSchema>;
export type MulmoStudioMultiLingualData = z.infer<typeof mulmoStudioMultiLingualDataSchema>;
export type MultiLingualTexts = z.infer<typeof multiLingualTextsSchema>;
export type MulmoMovieParams = z.infer<typeof mulmoMovieParamsSchema>;

// images
export type MulmoTextSlideMedia = z.infer<typeof mulmoTextSlideMediaSchema>;
export type MulmoMarkdownMedia = z.infer<typeof mulmoMarkdownMediaSchema>;
export type MulmoImageMedia = z.infer<typeof mulmoImageMediaSchema>;
export type MulmoChartMedia = z.infer<typeof mulmoChartMediaSchema>;
export type MulmoMermaidMedia = z.infer<typeof mulmoMermaidMediaSchema>;

export type FileDirs = {
  mulmoFilePath: string;
  mulmoFileDirPath: string;

  baseDirPath: string;
  outDirPath: string;
  imageDirPath: string;
  audioDirPath: string;
};

export type MulmoStudioContext = {
  fileDirs: FileDirs;
  studio: MulmoStudio;
  lang?: string;
  force: boolean;
  caption?: string;
};

export type ScriptingParams = {
  urls: string[];
  outDirPath: string;
  cacheDirPath: string;
  templateName: string;
  filename: string;
  llm_model?: string;
  llm?: LLM;
};

export type ImageProcessorParams = {
  beat: MulmoBeat;
  context: MulmoStudioContext;
  imagePath: string;
  textSlideStyle: string;
  canvasSize: MulmoCanvasDimension;
};

export type PDFMode = (typeof pdf_modes)[number];
export type PDFSize = (typeof pdf_sizes)[number];

export type Text2ImageAgentInfo = {
  provider: Text2ImageProvider;
  agent: string;
  imageParams: MulmoImageParams;
};

export type Text2MovieAgentInfo = {
  provider: Text2MovieProvider;
  agent: string;
  movieParams: MulmoMovieParams;
};

export type BeatMediaType = "movie" | "image";

export type StoryToScriptGenerateMode = (typeof storyToScriptGenerateMode)[keyof typeof storyToScriptGenerateMode];
