import { AgentFunction, AgentFunctionInfo } from "graphai";
export type ImageGoogleConfig = {
    projectId?: string;
    token?: string;
};
export declare const imageGoogleAgent: AgentFunction<{
    model: string;
    aspectRatio: string;
}, {
    buffer: Buffer;
}, {
    prompt: string;
}, ImageGoogleConfig>;
declare const imageGoogleAgentInfo: AgentFunctionInfo;
export default imageGoogleAgentInfo;
