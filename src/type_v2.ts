type SPEAKER = string;
type LANG = string;

type LocalizedText = {
  text: string;
  lang: LANG;
  captions: string;
  ttsTexts: string;
};

// Beat Data
export type MulmoBeat = {
  speaker: SPEAKER;

  text: string;
  lang: LANG;
  multiLingualText: Record<LANG, LocalizedText>;

  // ttsText: string | undefined;
  instructions: string | undefined; // tts_options for open ai
  duration: number; // generated // video duration tine (ms)
  filename: string; // generated //

  // 
  imagePrompt: string | undefined; // inserted by LLM
  image: string | undefined; // path to the image
};


export type VoiceMap = Record<SPEAKER, string>;

// epsode
export type MulmoScript = {
  // global setting
  title: string;
  description: string;
  reference: string;

  // mulmoScript PageData
  // script: ScriptData[];
  beats: MulmoBeat[];

  // for tts
  tts: string | undefined; // default: openAI
  speakers: SPEAKER[] | undefined;
  voicemap: VoiceMap; // generated

  // for graph data
  voices: string[] | undefined;
  ttsAgent: string; // generated

  filename: string; // generated
  // imageInfo: any[]; // generated

  // for video and image
  aspectRatio: string | undefined; // "16:9" or "9:16" for movie and images
  images: ImageInfo[]; // generated
  imagePath: string | undefined; // for Keynote images movie ??
  omitCaptions: boolean | undefined; // default is false

  // for bgm
  padding: number | undefined; // for bgm
};
