import "dotenv/config";
import { ToolCliArgs } from "../../../../types/cli_types.js";
import { existsSync, createReadStream, writeFileSync, mkdirSync } from "fs";
import { resolve, basename, extname, join } from "path";
import OpenAI from "openai";
import { MulmoScript } from "../../../../types/index.js";

const script: MulmoScript = {
  $mulmocast: {
    version: "1.1",
    credit: "closing",
  },
  canvasSize: {
    width: 1536,
    height: 1024,
  },
  lang: "en",
  title: "Music Video",
  audioParams: {
    bgm: {
      kind: "path",
      path: "to_be_filled.mp3",
    },
    padding: 0.0,
    introPadding: 0.0,
    closingPadding: 0.0,
    outroPadding: 0.0,
    bgmVolume: 1.0,
    audioVolume: 1.0,
    suppressSpeech: true,
  },
  beats: [],
}

export const handler = async (argv: ToolCliArgs<{ file: string }>) => {
  const { file } = argv;
  const fullPath = resolve(file);
  const filename = basename(file, extname(file));
  
  console.log(`File path: ${fullPath}`);
  console.log(`Filename: ${filename}`);
  
  if (!existsSync(fullPath)) {
    console.error(`Error: File '${fullPath}' does not exist.`);
    process.exit(1);
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error("Error: OPENAI_API_KEY environment variable is required");
    process.exit(1);
  }

  try {
    const openai = new OpenAI({ apiKey });
    
    console.log(`Transcribing audio file: ${file}`);
    
    const transcription = await openai.audio.transcriptions.create({
      file: createReadStream(fullPath),
      model: "whisper-1",
      response_format: "verbose_json",
      timestamp_granularities: ["word", "segment"]
    });

    if (transcription.segments) {
      script.beats = transcription.segments.map((segment, index) => {
        const duration = Math.round((segment.end - (index === 0 ? 0 : segment.start)) * 100) / 100;
        return {
          text: segment.text,
          duration: duration,
        }
      });
    }

    // Save script to output directory
    const outputDir = "output";
    if (!existsSync(outputDir)) {
      mkdirSync(outputDir, { recursive: true });
    }
    
    const outputPath = join(outputDir, `${filename}.json`);
    writeFileSync(outputPath, JSON.stringify(script, null, 2));
    console.log(`Script saved to: ${outputPath}`);

  } catch (error) {
    console.error("Error transcribing audio:", error);
    process.exit(1);
  }
};