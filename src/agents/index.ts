import addBGMAgent from "./add_bgm_agent";
import combineAudioFilesAgent from "./combine_audio_files_agent";
import imageGoogleAgent from "./image_google_agent";
import imageOpenaiAgent from "./image_openai_agent";
import mulmoPromptsAgent from "./mulmo_prompts_agent";
import ttsNijivoiceAgent from "./tts_nijivoice_agent";
import ttsOpenaiAgent from "./tts_openai_agent";
import validateMulmoScriptAgent from "./validate_mulmo_script_agent";

import { browserlessAgent } from "@graphai/browserless_agent";
import { textInputAgent } from "@graphai/input_agents";

import { openAIAgent } from "@graphai/openai_agent";
// import * as vanilla from "@graphai/vanilla";
import { fileWriteAgent } from "@graphai/vanilla_node_agents";

export {
  openAIAgent,
  fileWriteAgent,
  browserlessAgent,
  textInputAgent,
  addBGMAgent,
  combineAudioFilesAgent,
  imageGoogleAgent,
  imageOpenaiAgent,
  mulmoPromptsAgent,
  ttsNijivoiceAgent,
  ttsOpenaiAgent,
  validateMulmoScriptAgent,
};
