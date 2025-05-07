# mulmocast

A CLI tool for generating podcast and video content from script files. Automates the process of creating audio, images, and video from structured script files.

## Installation

```bash
npm install -g mulmocast
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
mulmo-tool scripting -u https://example.com -t seed_materials

# Generate script with interactive mode
mulmo-tool scripting -i -t seed_interactive
```

## Generate content from MulmoScript

Mulmo provides several commands to handle different aspects of content creation:

```bash
# Generate audio from script
mulmo audio script.json

# Generate images for script
mulmo images script.json

# Generate both audio and images, then combine into video
mulmo movie script.json

# Translate script to Japanese
mulmo translate script.json
```

## MulmoScript Format

MulmoScript is a JSON format to define podcast or video scripts:
schema: [./src/types/schema.ts](./src/types/schema.ts)


## Contributing

For developers interested in contributing to this project, please see [CONTRIBUTING.md](./CONTRIBUTING.md).

## Help

CLI Usage

```
$ mulmo -h
mulmo <action> <file>

Run mulmocast

Positionals:
  action  action to perform
       [string] [choices: "translate", "audio", "images", "movie", "preprocess"]
  file    Mulmo Script File                                             [string]

Options:
      --version        Show version number                             [boolean]
  -v, --verbose        verbose log         [boolean] [required] [default: false]
  -o, --outdir         output dir                                       [string]
  -b, --basedir        base dir                                         [string]
  -s, --scratchpaddir  scratchpad dir                                   [string]
  -i, --imagedir       image dir                                        [string]
      --help           Show help                                       [boolean]

```

```
$ mulmo-tool -h

mulmo-tool <action>

Run mulmocast tool

Positionals:
  action  action to perform            [string] [choices: "scripting", "prompt"]

Options:
      --version      Show version number                               [boolean]
  -v, --verbose      verbose log           [boolean] [required] [default: false]
  -o, --outdir       output dir                                         [string]
  -b, --basedir      base dir                                           [string]
  -u, --url          URLs to reference (required when not in interactive mode)
                                                           [array] [default: []]
  -i, --interactive  Generate script in interactive mode with user prompts
                                                                       [boolean]
  -t, --template     Template name to use
   [string] [choices: "business", "children_book", "coding", "podcast_standard",
                                                              "sensei_and_taro"]
  -c, --cache        cache dir                                          [string]
  -f, --filename     output filename                [string] [default: "script"]
      --help         Show help                                         [boolean]
```
