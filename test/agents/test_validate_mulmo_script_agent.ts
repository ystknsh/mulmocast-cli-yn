import { validateMulmoScriptAgent } from "../../src/agents/validate_mulmo_script_agent";
import test from "node:test";
import assert from "node:assert";
import type { GraphAI } from "graphai";

const validMulmoScriptJson = JSON.stringify({
  $mulmocast: {
    version: "1.0",
    credit: "closing",
  },
  title: "Test Script",
  description: "MulmoScript for testing",
  reference: "None",
  lang: "ja",
  beats: [
    {
      speaker: "speaker1",
      text: "Hello, this is a test",
      media: {
        type: "image",
        source: {
          kind: "url",
          url: "https://example.com/test-image.jpg",
        },
      },
      imageParams: {
        model: "dall-e-3",
        size: "1024x1024",
      },
      speechOptions: {
        speed: 1.0,
        instruction: "Speak clearly",
      },
      imagePrompt: "A test image showing something interesting",
    },
  ],
  speechParams: {
    provider: "openai",
    speakers: {
      speaker1: {
        displayName: {
          ja: "スピーカー 1",
          en: "Speaker 1",
        },
        voiceId: "voice-123",
        speechOptions: {
          speed: 1.0,
          instruction: "Speak naturally",
        },
      },
    },
  },
  imageParams: {
    model: "dall-e-3",
    provider: "openai",
    size: "1792x1024",
    style: "natural",
  },
  imagePath: "images/",
  omitCaptions: false,
});

const invalidMulmoScriptJson = JSON.stringify({
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

test("validateMulmoScriptAgent with valid MulmoScript", async () => {
  const result = await validateMulmoScriptAgent({
    ...baseParams,
    namedInputs: { text: validMulmoScriptJson },
  });
  assert(result);
  assert(result.isValid === true);
  assert(result.data !== null);
});

test("validateMulmoScriptAgent with invalid MulmoScript", async () => {
  const result = await validateMulmoScriptAgent({
    ...baseParams,
    namedInputs: { text: invalidMulmoScriptJson },
  });

  assert(result);
  assert.strictEqual(result.isValid, false);
  assert.ok(result.error);
});
