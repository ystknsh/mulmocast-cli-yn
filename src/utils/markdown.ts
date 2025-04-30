import { marked } from "marked";
import puppeteer from "puppeteer";

export const convertMarkdownToImage = async (markdown: string, outputPath: string) => {
  // Step 0: Prepare the header
  const styles = [
    "body { margin: 40px; margin-top: 60px; color:#333 }",
    "h1 { font-size: 60px; text-align: center }",
    "ul { margin-left: 40px } ",
    "li { font-size: 48px }",
  ];
  const header = `<head><style>${styles.join("\n")}</style></head>`;

  // Step 1: Convert Markdown to HTML
  const body = await marked(markdown);
  const html = `<htlm>${header}<body>${body}</body></html>`;

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
}