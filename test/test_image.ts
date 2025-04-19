import test from "node:test";
import assert from "node:assert";

import { script2Images } from "../src/split";

test("test script2Images", async () => {
  const scripts = [
    {
      speaker: "",
      text: "",
      ttsText: "",
      instructions: "",
      duration: 1,
      filename: "",
      imagePrompt: "this is a pen",
      imageIndex: 1,
    },
    {
      speaker: "",
      text: "",
      ttsText: "",
      instructions: "",
      duration: 1,
      filename: "",
      imagePrompt: "this is an apple",
      imageIndex: 1,
    },
  ];
  const images = script2Images(scripts);
  const expect = [
    { imagePrompt: "this is a pen", index: 0, image: undefined },
    { imagePrompt: "this is an apple", index: 1, image: undefined },
  ];

  const expectScripts = [
    {
      speaker: "",
      text: "",
      ttsText: "",
      instructions: "",
      duration: 1,
      filename: "",
      imageIndex: 0,
    },
    {
      speaker: "",
      text: "",
      ttsText: "",
      instructions: "",
      duration: 1,
      filename: "",
      imageIndex: 1,
    },
  ];
  assert.deepStrictEqual(images, expect);
  assert.deepStrictEqual(scripts, expectScripts);
});
