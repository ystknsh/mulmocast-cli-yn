#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const tool_args_1 = require("./tool-args");
const const_1 = require("../utils/const");
const seed_from_url_1 = require("../tools/seed_from_url");
const file_1 = require("../utils/file");
const seed_1 = require("../tools/seed");
const main = async () => {
    const { o: outdir, t: template, u: urls, b: basedir, action, v: verbose, i: interactive, f: filename } = tool_args_1.args;
    const baseDirPath = (0, file_1.getBaseDirPath)(basedir);
    const outDirPath = (0, file_1.getFullPath)(baseDirPath, outdir ?? const_1.outDirName);
    if (verbose) {
        console.log("baseDirPath:", baseDirPath);
        console.log("outDirPath:", outDirPath);
        console.log("template:", template);
        console.log("urls:", urls);
        console.log("action:", action);
        console.log("interactive:", interactive);
        console.log("filename:", filename);
    }
    if (action === "scripting") {
        if (interactive) {
            await (0, seed_1.createMulmoScriptWithInteractive)({ outdir: outDirPath, template_name: template, filename });
        }
        else if (urls) {
            await (0, seed_from_url_1.createMulmoScriptFromUrl)({ urls, template_name: template, outdir: outDirPath, filename });
        }
        else {
            throw new Error("urls is required when not in interactive mode");
        }
    }
    else {
        throw new Error(`Unknown or unsupported action: ${action}`);
    }
};
main().catch((error) => {
    console.error("An unexpected error occurred:", error);
    process.exit(1);
});
