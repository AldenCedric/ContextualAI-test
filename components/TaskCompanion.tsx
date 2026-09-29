"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { mockMaterials as MATERIALS, SUGGESTED_PROMPTS } from "@/lib/mock-data";
import {
  AssistanceMode,
  ChatMessage,
  ChatResponseData,
  SavedResponse,
  Material,
} from "@/lib/types";
import { classNames, generateId } from "@/lib/utils";
import { GEMINI_MODEL_LABEL } from "@/lib/constants";
import { usePrototype } from "@/lib/prototype-context";
import { parseAcademicDocument, ParsedDocument } from "@/lib/document-parser";
import {
  Bot,
  Sparkles,
  Lightbulb,
  Compass,
  ListOrdered,
  Search,
  CheckCircle2,
  FileEdit,
  FileText,
  Paperclip,
  Receipt,
  X,
  Send,
  AlertTriangle,
  ArrowRight,
  HelpCircle,
  Target,
  FileCheck,
  RotateCcw,
  RefreshCw,
} from "lucide-react";

interface TaskCompanionProps {
  initialMaterialId?: string;
  initialMode?: AssistanceMode;
}

const DEFAULT_ANY_MATERIAL: Material = {
  id: "any",
  title: "Any Material / Custom Upload",
  type: "Activity",
  description:
    "Provide any subject, topic, worksheet, or upload an academic document (PDF, TXT, DOCX) for live verification and assistance.",
  currentTask: "Review provided academic material and analyze key concepts.",
  progress: 0,
  status: "in-progress",
};

export default function TaskCompanion({
  initialMaterialId,
  initialMode = "guide",
}: TaskCompanionProps) {
  const { serviceMode, showReviewCheckpoint } = usePrototype();

  // Selected Material: default to 'any' if not specified, or the passed ID
  const [selectedMaterialId, setSelectedMaterialId] = useState<string>(
    initialMaterialId || "any",
  );

  // Custom subject/title when 'any' is selected
  const [customSubjectTitle, setCustomSubjectTitle] = useState<string>("");

  const selectedMaterial: Material =
    selectedMaterialId === "any"
      ? {
          ...DEFAULT_ANY_MATERIAL,
          title: customSubjectTitle.trim() || "Any Material / Custom Upload",
        }
      : MATERIALS.find((m) => m.id === selectedMaterialId) ||
        DEFAULT_ANY_MATERIAL;

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<AssistanceMode>(initialMode);
  const [isTyping, setIsTyping] = useState(false);
  const [isCooldown, setIsCooldown] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Attached Document State
  const [attachedDoc, setAttachedDoc] = useState<ParsedDocument | null>(null);
  const [isParsingDoc, setIsParsingDoc] = useState(false);

  // Modals
  const [showReviewModal, setShowReviewModal] = useState<{
    messageId: string;
    response: ChatResponseData;
  } | null>(null);
  const [reviewAnswers, setReviewAnswers] = useState({
    mainIdea: "",
    whatToVerify: "",
    ownWords: "",
  });
  const [showReceiptModal, setShowReceiptModal] =
    useState<SavedResponse | null>(null);
  const [reflection, setReflection] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load chat history for current material from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(
        `studyflow-chat-${selectedMaterial.id}`,
      );
      if (saved) {
        setMessages(JSON.parse(saved));
      } else {
        setMessages([]);
      }
    } catch {
      setMessages([]);
    }
  }, [selectedMaterial.id]);

  // Persist chat history
  useEffect(() => {
    if (messages.length > 0) {
      try {
        localStorage.setItem(
          `studyflow-chat-${selectedMaterial.id}`,
          JSON.stringify(messages),
        );
      } catch {
        // ignore
      }
    }
  }, [messages, selectedMaterial.id]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const suggestedPrompts =
    selectedMaterial.id === "any"
      ? [
          "Verify this document for gibberish, hallucinated text, or unrelated topics.",
          "Review the main arguments and academic structure of this material.",
          "Explain the core concepts and methodologies used in this topic.",
          "Break this assignment into a manageable step-by-step checklist.",
        ]
      : SUGGESTED_PROMPTS[selectedMaterial.type] ||
        SUGGESTED_PROMPTS["Activity"] ||
        [];

  const getStatusColor = () => {
    switch (serviceMode) {
      case "primary":
        return "bg-green-500";
      case "demo":
        return "bg-indigo-500";
      case "fallback-1":
      case "fallback-2":
        return "bg-yellow-500";
      case "local":
        return "bg-red-500";
      default:
        return "bg-green-500";
    }
  };

  const getStatusLabel = () => {
    switch (serviceMode) {
      case "primary":
        return "Gemini Live";
      case "demo":
        return "Demo Simulation";
      case "fallback-1":
      case "fallback-2":
        return "Backup Service";
      case "local":
        return "Local Fallback";
      default:
        return "Gemini";
    }
  };

  // Handle File Upload (PDF, TXT, DOCX)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsParsingDoc(true);
    setError(null);
    try {
      const parsed = await parseAcademicDocument(file);
      setAttachedDoc(parsed);

      // If 'any' is selected and user hasn't typed a title, auto-populate title from file name
      if (selectedMaterialId === "any" && !customSubjectTitle) {
        setCustomSubjectTitle(file.name.replace(/\.[^/.]+$/, ""));
      }

      // Auto-switch to Review mode for checking documents
      if (mode === "guide" || mode === "explain") {
        setMode("review");
      }
    } catch (err) {
      console.error("File parsing error", err);
      setError(
        "Failed to extract text from file. You can still paste the text directly into the chat.",
      );
    } finally {
      setIsParsingDoc(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSendMessage = async (customText?: string) => {
    if (isCooldown || isTyping) return;
    const messageToSend = customText || input;
    if (!messageToSend.trim() && !attachedDoc) return;

    // Snapshot current attached document for this message
    const docToSend = attachedDoc;

    const userDisplayText = messageToSend.trim()
      ? messageToSend
      : `Please review and verify attached document: ${docToSend?.name}`;

    const newUserMessage: ChatMessage = {
      id: generateId(),
      role: "user",
      content: userDisplayText,
      timestamp: new Date().toISOString(),
      attachedDocument: docToSend
        ? {
            name: docToSend.name,
            size: docToSend.size,
            wordCount: docToSend.wordCount,
          }
        : undefined,
    };

    setMessages((prev) => [...prev, newUserMessage]);
    setInput("");
    setAttachedDoc(null); // Clear from staging area so it visibly attaches to the sent message
    setIsTyping(true);
    setIsCooldown(true);
    setError(null);

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    // 1. Quota Guard: Check client query cache for identical repeated queries
    const cacheKey = `studyflow-qc-${selectedMaterial.id}-${mode}-${userDisplayText
      .trim()
      .toLowerCase()
      .slice(0, 80)
      .replace(/[^a-z0-9]/g, "")}-${docToSend ? docToSend.name : "nodoc"}`;

    if (serviceMode !== "local") {
      try {
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          const cachedData = JSON.parse(cached);
          const cachedAssistantMessage: ChatMessage = {
            id: generateId(),
            role: "assistant",
            content: cachedData.response || "",
            timestamp: new Date().toISOString(),
            assistanceMode: mode,
            source: cachedData.source || "gemini-primary",
            responseData: cachedData,
          };
          setTimeout(() => {
            setMessages((prev) => [...prev, cachedAssistantMessage]);
            setIsTyping(false);
            setTimeout(() => setIsCooldown(false), 1200);
          }, 350);
          return;
        }
      } catch {
        // Cache miss: proceed to fetch
      }
    }

    const conversationHistory = messages.slice(-6).map((m) => ({
      role: m.role,
      content: m.content,
    }));

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "text/event-stream, application/json",
        },
        body: JSON.stringify({
          material: {
            id: selectedMaterial.id,
            title: selectedMaterial.title,
            type: selectedMaterial.type,
            description: selectedMaterial.description,
          },
          currentTask: selectedMaterial.currentTask || "",
          assistanceMode: mode,
          conversationHistory,
          message: userDisplayText,
          stream: true,
          attachedDocument: docToSend
            ? {
                name: docToSend.name,
                size: docToSend.size,
                text: docToSend.text,
                wordCount: docToSend.wordCount,
                base64: docToSend.base64,
              }
            : undefined,
          ...(serviceMode !== "primary" ? { forceMode: serviceMode } : {}),
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch response: ${response.status}`);
      }

      const contentType = response.headers.get("content-type") || "";

      if (contentType.includes("text/event-stream")) {
        const reader = response.body?.getReader();
        if (!reader) throw new Error("No readable stream available");

        const decoder = new TextDecoder("utf-8");
        let buffer = "";
        const accumulatedText = { current: "" };
        let finalStructuredData: ChatResponseData | null = null;
        let responseSource = "gemini-primary";

        const assistantMessageId = generateId();
        setMessages((prev) => [
          ...prev,
          {
            id: assistantMessageId,
            role: "assistant",
            content: "",
            timestamp: new Date().toISOString(),
            assistanceMode: mode,
            source: "gemini-primary",
          },
        ]);
        setIsTyping(false);

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith("data:")) continue;
            const dataStr = trimmed.replace(/^data:\s*/, "");
            if (dataStr === "[DONE]") continue;

            try {
              const event = JSON.parse(dataStr);
              if (event.type === "chunk" && event.text) {
                accumulatedText.current += event.text;
                const textSnapshot = accumulatedText.current;
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantMessageId
                      ? { ...m, content: textSnapshot }
                      : m,
                  ),
                );
              } else if (event.type === "done") {
                finalStructuredData = event.data;
                if (event.source) {
                  responseSource = event.source;
                }
              }
            } catch {
              // Ignore partial JSON
            }
          }
        }

        const finalText =
          finalStructuredData?.response || accumulatedText.current;

        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMessageId
              ? {
                  ...m,
                  content: finalText,
                  source: responseSource as any,
                  responseData: finalStructuredData || undefined,
                }
              : m,
          ),
        );

        if (finalStructuredData) {
          try {
            localStorage.setItem(
              cacheKey,
              JSON.stringify({
                ...finalStructuredData,
                source: responseSource,
              }),
            );
          } catch {
            // cache quota full
          }
        }
      } else {
        const data = await response.json();
        const structured = data.data || data;

        const newAssistantMessage: ChatMessage = {
          id: generateId(),
          role: "assistant",
          content: structured.response || data.response || "",
          timestamp: new Date().toISOString(),
          assistanceMode: mode,
          source: data.source || "gemini-primary",
          responseData: structured,
        };

        setMessages((prev) => [...prev, newAssistantMessage]);

        try {
          localStorage.setItem(
            cacheKey,
            JSON.stringify({ ...structured, source: data.source }),
          );
        } catch {
          // storage quota full
        }
      }
    } catch (err: unknown) {
      console.error("Chat error:", err);
      setError(
        "An error occurred while generating the response. Please try again or switch to local template.",
      );
    } finally {
      setIsTyping(false);
      setTimeout(() => setIsCooldown(false), 1200);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearChat = () => {
    if (confirm("Clear the conversation for this material?")) {
      setMessages([]);
      localStorage.removeItem(`studyflow-chat-${selectedMaterial.id}`);
    }
  };

  const initiateSave = (messageId: string, response: ChatResponseData) => {
    const isLongExplanation =
      response.responseType === "explanation" && response.response.length > 500;
    if (
      showReviewCheckpoint &&
      (mode === "draft" ||
        response.responseType === "checklist" ||
        isLongExplanation)
    ) {
      setShowReviewModal({ messageId, response });
      setReviewAnswers({ mainIdea: "", whatToVerify: "", ownWords: "" });
    } else {
      saveResponse(messageId, response, null);
    }
  };

  const saveResponse = (
    messageId: string,
    response: ChatResponseData,
    review: { mainIdea: string; whatToVerify: string; ownWords: string } | null,
  ) => {
    const message = messages.find((m) => m.id === messageId);
    const msgIndex = messages.findIndex((m) => m.id === messageId);
    const userMessageContent =
      msgIndex > 0 && messages[msgIndex - 1]?.role === "user"
        ? messages[msgIndex - 1].content
        : input || "AI Interaction";

    const saved: SavedResponse = {
      id: generateId(),
      materialId: selectedMaterial.id,
      materialTitle: selectedMaterial.title,
      materialType: selectedMaterial.type,
      currentTask: selectedMaterial.currentTask || "",
      assistanceMode: mode,
      userMessage: userMessageContent,
      responseData: response,
      savedAt: new Date().toISOString(),
      source: message?.source || "gemini-primary",
      reviewAnswers: review || undefined,
    };

    try {
      const existing = localStorage.getItem("studyflow-saved-responses");
      const parsed = existing ? JSON.parse(existing) : [];
      localStorage.setItem(
        "studyflow-saved-responses",
        JSON.stringify([saved, ...parsed]),
      );
    } catch {
      // ignore
    }

    setShowReviewModal(null);
    setShowReceiptModal(saved);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] max-w-5xl mx-auto bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors">
      {/* Top Header & Material Switcher Bar */}
      <div className="p-4 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-indigo-600 dark:bg-indigo-500 text-white flex items-center justify-center font-bold text-lg shadow-sm">
            <Bot className="w-5 h-5" />
          </div>
          <div className="flex-1 sm:flex-none">
            <div className="flex items-center gap-2">
              <label
                htmlFor="material-select"
                className="text-xs font-bold text-slate-500 uppercase tracking-wider"
              >
                Material Context:
              </label>
            </div>
            <select
              id="material-select"
              value={selectedMaterialId}
              onChange={(e) => {
                setSelectedMaterialId(e.target.value);
                if (e.target.value !== "any") {
                  setCustomSubjectTitle("");
                }
              }}
              className="mt-0.5 text-sm font-semibold bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 shadow-sm"
            >
              <option value="any">
                Any Material / Custom Upload (Live Gemini)
              </option>
              {MATERIALS.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.title} ({m.type})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-center">
          {/* Status Indicator */}
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            <span className={`w-2 h-2 rounded-full ${getStatusColor()}`} />
            <span>{getStatusLabel()}</span>
          </div>

          <button
            onClick={clearChat}
            title="Clear Chat History"
            className="flex items-center gap-1 px-2 py-1 text-slate-400 hover:text-red-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-xs font-medium"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Clear</span>
          </button>

          {selectedMaterial.id !== "any" && (
            <Link
              href={`/materials/${selectedMaterial.id}`}
              className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              <span>Details</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          )}
        </div>
      </div>

      {/* Dynamic Subject / Material Banner for 'any' mode */}
      {selectedMaterialId === "any" ? (
        <div className="px-4 py-2.5 bg-indigo-50/80 dark:bg-indigo-950/50 border-b border-indigo-100 dark:border-indigo-900/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 flex-1 w-full sm:w-auto">
            <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
            <input
              type="text"
              value={customSubjectTitle}
              onChange={(e) => setCustomSubjectTitle(e.target.value)}
              placeholder="Enter subject name (e.g. Organic Chemistry, Macroeconomics Assignment, or attach file below)..."
              className="w-full sm:max-w-md px-2.5 py-1 text-xs bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800 rounded-md focus:ring-1 focus:ring-indigo-500 font-medium text-slate-800 dark:text-slate-200"
            />
          </div>
          <span className="text-[11px] text-indigo-700 dark:text-indigo-300 font-medium flex items-center gap-1">
            <FileCheck className="w-3.5 h-3.5" />
            Live Analysis Mode
          </span>
        </div>
      ) : (
        <div className="px-4 py-2 bg-indigo-50/70 dark:bg-indigo-950/40 border-b border-indigo-100 dark:border-indigo-900/50 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 truncate">
            <Target className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
            <span className="font-semibold text-indigo-800 dark:text-indigo-300">
              Target Task:
            </span>
            <span className="text-indigo-700 dark:text-indigo-200 truncate">
              {selectedMaterial.currentTask || selectedMaterial.description}
            </span>
          </div>
          <span className="hidden md:inline text-indigo-600 dark:text-indigo-400 font-medium">
            Contextually Grounded
          </span>
        </div>
      )}

      {/* Chat Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 bg-slate-50/50 dark:bg-slate-900/50">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[360px] text-center max-w-lg mx-auto py-8">
            <div className="w-14 h-14 rounded-2xl bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-4 shadow-sm">
              <Bot className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-1">
              Task Companion Ready
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 mb-6">
              Ask questions about{" "}
              <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                {selectedMaterial.title}
              </span>
              , or attach a document (PDF, TXT, DOCX) to review and verify.
            </p>

            <div className="w-full space-y-2 text-left">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Lightbulb className="w-3.5 h-3.5 text-indigo-500" />
                <span>Recommended Prompts:</span>
              </p>
              {suggestedPrompts.slice(0, 4).map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => handleSendMessage(prompt)}
                  className="flex items-center gap-2.5 w-full p-3 text-sm text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-indigo-400 hover:shadow-sm transition-all text-left group"
                >
                  <Sparkles className="w-4 h-4 text-indigo-500 flex-shrink-0 group-hover:scale-110 transition-transform" />
                  <span className="group-hover:translate-x-0.5 transition-transform">
                    {prompt}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={classNames(
                "flex animate-slide-up",
                msg.role === "user" ? "justify-end" : "justify-start",
              )}
            >
              {msg.role === "user" ? (
                <div className="bg-indigo-600 text-white rounded-2xl rounded-tr-sm px-5 py-3 max-w-[85%] sm:max-w-[75%] shadow-sm space-y-2">
                  {msg.attachedDocument && (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-700/80 border border-indigo-400/40 rounded-lg text-xs w-fit">
                      <FileText className="w-4 h-4 text-indigo-200 flex-shrink-0" />
                      <span className="font-semibold truncate max-w-[180px] sm:max-w-[280px]">
                        {msg.attachedDocument.name}
                      </span>
                      <span className="text-indigo-200 text-[10px] whitespace-nowrap">
                        ({(msg.attachedDocument.size / 1024).toFixed(1)} KB)
                      </span>
                    </div>
                  )}
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">
                    {msg.content}
                  </p>
                </div>
              ) : (
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl rounded-tl-sm px-5 py-4 max-w-[95%] sm:max-w-[85%] shadow-sm space-y-3.5">
                  {/* Metadata Header Badge */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-0.5 text-[10px] uppercase tracking-wider font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 rounded-md border border-indigo-200 dark:border-indigo-800 flex items-center gap-1">
                      <Bot className="w-3 h-3" />
                      AI • {msg.assistanceMode || "response"}
                    </span>

                    {msg.source === "local-template" && (
                      <span className="px-2.5 py-0.5 text-[10px] uppercase tracking-wider font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 rounded-md border border-amber-200 dark:border-amber-800">
                        Offline Template
                      </span>
                    )}
                    {(msg.source === "gemini-fallback-1" ||
                      msg.source === "gemini-fallback-2") && (
                      <span className="px-2.5 py-0.5 text-[10px] uppercase tracking-wider font-bold bg-yellow-100 dark:bg-yellow-950 text-yellow-800 dark:text-yellow-300 rounded-md border border-yellow-200 dark:border-yellow-800">
                        Backup AI Service
                      </span>
                    )}
                    {msg.source === "demo-simulation" && (
                      <span className="px-2.5 py-0.5 text-[10px] uppercase tracking-wider font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 rounded-md border border-indigo-200 dark:border-indigo-800">
                        Demo Simulation
                      </span>
                    )}
                    {msg.source === "gemini-primary" && (
                      <span className="px-2.5 py-0.5 text-[10px] uppercase tracking-wider font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 rounded-md border border-emerald-200 dark:border-emerald-800">
                        Gemini Live
                      </span>
                    )}

                    {msg.responseData?.requiresReview && (
                      <span className="px-2.5 py-0.5 text-[10px] uppercase tracking-wider font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 rounded-md border border-amber-200 dark:border-amber-800 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        Requires Review
                      </span>
                    )}
                  </div>

                  {/* Main Response Text */}
                  <div className="prose prose-sm dark:prose-invert max-w-none text-slate-800 dark:text-slate-100 leading-relaxed text-sm">
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  </div>

                  {/* Key Points - Compact & Integrated */}
                  {msg.responseData?.keyPoints &&
                    msg.responseData.keyPoints.length > 0 && (
                      <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60 space-y-1">
                        <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                          <span>Key Takeaways</span>
                        </p>
                        <ul className="space-y-1 pl-1">
                          {msg.responseData.keyPoints.map(
                            (point: string, i: number) => (
                              <li
                                key={i}
                                className="text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2"
                              >
                                <span className="text-indigo-500 font-bold">
                                  •
                                </span>
                                <span>{point}</span>
                              </li>
                            ),
                          )}
                        </ul>
                      </div>
                    )}

                  {/* Verification Questions - Compact Callout */}
                  {msg.responseData?.verificationQuestions &&
                    msg.responseData.verificationQuestions.length > 0 && (
                      <div className="px-3 py-2 bg-indigo-50/70 dark:bg-indigo-950/40 rounded-lg text-xs text-indigo-900 dark:text-indigo-200 flex items-start gap-2 border border-indigo-100 dark:border-indigo-900/50">
                        <HelpCircle className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 mt-0.5 flex-shrink-0" />
                        <div className="space-y-0.5">
                          <span className="font-semibold block">
                            To verify independently:
                          </span>
                          {msg.responseData.verificationQuestions.map(
                            (q: string, i: number) => (
                              <p
                                key={i}
                                className="text-xs text-indigo-800 dark:text-indigo-300"
                              >
                                • {q}
                              </p>
                            ),
                          )}
                        </div>
                      </div>
                    )}

                  {/* Uncertainties Callout - If any */}
                  {msg.responseData?.uncertainties &&
                    msg.responseData.uncertainties.length > 0 && (
                      <div className="bg-amber-50 dark:bg-amber-950/40 p-2.5 rounded-lg border border-amber-200 dark:border-amber-800 text-xs">
                        <p className="font-semibold text-amber-900 dark:text-amber-200 mb-1 flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                          <span>Note to verify:</span>
                        </p>
                        <ul className="list-disc list-inside space-y-0.5 text-amber-800 dark:text-amber-300">
                          {msg.responseData.uncertainties.map(
                            (u: string, i: number) => (
                              <li key={i}>{u}</li>
                            ),
                          )}
                        </ul>
                      </div>
                    )}

                  {/* Suggested Next Action */}
                  {msg.responseData?.suggestedNextAction && (
                    <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 pt-1">
                      <ArrowRight className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0" />
                      <span>
                        <strong className="text-slate-800 dark:text-slate-200">
                          Next Step:
                        </strong>{" "}
                        {msg.responseData.suggestedNextAction}
                      </span>
                    </div>
                  )}

                  {/* Action Bar (Follow-ups + Save/Discard) */}
                  <div className="pt-2.5 border-t border-slate-100 dark:border-slate-700/60 flex flex-col gap-2.5">
                    {msg.responseData?.followUpActions &&
                      msg.responseData.followUpActions.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {msg.responseData.followUpActions
                            .slice(0, 3)
                            .map((action: string, i: number) => (
                              <button
                                key={i}
                                onClick={() => handleSendMessage(action)}
                                className="px-2.5 py-1 text-xs bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 font-medium rounded-full transition-colors border border-indigo-200 dark:border-indigo-800 flex items-center gap-1"
                              >
                                <ArrowRight className="w-2.5 h-2.5" />
                                <span>{action}</span>
                              </button>
                            ))}
                        </div>
                      )}

                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() =>
                          setMessages((prev) =>
                            prev.filter((m) => m.id !== msg.id),
                          )
                        }
                        className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-50 transition-colors"
                      >
                        Discard
                      </button>
                      <button
                        onClick={() => initiateSave(msg.id, msg.responseData!)}
                        className="px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
                      >
                        <Receipt className="w-3.5 h-3.5" />
                        <span>Save Response</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}

        {isTyping && (
          <div className="flex justify-start animate-slide-up">
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600 animate-spin" />
              <span className="text-xs text-slate-500">
                StudyFlow is analyzing...
              </span>
            </div>
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800 rounded-xl text-xs flex justify-between items-center">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <span>{error}</span>
            </div>
            <button
              onClick={() => handleSendMessage()}
              className="font-bold underline ml-2"
            >
              Retry
            </button>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Bottom Composer Area */}
      <div className="p-4 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 space-y-3">
        {/* Assistance Mode Selector */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mr-1">
            Mode:
          </span>
          {(
            [
              { id: "explain", label: "Explain", icon: Lightbulb },
              { id: "guide", label: "Guide", icon: Compass },
              { id: "organize", label: "Organize", icon: ListOrdered },
              { id: "explore", label: "Explore", icon: Search },
              { id: "review", label: "Review", icon: CheckCircle2 },
              { id: "draft", label: "Draft", icon: FileEdit },
            ] as const
          ).map(({ id, label, icon: ModeIcon }) => (
            <button
              key={id}
              onClick={() => setMode(id)}
              className={classNames(
                "px-2.5 py-1 text-xs font-medium rounded-full transition-all border flex items-center gap-1.5",
                mode === id
                  ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                  : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100",
              )}
            >
              <ModeIcon className="w-3.5 h-3.5" />
              <span>{label}</span>
            </button>
          ))}
        </div>

        {/* Draft Notice */}
        {mode === "draft" && (
          <div className="px-3 py-1.5 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 rounded-lg text-xs text-amber-800 dark:text-amber-300 flex items-center gap-2">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            <span>
              Preliminary AI-assisted output — review required before academic
              use.
            </span>
          </div>
        )}

        {/* Attached Document Pill (if uploaded) */}
        {attachedDoc && (
          <div className="flex items-center justify-between px-3 py-2 bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800 rounded-xl text-xs">
            <div className="flex items-center gap-2 truncate">
              <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
              <span className="font-semibold text-indigo-900 dark:text-indigo-200 truncate">
                {attachedDoc.name}
              </span>
              <span className="text-indigo-600 dark:text-indigo-400">
                ({(attachedDoc.size / 1024).toFixed(1)} KB, ~
                {attachedDoc.wordCount} words)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  handleSendMessage(
                    "Please check this document for any gibberish, hallucinated text, or unrelated topics, and verify its academic relevance.",
                  )
                }
                className="px-2.5 py-1 bg-indigo-600 text-white rounded text-[11px] font-bold hover:bg-indigo-700 transition-colors flex items-center gap-1"
              >
                <CheckCircle2 className="w-3 h-3" />
                <span>Verify Document</span>
              </button>
              <button
                onClick={() => setAttachedDoc(null)}
                className="text-slate-400 hover:text-red-500 font-bold p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
                title="Remove attached document"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Main Input Box with File Upload Button */}
        <div className="relative flex items-end gap-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-2 focus-within:ring-2 focus-within:ring-indigo-500 transition-all">
          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.txt,.docx,.doc,.md"
            onChange={handleFileUpload}
            className="hidden"
          />

          {/* Attach Button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isParsingDoc || isTyping}
            title="Upload academic document (PDF, TXT, DOCX) to review"
            className="p-2 text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors flex-shrink-0"
          >
            {isParsingDoc ? (
              <RefreshCw className="w-4 h-4 animate-spin text-indigo-500" />
            ) : (
              <Paperclip className="w-4 h-4" />
            )}
          </button>

          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              e.target.style.height = "auto";
              e.target.style.height =
                Math.min(e.target.scrollHeight, 120) + "px";
            }}
            onKeyDown={handleKeyDown}
            placeholder={
              attachedDoc
                ? `Ask anything about ${attachedDoc.name}... (e.g. "Check for gibberish", "Summarize key claims")`
                : `Ask Task Companion about ${selectedMaterial.title}... (or attach a PDF/TXT/DOCX file)`
            }
            className="w-full max-h-[120px] bg-transparent border-0 resize-none focus:ring-0 text-slate-900 dark:text-slate-100 placeholder-slate-400 py-1.5 px-1 min-h-[40px] text-sm"
            rows={1}
            maxLength={2000}
            disabled={isTyping}
          />

          <button
            onClick={() => handleSendMessage()}
            disabled={(!input.trim() && !attachedDoc) || isTyping || isCooldown}
            className="flex-shrink-0 p-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
            aria-label="Send message"
            title={isCooldown ? "Please wait a moment..." : "Send message"}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

        {/* Input Footer Indicator */}
        <div className="flex justify-between items-center text-[10px] text-slate-500 dark:text-slate-400 px-1">
          <span>
            {selectedMaterial.title} • {mode} mode • {GEMINI_MODEL_LABEL}
          </span>
          <span>{input.length}/2000</span>
        </div>
      </div>

      {/* Review Checkpoint Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center">
                <FileEdit className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                Review this before saving
              </h2>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 mb-5">
              Reflecting on AI assistance builds metacognitive awareness. Answer
              these brief questions before saving to your record.
            </p>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  1. What is the main idea?
                </label>
                <input
                  type="text"
                  value={reviewAnswers.mainIdea}
                  onChange={(e) =>
                    setReviewAnswers({
                      ...reviewAnswers,
                      mainIdea: e.target.value,
                    })
                  }
                  placeholder="Summary in a few words..."
                  className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  2. What part should you verify?
                </label>
                <input
                  type="text"
                  value={reviewAnswers.whatToVerify}
                  onChange={(e) =>
                    setReviewAnswers({
                      ...reviewAnswers,
                      whatToVerify: e.target.value,
                    })
                  }
                  placeholder="Claims, facts, or instructions to check..."
                  className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  3. What would you explain differently in your own words?
                </label>
                <textarea
                  value={reviewAnswers.ownWords}
                  onChange={(e) =>
                    setReviewAnswers({
                      ...reviewAnswers,
                      ownWords: e.target.value,
                    })
                  }
                  rows={2}
                  placeholder="Your personal phrasing or perspective..."
                  className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2.5">
              <button
                onClick={() => setShowReviewModal(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() =>
                  saveResponse(
                    showReviewModal.messageId,
                    showReviewModal.response,
                    null,
                  )
                }
                className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Skip Review & Save
              </button>
              <button
                onClick={() =>
                  saveResponse(
                    showReviewModal.messageId,
                    showReviewModal.response,
                    reviewAnswers,
                  )
                }
                className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors"
              >
                Save with Review
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Learning Receipt Modal */}
      {showReceiptModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 dark:border-slate-800">
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-5 text-white text-center">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-1">
                <Receipt className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-lg font-bold">AI Learning Receipt</h2>
              <p className="text-[11px] opacity-90 mt-0.5">
                Prototype-only local record.
              </p>
            </div>

            <div className="p-5 space-y-4">
              <div className="bg-slate-50 dark:bg-slate-950 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Material:</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100 truncate max-w-[200px]">
                    {showReceiptModal.materialTitle}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">
                    Assistance Mode:
                  </span>
                  <span className="capitalize font-bold text-indigo-600 dark:text-indigo-400">
                    {showReceiptModal.assistanceMode}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">
                    Service Source:
                  </span>
                  <span className="font-mono text-[11px] bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                    {showReceiptModal.source}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Saved At:</span>
                  <span className="text-slate-700 dark:text-slate-300">
                    {new Date(showReceiptModal.savedAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>

              {showReceiptModal.reviewAnswers?.mainIdea && (
                <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-xl text-xs space-y-1 border border-blue-100 dark:border-blue-900">
                  <span className="font-bold text-blue-900 dark:text-blue-200">
                    Main Idea Identified:
                  </span>
                  <p className="text-blue-800 dark:text-blue-300">
                    {showReceiptModal.reviewAnswers.mainIdea}
                  </p>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Student Reflection Notes:
                </label>
                <textarea
                  value={reflection}
                  onChange={(e) => setReflection(e.target.value)}
                  placeholder="Add notes for your defense or instructor review..."
                  rows={2}
                  className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg focus:ring-2 focus:ring-emerald-500 resize-none"
                />
              </div>

              <button
                onClick={() => {
                  setShowReceiptModal(null);
                  setReflection("");
                }}
                className="w-full py-2.5 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold rounded-xl text-xs hover:bg-slate-800 transition-colors shadow"
              >
                Close Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
