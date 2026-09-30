"use client";

import { useRouter } from "next/navigation";
import AppShell from "@/components/AppShell";
import { usePrototype } from "@/lib/prototype-context";
import { useState } from "react";
import {
  FileText,
  ChevronLeft,
  MessageSquare,
  ChevronRight,
  AlertTriangle,
} from "lucide-react";

export default function TaskPage() {
  const router = useRouter();
  const {
    selectedSubject,
    selectedTask,
    customDocument,
    studentAnswer,
    setStudentAnswer,
  } = usePrototype();

  const [showContent, setShowContent] = useState(true);

  if (!selectedSubject) {
    return (
      <AppShell>
        <div className="text-center py-16">
          <AlertTriangle className="w-8 h-8 text-warning mx-auto mb-3" />
          <p className="text-muted mb-4">
            No subject selected. Please start from the dashboard.
          </p>
          <button
            onClick={() => router.push("/dashboard")}
            className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium"
          >
            Go to Dashboard
          </button>
        </div>
      </AppShell>
    );
  }

  const taskTitle =
    selectedTask?.title || customDocument?.fileName || "Custom Material";
  const taskContent =
    selectedTask?.content || customDocument?.extractedText || "";
  const taskInstructions = selectedTask?.instructions || "";

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Back to Dashboard */}
        <button
          onClick={() => router.push("/dashboard")}
          className="flex items-center gap-1 text-sm text-muted hover:text-foreground transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Dashboard
        </button>

        {/* Header */}
        <div>
          <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded">
            {selectedSubject.name}
          </span>
          <h1 className="text-xl font-bold mt-2">{taskTitle}</h1>
        </div>

        {/* Guidelines */}
        {taskInstructions && (
          <section className="bg-card-bg border border-card-border rounded-xl p-5">
            <h2 className="text-sm font-semibold mb-2 flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              Guidelines
            </h2>
            <pre className="text-sm text-muted whitespace-pre-wrap font-sans leading-relaxed">
              {taskInstructions}
            </pre>
          </section>
        )}

        {/* Task Content */}
        <section className="bg-card-bg border border-card-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-semibold flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              {selectedTask ? "Task Content" : "Uploaded Document Content"}
            </h2>
            <button
              onClick={() => setShowContent(!showContent)}
              className="text-xs text-primary hover:underline"
            >
              {showContent ? "Collapse" : "Expand"}
            </button>
          </div>

          {!selectedTask && customDocument?.parseStatus === "readable" && (
            <p className="text-xs text-muted mb-3">
              Document loaded successfully. This confirms that the text can be
              read; it does not confirm that the content is correct or complete.
            </p>
          )}

          {showContent && (
            <div className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed max-h-96 overflow-y-auto pr-2">
              {taskContent}
            </div>
          )}
        </section>

        {/* Student Answer Input */}
        <section className="bg-card-bg border border-card-border rounded-xl p-5">
          <h2 className="text-sm font-semibold mb-2">
            Your Answer / Draft (optional)
          </h2>
          <p className="text-xs text-muted mb-3">
            If you have a draft or answer, paste or type it here. The AI can
            review it in Review mode. If you do not have an answer yet, leave
            this blank and use Explain or Guide mode.
          </p>
          <textarea
            value={studentAnswer}
            onChange={(e) => setStudentAnswer(e.target.value)}
            rows={5}
            className="w-full rounded-lg border border-card-border bg-gray-50 dark:bg-gray-900 p-3 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary resize-y"
            placeholder="Type or paste your answer here..."
          />
        </section>

        {/* Actions */}
        <div className="flex justify-end">
          <button
            onClick={() => router.push("/task/chat")}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-dark transition-colors"
          >
            <MessageSquare className="w-4 h-4" />
            Open Chat
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </AppShell>
  );
}
