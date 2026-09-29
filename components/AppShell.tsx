"use client";

import React from "react";
import Navigation from "@/components/Navigation";
import { PrototypeProvider, usePrototype } from "@/lib/prototype-context";

function ShellContent({ children }: { children: React.ReactNode }) {
  const { settings, isMounted } = usePrototype();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {isMounted && settings.serviceMode !== "primary" && (
        <div className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/60 dark:text-yellow-200 px-4 py-2 text-sm text-center font-medium shadow-sm transition-all border-b border-yellow-200 dark:border-yellow-800">
          Prototype demonstration controls enabled — using{" "}
          <span className="font-bold">{settings.serviceMode}</span> mode.
        </div>
      )}

      <Navigation />

      <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      <footer className="mt-auto py-6 bg-slate-100 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-slate-500 dark:text-slate-400">
          Demonstration prototype: sample data and saved responses are stored
          locally in this browser.
        </div>
      </footer>
    </div>
  );
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <PrototypeProvider>
      <ShellContent>{children}</ShellContent>
    </PrototypeProvider>
  );
}
