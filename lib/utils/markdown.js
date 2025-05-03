"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertMarkdownToImage = void 0;
const marked_1 = require("marked");
const puppeteer_1 = __importDefault(require("puppeteer"));
const convertMarkdownToImage = async (markdown, style, outputPath) => {
    // Step 0: Prepare the header
    const header = `<head><style>${style}</style></head>`;
    // Step 1: Convert Markdown to HTML
    const body = await (0, marked_1.marked)(markdown);
    const html = `<htlm>${header}<body>${body}</body></html>`;
    // Step 2: Use Puppeteer to render HTML to an image
    const browser = await puppeteer_1.default.launch();
    const page = await browser.newPage();
    // Set the page content to the HTML generated from the Markdown
    await page.setContent(html);
    // Adjust page settings if needed (like width, height, etc.)
    await page.setViewport({ width: 1200, height: 800 });
    // Step 3: Capture screenshot of the page (which contains the Markdown-rendered HTML)
    await page.screenshot({ path: outputPath });
    await browser.close();
    console.log(`Image saved to ${outputPath}`);
};
exports.convertMarkdownToImage = convertMarkdownToImage;
