"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import { mockMaterials as MATERIALS } from "@/lib/mock-data";
import { usePrototype } from "@/lib/prototype-context";
import {
  Lightbulb,
  FilePlus,
  BookOpen,
  Bot,
  RefreshCw,
  Languages,
} from "lucide-react";

export default function DashboardPage() {
  const [greeting, setGreeting] = useState("Good day");
  const { currentMode, languageMode, setLanguageMode } = usePrototype();

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good morning");
    else if (hour < 18) setGreeting("Good afternoon");
    else setGreeting("Good evening");
  }, []);

  const getStatusColor = () => {
    switch (currentMode) {
      case "primary":
        return "bg-green-500";
      case "fallback-1":
      case "fallback-2":
        return "bg-yellow-500";
      case "local":
        return "bg-red-500";
      default:
        return "bg-green-500";
    }
  };

  const getStatusText = () => {
    switch (currentMode) {
      case "primary":
        return "Gemini Live";
      case "fallback-1":
      case "fallback-2":
        return "Gemini Backup";
      case "local":
        return "Local Fallback";
      default:
        return "Gemini Live";
    }
  };

  const upcomingMaterials = [...MATERIALS]
    .filter((m) => m.deadline)
    .sort(
      (a, b) =>
        new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime(),
    )
    .slice(0, 4);

  const recentMaterials = MATERIALS.slice(0, 3);

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-8">
        {/* 1. Greeting Section */}
        <div className="space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {greeting}, Student
              </h1>
              <p className="text-base text-gray-600 dark:text-gray-300 mt-1">
                From academic material to manageable next steps—with AI
                assistance you can review and control.
              </p>
            </div>

            {/* Language Selector Box */}
            <div className="bg-white dark:bg-gray-800 p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-2xs space-y-1 self-start sm:self-auto">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <Languages className="w-3.5 h-3.5 text-indigo-600" />
                <span>Language Preference:</span>
              </div>
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-lg text-xs">
                <button
                  type="button"
                  onClick={() => setLanguageMode("english")}
                  className={`px-2.5 py-1 rounded font-medium transition-colors ${
                    languageMode === "english"
                      ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 font-bold shadow-2xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                  }`}
                >
                  English
                </button>
                <button
                  type="button"
                  onClick={() => setLanguageMode("filipino")}
                  className={`px-2.5 py-1 rounded font-medium transition-colors ${
                    languageMode === "filipino"
                      ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 font-bold shadow-2xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                  }`}
                >
                  Filipino
                </button>
                <button
                  type="button"
                  onClick={() => setLanguageMode("taglish")}
                  title="Taglish — Tagalog-English code-switching"
                  className={`px-2.5 py-1 rounded font-medium transition-colors ${
                    languageMode === "taglish"
                      ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 font-bold shadow-2xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                  }`}
                >
                  Taglish
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            {/* 2. Today's Next Step Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-xs border-l-4 border-indigo-600 hover:shadow-md transition-shadow">
              <h2 className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-2">
                Today's Recommended Step
              </h2>
              <p className="text-xl font-semibold text-gray-900 dark:text-white mb-4 leading-snug">
                Review the Photosynthesis Activity and explain the role of
                glucose.
              </p>
              <div className="flex items-center gap-3">
                <Link
                  href="/materials/photosynthesis-activity"
                  className="inline-flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-xs font-bold shadow-xs"
                >
                  Continue Activity
                </Link>
                <Link
                  href="/materials/photosynthesis-activity/chat"
                  className="inline-flex items-center justify-center px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg transition-colors text-xs font-semibold"
                >
                  Open Companion
                </Link>
              </div>
            </div>

            {/* 3. Continue Where You Left Off Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-xs border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                Continue Where You Left Off
              </h2>
              <div className="flex justify-between items-end mb-3">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Academic Stress Handout
                </h3>
                <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                  Question 3 of 5
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-5">
                <div
                  className="bg-indigo-600 h-2 rounded-full"
                  style={{ width: "60%" }}
                />
              </div>
              <Link
                href="/materials/academic-stress-handout"
                className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-xs font-semibold"
              >
                Resume Handout
              </Link>
            </div>

            {/* 8. Recently Opened Activities */}
            <div className="space-y-3">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                Recently Opened Materials
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {recentMaterials.map((material) => (
                  <Link
                    key={material.id}
                    href={`/materials/${material.id}`}
                    className="block p-4 bg-white dark:bg-gray-800 rounded-xl shadow-2xs border border-gray-200 dark:border-gray-700 hover:border-indigo-300 hover:shadow-sm transition-all"
                  >
                    <div className="text-[10px] uppercase font-bold text-indigo-600 dark:text-indigo-400 mb-1.5">
                      {material.type}
                    </div>
                    <div className="font-semibold text-sm text-gray-900 dark:text-white line-clamp-2">
                      {material.title}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* 7. Gemini Service Status Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-xs border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                AI Service Status
              </h2>
              <div className="flex items-center gap-2.5 mb-2">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${getStatusColor()}`}
                />
                <span className="font-bold text-sm text-gray-900 dark:text-white">
                  {getStatusText()}
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                Gemini Flash 3.8 — Contextual Academic Companion with multi-key
                fallback rotation.
              </p>
            </div>

            {/* 4. Upcoming Deadlines Section */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-xs border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
              <h2 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-3">
                Upcoming Deadlines
              </h2>
              <div className="space-y-3">
                {upcomingMaterials.map((material) => (
                  <Link
                    key={material.id}
                    href={`/materials/${material.id}`}
                    className="block group p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-medium text-xs text-gray-900 dark:text-white group-hover:text-indigo-600 transition-colors line-clamp-1">
                        {material.title}
                      </h3>
                      <span className="text-[10px] font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 px-1.5 py-0.5 rounded whitespace-nowrap ml-2">
                        {new Date(material.deadline!).toLocaleDateString(
                          undefined,
                          {
                            month: "short",
                            day: "numeric",
                          },
                        )}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1 mt-1.5">
                      <div
                        className="bg-indigo-600 h-1 rounded-full"
                        style={{ width: `${material.progress}%` }}
                      />
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* 6. AI Literacy Prompt Card */}
            <div className="bg-indigo-50 dark:bg-indigo-950/40 rounded-xl p-5 border border-indigo-100 dark:border-indigo-900/50 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-3">
                <Lightbulb className="w-5 h-5 text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-indigo-900 dark:text-indigo-200 leading-relaxed">
                  <span className="font-bold block mb-1">AI Literacy Tip:</span>
                  AI-generated content may sound confident even when it is
                  incomplete. What part of your current response should you
                  verify against course rubrics?
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 5. Quick Actions Grid */}
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
            Quick Actions
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Link
              href="/materials"
              className="flex flex-col items-center justify-center p-5 bg-white dark:bg-gray-800 rounded-xl shadow-2xs border border-gray-200 dark:border-gray-700 hover:shadow-sm hover:border-indigo-300 transition-all gap-2 group text-center"
            >
              <BookOpen className="w-6 h-6 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform" />
              <span className="font-semibold text-xs text-gray-900 dark:text-white">
                View All Materials
              </span>
            </Link>

            <Link
              href="/chat"
              className="flex flex-col items-center justify-center p-5 bg-white dark:bg-gray-800 rounded-xl shadow-2xs border border-gray-200 dark:border-gray-700 hover:shadow-sm hover:border-indigo-300 transition-all gap-2 group text-center"
            >
              <Bot className="w-6 h-6 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform" />
              <span className="font-semibold text-xs text-gray-900 dark:text-white">
                Ask Task Companion
              </span>
            </Link>

            <Link
              href="/prototype-controls"
              className="flex flex-col items-center justify-center p-5 bg-white dark:bg-gray-800 rounded-xl shadow-2xs border border-gray-200 dark:border-gray-700 hover:shadow-sm hover:border-indigo-300 transition-all gap-2 group text-center"
            >
              <RefreshCw className="w-6 h-6 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform" />
              <span className="font-semibold text-xs text-gray-900 dark:text-white">
                Prototype Controls
              </span>
            </Link>

            <button
              type="button"
              onClick={() =>
                alert(
                  "Upload and document extraction will be available in future version.",
                )
              }
              className="flex flex-col items-center justify-center p-5 bg-white dark:bg-gray-800 rounded-xl shadow-2xs border border-gray-200 dark:border-gray-700 hover:shadow-sm hover:border-indigo-300 transition-all gap-2 group text-center"
            >
              <FilePlus className="w-6 h-6 text-slate-400 group-hover:scale-110 transition-transform" />
              <span className="font-semibold text-xs text-slate-500 dark:text-slate-400">
                Add Material (Future)
              </span>
            </button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
