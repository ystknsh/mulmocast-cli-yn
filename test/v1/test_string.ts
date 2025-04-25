import { splitIntoSentences, recursiveSplit } from "../../src/v1/split";
import { replacePairs, replacements } from "../../src/v1/fixtext";
import { separateText } from "../../src/v1/movie";
import { ScriptData } from "../../src/v1/type";

import test from "node:test";
import assert from "node:assert";

const text = "あかさたなはまやらわ。東京特許許可局！今日はいい天気ですか？";

const scriptData: ScriptData = {
  speaker: "Guest",
  text,
  ttsText: "",
  // caption: "",
  instructions: "",
  duration: 1,
  filename: "",
  imagePrompt: "",
  imageIndex: 1,
};

const scriptData2: ScriptData = {
  speaker: "Guest",
  text: "あかさかさかす。スカイツリーかな！ハウアーユーってなに？",
  ttsText: "",
  // caption: "",
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
      speaker: "Guest",
      text: "あかさたなはまやらわ。",
      ttsText: "",
      // caption: "",
      instructions: "",
      duration: 1,
      filename: "",
      imagePrompt: "",
      imageIndex: 1,
    },
    {
      speaker: "Guest",
      text: "東京特許許可局！",
      ttsText: "",
      // caption: "",
      instructions: "",
      duration: 1,
      filename: "",
      imagePrompt: "",
      imageIndex: 1,
    },
    {
      speaker: "Guest",
      text: "今日はいい天気ですか？",
      ttsText: "",
      // caption: "",
      instructions: "",
      duration: 1,
      filename: "",
      imagePrompt: "",
      imageIndex: 1,
    },
    {
      speaker: "Guest",
      text: "あかさかさかす。",
      ttsText: "",
      // caption: "",
      instructions: "",
      duration: 2,
      filename: "",
      imagePrompt: "",
      imageIndex: 2,
    },
    {
      speaker: "Guest",
      text: "スカイツリーかな！",
      ttsText: "",
      // caption: "",
      instructions: "",
      duration: 2,
      filename: "",
      imagePrompt: "",
      imageIndex: 2,
    },
    {
      speaker: "Guest",
      text: "ハウアーユーってなに？",
      ttsText: "",
      // caption: "",
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

test("test separateText", async () => {
  const fontSize = 48;
  const paddingX = fontSize * 2;
  const width = 720;
  const actualWidth = width - paddingX * 2;

  const text1 = "あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをん";
  const text2 = "あいうえお かきくけこ さしすせそ たちつてと なにぬねの はひふへほ まみむめも やゆよ らりるれろ わをん";

  const text3 = "いろはにほへとちりぬるをわかよたれそつねならむうゐのおくやまけふこえてあさきゆめみしゑひもせすん";
  const text4 = "いろはにほへと ちりぬるを わかよたれそ つねならむ うゐのおく やまけふこ えてあさき ゆめみし ゑひもせす ん";

  const expect1 = ["あいうえおかきくけこさ", "しすせそたちつてとなに", "ぬねのはひふへほまみむ", "めもやゆよらりるれろわ", "をん"];
  const expect2 = ["あいうえお かきくけこ ", "さしすせそ たちつてと ", "なにぬねの はひふへほ ", "まみむめも やゆよ らり", "るれろ わをん"];
  const expect3 = ["いろはにほへとちりぬる", "をわかよたれそつねなら", "むうゐのおくやまけふこ", "えてあさきゆめみしゑひ", "もせすん"];
  const expect4 = ["いろはにほへと ちりぬ", "るを わかよたれそ つね", "ならむ うゐのおく やま", "けふこ えてあさき ゆめ", "みし ゑひもせす ん"];

  const lines1 = separateText(text1, fontSize, actualWidth);
  assert.deepStrictEqual(lines1, expect1);

  const lines2 = separateText(text2, fontSize, actualWidth);
  assert.deepStrictEqual(lines2, expect2);

  const lines3 = separateText(text3, fontSize, actualWidth);
  assert.deepStrictEqual(lines3, expect3);

  const lines4 = separateText(text4, fontSize, actualWidth);
  assert.deepStrictEqual(lines4, expect4);
});
