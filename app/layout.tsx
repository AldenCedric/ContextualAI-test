import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";

export const metadata: Metadata = {
  title: "StudyFlow — Contextual AI Academic Companion",
  description:
    "StudyFlow helps students understand activities, handouts, assignments, and projects by providing contextual AI guidance instead of only generating direct answers.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-gray-50 text-gray-900 dark:bg-gray-950 dark:text-gray-100 font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
