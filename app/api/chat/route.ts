import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import {
  generateContextualResponse,
  isConversationalKickoff,
  isHelpStartRequest,
  isReviewQuery,
} from "@/lib/contextual-engine";
import { parseDocumentBuffer } from "@/lib/server-document-parser";
import { ChatRequest, GeminiResponse, ServiceSource } from "@/lib/types";

// Rate Limiting Setup
const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT_WINDOW = 60 * 1000;
const MAX_REQUESTS = 40;

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

// In-memory record of exhausted keys (e.g. 429 daily quota)
const exhaustedKeys = new Set<string>();

const SYSTEM_INSTRUCTION = `You are StudyFlow, a contextual academic companion for university students.

The student is working with an academic material such as an activity, handout, assignment, problem set, presentation, reading, worksheet, reflection paper, group project, or research activity.

Your role is to help the student understand the material, organize the work, investigate questions, receive feedback, and reflect on their own answer.

You must distinguish between:
1. The academic material (instructions & content).
2. The student's actual answer or draft.
3. The student's conversational message.

Never treat a casual chat message as the student's academic answer.
For example, if the student says "Sure, please let's start tackling the contents", do not interpret "sure", "let's", or "start" as academic claims. Instead, ask what the student wants to do or identify the first section from the material.

If no student answer is provided:
- Do not evaluate the student's accuracy, completeness, originality, or argument.
- Do not claim that the answer is incomplete or missing evidence.
- Instead, ask what kind of help the student wants or guide them on the first item.

If the student submits an answer:
- Review the student's answer against the material instructions and rubric.
- Identify what is clear, what is missing, what may be inaccurate, what requires evidence, and what to revise next.

Follow the selected assistance mode:
- understand: Explain instructions, identify what the activity is asking, define difficult terms.
- guide: Ask questions, give hints, help the student begin without immediately giving the full answer.
- organize: Break the material into manageable actions, create a checklist, identify order of work.
- explore: Suggest search terms, related concepts, and what the student should verify.
- review: Review the student's actual answer or draft for missing requirements, reasoning, and evidence.
- draft: Provide a preliminary example or outline only when explicitly requested; label as AI-generated; encourage student revision.

Use the selected language mode:
- english: Clear academic English.
- filipino: Primarily Filipino with technically necessary English terms.
- taglish: Natural modern Tagalog-English code-switching suitable for Filipino university students. Use English for technical and academic terms; use Filipino for explanations, encouragement, and conversational transitions. Avoid forced translations, excessive slang, and childish language. Keep the response academically accurate.

Return only valid JSON matching this schema:
{
  "status": "needs_clarification | document_overview | guided_help | answer_review | checklist | draft",
  "directResponse": "Your focused response string",
  "documentEvidence": [
    {
      "location": "Section or paragraph name",
      "excerptOrSummary": "Relevant excerpt from the material",
      "whyItMatters": "Why this excerpt matters for the student's work"
    }
  ],
  "keyPoints": ["1-3 brief key points"],
  "missingInformation": ["List of missing information if answer review, or empty array"],
  "suggestedNextActions": ["2-3 specific next actions"],
  "verificationQuestions": ["1 question the student should verify or reflect on"],
  "requiresStudentAnswer": false,
  "requiresReview": false,
  "languageMode": "english | filipino | taglish"
}
IMPORTANT: Output strictly valid JSON. Do not include markdown code blocks or backticks.`;

function buildGeminiPrompt(
  request: ChatRequest,
  extractedDocText: string,
): string {
  const language = request.languageMode || "english";
  const userMsg = request.userMessage || request.message || "";
  const studentAns = request.studentAnswer ? request.studentAnswer.trim() : null;

  const materialSection = `
Academic Material:
- Title: ${request.material.title}
- Type: ${request.material.type}
${request.material.instructions ? `- Instructions:\n"""\n${request.material.instructions}\n"""` : ""}
${request.material.content ? `- Content Preview:\n"""\n${request.material.content.slice(0, 1500)}\n"""` : ""}
${extractedDocText ? `- Uploaded Document Text:\n"""\n${extractedDocText.slice(0, 2500)}\n"""` : ""}
`;

  const studentAnswerSection = studentAns
    ? `Student's Submitted Answer / Draft:\n"""\n${studentAns}\n"""`
    : `Student's Submitted Answer / Draft: None provided yet.`;

  const conversationSection =
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

Selected Settings:
- Assistance Mode: ${request.assistanceMode}
- Language Mode: ${language}

${materialSection}
${studentAnswerSection}
${conversationSection}
Student's Conversational Message: "${userMsg}"

CRITICAL INSTRUCTIONS FOR THIS TURN:
1. Determine if the student's message is a conversational greeting/kickoff (e.g. "Sure, let's start..."). If so, do NOT treat words from the message as academic claims!
2. If student answer is "None provided yet", do NOT evaluate argument completeness or claim missing evidence.
3. Respond in ${language.toUpperCase()} mode.
4. Output strictly valid JSON.`;
}

async function callGeminiApi(
  apiKey: string,
  promptText: string,
): Promise<string> {
  const ai = new GoogleGenAI({ apiKey });

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
        { success: false, error: "Too many requests. Please wait a moment." },
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
      currentTask = "",
      studentAnswer = null,
      userMessage,
      message,
      assistanceMode = "guide",
      languageMode = "english",
      attachedDocument,
      stream = true,
      forceMode,
    } = body as ChatRequest;

    const effectiveMessage = (userMessage || message || "").trim();

    if (!effectiveMessage && !attachedDocument && !studentAnswer) {
      return NextResponse.json(
        { success: false, error: "Please enter a message or upload a document." },
        { status: 400 },
      );
    }

    if (!material || !material.title) {
      return NextResponse.json(
        { success: false, error: "Missing material information" },
        { status: 400 },
      );
    }

    // 3. Document Extraction (Serverless-friendly via buffer parser)
    let extractedDocText = attachedDocument?.text || "";
    if (attachedDocument?.base64) {
      try {
        const buffer = Buffer.from(attachedDocument.base64, "base64");
        const parsed = await parseDocumentBuffer(
          buffer,
          attachedDocument.name,
          4500,
        );
        if (parsed.text) {
          extractedDocText = parsed.text;
        }
      } catch (docErr) {
        console.warn("Document buffer extraction notice:", docErr);
      }
    }

    const contextEngineParams = {
      materialTitle: material.title,
      materialType: material.type || "Activity",
      materialInstructions: material.instructions || material.description || "",
      materialContent: material.content || "",
      currentTask: currentTask || material.description || "",
      studentAnswer,
      message: effectiveMessage,
      assistanceMode,
      languageMode,
      attachedDoc: attachedDocument
        ? {
            name: attachedDocument.name,
            size: attachedDocument.size,
            text: extractedDocText,
            wordCount: attachedDocument.wordCount,
          }
        : undefined,
    };

    // 4. Local Simulation / Demo Override
    if (forceMode === "local" || forceMode === "demo") {
      const localResponse = generateContextualResponse(contextEngineParams);
      return NextResponse.json({
        success: true,
        ...localResponse,
        data: localResponse,
        source: "local-fallback" as ServiceSource,
        timestamp: new Date().toISOString(),
      });
    }

    // 5. Key Rotation Setup with Quota Awareness
    const keys = [
      {
        key: process.env.GEMINI_API_KEY,
        name: "primary",
        source: "gemini-live" as ServiceSource,
      },
      {
        key: process.env.GEMINI_API_KEY_FALLBACK_1,
        name: "fallback-1",
        source: "gemini-backup" as ServiceSource,
      },
      {
        key: process.env.GEMINI_API_KEY_FALLBACK_2,
        name: "fallback-2",
        source: "gemini-backup" as ServiceSource,
      },
    ];

    let candidateKeys = keys.filter((k) => k.key && !exhaustedKeys.has(k.key));

    if (forceMode === "fallback-1") {
      candidateKeys = candidateKeys.filter(
        (k) => k.name === "fallback-1" || k.name === "fallback-2",
      );
    } else if (forceMode === "fallback-2") {
      candidateKeys = candidateKeys.filter((k) => k.name === "fallback-2");
    }

    const promptText = buildGeminiPrompt(body as ChatRequest, extractedDocText);

    // 6. Fast Response Handling for Kickoffs & Missing Answers
    // If user says "Sure, let's start" or "help me start" or requests review without an answer,
    // the contextual engine provides the immediate, perfectly grounded response!
    const isKickoff = isConversationalKickoff(effectiveMessage);
    const isHelp = isHelpStartRequest(effectiveMessage);
    const isReviewWithoutAnswer =
      (isReviewQuery(effectiveMessage) || assistanceMode === "review") &&
      (!studentAnswer || studentAnswer.trim().length === 0);

    let resolvedData: GeminiResponse | null = null;
    let resolvedSource: ServiceSource = "gemini-live";

    if (isKickoff || isHelp || isReviewWithoutAnswer) {
      resolvedData = generateContextualResponse(contextEngineParams);
      resolvedSource = candidateKeys.length > 0 ? "gemini-live" : "local-fallback";
    } else {
      // Execute Gemini API Call with Key Rotation
      let rawResponse: string | null = null;

      for (const { key, source } of candidateKeys) {
        if (!key) continue;
        try {
          rawResponse = await callGeminiApi(key, promptText);
          resolvedSource = source;
          break;
        } catch (apiErr: any) {
          const errMsg = apiErr?.message || String(apiErr);
          console.warn(`Gemini notice for key ${source}:`, errMsg);

          // Mark key as exhausted if daily quota or rate limit exceeded
          if (
            errMsg.includes("429") ||
            errMsg.includes("quota") ||
            errMsg.includes("Rate limit exceeded")
          ) {
            exhaustedKeys.add(key);
          }
        }
      }

      if (rawResponse) {
        try {
          const cleaned = rawResponse
            .replace(/```json/gi, "")
            .replace(/```/g, "")
            .trim();
          const parsed = JSON.parse(cleaned);

          resolvedData = {
            status: parsed.status || "guided_help",
            directResponse: parsed.directResponse || parsed.response || rawResponse,
            response: parsed.directResponse || parsed.response || rawResponse,
            responseType: parsed.responseType || "guidance",
            documentEvidence: parsed.documentEvidence || [],
            keyPoints: parsed.keyPoints || ["Grounded academic response provided."],
            missingInformation: parsed.missingInformation || [],
            suggestedNextActions: parsed.suggestedNextActions || ["Continue discussion", "Ask a question"],
            suggestedNextAction: parsed.suggestedNextActions?.[0] || "Review the guidance provided.",
            followUpActions: parsed.suggestedNextActions || ["Explain more simply", "Give me a hint"],
            verificationQuestions: parsed.verificationQuestions || ["Does this align with your coursework requirements?"],
            requiresStudentAnswer: Boolean(parsed.requiresStudentAnswer),
            requiresReview: Boolean(parsed.requiresReview),
            languageMode,
          };
        } catch {
          // Unstructured AI response fallback
          resolvedData = {
            status: "guided_help",
            directResponse: rawResponse,
            response: rawResponse,
            responseType: "guidance",
            keyPoints: ["Unstructured AI response"],
            suggestedNextActions: ["Explain more simply", "Ask for a hint"],
            suggestedNextAction: "Review this response against your assignment requirements.",
            followUpActions: ["Explain more simply", "Give me a hint"],
            verificationQuestions: ["Does this response address your coursework question?"],
            requiresStudentAnswer: false,
            requiresReview: false,
            languageMode,
          };
        }
      } else {
        // All Gemini keys failed or hit quota -> Local Academic Fallback
        resolvedData = generateContextualResponse(contextEngineParams);
        resolvedSource = "local-fallback";
      }
    }

    // 7. Streaming Response to eliminate serverless timeouts
    if (stream) {
      const encoder = new TextEncoder();
      const customReadable = new ReadableStream({
        async start(controller) {
          // Immediate initial event (TTFB < 200ms)
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ type: "start", status: "connected" })}\n\n`,
            ),
          );

          // Stream words progressively
          const words = (resolvedData?.directResponse || "").split(" ");
          for (let i = 0; i < words.length; i += 3) {
            const chunk = words.slice(i, i + 3).join(" ") + " ";
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ type: "chunk", text: chunk })}\n\n`,
              ),
            );
            await new Promise((r) => setTimeout(r, 18));
          }

          // Done event with full metadata
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: "done",
                data: resolvedData,
                source: resolvedSource,
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

    // 8. Non-Streaming Response
    return NextResponse.json({
      success: true,
      ...resolvedData,
      data: resolvedData,
      source: resolvedSource,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error("Unhandled chat route error:", err?.message || err);
    return NextResponse.json(
      {
        success: false,
        error:
          "Live AI assistance is temporarily unavailable. You can continue with a local academic template or try again later.",
      },
      { status: 500 },
    );
  }
}
