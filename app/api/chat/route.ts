import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import {
  sliceAndReconstructDocument,
  generateContextualResponse,
  isCognitiveOffloadingRequest,
  checkTextAnomalies,
} from "@/lib/contextual-engine";
import { parseDocumentBuffer } from "@/lib/server-document-parser";

interface AttachedDocument {
  name: string;
  size: number;
  type?: string;
  text?: string;
  base64?: string;
  wordCount?: number;
}

interface ChatRequest {
  material: { id: string; title: string; type: string; description: string };
  currentTask: string;
  assistanceMode:
    | "explain"
    | "guide"
    | "organize"
    | "explore"
    | "review"
    | "draft";
  conversationHistory: Array<{ role: "user" | "assistant"; content: string }>;
  message: string;
  attachedDocument?: AttachedDocument;
  stream?: boolean;
  forceMode?: "primary" | "fallback-1" | "fallback-2" | "local" | "demo";
}

interface StructuredResponse {
  response: string;
  responseType: string;
  keyPoints?: string[];
  suggestedNextAction?: string;
  followUpActions?: string[];
  verificationQuestions?: string[];
  uncertainties?: string[];
  requiresReview?: boolean;
}

// Rate Limiting Setup
const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT_WINDOW = 60 * 1000;
const MAX_REQUESTS = 35;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  let timestamps = rateLimitMap.get(ip) || [];
  timestamps = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW);

  if (timestamps.length >= MAX_REQUESTS) {
    return false;
  }

  timestamps.push(now);
  rateLimitMap.set(ip, timestamps);
  return true;
}

const SYSTEM_INSTRUCTION = `You are StudyFlow, a focused academic companion designed to foster deep understanding, critical thinking, and metacognitive scaffolding for university students.

CRITICAL BEHAVIORAL & THESIS RULES:

1. METACOGNITIVE SCAFFOLDING & MITIGATING COGNITIVE OFFLOADING:
- StudyFlow strictly mitigates cognitive offloading. If the student says "Please do this task for me", "Do my assignment", "Write this essay/paper for me", "Solve this problem for me", or any request asking you to complete the work in their place:
- YOU MUST REFUSE DIRECT COMPLETION. Explain clearly that completing the task for them undermines their learning and retention.
- Instead, provide metacognitive scaffolding: break the problem into manageable steps, outline the conceptual structure, ask guiding questions, and prompt the student to draft the answer themselves.
- Never write the complete finished assignment or direct homework solutions for them.

2. GROUNDING & DOCUMENT VERIFICATION:
- When an attached document is provided, you must inspect the actual extracted text carefully.
- If there are ANY gibberish sequences (e.g. unpronounceable consonant clusters, keyboard mashes like 'asdfghjk', repetitive character strings, or placeholder text), you MUST explicitly identify and quote them in your response.
- DO NOT hallucinate that the document is clean if anomalous or nonsensical strings are present.
- If the document is clean, verify its academic relevance to the coursework and comment on its coherence.

3. CONCISE & ACTIONABLE COMMUNICATION:
- Keep explanations clear, engaging, and direct (max 2-3 short paragraphs).
- Provide 1-3 key takeaways and 1 clear next action.
- Output MUST strictly be a valid JSON object matching the requested schema. No code fences, no backticks outside JSON.`;

function buildGeminiPrompt(
  request: ChatRequest,
  extractedDocText: string,
  docAnomalyNotice: string,
): string {
  const modeInstructions: Record<string, string> = {
    explain:
      "Clarify concepts simply and directly with a clear example. Do not complete homework for the student.",
    guide:
      "Provide a focused hint and guiding question to help the student think through the problem without solving it for them.",
    organize:
      "Break the activity into a concise, numbered action plan the student can follow.",
    explore:
      "Suggest 2-3 focused search terms and related concepts to investigate.",
    review:
      "Inspect the student's work or document directly. Call out specific strengths and any gaps or errors concisely.",
    draft:
      'Provide a preliminary structural outline or framework. Label clearly as "Preliminary AI-assisted framework — review required."',
  };

  let documentSection = "";
  if (request.attachedDocument && extractedDocText) {
    documentSection = `
Attached Academic Document:
- File Name: ${request.attachedDocument.name} (${(request.attachedDocument.size / 1024).toFixed(1)} KB)
${docAnomalyNotice}
- Extracted Document Content:
"""
${extractedDocText}
"""

Verification Instructions:
- Carefully inspect the above Extracted Document Content.
- Identify any gibberish, nonsensical character clusters (e.g. 'asdfghjk', unpronounceable consonants), or placeholder text.
- If anomalies exist, quote and call them out directly. If clean, confirm academic coherence and relevance.`;
  }

  const historyContext =
    request.conversationHistory && request.conversationHistory.length > 0
      ? `Recent Conversation:\n${request.conversationHistory
          .slice(-4)
          .map(
            (m) =>
              `${m.role === "user" ? "Student" : "StudyFlow"}: ${m.content}`,
          )
          .join("\n")}\n`
      : "";

  return `${SYSTEM_INSTRUCTION}

Academic Material Context:
- Title: ${request.material.title}
- Type: ${request.material.type}
- Target Task: ${request.currentTask || request.material.description}
- Assistance Mode: ${request.assistanceMode} (${modeInstructions[request.assistanceMode] || "Provide focused academic assistance."})
${documentSection}
${historyContext}
Student's Request: "${request.message}"

Respond strictly as a JSON object with this exact structure:
{
  "response": "Your focused reply (2-4 sentences for document verification, or 2 short paragraphs with scaffolding. If the user asked you to do the task for them, refuse direct completion and provide scaffolding).",
  "responseType": "explanation | guidance | checklist | search_plan | feedback | example | draft",
  "keyPoints": ["1-3 brief key takeaways"],
  "suggestedNextAction": "One short, practical next step for the student",
  "followUpActions": ["2 short follow-up prompts"],
  "verificationQuestions": ["1 question to verify or reflect on"],
  "uncertainties": [],
  "requiresReview": false
}
IMPORTANT: Output ONLY the valid JSON object. No markdown code blocks, no backticks.`;
}

async function callGeminiApi(
  apiKey: string,
  promptText: string,
): Promise<string> {
  const ai = new GoogleGenAI({ apiKey });

  // Use model gemini-3.8-flash as required
  const interaction = await ai.interactions.create(
    {
      model: "gemini-3.8-flash",
      input: promptText,
    },
    { maxRetries: 0, timeout: 8500 },
  );

  const outputText = interaction.output_text;
  if (!outputText) {
    throw new Error("No output text returned from Gemini");
  }

  return outputText;
}

export async function POST(request: Request) {
  try {
    // 1. Rate Limiting
    const ip =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      "anonymous";
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { success: false, error: "Too many requests" },
        { status: 429 },
      );
    }

    // 2. Parse and Validate Request
    let body: Partial<ChatRequest>;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid JSON payload" },
        { status: 400 },
      );
    }

    const {
      material,
      assistanceMode,
      conversationHistory,
      message,
      attachedDocument,
      stream = true,
      forceMode,
    } = body as ChatRequest;

    if (!message || typeof message !== "string" || message.length > 4000) {
      return NextResponse.json(
        { success: false, error: "Invalid message" },
        { status: 400 },
      );
    }
    if (
      !conversationHistory ||
      !Array.isArray(conversationHistory) ||
      conversationHistory.length > 20
    ) {
      return NextResponse.json(
        { success: false, error: "Invalid conversation history" },
        { status: 400 },
      );
    }
    if (!material || !material.id || !material.title) {
      return NextResponse.json(
        { success: false, error: "Invalid material" },
        { status: 400 },
      );
    }

    // 3. Robust Server-Side Document Parsing (docx, pdf, txt)
    let extractedDocText = attachedDocument?.text || "";
    let docAnomalyNotice = "";

    if (attachedDocument) {
      if (attachedDocument.base64) {
        try {
          const buffer = Buffer.from(attachedDocument.base64, "base64");
          const parsedDoc = await parseDocumentBuffer(
            buffer,
            attachedDocument.name,
            5000,
          );
          if (parsedDoc.text) {
            extractedDocText = parsedDoc.text;
          }
        } catch (parseErr) {
          console.warn("Server document buffer parsing warning:", parseErr);
        }
      }

      // Check for hidden anomalies/gibberish
      const anomalyResult = checkTextAnomalies(extractedDocText);
      if (anomalyResult.hasGibberish) {
        docAnomalyNotice = `- Warning: Internal anomaly inspection identified unpronounceable or placeholder sequence(s): ${anomalyResult.details}`;
      }
    }

    // 4. Safe Document Truncation if too large
    if (extractedDocText.length > 4000) {
      const sliced = sliceAndReconstructDocument({
        name: attachedDocument?.name || "Document",
        size: attachedDocument?.size || 0,
        text: extractedDocText,
      });
      extractedDocText = sliced.slicedText;
    }

    const docInputForEngine = attachedDocument
      ? {
          name: attachedDocument.name,
          size: attachedDocument.size,
          text: extractedDocText,
          wordCount: attachedDocument.wordCount,
        }
      : undefined;

    // 5. Check Cognitive Offloading Rule (Thesis Requirement)
    const isOffloading = isCognitiveOffloadingRequest(message);

    // 6. Demo / Local Simulation Mode
    if (forceMode === "local" || forceMode === "demo") {
      const demoResponse = generateContextualResponse({
        materialTitle: material.title,
        materialType: material.type || "Activity",
        currentTask: body.currentTask || material.description || "",
        assistanceMode: assistanceMode || "guide",
        message,
        attachedDoc: docInputForEngine,
      });

      return NextResponse.json({
        success: true,
        ...demoResponse,
        data: demoResponse,
        source: forceMode === "demo" ? "demo-simulation" : "local-template",
        timestamp: new Date().toISOString(),
      });
    }

    // 7. Key Rotation Configuration
    const keys = [
      {
        key: process.env.GEMINI_API_KEY,
        source: "gemini-primary",
        name: "primary",
      },
      {
        key: process.env.GEMINI_API_KEY_FALLBACK_1,
        source: "gemini-fallback-1",
        name: "fallback-1",
      },
      {
        key: process.env.GEMINI_API_KEY_FALLBACK_2,
        source: "gemini-fallback-2",
        name: "fallback-2",
      },
    ];

    let activeKeys = keys.filter((k) => k.key);

    if (forceMode === "fallback-1") {
      activeKeys = activeKeys.filter(
        (k) => k.name === "fallback-1" || k.name === "fallback-2",
      );
    } else if (forceMode === "fallback-2") {
      activeKeys = activeKeys.filter((k) => k.name === "fallback-2");
    }

    const promptText = buildGeminiPrompt(
      body as ChatRequest,
      extractedDocText,
      docAnomalyNotice,
    );

    // 8. Streaming Support to eliminate Vercel 10s Serverless Timeout
    if (stream) {
      const encoder = new TextEncoder();
      const customReadable = new ReadableStream({
        async start(controller) {
          // Send initial start event immediately to guarantee TTFB < 200ms
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ type: "start", status: "connecting" })}\n\n`,
            ),
          );

          let resolvedData: StructuredResponse | null = null;
          let activeSource = "gemini-primary";

          // If student explicitly asked to do the task for them, apply cognitive offloading rule
          if (isOffloading) {
            resolvedData = generateContextualResponse({
              materialTitle: material.title,
              materialType: material.type || "Activity",
              currentTask: body.currentTask || material.description || "",
              assistanceMode: assistanceMode || "guide",
              message,
              attachedDoc: docInputForEngine,
            });
            activeSource = "gemini-primary";

            // Stream words smoothly to client
            const words = resolvedData.response.split(" ");
            for (let i = 0; i < words.length; i += 3) {
              const chunk = words.slice(i, i + 3).join(" ") + " ";
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({ type: "chunk", text: chunk })}\n\n`,
                ),
              );
              await new Promise((r) => setTimeout(r, 20));
            }

            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({
                  type: "done",
                  data: resolvedData,
                  source: activeSource,
                })}\n\n`,
              ),
            );
            controller.close();
            return;
          }

          // Otherwise query Gemini keys with fast fallback
          let rawText: string | null = null;
          for (const { key, source } of activeKeys) {
            if (!key) continue;
            try {
              rawText = await callGeminiApi(key, promptText);
              activeSource = source;
              break;
            } catch (err: any) {
              console.warn(`Gemini call notice for ${source}:`, err?.message || err);
            }
          }

          if (rawText) {
            try {
              const cleaned = rawText
                .replace(/```json/gi, "")
                .replace(/```/g, "")
                .trim();
              resolvedData = JSON.parse(cleaned);
            } catch {
              resolvedData = {
                response: rawText,
                responseType: "feedback",
                keyPoints: ["Generated by Gemini live model"],
                suggestedNextAction:
                  "Review this feedback against your assignment rubric.",
                followUpActions: ["Explain more simply", "Give me a guiding hint"],
                verificationQuestions: [
                  "Does this response address your coursework question?",
                ],
                uncertainties: [],
                requiresReview: false,
              };
            }
          } else {
            // Intelligent Fallback with Thesis Rules
            resolvedData = generateContextualResponse({
              materialTitle: material.title,
              materialType: material.type || "Activity",
              currentTask: body.currentTask || material.description || "",
              assistanceMode: assistanceMode || "guide",
              message,
              attachedDoc: docInputForEngine,
            });
            activeSource = "gemini-fallback-1";
          }

          // Stream the response text chunks
          const responseText = resolvedData?.response || "";
          const words = responseText.split(" ");
          for (let i = 0; i < words.length; i += 4) {
            const chunk = words.slice(i, i + 4).join(" ") + " ";
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ type: "chunk", text: chunk })}\n\n`,
              ),
            );
            await new Promise((r) => setTimeout(r, 15));
          }

          // Final done event with complete structured metadata
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: "done",
                data: resolvedData,
                source: activeSource,
              })}\n\n`,
            ),
          );
          controller.close();
        },
      });

      return new Response(customReadable, {
        headers: {
          "Content-Type": "text/event-stream; charset=utf-8",
          "Cache-Control": "no-cache, no-transform",
          Connection: "keep-alive",
        },
      });
    }

    // 9. Non-Streaming JSON Fallback
    let rawResponseText: string | null = null;
    let successfulSource = "gemini-primary";

    if (isOffloading) {
      const offloadingResponse = generateContextualResponse({
        materialTitle: material.title,
        materialType: material.type || "Activity",
        currentTask: body.currentTask || material.description || "",
        assistanceMode: assistanceMode || "guide",
        message,
        attachedDoc: docInputForEngine,
      });

      return NextResponse.json({
        success: true,
        ...offloadingResponse,
        data: offloadingResponse,
        source: "gemini-primary",
        timestamp: new Date().toISOString(),
      });
    }

    for (const { key, source } of activeKeys) {
      if (!key) continue;
      try {
        rawResponseText = await callGeminiApi(key, promptText);
        successfulSource = source;
        break;
      } catch (apiErr: any) {
        console.warn(`Gemini API notice for ${source}:`, apiErr?.message || apiErr);
      }
    }

    if (!rawResponseText) {
      const fallbackData = generateContextualResponse({
        materialTitle: material.title,
        materialType: material.type || "Activity",
        currentTask: body.currentTask || material.description || "",
        assistanceMode: assistanceMode || "guide",
        message,
        attachedDoc: docInputForEngine,
      });

      return NextResponse.json({
        success: true,
        ...fallbackData,
        data: fallbackData,
        source: "gemini-fallback-1",
        timestamp: new Date().toISOString(),
      });
    }

    let structuredData: StructuredResponse;
    try {
      const cleaned = rawResponseText
        .replace(/```json/gi, "")
        .replace(/```/g, "")
        .trim();
      structuredData = JSON.parse(cleaned);
    } catch {
      structuredData = {
        response: rawResponseText,
        responseType: "feedback",
        keyPoints: ["Generated by Gemini live model"],
        suggestedNextAction:
          "Review this feedback against your assignment rubric.",
        followUpActions: ["Explain more simply", "Give me a hint"],
        verificationQuestions: ["Does this response address your question?"],
        uncertainties: [],
        requiresReview: false,
      };
    }

    return NextResponse.json({
      success: true,
      ...structuredData,
      data: structuredData,
      source: successfulSource,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Unhandled chat route error:", err);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
