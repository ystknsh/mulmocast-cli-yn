import { marked } from "marked";
import puppeteer from "puppeteer";

export const convertMarkdownToImage = async (markdown: string, style: string, outputPath: string) => {
  // Step 0: Prepare the header
  const header = `<head><style>${style}</style></head>`;

  // Step 1: Convert Markdown to HTML
  const body = await marked(markdown);
  const html = `<htlm>${header}<body>${body}</body></html>`;
  console.log(body);

  // Step 2: Use Puppeteer to render HTML to an image
  const browser = await puppeteer.launch();
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
