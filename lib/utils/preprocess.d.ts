export declare const createOrUpdateStudioData: (mulmoFile: string, files: {
    outDirPath: string;
}) => {
    filename: string;
    beats: {
        text: string;
        speaker: string;
        duration?: number | undefined;
        filename?: string | undefined;
        image?: string | undefined;
        media?: {
            type: "markdown";
            markdown: string[];
        } | {
            type: "web";
            url: string;
        } | {
            type: "pdf";
            source: {
                url: string;
                kind: "url";
            } | {
                kind: "data";
                data: string;
            } | {
                filename: string;
                kind: "file";
            };
        } | {
            type: "image";
            source: {
                url: string;
                kind: "url";
            } | {
                kind: "data";
                data: string;
            } | {
                filename: string;
                kind: "file";
            };
        } | {
            type: "svg";
            source: {
                url: string;
                kind: "url";
            } | {
                kind: "data";
                data: string;
            } | {
                filename: string;
                kind: "file";
            };
        } | {
            type: "movie";
            source: {
                url: string;
                kind: "url";
            } | {
                kind: "data";
                data: string;
            } | {
                filename: string;
                kind: "file";
            };
        } | {
            type: "textSlide";
            slide: {
                title: string;
                bullets: string[];
            };
        } | undefined;
        imageParams?: {
            model?: string | undefined;
            size?: string | undefined;
            style?: string | undefined;
        } | undefined;
        speechParams?: {
            speed?: number | undefined;
            instruction?: string | undefined;
        } | undefined;
        textSlideParams?: {
            cssStyles: string[];
        } | undefined;
        imagePrompt?: string | undefined;
        multiLingualTexts?: Record<string, {
            text: string;
            lang: string;
            filename: string;
            texts?: string[] | undefined;
            ttsTexts?: string[] | undefined;
            duration?: number | undefined;
        }> | undefined;
        hash?: string | undefined;
    }[];
    script: {
        title: string;
        beats: {
            text: string;
            speaker: string;
            image?: string | undefined;
            media?: {
                type: "markdown";
                markdown: string[];
            } | {
                type: "web";
                url: string;
            } | {
                type: "pdf";
                source: {
                    url: string;
                    kind: "url";
                } | {
                    kind: "data";
                    data: string;
                } | {
                    filename: string;
                    kind: "file";
                };
            } | {
                type: "image";
                source: {
                    url: string;
                    kind: "url";
                } | {
                    kind: "data";
                    data: string;
                } | {
                    filename: string;
                    kind: "file";
                };
            } | {
                type: "svg";
                source: {
                    url: string;
                    kind: "url";
                } | {
                    kind: "data";
                    data: string;
                } | {
                    filename: string;
                    kind: "file";
                };
            } | {
                type: "movie";
                source: {
                    url: string;
                    kind: "url";
                } | {
                    kind: "data";
                    data: string;
                } | {
                    filename: string;
                    kind: "file";
                };
            } | {
                type: "textSlide";
                slide: {
                    title: string;
                    bullets: string[];
                };
            } | undefined;
            imageParams?: {
                model?: string | undefined;
                size?: string | undefined;
                style?: string | undefined;
            } | undefined;
            speechParams?: {
                speed?: number | undefined;
                instruction?: string | undefined;
            } | undefined;
            textSlideParams?: {
                cssStyles: string[];
            } | undefined;
            imagePrompt?: string | undefined;
        }[];
        lang?: string | undefined;
        imageParams?: {
            model?: string | undefined;
            size?: string | undefined;
            style?: string | undefined;
            provider?: string | undefined;
        } | undefined;
        speechParams?: {
            speakers: Record<string, {
                displayName: Record<string, string>;
                voiceId: string;
            }>;
            speed?: number | undefined;
            instruction?: string | undefined;
            provider?: string | undefined;
        } | undefined;
        textSlideParams?: {
            cssStyles: string[];
        } | undefined;
        description?: string | undefined;
        reference?: string | undefined;
        canvasSize?: {
            width: number;
            height: number;
        } | undefined;
        videoParams?: {
            padding?: number | undefined;
        } | undefined;
        imagePath?: string | undefined;
        omitCaptions?: boolean | undefined;
    };
};
