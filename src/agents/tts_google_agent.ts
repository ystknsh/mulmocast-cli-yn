import { GraphAILogger } from "graphai";
import type { AgentFunction, AgentFunctionInfo } from "graphai";
import * as textToSpeech from '@google-cloud/text-to-speech';

const client = new textToSpeech.TextToSpeechClient();

export const ttsGoogleAgent: AgentFunction = async ({ namedInputs, params }) => {
  const { text } = namedInputs;
  const { apiKey, model, voice, suppressError, instructions } = params;

  console.info("*** DEBUG ***: ttsGoogleAgent", text);

  // Construct the voice request
  const voiceParams: textToSpeech.protos.google.cloud.texttospeech.v1.IVoiceSelectionParams = {
    languageCode: "en-US",
    ssmlGender: "FEMALE",
  };

// Construct the request
const request: textToSpeech.protos.google.cloud.texttospeech.v1.ISynthesizeSpeechRequest = {
  input: { text: text },
  voice: voiceParams,
  audioConfig: { 
    audioEncoding: 'MP3',
    speakingRate: 1.0
  },
};
try {
    // Call the Text-to-Speech API
    const [response] = await client.synthesizeSpeech(request);
    return { buffer: response.audioContent };
  } catch (e) {
    if (suppressError) {
      return {
        error: e,
      };
    }
    GraphAILogger.info(e);
    throw new Error("TTS Google Error");
  }
};

const ttsGoogleAgentInfo: AgentFunctionInfo = {
  name: "ttsGoogleAgent",
  agent: ttsGoogleAgent,
  mock: ttsGoogleAgent,
  samples: [],
  description: "Google TTS agent",
  category: ["tts"],
  author: "Receptron Team",
  repository: "https://github.com/receptron/graphai-agents/tree/main/tts/tts-openai-agent",
  license: "MIT",
  environmentVariables: ["OPENAI_API_KEY"],
};

export default ttsGoogleAgentInfo;
