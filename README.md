# mulmocast-cli

## Initialization

Install dependencies.

```
yarn install
brew install ffmpeg # Or install ffmpeg from https://ffmpeg.org/download.html
```

Create .env file.

```
OPENAI_API_KEY={your OpenAI key}
GOOGLE_PROJECT_ID={your Google Project ID}
NIJIVOICE_API_KEY={your Nijivoice API key}
```

## Quick Start

```
yarn run audio scripts/test/test_en.json
yarn run images scripts/test/test_en.json
yarn run movie scripts/test/test_en.json
```


## Create a podcast episode
1. Create a MulmoScript (use LLM)
   1. Feed some source text (ideas, news, press releases) to your favorite LLM.
   2. Ask the LLM to write a podcast script in JSON (refer to the contents of [prompts](./prompts) folder ).
   3. Create a JSON file with that generated JSON (such as [graphai_intro.json](./scripts/samples/graphai_intro.json))
2. Run ```yarn run audio {path to the script file}```.
3. The output will be generated in the `./output` folder.

## Create a video

1. Claudeを使って台本（MulmoScript）を作成
2. Youtubeライブ向けの縦動画であれば、その指示を追加（手作業）
3. 音声ファイルの作成（`yarn run audio {path to the script file}`を使って自動作成）
4. 画像ファイルの作成（`yarn run images {path to the script file}`を使って自動生成）
5. 映像ファイルの作成（`yarn run movie {path to the script file}`を使って自動生成）

# MulmoScript format

```JSON
{
  "title": "title of the podcast",
  "description": "The description of the podcast.",
  "reference": "URL to the source data", // optional
  "tts": "openAI", // or "nijivoice", default is "openAI"
  "speechParams": {
    "speakers": {
      "Host": {
        "voiceId": "shimmer",
        "displayName": {
          "en": "Host"
        }
      },
      "Guest": {
        "voiceId": "echo",
        "displayName": {
          "en": "Guest"
        }
      }
    }
  },
  "beats": [
    {
      "speaker": "Host",
      "text": "words from the host."
    },
    {
      "speaker": "Guest",
      "text": "words from the guest."
    },
    ...
  ]
}
```

## Translate the script into Japanese

Run ```yarn run translate {path to the script file}```

## Create a movie file with the Japanese script

Run ```yarn run movie {path to the script file}```
