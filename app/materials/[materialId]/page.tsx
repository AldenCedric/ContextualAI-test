"use client";

import { use, useState, useEffect } from "react";
import AppShell from "@/components/AppShell";
import { mockMaterials as MATERIALS } from "@/lib/mock-data";
import Link from "next/link";
import { ClipboardList, Check, ArrowLeft } from "lucide-react";

export default function MaterialDetailPage({
  params,
}: {
  params: Promise<{ materialId: string }>;
}) {
  const { materialId } = use(params);
  const initialMaterial = MATERIALS.find((m) => m.id === materialId);

  const [progress, setProgress] = useState(initialMaterial?.progress || 0);
  const [notes, setNotes] = useState("");
  const [saveStatus, setSaveStatus] = useState("");
  const [showSavedAssistance, setShowSavedAssistance] = useState(false);

  useEffect(() => {
    const savedNotes = localStorage.getItem(`studyflow-notes-${materialId}`);
    if (savedNotes) {
      setNotes(savedNotes);
    }
  }, [materialId]);

  const handleSaveNotes = () => {
    localStorage.setItem(`studyflow-notes-${materialId}`, notes);
    setSaveStatus("Saved!");
    setTimeout(() => setSaveStatus(""), 2000);
  };

  const handleMarkProgress = () => {
    setProgress((prev) => Math.min(prev + 20, 100));
  };

  if (!initialMaterial) {
    return (
      <AppShell>
        <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Material not found
          </h2>
          <Link
            href="/materials"
            className="inline-flex items-center text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 hover:underline"
          >
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Materials
          </Link>
        </div>
      </AppShell>
    );
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "Activity":
        return "bg-indigo-100 text-indigo-800";
      case "Handout":
        return "bg-emerald-100 text-emerald-800";
      case "Problem Set":
        return "bg-amber-100 text-amber-800";
      case "Presentation":
        return "bg-purple-100 text-purple-800";
      case "Research Activity":
        return "bg-cyan-100 text-cyan-800";
      case "Assignment":
        return "bg-pink-100 text-pink-800";
      case "Reading":
        return "bg-blue-100 text-blue-800";
      case "Project":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "in-progress":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "not-started":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Navigation */}
        <Link
          href="/materials"
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Materials
        </Link>

        {/* Material Header */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 flex-wrap">
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getTypeColor(initialMaterial.type)}`}
            >
              {initialMaterial.type}
            </span>
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(initialMaterial.status)}`}
            >
              {initialMaterial.status.replace("-", " ")}
            </span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            {initialMaterial.title}
          </h1>
          {initialMaterial.deadline && (
            <p className="text-gray-600 dark:text-gray-300">
              <span className="font-medium">Deadline:</span>{" "}
              {new Date(initialMaterial.deadline).toLocaleDateString()}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Instructions/Description Card */}
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
              <div className="flex items-center gap-2 mb-4 text-xl font-semibold text-gray-900 dark:text-white">
                <ClipboardList className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />{" "}
                Instructions & Description
              </div>
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {initialMaterial.description}
              </p>
            </div>

            {/* Current Task Card */}
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Current Task
              </h3>
              <p className="text-indigo-600 dark:text-indigo-400 font-medium mb-4">
                {initialMaterial.currentTask}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                This is your next recommended step.
              </p>
            </div>

            {/* Student Notes Area */}
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                My Notes
              </h3>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Jot down ideas, answers, or questions here..."
                className="w-full h-40 p-4 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white resize-none"
              />
              <div className="mt-4 flex items-center gap-4">
                <button
                  onClick={handleSaveNotes}
                  className="px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 rounded-lg font-medium transition-colors"
                >
                  Save Notes
                </button>
                {saveStatus && (
                  <span className="text-sm text-green-600 dark:text-green-400">
                    {saveStatus}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar Column */}
          <div className="space-y-8">
            {/* Suggested Next Action */}
            <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-xl p-6">
              <h3 className="text-lg font-bold text-indigo-900 dark:text-indigo-100 mb-2">
                Suggested Next Action
              </h3>
              <p className="text-indigo-700 dark:text-indigo-300 mb-6 text-sm">
                Get help with:{" "}
                <span className="font-semibold">
                  {initialMaterial.currentTask}
                </span>
              </p>
              <Link
                href={`/materials/${materialId}/chat`}
                className="block w-full text-center px-4 py-3 border border-transparent rounded-lg shadow-sm text-base font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
              >
                Open Task Companion
              </Link>
            </div>

            {/* Progress Section */}
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Progress
              </h3>
              <div className="space-y-2 mb-6">
                <div className="flex justify-between text-sm font-medium text-gray-700 dark:text-gray-300">
                  <span>Completion</span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                  <div
                    className="bg-indigo-600 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
              <button
                onClick={handleMarkProgress}
                disabled={progress >= 100}
                className="w-full px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Mark Progress (+20%)
              </button>
            </div>

            {/* Action Buttons */}
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6 space-y-3">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Actions
              </h3>
              <Link
                href={`/materials/${materialId}/chat?mode=review`}
                className="block w-full px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 rounded-lg font-medium transition-colors text-left"
              >
                Review My Work (with AI)
              </Link>
              <button
                onClick={() => setShowSavedAssistance(!showSavedAssistance)}
                className="w-full px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 rounded-lg font-medium transition-colors text-left flex justify-between items-center"
              >
                <span>View Saved AI Assistance</span>
                <span className="text-xs bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300 px-2 py-0.5 rounded-full">
                  {(() => {
                    try {
                      const all = JSON.parse(
                        localStorage.getItem("studyflow-saved-responses") ||
                          "[]",
                      );
                      return all.filter((r: any) => r.materialId === materialId)
                        .length;
                    } catch {
                      return 0;
                    }
                  })()}
                </span>
              </button>
              {showSavedAssistance && (
                <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg text-sm text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 space-y-3 max-h-80 overflow-y-auto">
                  {(() => {
                    try {
                      const all = JSON.parse(
                        localStorage.getItem("studyflow-saved-responses") ||
                          "[]",
                      );
                      const items = all.filter(
                        (r: any) => r.materialId === materialId,
                      );
                      if (items.length === 0) {
                        return (
                          <p className="italic">
                            No saved assistance yet. Use the Task Companion to
                            generate and save responses!
                          </p>
                        );
                      }
                      return items.map((item: any) => (
                        <div
                          key={item.id}
                          className="p-3 bg-white dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-800 space-y-1 text-xs"
                        >
                          <div className="flex justify-between items-center font-medium text-gray-900 dark:text-gray-100">
                            <span className="capitalize font-semibold text-indigo-600 dark:text-indigo-400">
                              {item.assistanceMode} Mode
                            </span>
                            <span className="text-gray-400">
                              {new Date(item.savedAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-gray-700 dark:text-gray-300 line-clamp-2">
                            {item.responseData?.response ||
                              "No response content"}
                          </p>
                          {item.reviewAnswers && (
                            <div className="pt-1 border-t border-gray-100 dark:border-gray-800 text-[11px] text-gray-500">
                              <span className="font-medium text-emerald-600">
                                Reviewed:{" "}
                              </span>
                              {item.reviewAnswers.mainIdea || "Verified"}
                            </div>
                          )}
                        </div>
                      ));
                    } catch {
                      return <p className="italic">No saved assistance yet.</p>;
                    }
                  })()}
                </div>
              )}
              <button
                onClick={() => setProgress(100)}
                disabled={progress >= 100}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg font-medium transition-colors text-left mt-2 disabled:opacity-50 flex items-center justify-between"
              >
                <span>
                  {progress >= 100 ? "Completed" : "Mark as Complete"}
                </span>
                {progress >= 100 && (
                  <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-12 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg text-center text-sm text-gray-500 dark:text-gray-400">
          This prototype uses sample academic materials. Future versions may
          support uploads, document extraction, and synchronization.
        </div>
      </div>
    </AppShell>
  );
}
