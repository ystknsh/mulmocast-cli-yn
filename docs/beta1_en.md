Here's the English translation of your release note:

---

# MulmoCast 0.1.x/Beta: Release Note

## Minimum Requirements to Use the Beta Version

1. A computer running macOS (Linux and Windows are currently untested)
2. Familiarity with using the Terminal app
3. Ability to use a text editor (e.g., Visual Studio Code, Emacs)
4. `node` and `brew` already installed
5. A ChatGPT account (a free account is sufficient)
6. An OpenAI developer account (uses pay-as-you-go API access)

## Environment Setup

### Required Steps

1. Install MulmoCast via: `npm install -g mulmocast`
2. Install FFmpeg via: `brew install ffmpeg`
3. Obtain your API key from OpenAI’s [developer settings page](https://platform.openai.com/settings/organization/api-keys) (format: `sk-XXXX`)
4. Choose a working folder and create a file named `.env` inside it. Add the line `OPENAI_API_KEY=sk-XXXX` (replace XXXX with your actual API key)

### Recommended Steps (For Better Image Generation)

5. Visit [Settings/Organization/General](https://platform.openai.com/settings/organization/general) on the OpenAI platform and complete identity verification under the “Verification” section
6. After verification, add the line `DEFAULT_OPENAI_IMAGE_MODEL=gpt-image-1` to your `.env` file

## Creating Comic-Style Videos

### Basic Workflow

1. Copy the URL of the webpage you want to turn into a video
2. Start a new chat session in ChatGPT and ask it to read the article (e.g., “read this article, [https://...”](https://...”))
3. Switch to your terminal and run: `mulmo prompt -t comic_strips`
   (This will display the necessary prompt and automatically copy it to your clipboard)
4. Return to ChatGPT and paste the prompt
5. Wait for ChatGPT to generate the script, then click the copy button on the top right of the script box
6. Go back to the terminal and run: `mulmo movie __clipboard` (note: two underscores)

If your environment is correctly set up, this will begin video generation. It usually takes about 4 minutes.

The generated video will be placed in an `output` folder inside your working directory. The filename will look like `script_20250521_054059`, based on the creation timestamp.

## Creating a Japanese Version of the Video

To create a version with Japanese subtitles, use the filename generated above and run:

```bash
mulmo movie script_xxxxxxxx_xxxx.json -c ja
```

(This uses the filename generated in the previous step; it creates a file with a `__ja` suffix in the `output` folder)

To also generate a Japanese voiceover, run:

```bash
mulmo movie script_xxxxxxxx_xxxx.json -l ja
```

(This creates a file with a `_ja` suffix in the `output` folder)

## Creating Ghibli-Style Comic Videos

If you want to make a Ghibli-style comic video, in Step 3 of the basic workflow, run:

```bash
mulmo prompt -t ghibli_strips
```

This will generate a prompt tailored for Ghibli-style visuals.

**Note:** Due to OpenAI’s shifting content policies, Ghibli-style image generation may occasionally fail with a message saying it violates the content policy. Please be aware of this.
