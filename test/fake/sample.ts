import { generateMock } from "@anatine/zod-mock";
import { mulmoScriptSchema } from "../../src/types/schema.js";

const mockData = generateMock(mulmoScriptSchema);
console.log(mockData);
