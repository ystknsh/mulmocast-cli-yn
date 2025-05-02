#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const fs_1 = __importDefault(require("fs"));
const args_1 = require("./args");
const preprocess_1 = require("../utils/preprocess");
const const_1 = require("../utils/const");
const methods_1 = require("../methods");
const translate_1 = require("../actions/translate");
const images_1 = require("../actions/images");
const audio_1 = require("../actions/audio");
const movie_1 = require("../actions/movie");
const file_1 = require("../utils/file");
const getFileObject = () => {
    const { basedir, file, outdir, imagedir, scratchpaddir } = args_1.args;
    const baseDirPath = (0, file_1.getBaseDirPath)(basedir);
    const mulmoFilePath = (0, file_1.getFullPath)(baseDirPath, file ?? "");
    const outDirPath = (0, file_1.getFullPath)(baseDirPath, outdir ?? const_1.outDirName);
    const imageDirPath = (0, file_1.getFullPath)(baseDirPath, imagedir ?? const_1.imageDirName);
    const scratchpadDirPath = (0, file_1.getFullPath)(baseDirPath, scratchpaddir ?? const_1.scratchpadDirName);
    return { baseDirPath, mulmoFilePath, outDirPath, imageDirPath, scratchpadDirPath };
};
const main = async () => {
    const files = getFileObject();
    const { mulmoFilePath } = files;
    if (args_1.args.v) {
        console.log(files);
    }
    if (!fs_1.default.existsSync(mulmoFilePath)) {
        console.error("File not exists");
        return -1;
    }
    // TODO some option process
    const { action } = args_1.args;
    const studio = (0, preprocess_1.createOrUpdateStudioData)(mulmoFilePath, files);
    if (action === "translate") {
        await (0, translate_1.translate)(studio, files);
    }
    if (action === "audio") {
        await (0, audio_1.audio)(studio, files, methods_1.MulmoScriptMethods.getSpeechProvider(studio.script) === "nijivoice" ? 1 : 8);
    }
    if (action === "images") {
        await (0, images_1.images)(studio, files);
    }
    if (action === "movie") {
        await (0, audio_1.audio)(studio, files, methods_1.MulmoScriptMethods.getSpeechProvider(studio.script) === "nijivoice" ? 1 : 8);
        await (0, images_1.images)(studio, files);
        await (0, movie_1.movie)(studio, files);
    }
};
main();
