import "dotenv/config";
import { ToolCliArgs } from "../../../../types/cli_types.js";
import { existsSync, createReadStream } from "fs";
import { resolve } from "path";
import OpenAI from "openai";

export const handler = async (argv: ToolCliArgs<{ file: string }>) => {
  const { file } = argv;
  const fullPath = resolve(file);
  
  console.log(`File path: ${fullPath}`);
  
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
      transcription.segments.forEach((segment, index) => {
        const duration = Math.round((segment.end - (index === 0 ? 0 : segment.start)) * 100) / 100;
        console.log(`${duration}: ${segment.text}`);
      });
    }
  } catch (error) {
    console.error("Error transcribing audio:", error);
    process.exit(1);
  }
};