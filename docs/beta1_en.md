# MulmoCast 0.1.x Beta Release Notes (English Version)

## Before You Begin

This document is intended for developers and creators who are familiar with Node.js and using the terminal.
We're also working on a more user-friendly app version—please stay tuned!

---

## Minimum Requirements

1. A computer running macOS (※Linux and Windows are currently untested)
2. A text editor (Visual Studio Code, Emacs, Vim, etc.)
3. Node.js and Homebrew (`brew`) must already be installed
4. A ChatGPT account (a free account is sufficient)
5. An OpenAI developer account (API access via pay-as-you-go plan)

---

## Environment Setup

### Required Steps

1. Install `mulmocast` globally:

   ```bash
   npm install -g mulmocast
   ```

2. Install `ffmpeg`:

   ```bash
   brew install ffmpeg
   ```

3. Visit [OpenAI API Keys page](https://platform.openai.com/settings/organization/api-keys) and retrieve your API key (`sk-XXXX` format)

4. Create a working folder and add a `.env` file with the following line:

   ```
   OPENAI_API_KEY=sk-XXXX
   ```

   ※Replace `sk-XXXX` with your actual API key.

### Recommended Steps (For High-Quality Image Generation)

5. Go to [OpenAI Settings > Organization > General](https://platform.openai.com/settings/organization/general) and complete the identity verification

6. After verification, add the following line to your `.env` file:

   ```
   DEFAULT_OPENAI_IMAGE_MODEL=gpt-image-1
   ```

---

## Creating Comic-Style Videos

MulmoCast is a tool for creating multi-modal content—from business presentations to podcasts. Let's begin by generating a comic-style video.

[![Watch Comic-Style Animation Example](./images/release_note_spotify_and_the_power_of_external_payments_thumnail.jpg)](https://youtu.be/VQVH1w7rY_M)
*Click the image to watch an example on YouTube*

### Basic Workflow

1. Copy the URL of the webpage you want to visualize

2. Open ChatGPT and instruct it to read the URL (e.g., `"Read this article: https://..."`)

3. Run the following command in your terminal:

   ```bash
   mulmo tool prompt -t comic_strips
   ```

   ※This will output a prompt and copy it to your clipboard.

4. Paste the prompt into ChatGPT and let it respond to it.

5. Once ChatGPT generates the script, click the copy button on the top-right corner of the script

6. Back in the terminal, run:

   ```bash
   mulmo movie __clipboard
   ```

   ※Note: Two underscores (`__`)

   Video generation will begin. It may take a few minutes depending on your machine. The output will be saved in the `output` folder like this:

   ```
   ./output
   ├── audio
   │   └── script_20250522_155403
   ├── images
   │   └── script_20250522_155403
   ├── script_20250522_155403_studio.json
   ├── script_20250522_155403.json
   ├── script_20250522_155403.mp3
   └── script_20250522_155403.mp4
   ```

---

## Creating Japanese-Language Videos

To generate Japanese-localized videos, use the following commands based on your filename (e.g., `script_20250522_155403`):

* **With Japanese subtitles:**

  ```bash
  mulmo movie output/script_20250522_155403.json -c ja
  ```

  → Output will have a `__ja` suffix (double underscore)

* **With Japanese voiceover:**

  ```bash
  mulmo movie script_20250522_155403.json -l ja
  ```

  → Output will have a `_ja` suffix (single underscore)

---

## Ghibli-Style Comic Videos

To generate a prompt for Ghibli-style visuals, run the following command in step 3 above:

```bash
mulmo prompt -t ghibli_strips
```

※Note: Image generation might fail due to OpenAI content policy violations if the visuals resemble copyrighted characters too closely.

---

## Business Presentation Videos

To generate business-style visuals, run the following command in step 3 above:

```bash
mulmo prompt -t business
```
