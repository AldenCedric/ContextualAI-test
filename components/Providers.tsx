"use client";

import React from "react";
import { PrototypeProvider } from "@/lib/prototype-context";

export function Providers({ children }: { children: React.ReactNode }) {
  return <PrototypeProvider>{children}</PrototypeProvider>;
}
