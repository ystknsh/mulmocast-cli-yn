import "dotenv/config";
import { ToolCliArgs } from "../../../../types/cli_types.js";
import { existsSync, createReadStream } from "fs";
import OpenAI from "openai";

export const handler = async (argv: ToolCliArgs<{ file: string }>) => {
  const { file } = argv;
  
  if (!existsSync(file)) {
    console.error(`Error: File '${file}' does not exist.`);
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
      file: createReadStream(file),
      model: "whisper-1",
      response_format: "verbose_json",
      timestamp_granularities: ["word", "segment"]
    });

    console.log("\n=== TRANSCRIPTION WITH TIMESTAMPS ===\n");
    console.log("Text:", transcription.text);
    
    if (transcription.segments) {
      console.log("\n=== SEGMENT-LEVEL TIMESTAMPS ===");
      transcription.segments.forEach((segment, index) => {
        console.log(`${index + 1}. [${segment.start}s - ${segment.end}s]: ${segment.text}`);
      });
    }

  } catch (error) {
    console.error("Error transcribing audio:", error);
    process.exit(1);
  }
};