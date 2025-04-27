export type LANG = string;
type URLString = string;

export type LocalizedText = {
  text: string;
  lang: LANG;

  // captions: string;
  texts: string[];
  ttsTexts: string[];

  duration: number; // generated // video duration time (ms)
  filename: string; // generated //
};

export type MultiLingualTexts = Record<LANG, LocalizedText>;

type SpeakerId = string;
type SpeakerData = {
  displayName: Record<LANG, string>;
  voiceId: string;
};
export type SpeakerDictonary = Record<SpeakerId, SpeakerData>;

//
type MediaSource =
  | { kind: "url"; url: URLString } // https://example.com/foo.pdf
  | { kind: "data"; data: string } // base64
  | { kind: "file"; filename: string }; //

type MulmoMarkdownMedia = {
  type: "markdown";
  markdown: string;
};

type MulmoWebMedia = {
  type: "web";
  url: URLString;
};

type MulmoPdfMedia = {
  type: "pdf";
  source: MediaSource;
};

type MulmoImageMedia = {
  type: "image";
  source: MediaSource;
};

type MulmoSvgMedia = {
  type: "svg";
  source: MediaSource;
};

type MulmoMovieMedia = {
  type: "movie";
  source: MediaSource;
};

export type MulmoMedia = MulmoMarkdownMedia | MulmoWebMedia | MulmoPdfMedia | MulmoImageMedia | MulmoSvgMedia | MulmoMovieMedia;

// Beat Data
export type MulmoBeat = {
  speaker: SpeakerId;
  text: string;

  multiLingualTexts: MultiLingualTexts;

  media?: MulmoMedia;

  instructions: string | undefined; // tts_options for open ai

  imagePrompt: string | undefined; // specified or inserted by preprocessor
  image: string | undefined; // path to the image

  filename: string; // generated
  duration?: number; // workaround
};

// export type VoiceMap = Record<SPEAKER, string>;

export type text2imageParms = {
  model: string | undefined; // default: provider specific
  size: string | undefined; // default: provider specific
  aspectRatio: string | undefined; // default: "16:9"
  style: string | undefined; // optional image style
};

// epsode
export type MulmoScript = {
  // global setting
  title: string;
  description: string;
  reference: string;
  lang: LANG;

  filename: string; // generated

  // page/slide
  beats: MulmoBeat[];

  // for tts
  tts: string | undefined; // default: openAI
  speakers: SpeakerDictonary;

  // for image
  text2image: text2imageParms & {
    provider: string | undefined; // default: openAI
  };

  // images: ImageInfo[]; // generated
  imagePath: string | undefined; // for Keynote images movie ??
  omitCaptions: boolean | undefined; // default is false

  // for bgm
  padding: number | undefined; // for bgm
};
