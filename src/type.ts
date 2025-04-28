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

export type text2imageParams = {
  model?: string; // default: provider specific
  size?: string; // default: provider specific
  aspectRatio?: string; // default: "16:9"
  style?: string; // optional image style
};

export type text2speechParams = {
  speed?: number; // default 1.0
  instruction?: string;
};

// Beat Data
export type MulmoBeat = {
  speaker: SpeakerId;
  text: string;

  multiLingualTexts: MultiLingualTexts;

  media?: MulmoMedia;

  imageParams?: text2imageParams; // beat specific parameters
  speechParams?: text2speechParams;

  imagePrompt?: string; // specified or inserted by preprocessor
  image?: string; // path to the image

  filename: string; // generated
  duration?: number; // workaround
};

// export type VoiceMap = Record<SPEAKER, string>;

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

  // for text2speech
  speechParams?: text2speechParams & {
    provider?: string; // default openai
    speakers: SpeakerDictonary;
  };

  // for text2image
  imageParams?: text2imageParams & {
    provider?: string; // default: openAI
  };

  // images: ImageInfo[]; // generated
  imagePath?: string; // for Keynote images movie ??
  omitCaptions?: boolean; // default is false

  // for bgm
  padding?: number; // for bgm
};
