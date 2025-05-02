import { z } from "zod";
export declare const langSchema: z.ZodString;
export declare const localizedTextSchema: z.ZodObject<{
    text: z.ZodString;
    lang: z.ZodString;
    texts: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    ttsTexts: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    duration: z.ZodOptional<z.ZodNumber>;
    filename: z.ZodString;
}, "strip", z.ZodTypeAny, {
    text: string;
    lang: string;
    filename: string;
    texts?: string[] | undefined;
    ttsTexts?: string[] | undefined;
    duration?: number | undefined;
}, {
    text: string;
    lang: string;
    filename: string;
    texts?: string[] | undefined;
    ttsTexts?: string[] | undefined;
    duration?: number | undefined;
}>;
export declare const multiLingualTextsSchema: z.ZodRecord<z.ZodString, z.ZodObject<{
    text: z.ZodString;
    lang: z.ZodString;
    texts: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    ttsTexts: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    duration: z.ZodOptional<z.ZodNumber>;
    filename: z.ZodString;
}, "strip", z.ZodTypeAny, {
    text: string;
    lang: string;
    filename: string;
    texts?: string[] | undefined;
    ttsTexts?: string[] | undefined;
    duration?: number | undefined;
}, {
    text: string;
    lang: string;
    filename: string;
    texts?: string[] | undefined;
    ttsTexts?: string[] | undefined;
    duration?: number | undefined;
}>>;
export declare const speakerDictionarySchema: z.ZodRecord<z.ZodString, z.ZodObject<{
    displayName: z.ZodRecord<z.ZodString, z.ZodString>;
    voiceId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    displayName: Record<string, string>;
    voiceId: string;
}, {
    displayName: Record<string, string>;
    voiceId: string;
}>>;
export declare const mulmoMediaSchema: z.ZodUnion<[z.ZodObject<{
    type: z.ZodLiteral<"markdown">;
    markdown: z.ZodString;
}, "strip", z.ZodTypeAny, {
    type: "markdown";
    markdown: string;
}, {
    type: "markdown";
    markdown: string;
}>, z.ZodObject<{
    type: z.ZodLiteral<"web">;
    url: z.ZodString;
}, "strip", z.ZodTypeAny, {
    type: "web";
    url: string;
}, {
    type: "web";
    url: string;
}>, z.ZodObject<{
    type: z.ZodLiteral<"pdf">;
    source: z.ZodDiscriminatedUnion<"kind", [z.ZodObject<{
        kind: z.ZodLiteral<"url">;
        url: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        url: string;
        kind: "url";
    }, {
        url: string;
        kind: "url";
    }>, z.ZodObject<{
        kind: z.ZodLiteral<"data">;
        data: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        kind: "data";
        data: string;
    }, {
        kind: "data";
        data: string;
    }>, z.ZodObject<{
        kind: z.ZodLiteral<"file">;
        filename: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        filename: string;
        kind: "file";
    }, {
        filename: string;
        kind: "file";
    }>]>;
}, "strip", z.ZodTypeAny, {
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
}, {
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
}>, z.ZodObject<{
    type: z.ZodLiteral<"image">;
    source: z.ZodDiscriminatedUnion<"kind", [z.ZodObject<{
        kind: z.ZodLiteral<"url">;
        url: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        url: string;
        kind: "url";
    }, {
        url: string;
        kind: "url";
    }>, z.ZodObject<{
        kind: z.ZodLiteral<"data">;
        data: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        kind: "data";
        data: string;
    }, {
        kind: "data";
        data: string;
    }>, z.ZodObject<{
        kind: z.ZodLiteral<"file">;
        filename: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        filename: string;
        kind: "file";
    }, {
        filename: string;
        kind: "file";
    }>]>;
}, "strip", z.ZodTypeAny, {
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
}, {
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
}>, z.ZodObject<{
    type: z.ZodLiteral<"svg">;
    source: z.ZodDiscriminatedUnion<"kind", [z.ZodObject<{
        kind: z.ZodLiteral<"url">;
        url: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        url: string;
        kind: "url";
    }, {
        url: string;
        kind: "url";
    }>, z.ZodObject<{
        kind: z.ZodLiteral<"data">;
        data: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        kind: "data";
        data: string;
    }, {
        kind: "data";
        data: string;
    }>, z.ZodObject<{
        kind: z.ZodLiteral<"file">;
        filename: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        filename: string;
        kind: "file";
    }, {
        filename: string;
        kind: "file";
    }>]>;
}, "strip", z.ZodTypeAny, {
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
}, {
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
}>, z.ZodObject<{
    type: z.ZodLiteral<"movie">;
    source: z.ZodDiscriminatedUnion<"kind", [z.ZodObject<{
        kind: z.ZodLiteral<"url">;
        url: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        url: string;
        kind: "url";
    }, {
        url: string;
        kind: "url";
    }>, z.ZodObject<{
        kind: z.ZodLiteral<"data">;
        data: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        kind: "data";
        data: string;
    }, {
        kind: "data";
        data: string;
    }>, z.ZodObject<{
        kind: z.ZodLiteral<"file">;
        filename: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        filename: string;
        kind: "file";
    }, {
        filename: string;
        kind: "file";
    }>]>;
}, "strip", z.ZodTypeAny, {
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
}, {
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
}>, z.ZodObject<{
    type: z.ZodLiteral<"textSlide">;
    slide: z.ZodObject<{
        title: z.ZodString;
        bullets: z.ZodArray<z.ZodString, "many">;
    }, "strip", z.ZodTypeAny, {
        title: string;
        bullets: string[];
    }, {
        title: string;
        bullets: string[];
    }>;
}, "strip", z.ZodTypeAny, {
    type: "textSlide";
    slide: {
        title: string;
        bullets: string[];
    };
}, {
    type: "textSlide";
    slide: {
        title: string;
        bullets: string[];
    };
}>]>;
export declare const text2imageParamsSchema: z.ZodObject<{
    model: z.ZodOptional<z.ZodString>;
    size: z.ZodOptional<z.ZodString>;
    style: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    model?: string | undefined;
    size?: string | undefined;
    style?: string | undefined;
}, {
    model?: string | undefined;
    size?: string | undefined;
    style?: string | undefined;
}>;
export declare const text2speechParamsSchema: z.ZodObject<{
    speed: z.ZodOptional<z.ZodNumber>;
    instruction: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    speed?: number | undefined;
    instruction?: string | undefined;
}, {
    speed?: number | undefined;
    instruction?: string | undefined;
}>;
export declare const textSlideParamsSchema: z.ZodObject<{
    cssStyles: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    cssStyles: string[];
}, {
    cssStyles: string[];
}>;
export declare const videoParamsSchema: z.ZodObject<{
    padding: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    padding?: number | undefined;
}, {
    padding?: number | undefined;
}>;
export declare const mulmoBeatSchema: z.ZodObject<{
    speaker: z.ZodString;
    text: z.ZodString;
    media: z.ZodOptional<z.ZodUnion<[z.ZodObject<{
        type: z.ZodLiteral<"markdown">;
        markdown: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        type: "markdown";
        markdown: string;
    }, {
        type: "markdown";
        markdown: string;
    }>, z.ZodObject<{
        type: z.ZodLiteral<"web">;
        url: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        type: "web";
        url: string;
    }, {
        type: "web";
        url: string;
    }>, z.ZodObject<{
        type: z.ZodLiteral<"pdf">;
        source: z.ZodDiscriminatedUnion<"kind", [z.ZodObject<{
            kind: z.ZodLiteral<"url">;
            url: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            url: string;
            kind: "url";
        }, {
            url: string;
            kind: "url";
        }>, z.ZodObject<{
            kind: z.ZodLiteral<"data">;
            data: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            kind: "data";
            data: string;
        }, {
            kind: "data";
            data: string;
        }>, z.ZodObject<{
            kind: z.ZodLiteral<"file">;
            filename: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            filename: string;
            kind: "file";
        }, {
            filename: string;
            kind: "file";
        }>]>;
    }, "strip", z.ZodTypeAny, {
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
    }, {
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
    }>, z.ZodObject<{
        type: z.ZodLiteral<"image">;
        source: z.ZodDiscriminatedUnion<"kind", [z.ZodObject<{
            kind: z.ZodLiteral<"url">;
            url: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            url: string;
            kind: "url";
        }, {
            url: string;
            kind: "url";
        }>, z.ZodObject<{
            kind: z.ZodLiteral<"data">;
            data: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            kind: "data";
            data: string;
        }, {
            kind: "data";
            data: string;
        }>, z.ZodObject<{
            kind: z.ZodLiteral<"file">;
            filename: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            filename: string;
            kind: "file";
        }, {
            filename: string;
            kind: "file";
        }>]>;
    }, "strip", z.ZodTypeAny, {
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
    }, {
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
    }>, z.ZodObject<{
        type: z.ZodLiteral<"svg">;
        source: z.ZodDiscriminatedUnion<"kind", [z.ZodObject<{
            kind: z.ZodLiteral<"url">;
            url: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            url: string;
            kind: "url";
        }, {
            url: string;
            kind: "url";
        }>, z.ZodObject<{
            kind: z.ZodLiteral<"data">;
            data: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            kind: "data";
            data: string;
        }, {
            kind: "data";
            data: string;
        }>, z.ZodObject<{
            kind: z.ZodLiteral<"file">;
            filename: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            filename: string;
            kind: "file";
        }, {
            filename: string;
            kind: "file";
        }>]>;
    }, "strip", z.ZodTypeAny, {
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
    }, {
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
    }>, z.ZodObject<{
        type: z.ZodLiteral<"movie">;
        source: z.ZodDiscriminatedUnion<"kind", [z.ZodObject<{
            kind: z.ZodLiteral<"url">;
            url: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            url: string;
            kind: "url";
        }, {
            url: string;
            kind: "url";
        }>, z.ZodObject<{
            kind: z.ZodLiteral<"data">;
            data: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            kind: "data";
            data: string;
        }, {
            kind: "data";
            data: string;
        }>, z.ZodObject<{
            kind: z.ZodLiteral<"file">;
            filename: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            filename: string;
            kind: "file";
        }, {
            filename: string;
            kind: "file";
        }>]>;
    }, "strip", z.ZodTypeAny, {
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
    }, {
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
    }>, z.ZodObject<{
        type: z.ZodLiteral<"textSlide">;
        slide: z.ZodObject<{
            title: z.ZodString;
            bullets: z.ZodArray<z.ZodString, "many">;
        }, "strip", z.ZodTypeAny, {
            title: string;
            bullets: string[];
        }, {
            title: string;
            bullets: string[];
        }>;
    }, "strip", z.ZodTypeAny, {
        type: "textSlide";
        slide: {
            title: string;
            bullets: string[];
        };
    }, {
        type: "textSlide";
        slide: {
            title: string;
            bullets: string[];
        };
    }>]>>;
    imageParams: z.ZodOptional<z.ZodObject<{
        model: z.ZodOptional<z.ZodString>;
        size: z.ZodOptional<z.ZodString>;
        style: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        model?: string | undefined;
        size?: string | undefined;
        style?: string | undefined;
    }, {
        model?: string | undefined;
        size?: string | undefined;
        style?: string | undefined;
    }>>;
    speechParams: z.ZodOptional<z.ZodObject<{
        speed: z.ZodOptional<z.ZodNumber>;
        instruction: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        speed?: number | undefined;
        instruction?: string | undefined;
    }, {
        speed?: number | undefined;
        instruction?: string | undefined;
    }>>;
    imagePrompt: z.ZodOptional<z.ZodString>;
    image: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    text: string;
    speaker: string;
    image?: string | undefined;
    media?: {
        type: "markdown";
        markdown: string;
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
    imagePrompt?: string | undefined;
}, {
    text: string;
    speaker: string;
    image?: string | undefined;
    media?: {
        type: "markdown";
        markdown: string;
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
    imagePrompt?: string | undefined;
}>;
export declare const mulmoDimensionSchema: z.ZodObject<{
    width: z.ZodNumber;
    height: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    width: number;
    height: number;
}, {
    width: number;
    height: number;
}>;
export declare const mulmoScriptSchema: z.ZodObject<{
    title: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    reference: z.ZodOptional<z.ZodString>;
    lang: z.ZodOptional<z.ZodString>;
    canvasSize: z.ZodOptional<z.ZodObject<{
        width: z.ZodNumber;
        height: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        width: number;
        height: number;
    }, {
        width: number;
        height: number;
    }>>;
    beats: z.ZodArray<z.ZodObject<{
        speaker: z.ZodString;
        text: z.ZodString;
        media: z.ZodOptional<z.ZodUnion<[z.ZodObject<{
            type: z.ZodLiteral<"markdown">;
            markdown: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            type: "markdown";
            markdown: string;
        }, {
            type: "markdown";
            markdown: string;
        }>, z.ZodObject<{
            type: z.ZodLiteral<"web">;
            url: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            type: "web";
            url: string;
        }, {
            type: "web";
            url: string;
        }>, z.ZodObject<{
            type: z.ZodLiteral<"pdf">;
            source: z.ZodDiscriminatedUnion<"kind", [z.ZodObject<{
                kind: z.ZodLiteral<"url">;
                url: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                url: string;
                kind: "url";
            }, {
                url: string;
                kind: "url";
            }>, z.ZodObject<{
                kind: z.ZodLiteral<"data">;
                data: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                kind: "data";
                data: string;
            }, {
                kind: "data";
                data: string;
            }>, z.ZodObject<{
                kind: z.ZodLiteral<"file">;
                filename: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                filename: string;
                kind: "file";
            }, {
                filename: string;
                kind: "file";
            }>]>;
        }, "strip", z.ZodTypeAny, {
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
        }, {
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
        }>, z.ZodObject<{
            type: z.ZodLiteral<"image">;
            source: z.ZodDiscriminatedUnion<"kind", [z.ZodObject<{
                kind: z.ZodLiteral<"url">;
                url: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                url: string;
                kind: "url";
            }, {
                url: string;
                kind: "url";
            }>, z.ZodObject<{
                kind: z.ZodLiteral<"data">;
                data: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                kind: "data";
                data: string;
            }, {
                kind: "data";
                data: string;
            }>, z.ZodObject<{
                kind: z.ZodLiteral<"file">;
                filename: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                filename: string;
                kind: "file";
            }, {
                filename: string;
                kind: "file";
            }>]>;
        }, "strip", z.ZodTypeAny, {
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
        }, {
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
        }>, z.ZodObject<{
            type: z.ZodLiteral<"svg">;
            source: z.ZodDiscriminatedUnion<"kind", [z.ZodObject<{
                kind: z.ZodLiteral<"url">;
                url: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                url: string;
                kind: "url";
            }, {
                url: string;
                kind: "url";
            }>, z.ZodObject<{
                kind: z.ZodLiteral<"data">;
                data: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                kind: "data";
                data: string;
            }, {
                kind: "data";
                data: string;
            }>, z.ZodObject<{
                kind: z.ZodLiteral<"file">;
                filename: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                filename: string;
                kind: "file";
            }, {
                filename: string;
                kind: "file";
            }>]>;
        }, "strip", z.ZodTypeAny, {
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
        }, {
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
        }>, z.ZodObject<{
            type: z.ZodLiteral<"movie">;
            source: z.ZodDiscriminatedUnion<"kind", [z.ZodObject<{
                kind: z.ZodLiteral<"url">;
                url: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                url: string;
                kind: "url";
            }, {
                url: string;
                kind: "url";
            }>, z.ZodObject<{
                kind: z.ZodLiteral<"data">;
                data: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                kind: "data";
                data: string;
            }, {
                kind: "data";
                data: string;
            }>, z.ZodObject<{
                kind: z.ZodLiteral<"file">;
                filename: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                filename: string;
                kind: "file";
            }, {
                filename: string;
                kind: "file";
            }>]>;
        }, "strip", z.ZodTypeAny, {
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
        }, {
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
        }>, z.ZodObject<{
            type: z.ZodLiteral<"textSlide">;
            slide: z.ZodObject<{
                title: z.ZodString;
                bullets: z.ZodArray<z.ZodString, "many">;
            }, "strip", z.ZodTypeAny, {
                title: string;
                bullets: string[];
            }, {
                title: string;
                bullets: string[];
            }>;
        }, "strip", z.ZodTypeAny, {
            type: "textSlide";
            slide: {
                title: string;
                bullets: string[];
            };
        }, {
            type: "textSlide";
            slide: {
                title: string;
                bullets: string[];
            };
        }>]>>;
        imageParams: z.ZodOptional<z.ZodObject<{
            model: z.ZodOptional<z.ZodString>;
            size: z.ZodOptional<z.ZodString>;
            style: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            model?: string | undefined;
            size?: string | undefined;
            style?: string | undefined;
        }, {
            model?: string | undefined;
            size?: string | undefined;
            style?: string | undefined;
        }>>;
        speechParams: z.ZodOptional<z.ZodObject<{
            speed: z.ZodOptional<z.ZodNumber>;
            instruction: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            speed?: number | undefined;
            instruction?: string | undefined;
        }, {
            speed?: number | undefined;
            instruction?: string | undefined;
        }>>;
        imagePrompt: z.ZodOptional<z.ZodString>;
        image: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        text: string;
        speaker: string;
        image?: string | undefined;
        media?: {
            type: "markdown";
            markdown: string;
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
        imagePrompt?: string | undefined;
    }, {
        text: string;
        speaker: string;
        image?: string | undefined;
        media?: {
            type: "markdown";
            markdown: string;
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
        imagePrompt?: string | undefined;
    }>, "many">;
    speechParams: z.ZodOptional<z.ZodObject<{
        speed: z.ZodOptional<z.ZodNumber>;
        instruction: z.ZodOptional<z.ZodString>;
    } & {
        provider: z.ZodOptional<z.ZodString>;
        speakers: z.ZodRecord<z.ZodString, z.ZodObject<{
            displayName: z.ZodRecord<z.ZodString, z.ZodString>;
            voiceId: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            displayName: Record<string, string>;
            voiceId: string;
        }, {
            displayName: Record<string, string>;
            voiceId: string;
        }>>;
    }, "strip", z.ZodTypeAny, {
        speakers: Record<string, {
            displayName: Record<string, string>;
            voiceId: string;
        }>;
        speed?: number | undefined;
        instruction?: string | undefined;
        provider?: string | undefined;
    }, {
        speakers: Record<string, {
            displayName: Record<string, string>;
            voiceId: string;
        }>;
        speed?: number | undefined;
        instruction?: string | undefined;
        provider?: string | undefined;
    }>>;
    imageParams: z.ZodOptional<z.ZodObject<{
        model: z.ZodOptional<z.ZodString>;
        size: z.ZodOptional<z.ZodString>;
        style: z.ZodOptional<z.ZodString>;
    } & {
        provider: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        model?: string | undefined;
        size?: string | undefined;
        style?: string | undefined;
        provider?: string | undefined;
    }, {
        model?: string | undefined;
        size?: string | undefined;
        style?: string | undefined;
        provider?: string | undefined;
    }>>;
    textSlideParams: z.ZodOptional<z.ZodObject<{
        cssStyles: z.ZodArray<z.ZodString, "many">;
    }, "strip", z.ZodTypeAny, {
        cssStyles: string[];
    }, {
        cssStyles: string[];
    }>>;
    videoParams: z.ZodOptional<z.ZodObject<{
        padding: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        padding?: number | undefined;
    }, {
        padding?: number | undefined;
    }>>;
    imagePath: z.ZodOptional<z.ZodString>;
    omitCaptions: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    title: string;
    beats: {
        text: string;
        speaker: string;
        image?: string | undefined;
        media?: {
            type: "markdown";
            markdown: string;
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
    description?: string | undefined;
    reference?: string | undefined;
    canvasSize?: {
        width: number;
        height: number;
    } | undefined;
    textSlideParams?: {
        cssStyles: string[];
    } | undefined;
    videoParams?: {
        padding?: number | undefined;
    } | undefined;
    imagePath?: string | undefined;
    omitCaptions?: boolean | undefined;
}, {
    title: string;
    beats: {
        text: string;
        speaker: string;
        image?: string | undefined;
        media?: {
            type: "markdown";
            markdown: string;
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
    description?: string | undefined;
    reference?: string | undefined;
    canvasSize?: {
        width: number;
        height: number;
    } | undefined;
    textSlideParams?: {
        cssStyles: string[];
    } | undefined;
    videoParams?: {
        padding?: number | undefined;
    } | undefined;
    imagePath?: string | undefined;
    omitCaptions?: boolean | undefined;
}>;
export declare const mulmoStudioBeatSchema: z.ZodObject<{
    speaker: z.ZodString;
    text: z.ZodString;
    media: z.ZodOptional<z.ZodUnion<[z.ZodObject<{
        type: z.ZodLiteral<"markdown">;
        markdown: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        type: "markdown";
        markdown: string;
    }, {
        type: "markdown";
        markdown: string;
    }>, z.ZodObject<{
        type: z.ZodLiteral<"web">;
        url: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        type: "web";
        url: string;
    }, {
        type: "web";
        url: string;
    }>, z.ZodObject<{
        type: z.ZodLiteral<"pdf">;
        source: z.ZodDiscriminatedUnion<"kind", [z.ZodObject<{
            kind: z.ZodLiteral<"url">;
            url: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            url: string;
            kind: "url";
        }, {
            url: string;
            kind: "url";
        }>, z.ZodObject<{
            kind: z.ZodLiteral<"data">;
            data: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            kind: "data";
            data: string;
        }, {
            kind: "data";
            data: string;
        }>, z.ZodObject<{
            kind: z.ZodLiteral<"file">;
            filename: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            filename: string;
            kind: "file";
        }, {
            filename: string;
            kind: "file";
        }>]>;
    }, "strip", z.ZodTypeAny, {
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
    }, {
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
    }>, z.ZodObject<{
        type: z.ZodLiteral<"image">;
        source: z.ZodDiscriminatedUnion<"kind", [z.ZodObject<{
            kind: z.ZodLiteral<"url">;
            url: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            url: string;
            kind: "url";
        }, {
            url: string;
            kind: "url";
        }>, z.ZodObject<{
            kind: z.ZodLiteral<"data">;
            data: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            kind: "data";
            data: string;
        }, {
            kind: "data";
            data: string;
        }>, z.ZodObject<{
            kind: z.ZodLiteral<"file">;
            filename: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            filename: string;
            kind: "file";
        }, {
            filename: string;
            kind: "file";
        }>]>;
    }, "strip", z.ZodTypeAny, {
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
    }, {
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
    }>, z.ZodObject<{
        type: z.ZodLiteral<"svg">;
        source: z.ZodDiscriminatedUnion<"kind", [z.ZodObject<{
            kind: z.ZodLiteral<"url">;
            url: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            url: string;
            kind: "url";
        }, {
            url: string;
            kind: "url";
        }>, z.ZodObject<{
            kind: z.ZodLiteral<"data">;
            data: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            kind: "data";
            data: string;
        }, {
            kind: "data";
            data: string;
        }>, z.ZodObject<{
            kind: z.ZodLiteral<"file">;
            filename: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            filename: string;
            kind: "file";
        }, {
            filename: string;
            kind: "file";
        }>]>;
    }, "strip", z.ZodTypeAny, {
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
    }, {
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
    }>, z.ZodObject<{
        type: z.ZodLiteral<"movie">;
        source: z.ZodDiscriminatedUnion<"kind", [z.ZodObject<{
            kind: z.ZodLiteral<"url">;
            url: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            url: string;
            kind: "url";
        }, {
            url: string;
            kind: "url";
        }>, z.ZodObject<{
            kind: z.ZodLiteral<"data">;
            data: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            kind: "data";
            data: string;
        }, {
            kind: "data";
            data: string;
        }>, z.ZodObject<{
            kind: z.ZodLiteral<"file">;
            filename: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            filename: string;
            kind: "file";
        }, {
            filename: string;
            kind: "file";
        }>]>;
    }, "strip", z.ZodTypeAny, {
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
    }, {
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
    }>, z.ZodObject<{
        type: z.ZodLiteral<"textSlide">;
        slide: z.ZodObject<{
            title: z.ZodString;
            bullets: z.ZodArray<z.ZodString, "many">;
        }, "strip", z.ZodTypeAny, {
            title: string;
            bullets: string[];
        }, {
            title: string;
            bullets: string[];
        }>;
    }, "strip", z.ZodTypeAny, {
        type: "textSlide";
        slide: {
            title: string;
            bullets: string[];
        };
    }, {
        type: "textSlide";
        slide: {
            title: string;
            bullets: string[];
        };
    }>]>>;
    imageParams: z.ZodOptional<z.ZodObject<{
        model: z.ZodOptional<z.ZodString>;
        size: z.ZodOptional<z.ZodString>;
        style: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        model?: string | undefined;
        size?: string | undefined;
        style?: string | undefined;
    }, {
        model?: string | undefined;
        size?: string | undefined;
        style?: string | undefined;
    }>>;
    speechParams: z.ZodOptional<z.ZodObject<{
        speed: z.ZodOptional<z.ZodNumber>;
        instruction: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        speed?: number | undefined;
        instruction?: string | undefined;
    }, {
        speed?: number | undefined;
        instruction?: string | undefined;
    }>>;
    imagePrompt: z.ZodOptional<z.ZodString>;
    image: z.ZodOptional<z.ZodString>;
} & {
    multiLingualTexts: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodObject<{
        text: z.ZodString;
        lang: z.ZodString;
        texts: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        ttsTexts: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        duration: z.ZodOptional<z.ZodNumber>;
        filename: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        text: string;
        lang: string;
        filename: string;
        texts?: string[] | undefined;
        ttsTexts?: string[] | undefined;
        duration?: number | undefined;
    }, {
        text: string;
        lang: string;
        filename: string;
        texts?: string[] | undefined;
        ttsTexts?: string[] | undefined;
        duration?: number | undefined;
    }>>>;
    hash: z.ZodOptional<z.ZodString>;
    duration: z.ZodOptional<z.ZodNumber>;
    filename: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    text: string;
    speaker: string;
    duration?: number | undefined;
    filename?: string | undefined;
    image?: string | undefined;
    media?: {
        type: "markdown";
        markdown: string;
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
}, {
    text: string;
    speaker: string;
    duration?: number | undefined;
    filename?: string | undefined;
    image?: string | undefined;
    media?: {
        type: "markdown";
        markdown: string;
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
}>;
export declare const mulmoStudioSchema: z.ZodObject<{
    script: z.ZodObject<{
        title: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
        reference: z.ZodOptional<z.ZodString>;
        lang: z.ZodOptional<z.ZodString>;
        canvasSize: z.ZodOptional<z.ZodObject<{
            width: z.ZodNumber;
            height: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            width: number;
            height: number;
        }, {
            width: number;
            height: number;
        }>>;
        beats: z.ZodArray<z.ZodObject<{
            speaker: z.ZodString;
            text: z.ZodString;
            media: z.ZodOptional<z.ZodUnion<[z.ZodObject<{
                type: z.ZodLiteral<"markdown">;
                markdown: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                type: "markdown";
                markdown: string;
            }, {
                type: "markdown";
                markdown: string;
            }>, z.ZodObject<{
                type: z.ZodLiteral<"web">;
                url: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                type: "web";
                url: string;
            }, {
                type: "web";
                url: string;
            }>, z.ZodObject<{
                type: z.ZodLiteral<"pdf">;
                source: z.ZodDiscriminatedUnion<"kind", [z.ZodObject<{
                    kind: z.ZodLiteral<"url">;
                    url: z.ZodString;
                }, "strip", z.ZodTypeAny, {
                    url: string;
                    kind: "url";
                }, {
                    url: string;
                    kind: "url";
                }>, z.ZodObject<{
                    kind: z.ZodLiteral<"data">;
                    data: z.ZodString;
                }, "strip", z.ZodTypeAny, {
                    kind: "data";
                    data: string;
                }, {
                    kind: "data";
                    data: string;
                }>, z.ZodObject<{
                    kind: z.ZodLiteral<"file">;
                    filename: z.ZodString;
                }, "strip", z.ZodTypeAny, {
                    filename: string;
                    kind: "file";
                }, {
                    filename: string;
                    kind: "file";
                }>]>;
            }, "strip", z.ZodTypeAny, {
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
            }, {
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
            }>, z.ZodObject<{
                type: z.ZodLiteral<"image">;
                source: z.ZodDiscriminatedUnion<"kind", [z.ZodObject<{
                    kind: z.ZodLiteral<"url">;
                    url: z.ZodString;
                }, "strip", z.ZodTypeAny, {
                    url: string;
                    kind: "url";
                }, {
                    url: string;
                    kind: "url";
                }>, z.ZodObject<{
                    kind: z.ZodLiteral<"data">;
                    data: z.ZodString;
                }, "strip", z.ZodTypeAny, {
                    kind: "data";
                    data: string;
                }, {
                    kind: "data";
                    data: string;
                }>, z.ZodObject<{
                    kind: z.ZodLiteral<"file">;
                    filename: z.ZodString;
                }, "strip", z.ZodTypeAny, {
                    filename: string;
                    kind: "file";
                }, {
                    filename: string;
                    kind: "file";
                }>]>;
            }, "strip", z.ZodTypeAny, {
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
            }, {
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
            }>, z.ZodObject<{
                type: z.ZodLiteral<"svg">;
                source: z.ZodDiscriminatedUnion<"kind", [z.ZodObject<{
                    kind: z.ZodLiteral<"url">;
                    url: z.ZodString;
                }, "strip", z.ZodTypeAny, {
                    url: string;
                    kind: "url";
                }, {
                    url: string;
                    kind: "url";
                }>, z.ZodObject<{
                    kind: z.ZodLiteral<"data">;
                    data: z.ZodString;
                }, "strip", z.ZodTypeAny, {
                    kind: "data";
                    data: string;
                }, {
                    kind: "data";
                    data: string;
                }>, z.ZodObject<{
                    kind: z.ZodLiteral<"file">;
                    filename: z.ZodString;
                }, "strip", z.ZodTypeAny, {
                    filename: string;
                    kind: "file";
                }, {
                    filename: string;
                    kind: "file";
                }>]>;
            }, "strip", z.ZodTypeAny, {
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
            }, {
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
            }>, z.ZodObject<{
                type: z.ZodLiteral<"movie">;
                source: z.ZodDiscriminatedUnion<"kind", [z.ZodObject<{
                    kind: z.ZodLiteral<"url">;
                    url: z.ZodString;
                }, "strip", z.ZodTypeAny, {
                    url: string;
                    kind: "url";
                }, {
                    url: string;
                    kind: "url";
                }>, z.ZodObject<{
                    kind: z.ZodLiteral<"data">;
                    data: z.ZodString;
                }, "strip", z.ZodTypeAny, {
                    kind: "data";
                    data: string;
                }, {
                    kind: "data";
                    data: string;
                }>, z.ZodObject<{
                    kind: z.ZodLiteral<"file">;
                    filename: z.ZodString;
                }, "strip", z.ZodTypeAny, {
                    filename: string;
                    kind: "file";
                }, {
                    filename: string;
                    kind: "file";
                }>]>;
            }, "strip", z.ZodTypeAny, {
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
            }, {
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
            }>, z.ZodObject<{
                type: z.ZodLiteral<"textSlide">;
                slide: z.ZodObject<{
                    title: z.ZodString;
                    bullets: z.ZodArray<z.ZodString, "many">;
                }, "strip", z.ZodTypeAny, {
                    title: string;
                    bullets: string[];
                }, {
                    title: string;
                    bullets: string[];
                }>;
            }, "strip", z.ZodTypeAny, {
                type: "textSlide";
                slide: {
                    title: string;
                    bullets: string[];
                };
            }, {
                type: "textSlide";
                slide: {
                    title: string;
                    bullets: string[];
                };
            }>]>>;
            imageParams: z.ZodOptional<z.ZodObject<{
                model: z.ZodOptional<z.ZodString>;
                size: z.ZodOptional<z.ZodString>;
                style: z.ZodOptional<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                model?: string | undefined;
                size?: string | undefined;
                style?: string | undefined;
            }, {
                model?: string | undefined;
                size?: string | undefined;
                style?: string | undefined;
            }>>;
            speechParams: z.ZodOptional<z.ZodObject<{
                speed: z.ZodOptional<z.ZodNumber>;
                instruction: z.ZodOptional<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                speed?: number | undefined;
                instruction?: string | undefined;
            }, {
                speed?: number | undefined;
                instruction?: string | undefined;
            }>>;
            imagePrompt: z.ZodOptional<z.ZodString>;
            image: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            text: string;
            speaker: string;
            image?: string | undefined;
            media?: {
                type: "markdown";
                markdown: string;
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
            imagePrompt?: string | undefined;
        }, {
            text: string;
            speaker: string;
            image?: string | undefined;
            media?: {
                type: "markdown";
                markdown: string;
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
            imagePrompt?: string | undefined;
        }>, "many">;
        speechParams: z.ZodOptional<z.ZodObject<{
            speed: z.ZodOptional<z.ZodNumber>;
            instruction: z.ZodOptional<z.ZodString>;
        } & {
            provider: z.ZodOptional<z.ZodString>;
            speakers: z.ZodRecord<z.ZodString, z.ZodObject<{
                displayName: z.ZodRecord<z.ZodString, z.ZodString>;
                voiceId: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                displayName: Record<string, string>;
                voiceId: string;
            }, {
                displayName: Record<string, string>;
                voiceId: string;
            }>>;
        }, "strip", z.ZodTypeAny, {
            speakers: Record<string, {
                displayName: Record<string, string>;
                voiceId: string;
            }>;
            speed?: number | undefined;
            instruction?: string | undefined;
            provider?: string | undefined;
        }, {
            speakers: Record<string, {
                displayName: Record<string, string>;
                voiceId: string;
            }>;
            speed?: number | undefined;
            instruction?: string | undefined;
            provider?: string | undefined;
        }>>;
        imageParams: z.ZodOptional<z.ZodObject<{
            model: z.ZodOptional<z.ZodString>;
            size: z.ZodOptional<z.ZodString>;
            style: z.ZodOptional<z.ZodString>;
        } & {
            provider: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            model?: string | undefined;
            size?: string | undefined;
            style?: string | undefined;
            provider?: string | undefined;
        }, {
            model?: string | undefined;
            size?: string | undefined;
            style?: string | undefined;
            provider?: string | undefined;
        }>>;
        textSlideParams: z.ZodOptional<z.ZodObject<{
            cssStyles: z.ZodArray<z.ZodString, "many">;
        }, "strip", z.ZodTypeAny, {
            cssStyles: string[];
        }, {
            cssStyles: string[];
        }>>;
        videoParams: z.ZodOptional<z.ZodObject<{
            padding: z.ZodOptional<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            padding?: number | undefined;
        }, {
            padding?: number | undefined;
        }>>;
        imagePath: z.ZodOptional<z.ZodString>;
        omitCaptions: z.ZodOptional<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        title: string;
        beats: {
            text: string;
            speaker: string;
            image?: string | undefined;
            media?: {
                type: "markdown";
                markdown: string;
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
        description?: string | undefined;
        reference?: string | undefined;
        canvasSize?: {
            width: number;
            height: number;
        } | undefined;
        textSlideParams?: {
            cssStyles: string[];
        } | undefined;
        videoParams?: {
            padding?: number | undefined;
        } | undefined;
        imagePath?: string | undefined;
        omitCaptions?: boolean | undefined;
    }, {
        title: string;
        beats: {
            text: string;
            speaker: string;
            image?: string | undefined;
            media?: {
                type: "markdown";
                markdown: string;
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
        description?: string | undefined;
        reference?: string | undefined;
        canvasSize?: {
            width: number;
            height: number;
        } | undefined;
        textSlideParams?: {
            cssStyles: string[];
        } | undefined;
        videoParams?: {
            padding?: number | undefined;
        } | undefined;
        imagePath?: string | undefined;
        omitCaptions?: boolean | undefined;
    }>;
    filename: z.ZodString;
    beats: z.ZodArray<z.ZodObject<{
        speaker: z.ZodString;
        text: z.ZodString;
        media: z.ZodOptional<z.ZodUnion<[z.ZodObject<{
            type: z.ZodLiteral<"markdown">;
            markdown: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            type: "markdown";
            markdown: string;
        }, {
            type: "markdown";
            markdown: string;
        }>, z.ZodObject<{
            type: z.ZodLiteral<"web">;
            url: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            type: "web";
            url: string;
        }, {
            type: "web";
            url: string;
        }>, z.ZodObject<{
            type: z.ZodLiteral<"pdf">;
            source: z.ZodDiscriminatedUnion<"kind", [z.ZodObject<{
                kind: z.ZodLiteral<"url">;
                url: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                url: string;
                kind: "url";
            }, {
                url: string;
                kind: "url";
            }>, z.ZodObject<{
                kind: z.ZodLiteral<"data">;
                data: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                kind: "data";
                data: string;
            }, {
                kind: "data";
                data: string;
            }>, z.ZodObject<{
                kind: z.ZodLiteral<"file">;
                filename: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                filename: string;
                kind: "file";
            }, {
                filename: string;
                kind: "file";
            }>]>;
        }, "strip", z.ZodTypeAny, {
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
        }, {
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
        }>, z.ZodObject<{
            type: z.ZodLiteral<"image">;
            source: z.ZodDiscriminatedUnion<"kind", [z.ZodObject<{
                kind: z.ZodLiteral<"url">;
                url: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                url: string;
                kind: "url";
            }, {
                url: string;
                kind: "url";
            }>, z.ZodObject<{
                kind: z.ZodLiteral<"data">;
                data: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                kind: "data";
                data: string;
            }, {
                kind: "data";
                data: string;
            }>, z.ZodObject<{
                kind: z.ZodLiteral<"file">;
                filename: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                filename: string;
                kind: "file";
            }, {
                filename: string;
                kind: "file";
            }>]>;
        }, "strip", z.ZodTypeAny, {
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
        }, {
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
        }>, z.ZodObject<{
            type: z.ZodLiteral<"svg">;
            source: z.ZodDiscriminatedUnion<"kind", [z.ZodObject<{
                kind: z.ZodLiteral<"url">;
                url: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                url: string;
                kind: "url";
            }, {
                url: string;
                kind: "url";
            }>, z.ZodObject<{
                kind: z.ZodLiteral<"data">;
                data: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                kind: "data";
                data: string;
            }, {
                kind: "data";
                data: string;
            }>, z.ZodObject<{
                kind: z.ZodLiteral<"file">;
                filename: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                filename: string;
                kind: "file";
            }, {
                filename: string;
                kind: "file";
            }>]>;
        }, "strip", z.ZodTypeAny, {
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
        }, {
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
        }>, z.ZodObject<{
            type: z.ZodLiteral<"movie">;
            source: z.ZodDiscriminatedUnion<"kind", [z.ZodObject<{
                kind: z.ZodLiteral<"url">;
                url: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                url: string;
                kind: "url";
            }, {
                url: string;
                kind: "url";
            }>, z.ZodObject<{
                kind: z.ZodLiteral<"data">;
                data: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                kind: "data";
                data: string;
            }, {
                kind: "data";
                data: string;
            }>, z.ZodObject<{
                kind: z.ZodLiteral<"file">;
                filename: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                filename: string;
                kind: "file";
            }, {
                filename: string;
                kind: "file";
            }>]>;
        }, "strip", z.ZodTypeAny, {
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
        }, {
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
        }>, z.ZodObject<{
            type: z.ZodLiteral<"textSlide">;
            slide: z.ZodObject<{
                title: z.ZodString;
                bullets: z.ZodArray<z.ZodString, "many">;
            }, "strip", z.ZodTypeAny, {
                title: string;
                bullets: string[];
            }, {
                title: string;
                bullets: string[];
            }>;
        }, "strip", z.ZodTypeAny, {
            type: "textSlide";
            slide: {
                title: string;
                bullets: string[];
            };
        }, {
            type: "textSlide";
            slide: {
                title: string;
                bullets: string[];
            };
        }>]>>;
        imageParams: z.ZodOptional<z.ZodObject<{
            model: z.ZodOptional<z.ZodString>;
            size: z.ZodOptional<z.ZodString>;
            style: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            model?: string | undefined;
            size?: string | undefined;
            style?: string | undefined;
        }, {
            model?: string | undefined;
            size?: string | undefined;
            style?: string | undefined;
        }>>;
        speechParams: z.ZodOptional<z.ZodObject<{
            speed: z.ZodOptional<z.ZodNumber>;
            instruction: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            speed?: number | undefined;
            instruction?: string | undefined;
        }, {
            speed?: number | undefined;
            instruction?: string | undefined;
        }>>;
        imagePrompt: z.ZodOptional<z.ZodString>;
        image: z.ZodOptional<z.ZodString>;
    } & {
        multiLingualTexts: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodObject<{
            text: z.ZodString;
            lang: z.ZodString;
            texts: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            ttsTexts: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            duration: z.ZodOptional<z.ZodNumber>;
            filename: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            text: string;
            lang: string;
            filename: string;
            texts?: string[] | undefined;
            ttsTexts?: string[] | undefined;
            duration?: number | undefined;
        }, {
            text: string;
            lang: string;
            filename: string;
            texts?: string[] | undefined;
            ttsTexts?: string[] | undefined;
            duration?: number | undefined;
        }>>>;
        hash: z.ZodOptional<z.ZodString>;
        duration: z.ZodOptional<z.ZodNumber>;
        filename: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        text: string;
        speaker: string;
        duration?: number | undefined;
        filename?: string | undefined;
        image?: string | undefined;
        media?: {
            type: "markdown";
            markdown: string;
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
    }, {
        text: string;
        speaker: string;
        duration?: number | undefined;
        filename?: string | undefined;
        image?: string | undefined;
        media?: {
            type: "markdown";
            markdown: string;
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
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    filename: string;
    beats: {
        text: string;
        speaker: string;
        duration?: number | undefined;
        filename?: string | undefined;
        image?: string | undefined;
        media?: {
            type: "markdown";
            markdown: string;
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
                markdown: string;
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
        description?: string | undefined;
        reference?: string | undefined;
        canvasSize?: {
            width: number;
            height: number;
        } | undefined;
        textSlideParams?: {
            cssStyles: string[];
        } | undefined;
        videoParams?: {
            padding?: number | undefined;
        } | undefined;
        imagePath?: string | undefined;
        omitCaptions?: boolean | undefined;
    };
}, {
    filename: string;
    beats: {
        text: string;
        speaker: string;
        duration?: number | undefined;
        filename?: string | undefined;
        image?: string | undefined;
        media?: {
            type: "markdown";
            markdown: string;
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
                markdown: string;
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
        description?: string | undefined;
        reference?: string | undefined;
        canvasSize?: {
            width: number;
            height: number;
        } | undefined;
        textSlideParams?: {
            cssStyles: string[];
        } | undefined;
        videoParams?: {
            padding?: number | undefined;
        } | undefined;
        imagePath?: string | undefined;
        omitCaptions?: boolean | undefined;
    };
}>;
