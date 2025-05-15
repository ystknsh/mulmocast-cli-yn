import test from "node:test";
import assert from "node:assert";

import { getFileObject } from "../../src/cli/cli.js";

import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test("test getFileObject", async () => {
  const ret = getFileObject({ file: "hello.yaml" });
  assert.deepStrictEqual(ret, {
    baseDirPath: path.resolve(__dirname, "../../"),
    mulmoFilePath: path.resolve(__dirname, "../../hello.yaml"),
    mulmoFileDirPath: path.resolve(__dirname, "../../"),
    outDirPath: path.resolve(__dirname, "../../output/"),
    imageDirPath: path.resolve(__dirname, "../../output/images"),
    audioDirPath: path.resolve(__dirname, "../../output/audio"),
    outputStudioFilePath: path.resolve(__dirname, "../../output/hello_studio.json"),
    isHttpPath: false,
    fileName: "hello",
    fileOrUrl: "hello.yaml",
  });
});
