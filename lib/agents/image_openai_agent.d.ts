import { AgentFunction, AgentFunctionInfo } from "graphai";
type OpenAIImageSize = "1792x1024" | "auto" | "1024x1024" | "1536x1024" | "1024x1536" | "256x256";
export declare const imageOpenaiAgent: AgentFunction<{
    apiKey: string;
    model: string;
    size: OpenAIImageSize | null | undefined;
}, {
    buffer: Buffer;
}, {
    prompt: string;
}>;
declare const imageOpenaiAgentInfo: AgentFunctionInfo;
export default imageOpenaiAgentInfo;
