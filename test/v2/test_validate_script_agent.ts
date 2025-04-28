import { validateScriptAgent } from "../../src/agents/validate_script_agent";
import test from "node:test";
import assert from "node:assert";
import type { GraphAI } from "graphai";

const validMulmoScriptJson = JSON.stringify({
  title: "Test Script",
  description: "MulmoScript for testing",
  reference: "None",
  lang: "ja",
  filename: "test.json",
  beats: [
    {
      speaker: "speaker1",
      text: "Hello, this is a test",
      multiLingualTexts: {
        ja: {
          text: "こんにちは、これはテストです",
          lang: "ja",
          texts: ["こんにちは、", "これはテストです"],
          ttsTexts: ["こんにちは、これはテストです"],
          duration: 2000,
          filename: "test_ja_001.mp3",
        },
      },
      filename: "test_001.mp3",
    },
  ],
  speakers: {
    speaker1: {
      displayName: {
        ja: "Speaker 1",
      },
      voiceId: "voice-123",
    },
  },
  text2image: {
    model: "dall-e-3",
    provider: "openai",
  },
});

const invalidMulmoScriptJson = JSON.stringify({
  title: "Incomplete Script",
  description: "Incomplete MulmoScript for testing",
  lang: "ja",
  beats: [],
});

const baseParams = {
  params: {},
  debugInfo: {
    verbose: false,
    nodeId: "",
    state: "",
    retry: 0,
    subGraphs: new Map<string, GraphAI>(),
  },
  filterParams: {},
};

test("validateScriptAgent with valid MulmoScript", async () => {
  const result = await validateScriptAgent({
    ...baseParams,
    namedInputs: { jsonString: validMulmoScriptJson },
  });
  assert(result);
  assert(result.isValid === true);
  assert(result.data !== null);
});

test("validateScriptAgent with invalid MulmoScript", async () => {
  const result = await validateScriptAgent({
    ...baseParams,
    namedInputs: { jsonString: invalidMulmoScriptJson },
  });

  assert(result);
  assert.strictEqual(result.isValid, false);
  assert.ok(result.error);
});
