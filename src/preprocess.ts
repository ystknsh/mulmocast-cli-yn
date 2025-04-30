import { createOrUpdateStudioData } from "./utils/preprocess";

// for debug
const main = async () => {
  const arg2 = process.argv[2];
  const studio = createOrUpdateStudioData(arg2);
  console.log(studio);
};

main();
