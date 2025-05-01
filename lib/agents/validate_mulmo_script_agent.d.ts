import type { AgentFunction, AgentFunctionInfo, DefaultConfigData } from "graphai";
import { MulmoScript } from "../types";
interface ValidateMulmoScriptInputs {
    text: string;
}
interface ValidateMulmoScriptResponse {
    isValid: boolean;
    data?: MulmoScript;
    error?: string;
}
/**
 * MulmoScript JSON validation agent
 * Validates if a JSON string conforms to the MulmoScript schema
 */
export declare const validateMulmoScriptAgent: AgentFunction<object, ValidateMulmoScriptResponse, ValidateMulmoScriptInputs, DefaultConfigData>;
declare const validateMulmoScriptAgentInfo: AgentFunctionInfo;
export default validateMulmoScriptAgentInfo;
