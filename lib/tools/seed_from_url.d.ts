import "dotenv/config";
export declare const createMulmoScriptFromUrl: ({ urls, template_name, outdir, filename, }: {
    urls: string[];
    outdir: string;
    template_name?: string;
    filename: string;
}) => Promise<void>;
