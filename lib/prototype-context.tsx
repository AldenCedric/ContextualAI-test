"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import type { ServiceMode, LanguageMode } from "./types";

export interface PrototypeSettings {
  serviceMode: ServiceMode;
  languageMode: LanguageMode;
  showReviewCheckpoint: boolean;
  showDocumentEvidence: boolean;
  showFuturePlaceholders: boolean;
}

interface PrototypeContextType {
  settings: PrototypeSettings;
  updateSettings: (newSettings: Partial<PrototypeSettings>) => void;
  isMounted: boolean;
  // Service Mode
  serviceMode: ServiceMode;
  setServiceMode: (mode: ServiceMode) => void;
  // Language Mode
  languageMode: LanguageMode;
  setLanguageMode: (mode: LanguageMode) => void;
  // Toggles
  showReviewCheckpoint: boolean;
  setShowReviewCheckpoint: (v: boolean) => void;
  showDocumentEvidence: boolean;
  setShowDocumentEvidence: (v: boolean) => void;
  showFuturePlaceholders: boolean;
  setShowFuturePlaceholders: (v: boolean) => void;
  // Legacy aliases
  currentMode: ServiceMode;
  fallbackLevel: ServiceMode;
  setFallbackLevel: (mode: ServiceMode) => void;
}

const defaultSettings: PrototypeSettings = {
  serviceMode: "primary",
  languageMode: "english",
  showReviewCheckpoint: true,
  showDocumentEvidence: true,
  showFuturePlaceholders: true,
};

const PrototypeContext = createContext<PrototypeContextType | undefined>(
  undefined,
);

export function PrototypeProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<PrototypeSettings>(defaultSettings);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    try {
      const saved = localStorage.getItem("studyflow-prototype-settings");
      if (saved) {
        setSettings({ ...defaultSettings, ...JSON.parse(saved) });
      }
    } catch {
      // ignore parse errors
    }
  }, []);

  const updateSettings = (newSettings: Partial<PrototypeSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      try {
        localStorage.setItem(
          "studyflow-prototype-settings",
          JSON.stringify(updated),
        );
      } catch {
        // localStorage may be unavailable
      }
      return updated;
    });
  };

  const setServiceMode = (mode: ServiceMode) =>
    updateSettings({ serviceMode: mode });
  const setLanguageMode = (mode: LanguageMode) =>
    updateSettings({ languageMode: mode });
  const setShowReviewCheckpoint = (v: boolean) =>
    updateSettings({ showReviewCheckpoint: v });
  const setShowDocumentEvidence = (v: boolean) =>
    updateSettings({ showDocumentEvidence: v });
  const setShowFuturePlaceholders = (v: boolean) =>
    updateSettings({ showFuturePlaceholders: v });

  const value: PrototypeContextType = {
    settings,
    updateSettings,
    isMounted,
    // Convenience
    serviceMode: settings.serviceMode,
    setServiceMode,
    languageMode: settings.languageMode,
    setLanguageMode,
    showReviewCheckpoint: settings.showReviewCheckpoint,
    setShowReviewCheckpoint,
    showDocumentEvidence: settings.showDocumentEvidence,
    setShowDocumentEvidence,
    showFuturePlaceholders: settings.showFuturePlaceholders,
    setShowFuturePlaceholders,
    // Legacy aliases
    currentMode: settings.serviceMode,
    fallbackLevel: settings.serviceMode,
    setFallbackLevel: setServiceMode,
  };

  return (
    <PrototypeContext.Provider value={value}>
      {children}
    </PrototypeContext.Provider>
  );
}

const fallbackContextValue: PrototypeContextType = {
  settings: defaultSettings,
  updateSettings: () => {},
  isMounted: false,
  serviceMode: "primary",
  setServiceMode: () => {},
  languageMode: "english",
  setLanguageMode: () => {},
  showReviewCheckpoint: true,
  setShowReviewCheckpoint: () => {},
  showDocumentEvidence: true,
  setShowDocumentEvidence: () => {},
  showFuturePlaceholders: true,
  setShowFuturePlaceholders: () => {},
  currentMode: "primary",
  fallbackLevel: "primary",
  setFallbackLevel: () => {},
};

export function usePrototype() {
  const context = useContext(PrototypeContext);
  if (context === undefined) {
    return fallbackContextValue;
  }
  return context;
}
