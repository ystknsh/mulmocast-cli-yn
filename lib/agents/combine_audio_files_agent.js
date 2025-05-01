"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fluent_ffmpeg_1 = __importDefault(require("fluent-ffmpeg"));
const path_1 = __importDefault(require("path"));
const file_1 = require("../utils/file");
const combineAudioFilesAgent = async ({ namedInputs, }) => {
    const { studio, combinedFileName } = namedInputs;
    const outputFile = path_1.default.resolve(combinedFileName);
    const command = (0, fluent_ffmpeg_1.default)();
    studio.beats.forEach((mulmoBeat, index) => {
        const filePath = path_1.default.resolve("./scratchpad/" + mulmoBeat.filename + ".mp3");
        const isLast = index === studio.beats.length - 2;
        command.input(filePath);
        command.input(isLast ? file_1.silentLastPath : file_1.silentPath);
        // Measure and log the timestamp of each section
        fluent_ffmpeg_1.default.ffprobe(filePath, (err, metadata) => {
            if (err) {
                console.error("Error while getting metadata:", err);
            }
            else {
                studio.beats[index]["duration"] = metadata.format.duration + (isLast ? 0.8 : 0.3);
            }
        });
    });
    const promise = new Promise((resolve, reject) => {
        command
            .on("end", () => {
            resolve(0);
        })
            .on("error", (err) => {
            console.error("Error while combining MP3 files:", err);
            reject(err);
        })
            .mergeToFile(outputFile, path_1.default.dirname(outputFile));
    });
    await promise;
    return {
        fileName: outputFile,
        studio,
    };
};
const combineAudioFilesAgentInfo = {
    name: "combineAudioFilesAgent",
    agent: combineAudioFilesAgent,
    mock: combineAudioFilesAgent,
    samples: [],
    description: "combineAudioFilesAgent",
    category: ["ffmpeg"],
    author: "satoshi nakajima",
    repository: "https://github.com/snakajima/ai-podcaster",
    license: "MIT",
};
exports.default = combineAudioFilesAgentInfo;
