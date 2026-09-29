"use client";

import React, { use } from "react";
import AppShell from "@/components/AppShell";
import TaskCompanion from "@/components/TaskCompanion";

export default function MaterialChatPage({
  params,
}: {
  params: Promise<{ materialId: string }>;
}) {
  const { materialId } = use(params);

  return (
    <AppShell>
      <div className="space-y-4">
        <TaskCompanion initialMaterialId={materialId} />
      </div>
    </AppShell>
  );
}
