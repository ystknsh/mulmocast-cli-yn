import { GraphAILogger } from "graphai";
import fs from "fs";
import { readMulmoScriptFile, fetchMulmoScriptFile } from "./file.js";
import type { MulmoStudio, MulmoScript, MulmoPresentationStyle, MulmoStudioMultiLingual } from "../types/type.js";
import { mulmoStudioSchema, mulmoCaptionParamsSchema } from "../types/index.js";
import { MulmoPresentationStyleMethods, MulmoScriptMethods } from "../methods/index.js";

import { mulmoPresentationStyleSchema, mulmoStudioMultiLingualSchema, FileObject } from "../types/index.js";

const rebuildStudio = (currentStudio: MulmoStudio | undefined, mulmoScript: MulmoScript, fileName: string) => {
  const isTest = process.env.NODE_ENV === "test";
  const parsed =
    isTest && currentStudio ? { data: mulmoStudioSchema.parse(currentStudio), success: true, error: null } : mulmoStudioSchema.safeParse(currentStudio);
  if (parsed.success) {
    return parsed.data;
  }
  if (currentStudio) {
    GraphAILogger.info("currentStudio is invalid", parsed.error);
  }
  // We need to parse it to fill default values
  return mulmoStudioSchema.parse({
    script: mulmoScript,
    filename: fileName,
    beats: [...Array(mulmoScript.beats.length)].map(() => ({})),
  });
};

const mulmoCredit = (speaker: string) => {
  return {
    speaker,
    text: "",
    image: {
      type: "image" as const,
      source: {
        kind: "url" as const,
        url: "https://github.com/receptron/mulmocast-cli/raw/refs/heads/main/assets/images/mulmocast_credit.png",
      },
    },
    audio: {
      type: "audio" as const,
      source: {
        kind: "url" as const,
        url: "https://github.com/receptron/mulmocast-cli/raw/refs/heads/main/assets/audio/silent300.mp3",
      },
    },
  };
};

export const createOrUpdateStudioData = (
  _mulmoScript: MulmoScript,
  currentStudio: MulmoStudio | undefined,
  fileName: string,
  videoCaptionLang?: string,
  presentationStyle?: MulmoPresentationStyle | null,
) => {
  const mulmoScript = _mulmoScript.__test_invalid__ ? _mulmoScript : MulmoScriptMethods.validate(_mulmoScript); // validate and insert default value

  const studio: MulmoStudio = rebuildStudio(currentStudio, mulmoScript, fileName);

  // TODO: Move this code out of this function later
  // Addition cloing credit
  if (mulmoScript.$mulmocast.credit === "closing") {
    const defaultSpeaker = MulmoPresentationStyleMethods.getDefaultSpeaker(presentationStyle ?? studio.script);
    mulmoScript.beats.push(mulmoCredit(mulmoScript.beats[0].speaker ?? defaultSpeaker)); // First speaker
  }

  studio.script = MulmoScriptMethods.validate(mulmoScript); // update the script
  studio.beats = studio.script.beats.map((_, index) => studio.beats[index] ?? {});

  if (videoCaptionLang) {
    studio.script.captionParams = mulmoCaptionParamsSchema.parse({
      ...(studio.script.captionParams ?? {}),
      lang: videoCaptionLang,
    });
  }

  return studio;
};

export const fetchScript = async (isHttpPath: boolean, mulmoFilePath: string, fileOrUrl: string): Promise<MulmoScript | null> => {
  if (isHttpPath) {
    const res = await fetchMulmoScriptFile(fileOrUrl);
    if (!res.result || !res.script) {
      GraphAILogger.info(`ERROR: HTTP error! ${res.status} ${fileOrUrl}`);
      return null;
    }
    return res.script;
  }
  if (!fs.existsSync(mulmoFilePath)) {
    GraphAILogger.info(`ERROR: File not exists ${mulmoFilePath}`);
    return null;
  }
  return readMulmoScriptFile<MulmoScript>(mulmoFilePath, "ERROR: File does not exist " + mulmoFilePath)?.mulmoData ?? null;
};

export const getMultiLingual = (multilingualFilePath: string, studioBeatsLength: number): MulmoStudioMultiLingual => {
  if (fs.existsSync(multilingualFilePath)) {
    const jsonData =
      readMulmoScriptFile<MulmoStudioMultiLingual>(multilingualFilePath, "ERROR: File does not exist " + multilingualFilePath)?.mulmoData ?? null;
    const dataSet = mulmoStudioMultiLingualSchema.parse(jsonData);
    while (dataSet.length < studioBeatsLength) {
      dataSet.push({ multiLingualTexts: {} });
    }
    dataSet.length = studioBeatsLength;
    return dataSet;
  }
  return [...Array(studioBeatsLength)].map(() => ({ multiLingualTexts: {} }));
};

export const getPresentationStyle = (presentationStylePath: string | undefined): MulmoPresentationStyle | null => {
  if (presentationStylePath) {
    if (!fs.existsSync(presentationStylePath)) {
      throw new Error(`ERROR: File not exists ${presentationStylePath}`);
    }
    const jsonData =
      readMulmoScriptFile<MulmoPresentationStyle>(presentationStylePath, "ERROR: File does not exist " + presentationStylePath)?.mulmoData ?? null;
    return mulmoPresentationStyleSchema.parse(jsonData);
  }
  return null;
};

const initSessionState = () => {
  return {
    inSession: {
      audio: false,
      image: false,
      video: false,
      multiLingual: false,
      caption: false,
      pdf: false,
    },
    inBeatSession: {
      audio: {},
      image: {},
      movie: {},
      multiLingual: {},
      caption: {},
      html: {},
      imageReference: {},
      soundEffect: {},
      lipSync: {},
    },
  };
};

const buildContext = (
  studio: MulmoStudio,
  files: FileObject,
  presentationStyle: MulmoPresentationStyle | null,
  multiLingual: MulmoStudioMultiLingual,
  force?: boolean,
  targetLang?: string,
) => {
  return {
    studio,
    fileDirs: files,
    force: Boolean(force),
    lang: targetLang ?? studio.script.lang, // This lang is target Language. studio.lang is default Language
    sessionState: initSessionState(),
    presentationStyle: presentationStyle ?? studio.script,
    multiLingual,
  };
};

export const initializeContextFromFiles = async (files: FileObject, raiseError: boolean, force?: boolean, captionLang?: string, targetLang?: string) => {
  const { fileName, isHttpPath, fileOrUrl, mulmoFilePath, outputStudioFilePath, presentationStylePath, outputMultilingualFilePath } = files;

  // read mulmoScript, presentationStyle, currentStudio from files
  const mulmoScript = await fetchScript(isHttpPath, mulmoFilePath, fileOrUrl);
  if (!mulmoScript) {
    return null;
  }
  const presentationStyle = getPresentationStyle(presentationStylePath);
  // Create or update MulmoStudio file with MulmoScript
  const currentStudio = readMulmoScriptFile<MulmoStudio>(outputStudioFilePath);

  try {
    // validate mulmoStudioSchema. skip if __test_invalid__ is true
    const studio = createOrUpdateStudioData(mulmoScript, currentStudio?.mulmoData, fileName, captionLang, presentationStyle);
    const multiLingual = getMultiLingual(outputMultilingualFilePath, studio.beats.length);

    return buildContext(studio, files, presentationStyle, multiLingual, force, targetLang);
  } catch (error) {
    GraphAILogger.info(`Error: invalid MulmoScript Schema: ${isHttpPath ? fileOrUrl : mulmoFilePath} \n ${error}`);
    if (raiseError) {
      throw error;
    }
    return null;
  }
};
