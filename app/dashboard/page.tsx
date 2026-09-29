"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import { mockMaterials as MATERIALS } from "@/lib/mock-data";
import { usePrototype } from "@/lib/prototype-context";
import { Lightbulb, FilePlus, BookOpen, Bot, RefreshCw } from "lucide-react";

export default function DashboardPage() {
  const [greeting, setGreeting] = useState("Good day");
  const { currentMode } = usePrototype();

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
        return "bg-gray-500";
    }
  };

  const getStatusText = () => {
    switch (currentMode) {
      case "primary":
        return "Live AI";
      case "fallback-1":
      case "fallback-2":
        return "Backup AI Service";
      case "local":
        return "Local Fallback";
      default:
        return "Unknown Status";
    }
  };

  const upcomingMaterials = [...MATERIALS]
    .filter((m) => m.deadline)
    .sort(
      (a, b) =>
        new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime(),
    )
    .slice(0, 3);

  const recentMaterials = MATERIALS.slice(0, 3);

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-8">
        {/* 1. Greeting Section */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {greeting}, Student
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            From academic material to manageable next steps—with AI assistance
            you can review and control.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            {/* 2. Today's Next Step Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border-l-4 border-indigo-600 hover:shadow-md transition-shadow">
              <h2 className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-2">
                Today's Next Step
              </h2>
              <p className="text-xl font-medium text-gray-900 dark:text-white mb-6">
                Review the Photosynthesis Activity and explain the role of
                glucose.
              </p>
              <Link
                href="/materials/photosynthesis-activity"
                className="inline-flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
              >
                Continue
              </Link>
            </div>

            {/* 3. Continue Where You Left Off Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
              <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">
                Continue Where You Left Off
              </h2>
              <div className="flex justify-between items-end mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Academic Stress Handout
                </h3>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Question 3 of 5
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-6">
                <div
                  className="bg-indigo-600 h-2.5 rounded-full"
                  style={{ width: "60%" }}
                ></div>
              </div>
              <Link
                href="/materials/academic-stress-handout"
                className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
              >
                Resume
              </Link>
            </div>

            {/* 8. Recently Opened Activities */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Recently Opened
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {recentMaterials.map((material) => (
                  <Link
                    key={material.id}
                    href={`/materials/${material.id}`}
                    className="block p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:border-indigo-300 hover:shadow-md transition-all"
                  >
                    <div className="text-xs text-indigo-600 dark:text-indigo-400 mb-2 font-medium">
                      {material.type}
                    </div>
                    <div className="font-medium text-gray-900 dark:text-white line-clamp-2">
                      {material.title}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* 7. Gemini Service Status Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
              <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-4">
                Service Status
              </h2>
              <div className="flex items-center gap-3 mb-2">
                <span
                  className={`w-3 h-3 rounded-full ${getStatusColor()}`}
                ></span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {getStatusText()}
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Gemini Flash — Contextual Academic Companion
              </p>
            </div>

            {/* 4. Upcoming Deadlines Section */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Upcoming Deadlines
              </h2>
              <div className="space-y-4">
                {upcomingMaterials.length > 0 ? (
                  upcomingMaterials.map((material) => (
                    <Link
                      key={material.id}
                      href={`/materials/${material.id}`}
                      className="block group"
                    >
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="font-medium text-gray-900 dark:text-white group-hover:text-indigo-600 transition-colors line-clamp-1">
                          {material.title}
                        </h3>
                        <span className="text-xs font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded whitespace-nowrap ml-2">
                          {material.deadline
                            ? new Date(material.deadline).toLocaleDateString(
                                undefined,
                                { month: "short", day: "numeric" },
                              )
                            : ""}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 mb-2">
                        {material.type}
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                        <div
                          className="bg-indigo-600 h-1.5 rounded-full"
                          style={{
                            width: `${(material as any).progress || 0}%`,
                          }}
                        ></div>
                      </div>
                    </Link>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    No upcoming deadlines.
                  </p>
                )}
              </div>
            </div>

            {/* 6. AI Literacy Prompt Card */}
            <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-6 border border-indigo-100 dark:border-indigo-800 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-3">
                <Lightbulb className="w-5 h-5 text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-indigo-900 dark:text-indigo-200 leading-relaxed">
                  <span className="font-semibold block mb-1">
                    AI Literacy Tip
                  </span>
                  AI-generated content may sound confident even when it is
                  incomplete. What part of your current response should you
                  verify?
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 5. Quick Actions Grid */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              onClick={() => alert("Coming in future version")}
              className="flex flex-col items-center justify-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md hover:border-indigo-300 transition-all gap-3 group"
            >
              <FilePlus className="w-8 h-8 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform" />
              <span className="font-medium text-gray-900 dark:text-white">
                Add Material
              </span>
            </button>
            <Link
              href="/materials"
              className="flex flex-col items-center justify-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md hover:border-indigo-300 transition-all gap-3 group"
            >
              <BookOpen className="w-8 h-8 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform" />
              <span className="font-medium text-gray-900 dark:text-white">
                Open Activity
              </span>
            </Link>
            <Link
              href="/chat"
              className="flex flex-col items-center justify-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md hover:border-indigo-300 transition-all gap-3 group"
            >
              <Bot className="w-8 h-8 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform" />
              <span className="font-medium text-gray-900 dark:text-white text-center">
                Ask Task Companion
              </span>
            </Link>
            <Link
              href="/prototype-controls"
              className="flex flex-col items-center justify-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md hover:border-indigo-300 transition-all gap-3 group"
            >
              <RefreshCw className="w-8 h-8 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform" />
              <span className="font-medium text-gray-900 dark:text-white text-center">
                Try Fallback Mode
              </span>
            </Link>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
