"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fileCacheAgentFilter = void 0;
require("dotenv/config");
const promises_1 = __importDefault(require("fs/promises"));
const fileCacheAgentFilter = async (context, next) => {
    const { namedInputs } = context;
    const { file, text } = namedInputs;
    try {
        await promises_1.default.access(file);
        const elements = file.split("/");
        console.log("cache hit: " + elements[elements.length - 1], text.slice(0, 10));
        return true;
    }
    catch (__e) {
        const output = (await next(context));
        const buffer = output ? output["buffer"] : undefined;
        if (buffer) {
            console.log("writing: " + file);
            await promises_1.default.writeFile(file, buffer);
            return true;
        }
        console.log("no cache, no buffer: " + file);
        return false;
    }
};
exports.fileCacheAgentFilter = fileCacheAgentFilter;
