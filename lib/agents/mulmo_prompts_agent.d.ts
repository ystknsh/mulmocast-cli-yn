import { AgentFunction, AgentFunctionInfo } from "graphai";
import { prompts } from "./prompts_data";
export declare const mulmoPromptsAgent: AgentFunction<{
    promptKey: keyof typeof prompts;
}>;
declare const mulmoPromptsAgentInfo: AgentFunctionInfo;
export default mulmoPromptsAgentInfo;
