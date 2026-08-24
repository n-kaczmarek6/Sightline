import { PDFParse } from "pdf-parse";
import mammoth from "mammoth";

const MAX_CHARS = 20000;

export async function extractCvText(buffer, filename) {
  const lower = (filename || "").toLowerCase();
  let text = "";

  if (lower.endsWith(".pdf")) {
    const parser = new PDFParse({ data: buffer });
    try {
      const result = await parser.getText();
      text = result.text;
    } finally {
      await parser.destroy();
    }
  } else if (lower.endsWith(".docx")) {
    const result = await mammoth.extractRawText({ buffer });
    text = result.value;
  } else {
    throw new Error("unsupported_file_type");
  }

  text = text.replace(/^--\s*\d+\s*of\s*\d+\s*--$/gm, "").trim();
  if (!text) throw new Error("empty_file_text");
  if (text.length > MAX_CHARS) text = text.slice(0, MAX_CHARS);
  return text;
}
