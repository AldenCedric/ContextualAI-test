"use client";

import React from "react";
import Navigation from "./Navigation";

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navigation />
      <main className="flex-1 mx-auto w-full max-w-5xl px-4 py-6">
        {children}
      </main>
      <footer className="border-t border-card-border py-3 text-center text-xs text-muted">
        StudyFlow — Thesis Defense Prototype. Sample data and responses are
        stored locally in this browser.
      </footer>
    </div>
  );
}
