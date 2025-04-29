import fs from "fs";
import path from "path";

import test from "node:test";
import assert from "node:assert";

import { mulmoScriptSchema } from "../../src/schema";

test("test updateMultiLingualTexts not update", async () => {
  const jsonData = {};
  const basePath = path.resolve(__dirname + "/../../scripts/test/");
  fs.readdirSync(basePath).map((file) => {
    try {
      const content = fs.readFileSync(path.resolve(basePath) + "/" + file, "utf-8");
      const jsonData = JSON.parse(content);
      const parsed = mulmoScriptSchema.parse(jsonData);
    } catch (e) {
      console.error(file);
    }
  });
);
