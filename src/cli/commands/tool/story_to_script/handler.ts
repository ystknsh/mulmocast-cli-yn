import { ToolCliArgs } from "@/src/types/cli_types.js";
import { selectTemplate } from "@/src/utils/inquirer.js";
import { setGraphAILogger } from "@/src/cli/helpers.js";
import { storyToScript } from "@/src/tools/story_to_script.js";
import { mulmoStoryboardSchema } from "@/src/types/schema.js";
import { getBaseDirPath, getFullPath, readAndParseJson } from "@/src/utils/file.js";
import { outDirName } from "@/src/utils/const.js";

export const handler = async (
  argv: ToolCliArgs<{
    o?: string;
    b?: string;
    t?: string;
    s?: string;
    beats_per_scene?: number;
    file?: string;
  }>,
) => {
  const { v: verbose, s: filename, file, o: outdir, b: basedir, beats_per_scene } = argv;
  let { t: template } = argv;

  const baseDirPath = getBaseDirPath(basedir as string);
  const outDirPath = getFullPath(baseDirPath, (outdir as string) ?? outDirName);

  if (!template) {
    template = await selectTemplate();
  }

  setGraphAILogger(verbose, {
    outdir: outDirPath,
    basedir: baseDirPath,
    template,
    fileName: filename as string,
    beatsPerScene: beats_per_scene as number,
    storyFilePath: file as string,
  });

  const parsedStory = readAndParseJson(file as string, mulmoStoryboardSchema);
  await storyToScript({
    story: parsedStory,
    beatsPerScene: beats_per_scene as number,
    templateName: template,
    outdir: outDirPath,
    fileName: filename as string,
  });
};
