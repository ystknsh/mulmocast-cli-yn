import { MulmoScript, mulmoScriptSchema } from "../types/index.js";

const validate_1_0 = (script: any): any => {
  console.log("*** validating script 1.0 ***");
  return script;
};

const validators = [
  { from: "1.0", to: "1.1", validator: validate_1_0 },
];

export const MulmoScriptMethods = {
  validate(script: any): MulmoScript {
    const validatedScript = validators.reduce((acc, validator) => {
      if (acc.$mulmocast.version === validator.from) {
        const validated = validator.validator(acc);
        validated.$mulmocast.version = validator.to;
        return validated;
      }
      return acc;
    }, script);
    return mulmoScriptSchema.parse(validatedScript);
  },
};
