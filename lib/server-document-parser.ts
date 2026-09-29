import mammoth from "mammoth";
import { extractText as unpdfExtractText } from "unpdf";

export interface ParsedDocumentResult {
  text: string;
  wordCount: number;
  isTruncated: boolean;
  rawLength: number;
  sampleRatio?: string;
}

/**
 * Serverless-friendly academic document parser for Vercel.
 * Supports .docx (via mammoth), .pdf (via unpdf), and text/markdown files.
 * Truncates safely to avoid exceeding LLM context and token limits.
 */
export async function parseDocumentBuffer(
  buffer: Buffer,
  fileName: string,
  maxChars = 6000,
): Promise<ParsedDocumentResult> {
  const extension = fileName.split(".").pop()?.toLowerCase() || "";
  let rawText = "";

  if (extension === "docx" || extension === "doc") {
    try {
      const result = await mammoth.extractRawText({ buffer });
      rawText = result.value || "";
    } catch (err: any) {
      console.warn("Mammoth server extraction warning:", err?.message || err);
      // Fallback: search for UTF-8 readable text chunks if zip header is corrupted
      rawText = buffer
        .toString("utf-8")
        .replace(/<[^>]+>/g, " ")
        .replace(/[^\x20-\x7E\n\r\t]/g, " ");
    }
  } else if (extension === "pdf") {
    try {
      const uint8 = new Uint8Array(buffer);
      const res = await unpdfExtractText(uint8);
      rawText = Array.isArray(res.text) ? res.text.join("\n") : res.text || "";
    } catch (err: any) {
      console.warn("unpdf server extraction warning:", err?.message || err);
      // Fallback: decode raw stream
      rawText = buffer.toString("utf-8");
    }
  } else {
    // txt, md, json, csv, etc.
    try {
      rawText = buffer.toString("utf-8");
    } catch {
      rawText = "";
    }
  }

  const cleanText = rawText.replace(/\r\n/g, "\n").trim();
  const rawLength = cleanText.length;
  const wordCount = cleanText
    ? cleanText.split(/\s+/).filter(Boolean).length
    : 0;

  if (rawLength <= maxChars) {
    return {
      text: cleanText,
      wordCount,
      isTruncated: false,
      rawLength,
      sampleRatio: "100% full text",
    };
  }

  // Safe token limit truncation: preserve beginning, middle excerpt, and ending
  const introLen = Math.floor(maxChars * 0.45);
  const midLen = Math.floor(maxChars * 0.3);
  const endLen = Math.floor(maxChars * 0.25);

  const intro = cleanText.slice(0, introLen).trim();
  const midStart = Math.floor(cleanText.length / 2) - Math.floor(midLen / 2);
  const mid = cleanText.slice(midStart, midStart + midLen).trim();
  const end = cleanText.slice(cleanText.length - endLen).trim();

  const truncated = `[Document Beginning]\n${intro}\n\n[... Core Excerpt ...]\n${mid}\n\n[Document Conclusion]\n${end}`;

  return {
    text: truncated,
    wordCount,
    isTruncated: true,
    rawLength,
    sampleRatio: `~${((truncated.length / rawLength) * 100).toFixed(0)}% excerpt (${rawLength} characters total)`,
  };
}
