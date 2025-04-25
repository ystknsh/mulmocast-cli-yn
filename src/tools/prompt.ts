import fs from "fs";
import path from "path";

const main = async () => {
  const basePath = path.resolve(__dirname + "/../../prompts/");
  const ret: Record<string, string> = {};
  fs.readdirSync(basePath).map((file) => {
    const key = file.split(".")[0];
    const content = fs.readFileSync(path.resolve(basePath) + "/" + file, "utf-8");
    ret[key] = content;
  });
  const code = `export const prompts = ${JSON.stringify(ret)};`;
  fs.writeFileSync(path.resolve(__dirname + "/../../src/agents/prompts_data.ts"), code, "utf8");

  // console.log(hoge);
};

main();
