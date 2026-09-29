export type MaterialType =
  | "Activity"
  | "Handout"
  | "Assignment"
  | "Problem Set"
  | "Presentation"
  | "Research Activity"
  | "Reading"
  | "Project";

export type AssistanceMode =
  | "explain"
  | "guide"
  | "organize"
  | "explore"
  | "review"
  | "draft";

export type ResponseType =
  | "explanation"
  | "guidance"
  | "checklist"
  | "search_plan"
  | "feedback"
  | "example"
  | "draft";

export type ServiceSource =
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

export interface Material {
  id: string;
  title: string;
  type: MaterialType;
  description: string;
  deadline?: string;
  progress: number; // 0-100
  status: "not-started" | "in-progress" | "completed";
  notes?: string;
  currentTask?: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  assistanceMode?: AssistanceMode;
  responseData?: GeminiResponse;
  source?: ServiceSource;
  attachedDocument?: {
    name: string;
    size: number;
    wordCount?: number;
  };
}

export interface GeminiResponse {
  response: string;
  responseType: ResponseType;
  keyPoints: string[];
  suggestedNextAction: string;
  followUpActions: string[];
  verificationQuestions: string[];
  uncertainties: string[];
  requiresReview: boolean;
}

export interface ChatRequest {
  material: Pick<Material, "id" | "title" | "type" | "description">;
  currentTask: string;
  assistanceMode: AssistanceMode;
  conversationHistory: Array<{ role: "user" | "assistant"; content: string }>;
  message: string;
}

export interface SavedResponse {
  id: string;
  materialId: string;
  materialTitle: string;
  materialType: MaterialType;
  currentTask: string;
  assistanceMode: AssistanceMode;
  userMessage: string;
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
  showReviewCheckpoint: boolean;
  showFuturePlaceholders: boolean;
}

// Alias for components that reference this type by an alternative name
export type ChatResponseData = GeminiResponse;
