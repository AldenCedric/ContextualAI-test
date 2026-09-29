"use client";

import React from "react";
import AppShell from "@/components/AppShell";
import TaskCompanion from "@/components/TaskCompanion";
import { Bot } from "lucide-react";

export default function ChatMainPage() {
  return (
    <AppShell>
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Bot className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              <span>Task Companion & Document Verifier</span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Contextual AI guidance for academic materials, assignments,
              handouts, and document verification.
            </p>
          </div>
        </div>

        <TaskCompanion />
      </div>
    </AppShell>
  );
}
