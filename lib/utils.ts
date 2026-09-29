import { ServiceSource, ResponseType, AssistanceMode, Material } from "./types";

export function generateId(): string {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
}

export function formatDate(dateString: string): string {
  if (!dateString) return "";
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function getSourceLabel(source: ServiceSource): string {
  switch (source) {
    case "gemini-primary":
      return "Live AI";
    case "gemini-fallback-1":
    case "gemini-fallback-2":
      return "Backup AI service";
    case "local-template":
      return "Local fallback";
    default:
      return "Unknown source";
  }
}

export function getResponseTypeLabel(type: ResponseType): string {
  switch (type) {
    case "explanation":
      return "Explanation";
    case "guidance":
      return "Guidance";
    case "checklist":
      return "Checklist";
    case "search_plan":
      return "Search Plan";
    case "feedback":
      return "Feedback";
    case "example":
      return "Example";
    case "draft":
      return "Draft";
    default:
      return String(type);
  }
}

export function getModeLabel(mode: AssistanceMode): string {
  return mode.charAt(0).toUpperCase() + mode.slice(1);
}

export function getStatusColor(status: Material["status"]): string {
  switch (status) {
    case "completed":
      return "text-green-600 bg-green-50 border-green-200";
    case "in-progress":
      return "text-blue-600 bg-blue-50 border-blue-200";
    case "not-started":
      return "text-gray-600 bg-gray-50 border-gray-200";
    default:
      return "text-gray-600 bg-gray-50 border-gray-200";
  }
}

export function getProgressColor(progress: number): string {
  if (progress >= 100) return "bg-green-500";
  if (progress >= 50) return "bg-blue-500";
  if (progress > 0) return "bg-indigo-500";
  return "bg-gray-300";
}

export function truncateText(text: string, maxLength: number): string {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}

export function classNames(
  ...classes: (string | boolean | undefined | null)[]
): string {
  return classes.filter(Boolean).join(" ");
}
