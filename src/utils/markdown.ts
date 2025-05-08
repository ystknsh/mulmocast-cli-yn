import { GraphAILogger } from "graphai";
import { marked } from "marked";
import puppeteer from "puppeteer";

export const renderHTMLToImage = async (html: string, outputPath: string) => {
  // Use Puppeteer to render HTML to an image
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // Set the page content to the HTML generated from the Markdown
  await page.setContent(html);

  // Adjust page settings if needed (like width, height, etc.)
  await page.setViewport({ width: 1200, height: 800 });

  // Step 3: Capture screenshot of the page (which contains the Markdown-rendered HTML)
  await page.screenshot({ path: outputPath });

  await browser.close();
  GraphAILogger.info(`HTML image rendered to ${outputPath}`);
};

export const renderMarkdownToImage = async (markdown: string, style: string, outputPath: string) => {
  const header = `<head><style>${style}</style></head>`;
  const body = await marked(markdown);
  const html = `<htlm>${header}<body>${body}</body></html>`;
  await renderHTMLToImage(html, outputPath);
};

export const interpolate = (template: string, data: Record<string, string>): string => {
  return template.replace(/\$\{(.*?)\}/g, (_, key) => data[key.trim()] ?? "");
};
