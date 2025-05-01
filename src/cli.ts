#!/usr/bin/env node

import "dotenv/config";
import path from "path";
import fs from "fs";
import { args } from "./args";

import { createOrUpdateStudioData } from "./utils/preprocess";

import { translate } from "./translate";
import { images } from "./images";
import { audio } from "./audio";

const main = async () => {
  const filePath = path.resolve(args.file as string);
  if (!fs.existsSync(filePath)) {
    console.error("File not exists");
    return -1;
  }

  // TODO some option process
  const { action } = args;
  const studio = createOrUpdateStudioData(filePath);
  // "translate", "audio", "images", "movie"

  if (action === "translate") {
    await translate(studio);
  }
  if (action === "audio") {
    await audio(studio, studio.script.speechParams?.provider === "nijivoice" ? 1 : 8);
  }
  if (action === "images") {
    await images(studio);
  }
};
main();
