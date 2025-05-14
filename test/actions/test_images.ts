import test from "node:test";
// import assert from "node:assert";

import { getFileObject } from "../../src/cli/cli.js";
import { createOrUpdateStudioData } from "../../src/utils/preprocess.js";
import { images } from "../../src/actions/images.js";

import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test("test images", async () => {
  // const fileDirs = getFileObject({ file: "hello.yaml", basedir: __dirname });
  const fileDirs = getFileObject({ file: "hello.yaml" });
  const mulmoScript = {
    $mulmocast: {
      version: "1.0",
      credit: "closing",
    },
    title: "MASAI: A Modular Future for Software Engineering AI",
    description: "Exploring MASAI, a modular approach for AI agents in software engineering that revolutionizes how complex coding issues are tackled.",
    beats: [
      {
        text: "",
        image: {
          type: "image",
          source: {
            kind: "path",
            path: "../../assets/images/mulmocast_credit.png",
          },
        },
      },
    ],
  };
  const studio = createOrUpdateStudioData(mulmoScript, "hello", fileDirs);
  const context = {
    studio,
    fileDirs,
    force: false,
  };
  await images(context);
});
