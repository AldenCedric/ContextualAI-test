"use client";

import React, { use, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import AppShell from "@/components/AppShell";
import TaskCompanion from "@/components/TaskCompanion";
import { AssistanceMode } from "@/lib/types";

export default function MaterialChatPage({
  params,
}: {
  params: Promise<{ materialId: string }>;
}) {
  const { materialId } = use(params);
  const searchParams = useSearchParams();
  const modeParam = searchParams.get("mode") as AssistanceMode | null;

  const [studentAnswer, setStudentAnswer] = useState("");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(
        `studyflow-student-answer-${materialId}`,
      );
      if (saved) {
        setStudentAnswer(saved);
      }
    } catch {
      // ignore
    }
  }, [materialId]);

  return (
    <AppShell>
      <div className="space-y-4">
        <TaskCompanion
          initialMaterialId={materialId}
          initialMode={modeParam || "guide"}
          initialStudentAnswer={studentAnswer}
        />
      </div>
    </AppShell>
  );
}
