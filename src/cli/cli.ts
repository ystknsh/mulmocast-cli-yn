#!/usr/bin/env node

import "dotenv/config";
import fs from "fs";
import { args } from "./args";

import { createOrUpdateStudioData } from "../utils/preprocess";
import { outDirName, imageDirName, scratchpadDirName } from "../utils/const";
import { MulmoScriptMethods } from "../methods";

import { translate } from "../actions/translate";
import { images } from "../actions/images";
import { audio } from "../actions/audio";
import { movie } from "../actions/movie";

import { getBaseDirPath, getFullPath } from "../utils/file";
import { mulmoStudioSchema } from "../types/schema";

const getFileObject = () => {
  const { basedir, file, outdir, imagedir, scratchpaddir } = args;
  const baseDirPath = getBaseDirPath(basedir as string);

  const mulmoFilePath = getFullPath(baseDirPath, (file as string) ?? "");

  const outDirPath = getFullPath(baseDirPath, (outdir as string) ?? outDirName);
  const imageDirPath = getFullPath(baseDirPath, (imagedir as string) ?? imageDirName);
  const scratchpadDirPath = getFullPath(baseDirPath, (scratchpaddir as string) ?? scratchpadDirName);

  return { baseDirPath, mulmoFilePath, outDirPath, imageDirPath, scratchpadDirPath };
};
const main = async () => {
  const files = getFileObject();
  const { mulmoFilePath } = files;

  if (args.v) {
    console.log(files);
  }

  if (!fs.existsSync(mulmoFilePath)) {
    console.error("File not exists");
    return -1;
  }

    // TODO some option process
  const { action } = args;
  const studio = createOrUpdateStudioData(mulmoFilePath, files);

  // validate mulmoStudioSchema. skip if __test_invalid__ is true
  try {
    if (!studio.script?.__test_invalid__) {
      mulmoStudioSchema.parse(studio);
    }
  } catch (error) {
    console.error(`Error: invalid MulmoScript Schema: ${mulmoFilePath} \n ${error}`);
    return -1;
  }

  if (action === "translate") {
    await translate(studio, files);
  }
  if (action === "audio") {
    await audio(studio, files, MulmoScriptMethods.getSpeechProvider(studio.script) === "nijivoice" ? 1 : 8);
  }
  if (action === "images") {
    await images(studio, files);
  }
  if (action === "movie") {
    await audio(studio, files, MulmoScriptMethods.getSpeechProvider(studio.script) === "nijivoice" ? 1 : 8);
    await images(studio, files);
    await movie(studio, files);
  }
};
main();
