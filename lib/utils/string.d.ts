export declare function splitIntoSentencesJa(paragraph: string, divider: string, minimum: number): string[];
export declare const recursiveSplitJa: (text: string) => string[];
interface Replacement {
    from: string;
    to: string;
}
export declare function replacePairsJa(str: string, replacements: Replacement[]): string;
export declare const replacementsJa: Replacement[];
export {};
