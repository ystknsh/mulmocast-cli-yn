# mulmo

A CLI tool for generating podcast and video content from script files. Automates the process of creating audio, images, and video from structured script files.

## Installation

```bash
npm install -g mulmo
```

You'll also need to install ffmpeg:
```bash
# For macOS with Homebrew
brew install ffmpeg

# For other platforms
# Visit https://ffmpeg.org/download.html
```

## Configuration

Create a `.env` file in your project directory with the following API keys:

```
OPENAI_API_KEY=your_openai_api_key
GOOGLE_PROJECT_ID=your_google_project_id # optional for movie, image generation
NIJIVOICE_API_KEY=your_nijivoice_api_key # optional for movie, audio generation
BROWSERLESS_API_TOKEN=your_browserless_api_token # optional for scripting from web content
```

## Workflow

1. Create a MulmoScript JSON file with `mulmo-tool scripting`
2. Generate audio with `mulmo audio`
3. Generate images with `mulmo images` 
4. Create final video with `mulmo movie`

## Generate MulmoScript

```bash
# Generate script from web content
mulmo-tool scripting -u https://example.com

# Generate script with interactive mode
mulmo-tool scripting -i
```

## Generate content from MulmoScript

Mulmo provides several commands to handle different aspects of content creation:

```bash
# Generate audio from script
mulmo audio -f script.json

# Generate images for script
mulmo images -f script.json

# Generate both audio and images, then combine into video
mulmo movie -f script.json

# Translate script to Japanese
mulmo translate -f script.json
```

## MulmoScript Format

MulmoScript is a JSON format to define podcast or video scripts:
schema: [./src/types/schema.ts](./src/types/schema.ts)


## Contributing

For developers interested in contributing to this project, please see [CONTRIBUTING.md](./CONTRIBUTING.md).
