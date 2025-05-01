#!/usr/bin/env node

import "dotenv/config";
import path from "path";
import fs from "fs";
import { args } from "./args";

import { createOrUpdateStudioData } from "./utils/preprocess";
import { translate } from "./translate";

const main = async () => {
  const filePath = path.resolve(args.file as string);
  if (!fs.existsSync(filePath)) {
    console.error("File not exists");
    return -1;
  }

  // TODO some option process
  const { action } = args;
  const studio = createOrUpdateStudioData(filePath);
  // "translate", "audio", "image", "movie"

  if (action === "translate") {
    await translate(studio);
  }
  // console.log("hello");
};
main();
