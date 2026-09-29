"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  mockMaterials as MATERIALS,
  SUGGESTED_PROMPTS,
  ASSISTANCE_MODES,
} from "@/lib/mock-data";
import {
  AssistanceMode,
  ChatMessage,
  ChatResponseData,
  SavedResponse,
  Material,
  ServiceSource,
} from "@/lib/types";
import { classNames, generateId } from "@/lib/utils";
import { usePrototype } from "@/lib/prototype-context";
import { parseAcademicDocument, ParsedDocument } from "@/lib/document-parser";
import { DOCUMENT_READABLE_NOTICE } from "@/lib/contextual-engine";
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
  Receipt,
  Send,
  AlertTriangle,
  ArrowRight,
  HelpCircle,
  Target,
  RotateCcw,
  BookOpen,
  Info,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface TaskCompanionProps {
  initialMaterialId?: string;
  initialMode?: AssistanceMode;
  initialStudentAnswer?: string;
}

const DEFAULT_ANY_MATERIAL: Material = {
  id: "any",
  title: "Any Academic Material / Custom Upload",
  type: "Activity",
  description:
    "Provide any subject, worksheet, problem set, or upload an academic document for contextual guidance and review.",
  instructions:
    "General Academic Instructions:\n1. Clearly state your core learning objective.\n2. Review instructions and identify questions.\n3. Formulate your answer in your own words before requesting review.",
  content:
    "General Course Content: StudyFlow provides contextual academic scaffolding to university students across activities, handouts, problem sets, reflection papers, and presentations.",
  currentTask: "Review the material instructions and begin with Step 1.",
  progress: 0,
  status: "in-progress",
};

export default function TaskCompanion({
  initialMaterialId,
  initialMode = "guide",
  initialStudentAnswer = "",
}: TaskCompanionProps) {
  const {
    serviceMode,
    showReviewCheckpoint,
    showDocumentEvidence,
    languageMode,
    setLanguageMode,
  } = usePrototype();

  const [selectedMaterialId, setSelectedMaterialId] = useState<string>(
    initialMaterialId || "photosynthesis-activity",
  );

  const selectedMaterial: Material =
    selectedMaterialId === "any"
      ? DEFAULT_ANY_MATERIAL
      : MATERIALS.find((m) => m.id === selectedMaterialId) ||
        DEFAULT_ANY_MATERIAL;

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<AssistanceMode>(initialMode);
  const [isTyping, setIsTyping] = useState(false);
  const [isCooldown, setIsCooldown] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Student Draft Answer state
  const [studentAnswer, setStudentAnswer] = useState(initialStudentAnswer);
  const [showAnswerDrawer, setShowAnswerDrawer] = useState(
    Boolean(initialStudentAnswer),
  );

  // Attached Document State
  const [attachedDoc, setAttachedDoc] = useState<ParsedDocument | null>(null);

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
        // storage quota full
      }
    }
  }, [messages, selectedMaterial.id]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const suggestedPrompts =
    SUGGESTED_PROMPTS[selectedMaterial.type] ||
    SUGGESTED_PROMPTS["Activity"] ||
    [];

  const getSourceBadge = (source?: ServiceSource) => {
    switch (source) {
      case "gemini-live":
      case "gemini-primary":
        return {
          label: "Gemini Live",
          color:
            "bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
        };
      case "gemini-backup":
      case "gemini-fallback-1":
      case "gemini-fallback-2":
        return {
          label: "Gemini Backup",
          color:
            "bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800",
        };
      case "local-fallback":
      case "local-template":
      default:
        return {
          label: "Local Fallback Template",
          color:
            "bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800",
        };
    }
  };

  // Handle Document Upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    try {
      const parsed = await parseAcademicDocument(file);
      setAttachedDoc(parsed);

      // Add notification system message in the chat
      const uploadNoticeMsg: ChatMessage = {
        id: generateId(),
        role: "assistant",
        content: `${DOCUMENT_READABLE_NOTICE}\n\nDocument attached: **${parsed.name}** (${(parsed.size / 1024).toFixed(1)} KB, ~${parsed.wordCount || 100} words).`,
        timestamp: new Date().toISOString(),
        source: "local-fallback",
        attachedDocument: {
          name: parsed.name,
          size: parsed.size,
          wordCount: parsed.wordCount,
        },
      };
      setMessages((prev) => [...prev, uploadNoticeMsg]);
    } catch (err) {
      console.error("File parsing error", err);
      setError(
        "Failed to extract text from file. You can still paste text directly.",
      );
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSendMessage = async (customText?: string) => {
    if (isCooldown || isTyping) return;
    const messageToSend = customText || input;
    if (!messageToSend.trim() && !attachedDoc && !studentAnswer.trim()) return;

    const docToSend = attachedDoc;
    const answerToSend = studentAnswer.trim() || undefined;

    const userDisplayText = messageToSend.trim()
      ? messageToSend
      : answerToSend
        ? "Please review my submitted draft answer against the material instructions."
        : `Please guide me on the attached document: ${docToSend?.name}`;

    const newUserMessage: ChatMessage = {
      id: generateId(),
      role: "user",
      content: userDisplayText,
      timestamp: new Date().toISOString(),
      assistanceMode: mode,
      languageMode,
      studentAnswer: answerToSend,
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
    setAttachedDoc(null);
    setIsTyping(true);
    setIsCooldown(true);
    setError(null);

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
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
            instructions: selectedMaterial.instructions,
            content: selectedMaterial.content,
            description: selectedMaterial.description,
          },
          currentTask: selectedMaterial.currentTask || "",
          studentAnswer: answerToSend || null,
          userMessage: userDisplayText,
          assistanceMode: mode,
          languageMode,
          conversationHistory,
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
        throw new Error(`Service returned HTTP ${response.status}`);
      }

      const contentType = response.headers.get("content-type") || "";

      if (contentType.includes("text/event-stream")) {
        const reader = response.body?.getReader();
        if (!reader) throw new Error("No readable stream");

        const decoder = new TextDecoder("utf-8");
        let buffer = "";
        const accumulatedText = { current: "" };
        let finalStructuredData: ChatResponseData | null = null;
        let responseSource: ServiceSource = "gemini-live";

        const assistantMsgId = generateId();
        setMessages((prev) => [
          ...prev,
          {
            id: assistantMsgId,
            role: "assistant",
            content: "",
            timestamp: new Date().toISOString(),
            assistanceMode: mode,
            languageMode,
            source: "gemini-live",
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
                    m.id === assistantMsgId
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
          finalStructuredData?.directResponse ||
          finalStructuredData?.response ||
          accumulatedText.current;

        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMsgId
              ? {
                  ...m,
                  content: finalText,
                  source: responseSource,
                  responseData: finalStructuredData || undefined,
                }
              : m,
          ),
        );
      } else {
        const data = await response.json();
        const structured: ChatResponseData = data.data || data;

        const newAssistantMessage: ChatMessage = {
          id: generateId(),
          role: "assistant",
          content:
            structured.directResponse ||
            structured.response ||
            data.response ||
            "",
          timestamp: new Date().toISOString(),
          assistanceMode: mode,
          languageMode,
          source: data.source || "gemini-live",
          responseData: structured,
        };

        setMessages((prev) => [...prev, newAssistantMessage]);
      }
    } catch (err: unknown) {
      console.error("Chat error:", err);
      setError(
        "Live AI assistance is temporarily unavailable. You can continue with a local academic template or try again later.",
      );
    } finally {
      setIsTyping(false);
      setTimeout(() => setIsCooldown(false), 800);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearChat = () => {
    if (confirm("Clear conversation history for this material?")) {
      setMessages([]);
      localStorage.removeItem(`studyflow-chat-${selectedMaterial.id}`);
    }
  };

  const initiateSave = (messageId: string, response: ChatResponseData) => {
    if (showReviewCheckpoint) {
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
        : input || "Academic Inquiry";

    const saved: SavedResponse = {
      id: generateId(),
      materialId: selectedMaterial.id,
      materialTitle: selectedMaterial.title,
      materialType: selectedMaterial.type,
      currentTask: selectedMaterial.currentTask || "",
      assistanceMode: mode,
      languageMode,
      userMessage: userMessageContent,
      studentAnswer: studentAnswer.trim() || undefined,
      responseData: response,
      savedAt: new Date().toISOString(),
      source: message?.source || "gemini-live",
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
      // storage quota full
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
            <label
              htmlFor="material-select"
              className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block"
            >
              Academic Material Context:
            </label>
            <select
              id="material-select"
              value={selectedMaterialId}
              onChange={(e) => setSelectedMaterialId(e.target.value)}
              className="mt-0.5 text-sm font-semibold bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 shadow-sm max-w-[280px] sm:max-w-md truncate"
            >
              <option value="any">Any Academic Material / Custom Upload</option>
              {MATERIALS.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.title} ({m.type})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Language & Actions */}
        <div className="flex flex-wrap items-center gap-2.5 self-end sm:self-center">
          {/* Visible Language Selector */}
          <div className="flex items-center gap-1 bg-white dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700 text-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">
              Lang:
            </span>
            <button
              type="button"
              onClick={() => setLanguageMode("english")}
              className={`px-2 py-0.5 rounded font-medium transition-colors ${
                languageMode === "english"
                  ? "bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              English
            </button>
            <button
              type="button"
              onClick={() => setLanguageMode("filipino")}
              className={`px-2 py-0.5 rounded font-medium transition-colors ${
                languageMode === "filipino"
                  ? "bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              Filipino
            </button>
            <button
              type="button"
              onClick={() => setLanguageMode("taglish")}
              title="Taglish — Tagalog-English code-switching"
              className={`px-2 py-0.5 rounded font-medium transition-colors ${
                languageMode === "taglish"
                  ? "bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              Taglish
            </button>
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

      {/* Target Task & Material Overview Banner */}
      <div className="px-4 py-2 bg-indigo-50/70 dark:bg-indigo-950/40 border-b border-indigo-100 dark:border-indigo-900/50 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 truncate">
          <Target className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
          <span className="font-semibold text-indigo-800 dark:text-indigo-300">
            Target Task:
          </span>
          <span className="text-indigo-700 dark:text-indigo-200 truncate max-w-xs sm:max-w-md">
            {selectedMaterial.currentTask || selectedMaterial.description}
          </span>
        </div>

        <button
          type="button"
          onClick={() => setShowAnswerDrawer(!showAnswerDrawer)}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md font-medium text-xs transition-colors ${
            studentAnswer.trim()
              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-300"
              : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-indigo-300"
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>
            {studentAnswer.trim()
              ? "My Draft Answer (Attached)"
              : "Attach My Draft Answer"}
          </span>
          {showAnswerDrawer ? (
            <ChevronUp className="w-3 h-3" />
          ) : (
            <ChevronDown className="w-3 h-3" />
          )}
        </button>
      </div>

      {/* Expandable Student Answer Drawer */}
      {showAnswerDrawer && (
        <div className="px-4 py-3 bg-slate-50 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800 text-xs space-y-2">
          <div className="flex justify-between items-center">
            <span className="font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
              <FileEdit className="w-3.5 h-3.5 text-indigo-600" />
              <span>Student Draft / Answer Field (Separate from Chat):</span>
            </span>
            <span className="text-[11px] text-slate-500">
              {studentAnswer.trim().split(/\s+/).filter(Boolean).length} words
            </span>
          </div>
          <textarea
            value={studentAnswer}
            onChange={(e) => setStudentAnswer(e.target.value)}
            placeholder="Type or paste your actual answer, essay paragraph, or problem calculation here. When you ask the AI to review, it will assess this text directly against the assignment rubric."
            rows={3}
            className="w-full p-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 leading-relaxed"
          />
          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <span>
              {studentAnswer.trim()
                ? "Your draft will be submitted for review on your next request."
                : "No answer submitted yet. Casual chat messages will not be judged as your answer."}
            </span>
            {studentAnswer.trim() && (
              <button
                type="button"
                onClick={() => setStudentAnswer("")}
                className="text-red-500 hover:underline"
              >
                Clear draft
              </button>
            )}
          </div>
        </div>
      )}

      {/* Chat Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 bg-slate-50/50 dark:bg-slate-900/50">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[340px] text-center max-w-lg mx-auto py-8">
            <div className="w-14 h-14 rounded-2xl bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-4 shadow-sm">
              <Bot className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-1">
              Task Companion Ready
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 mb-6">
              Working with{" "}
              <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                {selectedMaterial.title}
              </span>
              . Select a mode or choose a prompt to begin:
            </p>

            <div className="w-full space-y-2 text-left">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Lightbulb className="w-3.5 h-3.5 text-indigo-500" />
                <span>Suggested Prompts for this {selectedMaterial.type}:</span>
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
          messages.map((msg) => {
            const badge = getSourceBadge(msg.source);
            return (
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
                        <span className="text-indigo-200 text-[10px]">
                          ({(msg.attachedDocument.size / 1024).toFixed(1)} KB)
                        </span>
                      </div>
                    )}
                    {msg.studentAnswer && (
                      <div className="p-2 bg-indigo-700/60 border border-indigo-400/30 rounded-lg text-xs">
                        <span className="font-semibold text-indigo-200 block mb-0.5">
                          Submitted Draft for Review:
                        </span>
                        <p className="line-clamp-2 text-indigo-100 italic">
                          "{msg.studentAnswer}"
                        </p>
                      </div>
                    )}
                    <p className="whitespace-pre-wrap text-sm leading-relaxed">
                      {msg.content}
                    </p>
                  </div>
                ) : (
                  <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl rounded-tl-sm px-5 py-4 max-w-[95%] sm:max-w-[85%] shadow-sm space-y-3.5">
                    {/* Header Badges */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-0.5 text-[10px] uppercase tracking-wider font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 rounded-md border border-indigo-200 dark:border-indigo-800 flex items-center gap-1">
                        <Bot className="w-3 h-3" />
                        AI • {msg.assistanceMode || "response"}
                      </span>

                      <span
                        className={`px-2.5 py-0.5 text-[10px] uppercase tracking-wider font-bold rounded-md border ${badge.color}`}
                      >
                        {badge.label}
                      </span>

                      {msg.responseData?.status === "needs_clarification" && (
                        <span className="px-2 py-0.5 text-[10px] font-bold bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 rounded-md border border-purple-200 dark:border-purple-800">
                          Awaiting Student Draft
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

                    {/* Document Evidence Section */}
                    {showDocumentEvidence &&
                      msg.responseData?.documentEvidence &&
                      msg.responseData.documentEvidence.length > 0 && (
                        <div className="p-3 bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-700 rounded-xl space-y-2 text-xs">
                          <div className="flex items-center gap-1.5 font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider text-[10px]">
                            <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                            <span>Document Evidence & Course Anchors</span>
                          </div>
                          {msg.responseData.documentEvidence.map((ev, idx) => (
                            <div
                              key={idx}
                              className="p-2 bg-white dark:bg-slate-800 rounded border border-slate-200/80 dark:border-slate-700/80 space-y-1"
                            >
                              <span className="font-semibold text-indigo-700 dark:text-indigo-400 block">
                                {ev.location}
                              </span>
                              <p className="text-slate-600 dark:text-slate-300 italic">
                                "{ev.excerptOrSummary}"
                              </p>
                              {ev.whyItMatters && (
                                <p className="text-[11px] text-slate-500">
                                  <strong>Why it matters:</strong>{" "}
                                  {ev.whyItMatters}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                    {/* Key Points */}
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

                    {/* Missing Information Callout */}
                    {msg.responseData?.missingInformation &&
                      msg.responseData.missingInformation.length > 0 && (
                        <div className="p-2.5 bg-amber-50/80 dark:bg-amber-950/40 rounded-lg text-xs text-amber-900 dark:text-amber-200 border border-amber-200 dark:border-amber-800 flex items-start gap-2">
                          <Info className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                          <div className="space-y-0.5">
                            <span className="font-bold block">
                              Items Needed / Missing:
                            </span>
                            {msg.responseData.missingInformation.map(
                              (info, idx) => (
                                <p key={idx}>• {info}</p>
                              ),
                            )}
                          </div>
                        </div>
                      )}

                    {/* Verification Questions */}
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
                                <p key={i}>• {q}</p>
                              ),
                            )}
                          </div>
                        </div>
                      )}

                    {/* Suggested Next Action */}
                    {(msg.responseData?.suggestedNextAction ||
                      msg.responseData?.suggestedNextActions?.[0]) && (
                      <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 pt-1">
                        <ArrowRight className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0" />
                        <span>
                          <strong className="text-slate-800 dark:text-slate-200">
                            Recommended Next Step:
                          </strong>{" "}
                          {msg.responseData.suggestedNextAction ||
                            msg.responseData.suggestedNextActions[0]}
                        </span>
                      </div>
                    )}

                    {/* Follow-up Action Buttons & Save */}
                    <div className="pt-2.5 border-t border-slate-100 dark:border-slate-700/60 flex flex-col gap-2.5">
                      {(msg.responseData?.suggestedNextActions ||
                        msg.responseData?.followUpActions) && (
                        <div className="flex flex-wrap gap-1.5">
                          {(
                            msg.responseData.suggestedNextActions ||
                            msg.responseData.followUpActions ||
                            []
                          )
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
                          onClick={() =>
                            initiateSave(msg.id, msg.responseData!)
                          }
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
            );
          })
        )}

        {isTyping && (
          <div className="flex justify-start animate-slide-up">
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600 animate-spin" />
              <span className="text-xs text-slate-500">
                StudyFlow is analyzing in {languageMode.toUpperCase()}...
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
        {/* Assistance Mode Selector Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mr-1">
            Mode:
          </span>
          {ASSISTANCE_MODES.map((m) => {
            const isSelected = mode === m.id;
            return (
              <button
                key={m.id}
                onClick={() => setMode(m.id)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  isSelected
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700"
                }`}
                title={m.description}
              >
                {m.id === "understand" && <Lightbulb className="w-3 h-3" />}
                {m.id === "guide" && <Compass className="w-3 h-3" />}
                {m.id === "organize" && <ListOrdered className="w-3 h-3" />}
                {m.id === "explore" && <Search className="w-3 h-3" />}
                {m.id === "review" && <CheckCircle2 className="w-3 h-3" />}
                {m.id === "draft" && <FileEdit className="w-3 h-3" />}
                <span>{m.label}</span>
              </button>
            );
          })}
        </div>

        {/* Language Preference Note */}
        <div className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center justify-between">
          <span>
            Choose the language style that makes the explanation easiest for you
            to understand.
          </span>
          <span className="font-semibold text-slate-600 dark:text-slate-400">
            Active:{" "}
            {languageMode === "taglish"
              ? "Taglish — Tagalog-English"
              : languageMode.toUpperCase()}
          </span>
        </div>

        {/* Attached Document Preview Badge if staged */}
        {attachedDoc && (
          <div className="flex items-center justify-between p-2 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 rounded-lg text-xs">
            <div className="flex items-center gap-2 truncate">
              <FileText className="w-4 h-4 text-indigo-600 flex-shrink-0" />
              <span className="font-semibold text-indigo-900 dark:text-indigo-200 truncate">
                {attachedDoc.name} ({(attachedDoc.size / 1024).toFixed(1)} KB)
              </span>
              <span className="text-[10px] text-indigo-700 dark:text-indigo-300">
                • Readable extracted text
              </span>
            </div>
            <button
              onClick={() => {
                setAttachedDoc(null);
              }}
              className="text-slate-400 hover:text-red-500 p-1"
            >
              ✕
            </button>
          </div>
        )}

        {/* Input Textarea and Send Actions */}
        <div className="relative flex items-end gap-2 bg-slate-50 dark:bg-slate-900 rounded-xl p-2 border border-slate-300 dark:border-slate-700 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-transparent transition-all">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".pdf,.txt,.docx,.doc,.md"
            className="hidden"
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            title="Upload PDF, TXT, or DOCX"
            className="p-2 text-slate-500 hover:text-indigo-600 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            <FileText className="w-5 h-5" />
          </button>

          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Ask StudyFlow about ${selectedMaterial.title}... (e.g. "Help me start", "Explain the instructions")`}
            rows={1}
            maxLength={2000}
            className="flex-1 bg-transparent border-none resize-none focus:outline-none text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 max-h-32 py-1 leading-relaxed"
          />

          <button
            type="button"
            onClick={() => handleSendMessage()}
            disabled={
              (!input.trim() && !attachedDoc && !studentAnswer.trim()) ||
              isTyping
            }
            className="p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Review Checkpoint Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-indigo-600" />
              <span>Review this before saving</span>
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Uphold metacognitive awareness and learning retention by
              reflecting on the AI assistance before saving it to your local
              records.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  1. What is the main idea of the response?
                </label>
                <input
                  type="text"
                  value={reviewAnswers.mainIdea}
                  onChange={(e) =>
                    setReviewAnswers((prev) => ({
                      ...prev,
                      mainIdea: e.target.value,
                    }))
                  }
                  placeholder="Summarize the core premise..."
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  2. What part should you verify against course materials?
                </label>
                <input
                  type="text"
                  value={reviewAnswers.whatToVerify}
                  onChange={(e) =>
                    setReviewAnswers((prev) => ({
                      ...prev,
                      whatToVerify: e.target.value,
                    }))
                  }
                  placeholder="Identify claims, formulas, or equations to check..."
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  3. What would you explain or revise in your own words?
                </label>
                <input
                  type="text"
                  value={reviewAnswers.ownWords}
                  onChange={(e) =>
                    setReviewAnswers((prev) => ({
                      ...prev,
                      ownWords: e.target.value,
                    }))
                  }
                  placeholder="Express key concepts in your own authentic words..."
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowReviewModal(null)}
                className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() =>
                  saveResponse(
                    showReviewModal.messageId,
                    showReviewModal.response,
                    reviewAnswers,
                  )
                }
                className="px-4 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-sm"
              >
                Save with Review
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Learning Receipt Modal */}
      {showReceiptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-indigo-600" />
                  <span>AI Learning Receipt</span>
                </h3>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Prototype-only local record
                </span>
              </div>
              <span className="text-xs text-slate-500">
                {new Date(showReceiptModal.savedAt).toLocaleTimeString()}
              </span>
            </div>

            <div className="space-y-2 text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
              <p>
                <strong>Material:</strong> {showReceiptModal.materialTitle} (
                {showReceiptModal.materialType})
              </p>
              <p>
                <strong>Assistance Mode:</strong>{" "}
                {showReceiptModal.assistanceMode} • <strong>Language:</strong>{" "}
                {showReceiptModal.languageMode || "english"}
              </p>
              <p>
                <strong>Student Request:</strong> "
                {showReceiptModal.userMessage}"
              </p>
              {showReceiptModal.studentAnswer && (
                <p>
                  <strong>Student Draft:</strong> "
                  {showReceiptModal.studentAnswer.slice(0, 120)}..."
                </p>
              )}
              <p>
                <strong>Service Source:</strong> {showReceiptModal.source}
              </p>
            </div>

            {showReceiptModal.reviewAnswers && (
              <div className="text-xs space-y-1 bg-indigo-50/70 dark:bg-indigo-950/40 p-3 rounded-xl border border-indigo-100 dark:border-indigo-900/50">
                <span className="font-bold text-indigo-900 dark:text-indigo-300 block">
                  Student Metacognitive Review:
                </span>
                <p>
                  • Main Idea:{" "}
                  {showReceiptModal.reviewAnswers.mainIdea || "Noted"}
                </p>
                <p>
                  • What to Verify:{" "}
                  {showReceiptModal.reviewAnswers.whatToVerify || "Verified"}
                </p>
                <p>
                  • In Own Words:{" "}
                  {showReceiptModal.reviewAnswers.ownWords || "Refined"}
                </p>
              </div>
            )}

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Student Reflection Notes:
              </label>
              <textarea
                value={reflection}
                onChange={(e) => setReflection(e.target.value)}
                placeholder="Add your own study notes or questions for your professor..."
                rows={2}
                className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowReceiptModal(null)}
                className="px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-sm"
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
