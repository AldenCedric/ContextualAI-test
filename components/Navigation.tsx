"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { usePrototype } from "@/lib/prototype-context";
import { Bot, GraduationCap, Menu, X, Sparkles } from "lucide-react";

export default function Navigation() {
  const pathname = usePathname();
  const { settings, isMounted } = usePrototype();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: "Dashboard", href: "/dashboard" },
    { name: "Materials", href: "/materials" },
    { name: "Task Companion", href: "/chat" },
    { name: "Prototype Controls", href: "/prototype-controls" },
  ];

  const getStatusColor = () => {
    if (!isMounted) return "bg-green-500";
    switch (settings.serviceMode) {
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

  const getStatusTitle = () => {
    if (!isMounted) return "Service Mode: primary";
    return `Service Mode: ${settings.serviceMode}`;
  };

  const checkIsActive = (href: string) => {
    if (!pathname) return false;
    if (href === "/chat") {
      return pathname.startsWith("/chat") || pathname.includes("/chat");
    }
    if (href === "/materials") {
      return pathname.startsWith("/materials") && !pathname.includes("/chat");
    }
    return pathname === href;
  };

  return (
    <nav
      suppressHydrationWarning
      className="sticky top-0 z-50 w-full backdrop-blur-md bg-white/80 dark:bg-slate-900/80 border-b border-gray-200 dark:border-slate-800 shadow-sm transition-colors duration-300"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center gap-2.5">
              <Link
                href="/dashboard"
                className="text-xl font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 transition-colors flex items-center gap-2"
              >
                <div className="w-8 h-8 rounded-lg bg-indigo-600 dark:bg-indigo-500 text-white flex items-center justify-center shadow-sm">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <span>StudyFlow</span>
              </Link>
              <div
                suppressHydrationWarning
                className={`w-2.5 h-2.5 rounded-full ${getStatusColor()} transition-colors ml-1`}
                title={getStatusTitle()}
                aria-label={getStatusTitle()}
              />
            </div>
            <div className="hidden sm:ml-8 sm:flex sm:space-x-8">
              {navLinks.map((link) => {
                const isActive = checkIsActive(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    suppressHydrationWarning
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${
                      isActive
                        ? "border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400 font-semibold"
                        : "border-transparent text-gray-600 dark:text-gray-300 hover:border-gray-300 hover:text-gray-900 dark:hover:text-white"
                    }`}
                  >
                    {link.name}
                    {link.href === "/chat" && (
                      <span className="ml-1.5 px-1.5 py-0.5 text-[10px] uppercase font-bold tracking-wider bg-indigo-100 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300 rounded flex items-center gap-1">
                        <Sparkles className="w-2.5 h-2.5" />
                        AI
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="hidden sm:flex sm:items-center sm:gap-3">
            <Link
              href="/chat"
              className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm transition-all hover:shadow"
            >
              <Bot className="w-3.5 h-3.5" />
              <span>Open Companion</span>
            </Link>
          </div>

          <div className="-mr-2 flex items-center sm:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-slate-800 focus:outline-none"
              aria-expanded={isMobileMenuOpen}
            >
              <span className="sr-only">Open main menu</span>
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="sm:hidden bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-gray-200 dark:border-slate-800">
          <div className="pt-2 pb-3 space-y-1">
            {navLinks.map((link) => {
              const isActive = checkIsActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                    isActive
                      ? "bg-indigo-50 dark:bg-indigo-950/50 border-indigo-600 text-indigo-600 dark:text-indigo-400"
                      : "border-transparent text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 hover:border-gray-300 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
}
