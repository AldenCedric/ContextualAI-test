"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import type { ServiceMode } from "./types";

export interface PrototypeSettings {
  serviceMode: ServiceMode;
  showReviewCheckpoint: boolean;
  showFuturePlaceholders: boolean;
}

interface PrototypeContextType {
  settings: PrototypeSettings;
  updateSettings: (newSettings: Partial<PrototypeSettings>) => void;
  isMounted: boolean;
  // Convenience accessors so consumers don't need to go through settings.*
  serviceMode: ServiceMode;
  setServiceMode: (mode: ServiceMode) => void;
  showReviewCheckpoint: boolean;
  setShowReviewCheckpoint: (v: boolean) => void;
  showFuturePlaceholders: boolean;
  setShowFuturePlaceholders: (v: boolean) => void;
  // Legacy alias used by some pages
  currentMode: ServiceMode;
  fallbackLevel: ServiceMode;
  setFallbackLevel: (mode: ServiceMode) => void;
}

const defaultSettings: PrototypeSettings = {
  serviceMode: "primary",
  showReviewCheckpoint: true,
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
  const setShowReviewCheckpoint = (v: boolean) =>
    updateSettings({ showReviewCheckpoint: v });
  const setShowFuturePlaceholders = (v: boolean) =>
    updateSettings({ showFuturePlaceholders: v });

  const value: PrototypeContextType = {
    settings,
    updateSettings,
    isMounted,
    // Convenience
    serviceMode: settings.serviceMode,
    setServiceMode,
    showReviewCheckpoint: settings.showReviewCheckpoint,
    setShowReviewCheckpoint,
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
  showReviewCheckpoint: true,
  setShowReviewCheckpoint: () => {},
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
