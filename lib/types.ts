export type MaterialType =
  | "Activity"
  | "Handout"
  | "Assignment"
  | "Problem Set"
  | "Presentation"
  | "Reflection Paper"
  | "Research Activity"
  | "Worksheet"
  | "Group Project"
  | "Reading";

export type AssistanceMode =
  | "understand"
  | "guide"
  | "organize"
  | "explore"
  | "review"
  | "draft";

export type LanguageMode = "english" | "filipino" | "taglish";

export type ResponseStatus =
  | "needs_clarification"
  | "document_overview"
  | "guided_help"
  | "answer_review"
  | "checklist"
  | "draft";

export type ResponseType =
  | ResponseStatus
  | "explanation"
  | "guidance"
  | "checklist"
  | "search_plan"
  | "feedback"
  | "example"
  | "draft";

export type ServiceSource =
  | "gemini-live"
  | "gemini-backup"
  | "local-fallback"
  // Legacy aliases for backward compatibility
  | "gemini-primary"
  | "gemini-fallback-1"
  | "gemini-fallback-2"
  | "local-template"
  | "demo-simulation";

export type ServiceMode =
  | "primary"
  | "fallback-1"
  | "fallback-2"
  | "local"
  | "demo";

export interface DocumentEvidenceItem {
  location: string;
  excerptOrSummary: string;
  whyItMatters: string;
}

export interface Material {
  id: string;
  title: string;
  type: MaterialType;
  description: string;
  instructions?: string;
  content?: string;
  deadline?: string;
  progress: number; // 0-100
  status: "not-started" | "in-progress" | "completed";
  notes?: string;
  currentTask?: string;
  studentAnswer?: string;
}

export interface GeminiResponse {
  status: ResponseStatus;
  directResponse: string;
  response?: string; // backward compat alias for directResponse
  responseType?: string; // backward compat
  documentEvidence?: DocumentEvidenceItem[];
  keyPoints: string[];
  missingInformation?: string[];
  suggestedNextActions: string[];
  suggestedNextAction?: string; // backward compat alias
  followUpActions?: string[]; // backward compat alias
  verificationQuestions: string[];
  uncertainties?: string[];
  requiresStudentAnswer?: boolean;
  requiresReview: boolean;
  languageMode?: LanguageMode;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  assistanceMode?: AssistanceMode;
  languageMode?: LanguageMode;
  responseData?: GeminiResponse;
  source?: ServiceSource;
  attachedDocument?: {
    name: string;
    size: number;
    wordCount?: number;
  };
  studentAnswer?: string;
}

export interface ChatRequest {
  material: {
    id?: string;
    title: string;
    type: string;
    instructions?: string;
    content?: string;
    description?: string;
  };
  currentTask?: string;
  studentAnswer?: string | null;
  userMessage?: string;
  message?: string; // backward compat alias
  assistanceMode: AssistanceMode;
  languageMode?: LanguageMode;
  conversationHistory: Array<{ role: "user" | "assistant"; content: string }>;
  attachedDocument?: {
    name: string;
    size: number;
    text?: string;
    base64?: string;
    wordCount?: number;
  };
  stream?: boolean;
  forceMode?: ServiceMode;
}

export interface SavedResponse {
  id: string;
  materialId: string;
  materialTitle: string;
  materialType: MaterialType;
  currentTask: string;
  languageMode?: LanguageMode;
  assistanceMode: AssistanceMode;
  userMessage: string;
  studentAnswer?: string;
  responseData: GeminiResponse;
  reviewAnswers?: ReviewAnswers;
  studentReflection?: string;
  savedAt: string;
  source: ServiceSource;
}

export interface ReviewAnswers {
  mainIdea: string;
  whatToVerify: string;
  ownWords: string;
}

export interface PrototypeSettings {
  serviceMode: ServiceMode;
  languageMode: LanguageMode;
  showReviewCheckpoint: boolean;
  showDocumentEvidence: boolean;
  showFuturePlaceholders: boolean;
}

// Alias for components that reference this type
export type ChatResponseData = GeminiResponse;
