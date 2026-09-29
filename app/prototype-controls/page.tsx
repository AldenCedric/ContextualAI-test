"use client";

import React, { useState } from "react";
import AppShell from "@/components/AppShell";
import { usePrototype } from "@/lib/prototype-context";
import { FUTURE_FEATURES } from "@/lib/mock-data";
import {
  Upload,
  Camera,
  Calendar,
  Leaf,
  Heart,
  Smartphone,
  TabletSmartphone,
  ShieldCheck,
  Cloud,
  Sparkles,
  AlertTriangle,
  Languages,
} from "lucide-react";

const getFeatureIcon = (id: string) => {
  switch (id) {
    case "upload":
      return (
        <Upload className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
      );
    case "ocr":
      return (
        <Camera className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
      );
    case "calendar":
      return (
        <Calendar className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
      );
    case "screen-free":
      return (
        <Leaf className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
      );
    case "wellness":
      return <Heart className="w-5 h-5 text-rose-600 dark:text-rose-400" />;
    case "widget":
      return (
        <Smartphone className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
      );
    case "mobile":
      return (
        <TabletSmartphone className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
      );
    case "privacy":
      return (
        <ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
      );
    case "cloud":
      return <Cloud className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />;
    default:
      return (
        <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
      );
  }
};

export default function PrototypeControlsPage() {
  const {
    serviceMode,
    setServiceMode,
    languageMode,
    setLanguageMode,
    showReviewCheckpoint,
    setShowReviewCheckpoint,
    showDocumentEvidence,
    setShowDocumentEvidence,
    showFuturePlaceholders,
    setShowFuturePlaceholders,
  } = usePrototype();

  const [feedback, setFeedback] = useState<string | null>(null);

  const showFeedback = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleResetDemo = () => {
    if (
      confirm(
        "Are you sure you want to reset the demo? This will clear all local storage and reload.",
      )
    ) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const handleClearChat = () => {
    if (confirm("Clear local chat history for all materials?")) {
      const keysToRemove = Object.keys(localStorage).filter((key) =>
        key.startsWith("studyflow-chat-"),
      );
      keysToRemove.forEach((key) => localStorage.removeItem(key));
      showFeedback("Chat history cleared");
    }
  };

  const handleClearSaved = () => {
    if (confirm("Clear saved AI Learning Receipts?")) {
      localStorage.removeItem("studyflow-saved-responses");
      showFeedback("Saved AI responses cleared");
    }
  };

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto space-y-8 pb-12">
        {/* Yellow Notice Banner */}
        <div className="bg-yellow-50 dark:bg-yellow-950/40 border-l-4 border-yellow-400 p-4 rounded-r-md">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-yellow-500 mr-3 flex-shrink-0" />
            <p className="text-sm text-yellow-800 dark:text-yellow-200 font-semibold">
              Prototype demonstration controls enabled.
            </p>
          </div>
        </div>

        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
            Prototype Controls
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            These controls are for thesis defense demonstration only. API keys
            are kept securely server-side and never exposed.
          </p>
        </div>

        {feedback && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-2.5 rounded-lg text-xs font-semibold">
            {feedback}
          </div>
        )}

        {/* 1. Language Mode Selector */}
        <section className="bg-white dark:bg-slate-900 rounded-xl shadow-xs border border-slate-200 dark:border-slate-800 p-6 space-y-4">
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Languages className="w-5 h-5 text-indigo-600" />
            <span>Language Mode</span>
          </h2>
          <p className="text-xs text-slate-500">
            Choose the language style that makes the explanation easiest for
            university students to understand.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <label
              className={`p-4 border rounded-xl cursor-pointer transition-all flex flex-col justify-between ${
                languageMode === "english"
                  ? "border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30"
                  : "border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-sm text-slate-900 dark:text-white">
                  English
                </span>
                <input
                  type="radio"
                  name="languageMode"
                  checked={languageMode === "english"}
                  onChange={() => setLanguageMode("english")}
                  className="text-indigo-600"
                />
              </div>
              <span className="text-xs text-slate-500">
                Clear academic English avoiding unnecessary complexity.
              </span>
            </label>

            <label
              className={`p-4 border rounded-xl cursor-pointer transition-all flex flex-col justify-between ${
                languageMode === "filipino"
                  ? "border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30"
                  : "border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-sm text-slate-900 dark:text-white">
                  Filipino
                </span>
                <input
                  type="radio"
                  name="languageMode"
                  checked={languageMode === "filipino"}
                  onChange={() => setLanguageMode("filipino")}
                  className="text-indigo-600"
                />
              </div>
              <span className="text-xs text-slate-500">
                Primarily Filipino with technical terms kept in English when
                clearer.
              </span>
            </label>

            <label
              className={`p-4 border rounded-xl cursor-pointer transition-all flex flex-col justify-between ${
                languageMode === "taglish"
                  ? "border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30"
                  : "border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-sm text-slate-900 dark:text-white">
                  Taglish
                </span>
                <input
                  type="radio"
                  name="languageMode"
                  checked={languageMode === "taglish"}
                  onChange={() => setLanguageMode("taglish")}
                  className="text-indigo-600"
                />
              </div>
              <span className="text-xs text-slate-500">
                Taglish — Tagalog-English code-switching for Filipino university
                students.
              </span>
            </label>
          </div>
        </section>

        {/* 2. AI Service Mode */}
        <section className="bg-white dark:bg-slate-900 rounded-xl shadow-xs border border-slate-200 dark:border-slate-800 p-6 space-y-4">
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span>
            <span>AI Service Mode</span>
          </h2>
          <div className="space-y-3">
            <label className="flex items-start p-3.5 border rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors border-slate-200 dark:border-slate-700">
              <input
                type="radio"
                name="serviceMode"
                className="mt-1 text-indigo-600"
                checked={serviceMode === "primary"}
                onChange={() => setServiceMode("primary")}
              />
              <div className="ml-3">
                <span className="block text-sm font-semibold text-slate-900 dark:text-white">
                  Primary Gemini (Default)
                </span>
                <span className="block text-xs text-slate-500">
                  Uses GEMINI_API_KEY with automatic failover to fallback keys.
                </span>
              </div>
            </label>

            <label className="flex items-start p-3.5 border rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors border-slate-200 dark:border-slate-700">
              <input
                type="radio"
                name="serviceMode"
                className="mt-1 text-indigo-600"
                checked={serviceMode === "fallback-1"}
                onChange={() => setServiceMode("fallback-1")}
              />
              <div className="ml-3">
                <span className="block text-sm font-semibold text-slate-900 dark:text-white">
                  Backup AI Service 1
                </span>
                <span className="block text-xs text-slate-500">
                  Simulates primary key exhaustion; calls
                  GEMINI_API_KEY_FALLBACK_1.
                </span>
              </div>
            </label>

            <label className="flex items-start p-3.5 border rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors border-slate-200 dark:border-slate-700">
              <input
                type="radio"
                name="serviceMode"
                className="mt-1 text-indigo-600"
                checked={serviceMode === "fallback-2"}
                onChange={() => setServiceMode("fallback-2")}
              />
              <div className="ml-3">
                <span className="block text-sm font-semibold text-slate-900 dark:text-white">
                  Backup AI Service 2
                </span>
                <span className="block text-xs text-slate-500">
                  Simulates primary and secondary key exhaustion; calls
                  GEMINI_API_KEY_FALLBACK_2.
                </span>
              </div>
            </label>

            <label className="flex items-start p-3.5 border rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors border-slate-200 dark:border-slate-700">
              <input
                type="radio"
                name="serviceMode"
                className="mt-1 text-indigo-600"
                checked={serviceMode === "local"}
                onChange={() => setServiceMode("local")}
              />
              <div className="ml-3">
                <span className="block text-sm font-semibold text-slate-900 dark:text-white">
                  Local Academic Fallback
                </span>
                <span className="block text-xs text-slate-500">
                  Simulates offline or complete API exhaustion using localized
                  templates.
                </span>
              </div>
            </label>
          </div>
        </section>

        {/* 3. Demo Controls */}
        <section className="bg-white dark:bg-slate-900 rounded-xl shadow-xs border border-slate-200 dark:border-slate-800 p-6 space-y-4">
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
            Demo Toggles & Storage
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              onClick={handleResetDemo}
              className="px-4 py-2.5 bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-100 text-xs font-semibold"
            >
              Reset Demo (All Storage)
            </button>
            <button
              onClick={handleClearChat}
              className="px-4 py-2.5 bg-slate-50 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-100 text-xs font-semibold"
            >
              Clear Local Chat
            </button>
            <button
              onClick={handleClearSaved}
              className="px-4 py-2.5 bg-slate-50 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-100 text-xs font-semibold"
            >
              Clear Saved Responses
            </button>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <label className="flex items-center p-3 border border-slate-200 dark:border-slate-700 rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800">
              <input
                type="checkbox"
                className="h-4 w-4 text-indigo-600 rounded"
                checked={showReviewCheckpoint}
                onChange={(e) => setShowReviewCheckpoint(e.target.checked)}
              />
              <span className="ml-3 text-xs font-semibold text-slate-900 dark:text-white">
                Toggle Review Checkpoint (Metacognitive Reflection Modal before
                Save)
              </span>
            </label>

            <label className="flex items-center p-3 border border-slate-200 dark:border-slate-700 rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800">
              <input
                type="checkbox"
                className="h-4 w-4 text-indigo-600 rounded"
                checked={showDocumentEvidence}
                onChange={(e) => setShowDocumentEvidence(e.target.checked)}
              />
              <span className="ml-3 text-xs font-semibold text-slate-900 dark:text-white">
                Toggle Document Evidence Display in Chat Cards
              </span>
            </label>

            <label className="flex items-center p-3 border border-slate-200 dark:border-slate-700 rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800">
              <input
                type="checkbox"
                className="h-4 w-4 text-indigo-600 rounded"
                checked={showFuturePlaceholders}
                onChange={(e) => setShowFuturePlaceholders(e.target.checked)}
              />
              <span className="ml-3 text-xs font-semibold text-slate-900 dark:text-white">
                Toggle Future Feature Placeholders
              </span>
            </label>
          </div>
        </section>

        {/* 4. Future Features Roadmap */}
        {showFuturePlaceholders && (
          <section className="bg-white dark:bg-slate-900 rounded-xl shadow-xs border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
              Future Feature Roadmap
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {FUTURE_FEATURES.map((feature) => (
                <div
                  key={feature.id}
                  className="border border-slate-200 dark:border-slate-800 rounded-lg p-4 bg-slate-50/70 dark:bg-slate-800/40"
                >
                  <div className="mb-2 p-2 bg-indigo-50 dark:bg-indigo-950/60 w-fit rounded-lg">
                    {getFeatureIcon(feature.id)}
                  </div>
                  <h3 className="font-bold text-xs text-slate-800 dark:text-slate-200 mb-1">
                    {feature.title}
                  </h3>
                  <p className="text-xs text-slate-500 mb-2 leading-relaxed">
                    {feature.description}
                  </p>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-slate-300">
                    Planned future feature — not implemented in prototype.
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </AppShell>
  );
}
