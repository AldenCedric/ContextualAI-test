/**
 * StudyFlow Academic Document Parser (Client & Browser Support)
 * Extracts text from TXT, MD, DOCX, and PDF with Base64 encoding for server validation.
 */

export interface ParsedDocument {
  name: string;
  size: number;
  type: string;
  text: string;
  wordCount: number;
  preview: string;
  base64?: string;
}

/**
 * Converts a browser File object to a base64 string
 */
export async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const res = reader.result as string;
      const base64 = res.includes(",") ? res.split(",")[1] : res;
      resolve(base64);
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

/**
 * Parses academic documents on the client and packages base64 data for the server parser.
 */
export async function parseAcademicDocument(
  file: File,
): Promise<ParsedDocument> {
  const name = file.name;
  const size = file.size;
  const type = file.type || "application/octet-stream";
  let extractedText = "";
  let base64 = "";

  const extension = name.split(".").pop()?.toLowerCase() || "";

  try {
    base64 = await fileToBase64(file);
  } catch (err) {
    console.warn("Base64 conversion failed:", err);
  }

  if (
    ["txt", "md", "json", "csv", "tsv"].includes(extension) ||
    type.startsWith("text/")
  ) {
    try {
      extractedText = await file.text();
    } catch {
      extractedText = "";
    }
  } else if (extension === "docx" || extension === "doc") {
    // Try extracting with mammoth in the browser if available
    try {
      // Dynamic import to prevent SSR bundling issues
      const mammoth = await import("mammoth/mammoth.browser.js");
      const arrayBuffer = await file.arrayBuffer();
      const result = await (mammoth.default || mammoth).extractRawText({
        arrayBuffer,
      });
      extractedText = result.value || "";
    } catch (err) {
      console.warn("Client mammoth extraction fallback:", err);
      // Fast fallback: parse XML from docx zip if available
      extractedText = await extractTextFromDocxZip(file);
    }
  } else if (extension === "pdf") {
    // Fast client-side PDF stream extractor for instant preview
    extractedText = await extractTextFromPDFBytes(file);
  }

  // Clean text and generate preview
  const cleanText = extractedText.replace(/\r\n/g, "\n").trim();
  const words = cleanText ? cleanText.split(/\s+/).filter(Boolean) : [];
  const preview =
    cleanText.length > 300
      ? cleanText.substring(0, 300) + "..."
      : cleanText || `[Attached: ${name} (${(size / 1024).toFixed(1)} KB)]`;

  return {
    name,
    size,
    type,
    text: cleanText,
    wordCount: words.length,
    preview,
    base64,
  };
}

/**
 * Fast client-side text extractor from PDF arrayBuffer for immediate UI preview
 */
async function extractTextFromPDFBytes(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    const decoder = new TextDecoder("utf-8", { fatal: false });
    const rawString = decoder.decode(bytes);

    // Look for text in PDF Tj / TJ operators
    const textMatches: string[] = [];
    const tjRegex = /\(([^)]+)\)\s*Tj/g;
    let match;
    while ((match = tjRegex.exec(rawString)) !== null) {
      if (match[1] && match[1].length > 1) {
        textMatches.push(match[1]);
      }
    }

    if (textMatches.length > 5) {
      return textMatches.join(" ");
    }

    const readableChunks =
      rawString.match(/[A-Za-z0-9\s.,;:'"?!()-]{4,}/g) || [];
    const filtered = readableChunks.filter(
      (c) =>
        !c.startsWith("obj") &&
        !c.includes("endobj") &&
        !c.includes("xref") &&
        c.trim().length > 3,
    );

    return filtered.slice(0, 80).join(" ");
  } catch {
    return "";
  }
}

/**
 * Lightweight browser extractor for XML tags inside docx container
 */
async function extractTextFromDocxZip(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const decoder = new TextDecoder("utf-8", { fatal: false });
    const rawString = decoder.decode(arrayBuffer);

    const wtMatches: string[] = [];
    const wtRegex = /<w:t[^>]*>([^<]+)<\/w:t>/g;
    let match;
    while ((match = wtRegex.exec(rawString)) !== null) {
      if (match[1]) {
        wtMatches.push(match[1]);
      }
    }

    if (wtMatches.length > 0) {
      return wtMatches.join(" ");
    }

    const readable = rawString.match(/[A-Za-z0-9\s.,;:'"?!()-]{5,}/g) || [];
    return readable
      .filter((c) => !c.includes("schemas.openxmlformats"))
      .slice(0, 100)
      .join(" ");
  } catch {
    return "";
  }
}
