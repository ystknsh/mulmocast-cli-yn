import type { Argv } from "yargs";
export declare const commonOptions: (yargs: Argv) => Argv<{
    v: boolean;
} & {
    o: string | undefined;
} & {
    b: string | undefined;
}>;
