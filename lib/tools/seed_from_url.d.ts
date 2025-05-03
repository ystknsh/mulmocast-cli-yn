import "dotenv/config";
export declare const createMulmoScriptFromUrl: ({ urls, template_name, outdir }: {
    urls: string[];
    outdir: string;
    template_name?: string;
}) => Promise<void>;
