import test from "node:test";
import assert from "node:assert";

import { script2Images } from "../src/split";
import { ScriptData } from "../src/type";

test("test script2Images", async () => {
  const scripts: ScriptData[] = [
    {
      speaker: "Guest",
      text: "",
      ttsText: "",
      instructions: "",
      duration: 1,
      filename: "",
      imagePrompt: "this is a pen",
      imageIndex: 1,
    },
    {
      speaker: "Guest",
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
      speaker: "Guest",
      text: "",
      ttsText: "",
      instructions: "",
      duration: 1,
      filename: "",
      imageIndex: 0,
    },
    {
      speaker: "Guest",
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
