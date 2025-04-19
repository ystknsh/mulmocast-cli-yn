import { splitIntoSentences, recursiveSplit } from "../src/split";
import { replacePairs, replacements } from "../src/fixtext";

import test from "node:test";
import assert from "node:assert";

const text = "あかさたなはまやらわ。東京特許許可局！今日はいい天気ですか？";

const scriptData = {
  speaker: "",
  text,
  ttsText: "",
  caption: "",
  instructions: "",
  duration: 1,
  filename: "",
  imagePrompt: "",
  imageIndex: 1,
};

const scriptData2 = {
  speaker: "",
  text: "あかさかさかす。スカイツリーかな！ハウアーユーってなに？",
  ttsText: "",
  caption: "",
  instructions: "",
  duration: 2,
  filename: "",
  imagePrompt: "",
  imageIndex: 2,
};

test("test splitIntoSentences", async () => {
  const ret = splitIntoSentences(text, "。", 7);
  assert.deepStrictEqual(ret, ["あかさたなはまやらわ。", "東京特許許可局！今日はいい天気ですか？"]);
});

test("test recursiveSplit", async () => {
  const ret = recursiveSplit([scriptData, scriptData2]);
  const expect = [
    {
      speaker: "",
      text: "あかさたなはまやらわ。",
      ttsText: "",
      caption: "",
      instructions: "",
      duration: 1,
      filename: "",
      imagePrompt: "",
      imageIndex: 1,
    },
    {
      speaker: "",
      text: "東京特許許可局！",
      ttsText: "",
      caption: "",
      instructions: "",
      duration: 1,
      filename: "",
      imagePrompt: "",
      imageIndex: 1,
    },
    {
      speaker: "",
      text: "今日はいい天気ですか？",
      ttsText: "",
      caption: "",
      instructions: "",
      duration: 1,
      filename: "",
      imagePrompt: "",
      imageIndex: 1,
    },
    {
      speaker: "",
      text: "あかさかさかす。",
      ttsText: "",
      caption: "",
      instructions: "",
      duration: 2,
      filename: "",
      imagePrompt: "",
      imageIndex: 2,
    },
    {
      speaker: "",
      text: "スカイツリーかな！",
      ttsText: "",
      caption: "",
      instructions: "",
      duration: 2,
      filename: "",
      imagePrompt: "",
      imageIndex: 2,
    },
    {
      speaker: "",
      text: "ハウアーユーってなに？",
      ttsText: "",
      caption: "",
      instructions: "",
      duration: 2,
      filename: "",
      imagePrompt: "",
      imageIndex: 2,
    },
  ];
  assert.deepStrictEqual(ret, expect);
});

test("test replacePairs", async () => {
  const caption = "AGIとOpenAIの危険な麺類について危険な面を話します";
  const expect = "エージーアイとオープンエーアイの危険な麺類について危険なめんを話します";
  const voice_text = replacePairs(caption, replacements);

  assert.equal(voice_text, expect);
  // console.log(voice_text);
});
