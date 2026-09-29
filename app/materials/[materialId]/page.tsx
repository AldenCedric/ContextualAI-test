"use client";

import { use, useState, useEffect } from "react";
import AppShell from "@/components/AppShell";
import { mockMaterials as MATERIALS } from "@/lib/mock-data";
import Link from "next/link";
import {
  ClipboardList,
  Check,
  ArrowLeft,
  BookOpen,
  FileEdit,
  Bot,
  ArrowRight,
  Info,
} from "lucide-react";

export default function MaterialDetailPage({
  params,
}: {
  params: Promise<{ materialId: string }>;
}) {
  const { materialId } = use(params);
  const initialMaterial = MATERIALS.find((m) => m.id === materialId);

  const [progress, setProgress] = useState(initialMaterial?.progress || 0);
  const [studentAnswer, setStudentAnswer] = useState("");
  const [notes, setNotes] = useState("");
  const [saveStatus, setSaveStatus] = useState("");
  const [showSavedAssistance, setShowSavedAssistance] = useState(false);

  useEffect(() => {
    const savedNotes = localStorage.getItem(`studyflow-notes-${materialId}`);
    if (savedNotes) {
      setNotes(savedNotes);
    }
    const savedAnswer = localStorage.getItem(
      `studyflow-student-answer-${materialId}`,
    );
    if (savedAnswer) {
      setStudentAnswer(savedAnswer);
    }
  }, [materialId]);

  const handleSaveAnswer = () => {
    localStorage.setItem(
      `studyflow-student-answer-${materialId}`,
      studentAnswer,
    );
    setSaveStatus("Answer saved!");
    setTimeout(() => setSaveStatus(""), 2500);
  };

  const handleSaveNotes = () => {
    localStorage.setItem(`studyflow-notes-${materialId}`, notes);
    setSaveStatus("Notes saved!");
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
        return "bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300";
      case "Handout":
        return "bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300";
      case "Problem Set":
        return "bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300";
      case "Presentation":
        return "bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300";
      case "Reflection Paper":
        return "bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300";
      case "Research Activity":
        return "bg-cyan-100 dark:bg-cyan-950 text-cyan-800 dark:text-cyan-300";
      case "Worksheet":
        return "bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300";
      case "Group Project":
        return "bg-orange-100 dark:bg-orange-950 text-orange-800 dark:text-orange-300";
      case "Assignment":
        return "bg-pink-100 dark:bg-pink-950 text-pink-800 dark:text-pink-300";
      default:
        return "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300 border-green-200";
      case "in-progress":
        return "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-blue-200";
      case "not-started":
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 border-gray-200";
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
        <div className="space-y-3">
          <div className="flex items-center gap-3 flex-wrap">
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getTypeColor(initialMaterial.type)}`}
            >
              {initialMaterial.type}
            </span>
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(initialMaterial.status)}`}
            >
              {initialMaterial.status.replace("-", " ")}
            </span>
            {initialMaterial.deadline && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Deadline:{" "}
                {new Date(initialMaterial.deadline).toLocaleDateString()}
              </span>
            )}
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
            {initialMaterial.title}
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-300 max-w-3xl">
            {initialMaterial.description}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Instructions Card */}
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xs border border-gray-200 dark:border-gray-800 p-6 space-y-3">
              <div className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
                <ClipboardList className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <span>Instructions & Guidelines</span>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                {initialMaterial.instructions || initialMaterial.description}
              </p>
            </div>

            {/* Content Preview Card */}
            {initialMaterial.content && (
              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xs border border-gray-200 dark:border-gray-800 p-6 space-y-3">
                <div className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
                  <BookOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  <span>Content Preview</span>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 font-mono whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto">
                  {initialMaterial.content}
                </div>
              </div>
            )}

            {/* Student Answer Field (Mandatory Thesis Requirement) */}
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xs border border-gray-200 dark:border-gray-800 p-6 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
                  <FileEdit className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  <span>My Draft Answer</span>
                </div>
                <span className="text-xs text-gray-500">
                  {studentAnswer.trim()
                    ? `${studentAnswer.trim().split(/\s+/).filter(Boolean).length} words`
                    : "No draft entered"}
                </span>
              </div>

              {!studentAnswer.trim() && (
                <div className="p-3 bg-indigo-50/70 dark:bg-indigo-950/40 rounded-lg border border-indigo-100 dark:border-indigo-900/50 flex items-start gap-2 text-xs text-indigo-800 dark:text-indigo-200">
                  <Info className="w-4 h-4 text-indigo-600 mt-0.5 flex-shrink-0" />
                  <span>
                    No answer submitted yet. You can ask the AI to explain the
                    instructions or guide you through the first question.
                  </span>
                </div>
              )}

              <textarea
                value={studentAnswer}
                onChange={(e) => setStudentAnswer(e.target.value)}
                placeholder="Draft or paste your actual response, calculations, or argument here before requesting review..."
                rows={5}
                className="w-full p-3.5 border border-gray-300 dark:border-gray-700 rounded-lg shadow-2xs text-xs sm:text-sm text-gray-900 dark:text-gray-100 dark:bg-gray-800 focus:ring-2 focus:ring-indigo-500 leading-relaxed"
              />

              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleSaveAnswer}
                    className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition-colors shadow-2xs"
                  >
                    Save Draft Answer
                  </button>
                  {saveStatus && (
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                      {saveStatus}
                    </span>
                  )}
                </div>

                <Link
                  href={`/materials/${materialId}/chat?mode=review`}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  <span>Review with AI</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Student Personal Notes */}
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xs border border-gray-200 dark:border-gray-800 p-6 space-y-3">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                Personal Study Notes
              </h3>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Jot down quick reminders, questions for office hours, or references..."
                rows={3}
                className="w-full p-3 border border-gray-300 rounded-lg text-xs text-gray-900 dark:text-white dark:bg-gray-800 dark:border-gray-700"
              />
              <button
                type="button"
                onClick={handleSaveNotes}
                className="px-3 py-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 text-xs rounded font-medium"
              >
                Save Notes
              </button>
            </div>
          </div>

          {/* Sidebar Column */}
          <div className="space-y-6">
            {/* Suggested Next Action */}
            <div className="bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 rounded-xl p-6 space-y-3">
              <h3 className="text-base font-bold text-indigo-900 dark:text-indigo-100">
                Suggested Next Action
              </h3>
              <p className="text-xs text-indigo-700 dark:text-indigo-300 leading-relaxed">
                {initialMaterial.currentTask || initialMaterial.description}
              </p>
              <Link
                href={`/materials/${materialId}/chat`}
                className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-sm"
              >
                <Bot className="w-4 h-4" />
                <span>Open Task Companion</span>
              </Link>
            </div>

            {/* Progress Section */}
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xs border border-gray-200 dark:border-gray-800 p-6 space-y-4">
              <div className="flex justify-between items-center text-sm font-semibold text-gray-900 dark:text-white">
                <span>Completion</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                <div
                  className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <button
                type="button"
                onClick={handleMarkProgress}
                disabled={progress >= 100}
                className="w-full py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 text-xs rounded-lg font-medium disabled:opacity-50"
              >
                Mark Progress (+20%)
              </button>
            </div>

            {/* Action Buttons */}
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xs border border-gray-200 dark:border-gray-800 p-6 space-y-3">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider text-[11px]">
                Quick Actions
              </h3>
              <Link
                href={`/materials/${materialId}/chat?mode=review`}
                className="block w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800/80 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold transition-colors border border-slate-200 dark:border-slate-700"
              >
                Review My Answer (with AI)
              </Link>

              <button
                type="button"
                onClick={() => setShowSavedAssistance(!showSavedAssistance)}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold transition-colors border border-slate-200 dark:border-slate-700 flex justify-between items-center"
              >
                <span>View Saved AI Assistance</span>
                <span className="text-[10px] font-bold bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-full">
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
                <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg text-xs text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 space-y-2 max-h-60 overflow-y-auto">
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
                            No saved assistance records yet.
                          </p>
                        );
                      }
                      return items.map((item: any) => (
                        <div
                          key={item.id}
                          className="p-2.5 bg-white dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-800 space-y-1"
                        >
                          <div className="flex justify-between items-center font-semibold text-indigo-600 dark:text-indigo-400">
                            <span className="capitalize">
                              {item.assistanceMode} Mode
                            </span>
                            <span className="text-[10px] text-gray-400">
                              {new Date(item.savedAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="line-clamp-2 text-slate-700 dark:text-slate-300">
                            {item.responseData?.directResponse ||
                              item.responseData?.response ||
                              "No content"}
                          </p>
                        </div>
                      ));
                    } catch {
                      return <p className="italic">No records available.</p>;
                    }
                  })()}
                </div>
              )}

              <button
                type="button"
                onClick={() => setProgress(100)}
                disabled={progress >= 100}
                className="w-full px-3.5 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg text-xs font-semibold transition-colors flex items-center justify-between disabled:opacity-50"
              >
                <span>
                  {progress >= 100 ? "Completed" : "Mark as Complete"}
                </span>
                {progress >= 100 && (
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="p-4 bg-gray-50 dark:bg-gray-800/40 rounded-xl text-center text-xs text-gray-500 dark:text-gray-400">
          This prototype uses sample university materials. Future versions may
          support direct classroom LMS integration and cloud syncing.
        </div>
      </div>
    </AppShell>
  );
}
