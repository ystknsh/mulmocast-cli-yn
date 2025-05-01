#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const args_1 = require("./args");
const preprocess_1 = require("./utils/preprocess");
const translate_1 = require("./actions/translate");
const images_1 = require("./actions/images");
const audio_1 = require("./actions/audio");
const movie_1 = require("./actions/movie");
const main = async () => {
    const filePath = path_1.default.resolve(args_1.args.file);
    if (!fs_1.default.existsSync(filePath)) {
        console.error("File not exists");
        return -1;
    }
    // TODO some option process
    const { action } = args_1.args;
    const studio = (0, preprocess_1.createOrUpdateStudioData)(filePath);
    if (action === "translate") {
        await (0, translate_1.translate)(studio);
    }
    if (action === "audio") {
        await (0, audio_1.audio)(studio, studio.script.speechParams?.provider === "nijivoice" ? 1 : 8);
    }
    if (action === "images") {
        await (0, images_1.images)(studio);
    }
    if (action === "movie") {
        await (0, movie_1.movie)(studio);
    }
};
main();
