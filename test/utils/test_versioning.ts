import { getBaseDirPath, getFullPath } from "../../src/utils/file.js";

import test from "node:test";
import assert from "node:assert";
import { MulmoScriptMethods } from "../../src/methods/index.js";

test("validating versioning from 1.0", async () => {
  const input = {
    $mulmocast: {
      version: "1.0",
      credit: "closing",
    },
    speechParams: {
      provider: "nijivoice",
      speakers: {
        speaker1: {
          voiceId: "voice-123",
        },
        speaker2: {
          voiceId: "voice-456",
        },
        speaker3: {
          provider: "openai",
          voiceId: "voice-789",
        },
      },
    },
    beats: [
      {
        text: "Hello, world!",
      },
    ],
  };
  const expected = {
    $mulmocast: {
      version: "1.1",
      credit: "closing",
    },
    canvasSize: {
      height: 720,
      width: 1280,
    },
    imageParams: {
      images: {},
      provider: "openai",
    },
    movieParams: {
      provider: "replicate",
    },
    audioParams: {
      audioVolume: 1,
      bgmVolume: 0.2,
      closingPadding: 0.8,
      introPadding: 1,
      outroPadding: 1,
      padding: 0.3,
      suppressSpeech: false,
    },
    speechParams: {
      speakers: {
        speaker1: {
          provider: "nijivoice",
          voiceId: "voice-123",
        },
        speaker2: {
          provider: "nijivoice",
          voiceId: "voice-456",
        },
        speaker3: {
          provider: "openai",
          voiceId: "voice-789",
        },
      },
    },
    beats: [
      {
        text: "Hello, world!",
      },
    ],
  };
  const validated = MulmoScriptMethods.validate(input);
  assert.deepStrictEqual(validated, expected);
});
