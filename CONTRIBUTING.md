# mulmocast-cli

## Initialization

Install dependencies.

```
yarn install
brew install ffmpeg # Or install ffmpeg from https://ffmpeg.org/download.html
```

Create .env file.

```
OPENAI_API_KEY=your_openai_api_key
GOOGLE_PROJECT_ID=your_google_project_id # optional for movie, image generation
NIJIVOICE_API_KEY=your_nijivoice_api_key # optional for movie, audio generation
BROWSERLESS_API_TOKEN=your_browserless_api_token # optional for scripting from web content
```

## Quick Start
### Generate MulmoScript interactively
```bash
yarn run scripting -i -t seed_interactive
```

This will create a MulmoScript JSON file in the ⁠./output folder by default.

### Generate content using either approach:
- Option 1: Execute each step individually
  ```bash
  yarn run audio scripts/test/test_en.json
  yarn run images scripts/test/test_en.json
  yarn run movie scripts/test/test_en.json
  ```

- Option 2: Generate video in one go (this will process audio and images internally)

  ```bash
  yarn run movie scripts/test/test_en.json
  ```
 

## Create a podcast episode
1. Create a MulmoScript (LLMs are useful for this process)
   1. Feed some source text (ideas, news, press releases) to your favorite LLM.
   2. Ask the LLM to write a podcast script in MulmoScript JSON format (you can use the prompt examples in the [prompts](./prompts) folder as a reference).
   3. Save the generated script as a MulmoScript JSON file (such as [graphai_intro.json](./scripts/samples/graphai_intro.json))
2. Run ```yarn run audio {path to the script file}```.
3. The output will be generated in the `./output` folder.

## Create a video

1. Create a script (MulmoScript) using Claude or another LLM
2. If you need a vertical video for YouTube Live, add those instructions manually
3. Generate audio files using `yarn run audio {path to the script file}`
4. Generate image files using `yarn run images {path to the script file}`
5. Generate the final video file using `yarn run movie {path to the script file}`

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