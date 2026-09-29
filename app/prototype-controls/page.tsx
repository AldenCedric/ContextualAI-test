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
} from "lucide-react";

const getFeatureIcon = (id: string) => {
  switch (id) {
    case "upload":
      return (
        <Upload className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
      );
    case "ocr":
      return (
        <Camera className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
      );
    case "calendar":
      return (
        <Calendar className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
      );
    case "screen-free":
      return (
        <Leaf className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
      );
    case "wellness":
      return <Heart className="w-6 h-6 text-rose-600 dark:text-rose-400" />;
    case "widget":
      return (
        <Smartphone className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
      );
    case "mobile":
      return (
        <TabletSmartphone className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
      );
    case "privacy":
      return (
        <ShieldCheck className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
      );
    case "cloud":
      return <Cloud className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />;
    default:
      return (
        <Sparkles className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
      );
  }
};

export default function PrototypeControlsPage() {
  const {
    fallbackLevel,
    setFallbackLevel,
    showReviewCheckpoint,
    setShowReviewCheckpoint,
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
    if (confirm("Clear local chat history?")) {
      const keysToRemove = Object.keys(localStorage).filter((key) =>
        key.startsWith("studyflow-chat-"),
      );
      keysToRemove.forEach((key) => localStorage.removeItem(key));
      showFeedback("Chat history cleared");
    }
  };

  const handleClearSaved = () => {
    if (confirm("Clear saved AI responses?")) {
      localStorage.removeItem("studyflow-saved-responses");
      showFeedback("Saved AI responses cleared");
    }
  };

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto space-y-8 pb-12">
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-md">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-yellow-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700 font-medium">
                Prototype demonstration controls enabled.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Prototype Controls
          </h1>
          <p className="text-slate-600">
            These controls are for thesis defense demonstration only.
          </p>
        </div>

        {feedback && (
          <div
            className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded relative"
            role="alert"
          >
            <span className="block sm:inline">{feedback}</span>
          </div>
        )}

        <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-xl font-semibold text-slate-800 mb-4 flex items-center">
            <span className="w-3 h-3 rounded-full mr-2 bg-indigo-500"></span>
            AI Service Mode
          </h2>
          <div className="space-y-4">
            <label className="flex items-start p-4 border rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
              <input
                type="radio"
                name="fallbackLevel"
                className="mt-1 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                checked={fallbackLevel === "primary"}
                onChange={() => setFallbackLevel("primary")}
              />
              <div className="ml-3">
                <span className="block text-sm font-medium text-slate-900">
                  Primary Gemini (Default)
                </span>
                <span className="block text-sm text-slate-500">
                  Uses the primary API key
                </span>
              </div>
            </label>

            <label className="flex items-start p-4 border rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
              <input
                type="radio"
                name="fallbackLevel"
                className="mt-1 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                checked={fallbackLevel === "fallback-1"}
                onChange={() => setFallbackLevel("fallback-1")}
              />
              <div className="ml-3">
                <span className="block text-sm font-medium text-slate-900">
                  Force Fallback Key 1
                </span>
                <span className="block text-sm text-slate-500">
                  Simulates primary key failure
                </span>
              </div>
            </label>

            <label className="flex items-start p-4 border rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
              <input
                type="radio"
                name="fallbackLevel"
                className="mt-1 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                checked={fallbackLevel === "fallback-2"}
                onChange={() => setFallbackLevel("fallback-2")}
              />
              <div className="ml-3">
                <span className="block text-sm font-medium text-slate-900">
                  Force Fallback Key 2
                </span>
                <span className="block text-sm text-slate-500">
                  Simulates both primary and fallback 1 failure
                </span>
              </div>
            </label>

            <label className="flex items-start p-4 border border-indigo-200 dark:border-indigo-800 bg-indigo-50/40 dark:bg-indigo-950/20 rounded-lg cursor-pointer hover:bg-indigo-50/70 transition-colors">
              <input
                type="radio"
                name="fallbackLevel"
                className="mt-1 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                checked={fallbackLevel === "demo"}
                onChange={() => setFallbackLevel("demo")}
              />
              <div className="ml-3">
                <span className="block text-sm font-bold text-indigo-900 dark:text-indigo-200">
                  Demo Simulation Mode (Conserves 100% API Quota)
                </span>
                <span className="block text-sm text-indigo-700 dark:text-indigo-400">
                  Generates realistic academic verification and task guidance
                  locally. Perfect for rehearsing the presentation without
                  consuming the daily 20-request limit.
                </span>
              </div>
            </label>

            <label className="flex items-start p-4 border rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
              <input
                type="radio"
                name="fallbackLevel"
                className="mt-1 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                checked={fallbackLevel === "local"}
                onChange={() => setFallbackLevel("local")}
              />
              <div className="ml-3">
                <span className="block text-sm font-medium text-slate-900">
                  Force Local Template
                </span>
                <span className="block text-sm text-slate-500">
                  Simulates complete API failure, uses offline templates
                </span>
              </div>
            </label>
          </div>
        </section>

        <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-xl font-semibold text-slate-800 mb-4">
            Demo Controls
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={handleResetDemo}
              className="px-4 py-3 bg-red-50 text-red-700 border border-red-200 rounded-lg hover:bg-red-100 transition-colors font-medium text-left"
            >
              Reset Demo
            </button>
            <button
              onClick={handleClearChat}
              className="px-4 py-3 bg-slate-50 text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors font-medium text-left"
            >
              Clear Local Chat
            </button>
            <button
              onClick={handleClearSaved}
              className="px-4 py-3 bg-slate-50 text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors font-medium text-left"
            >
              Clear Saved Responses
            </button>

            <label className="flex items-center p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
              <input
                type="checkbox"
                className="h-4 w-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                checked={showReviewCheckpoint}
                onChange={(e) => setShowReviewCheckpoint(e.target.checked)}
              />
              <span className="ml-3 text-sm font-medium text-slate-900">
                Toggle Review Checkpoint
              </span>
            </label>

            <label className="flex items-center p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
              <input
                type="checkbox"
                className="h-4 w-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                checked={showFuturePlaceholders}
                onChange={(e) => setShowFuturePlaceholders(e.target.checked)}
              />
              <span className="ml-3 text-sm font-medium text-slate-900">
                Toggle Future Feature Placeholders
              </span>
            </label>
          </div>
        </section>

        {showFuturePlaceholders && (
          <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-xl font-semibold text-slate-800 mb-4">
              Future Feature Roadmap
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {FUTURE_FEATURES.map((feature) => (
                <div
                  key={feature.id}
                  className="border border-slate-200 rounded-lg p-4 bg-slate-50 opacity-80"
                >
                  <div className="mb-3 p-2 bg-indigo-50 dark:bg-indigo-950/40 w-fit rounded-lg">
                    {getFeatureIcon(feature.id)}
                  </div>
                  <h3 className="font-semibold text-slate-700 mb-1">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-slate-500 mb-3">
                    {feature.description}
                  </p>
                  <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-200 text-gray-700">
                    Planned future feature — not implemented in this prototype.
                  </span>
                </div>
              ))}
            </div>
            <p className="mt-4 text-sm text-slate-500 italic">
              Note: These features represent the extended vision of StudyFlow
              but are beyond the scope of the current prototype.
            </p>
          </section>
        )}

        <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-xl font-semibold text-slate-800 mb-4">
            Presentation Demo Sequence (3-5 mins)
          </h2>
          <ol className="list-decimal list-inside space-y-2 text-slate-700 text-sm">
            <li>
              <span className="font-semibold">Open the dashboard</span>{" "}
              (/dashboard) to view materials, deadlines, and AI literacy tip.
            </li>
            <li>
              <span className="font-semibold">
                Open "Photosynthesis Activity"
              </span>{" "}
              to examine instructions and current task.
            </li>
            <li>
              <span className="font-semibold">Open the Task Companion</span>{" "}
              chat interface.
            </li>
            <li>
              <span className="font-semibold">Select Guide mode</span> from the
              assistance mode chips.
            </li>
            <li>
              <span className="font-semibold">Send:</span> "Give me a hint
              without giving me the complete answer."
            </li>
            <li>
              <span className="font-semibold">Show the Gemini response</span>{" "}
              with key points, verification question, and next step.
            </li>
            <li>
              <span className="font-semibold">
                Select "Explain this more simply"
              </span>{" "}
              from the follow-up buttons.
            </li>
            <li>
              <span className="font-semibold">Show the follow-up response</span>{" "}
              generated in the same task context.
            </li>
            <li>
              <span className="font-semibold">Select "Save response"</span> to
              trigger the review checkpoint.
            </li>
            <li>
              <span className="font-semibold">
                Answer the cognitive scaffolding questions
              </span>{" "}
              (main idea, verification, own words).
            </li>
            <li>
              <span className="font-semibold">
                Save and review the AI Learning Receipt
              </span>{" "}
              modal.
            </li>
            <li>
              <span className="font-semibold">
                Open "Academic Stress Handout"
              </span>{" "}
              from materials.
            </li>
            <li>
              <span className="font-semibold">Ask:</span> "Help me identify the
              main ideas and what I should verify."
            </li>
            <li>
              <span className="font-semibold">
                Switch the prototype to local fallback mode
              </span>{" "}
              in Prototype Controls.
            </li>
            <li>
              <span className="font-semibold">Send another request</span> in the
              Task Companion.
            </li>
            <li>
              <span className="font-semibold">
                Show that the application still provides
              </span>{" "}
              a relevant structured local template with warning notice.
            </li>
            <li>
              <span className="font-semibold">
                Open the future-feature roadmap
              </span>{" "}
              to discuss future work (OCR, upload, calendar, Supabase).
            </li>
          </ol>
        </section>
      </div>
    </AppShell>
  );
}
