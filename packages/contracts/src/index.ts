export interface UserProfile {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export type UploadType = "raw" | "processed" | "both";

export interface UploadResponse {
  message: string;
  status: number;
}

export interface DocumentFile {
  filename: string;
  file_path: string;
  last_modified: string;
  size: number;
}

export interface SearchResultMetadata {
  chunk_id?: string;
  chunk_index?: number;
  document_id?: string;
  title?: string | null;
  keywords?: string[] | null;
  domain?: string | null;
  page_number?: number | null;
  chunk_size?: number;
  uploaded_by?: string;
  uploaded_at?: string;
  version?: number;
  [key: string]: unknown;
}

export interface SearchResult {
  id: string;
  score: number;
  metadata: SearchResultMetadata;
}

export interface SearchResponse {
  query: string;
  results: SearchResult[];
}

export interface ChatRequest {
  message: string;
  model?: string;
  thread_id?: string;
}

export interface ChatResponse {
  thread_id: string;
  final_response: string;
}

export interface ConversationMessage {
  id: number;
  role: "user" | "assistant" | "system" | "tool" | string;
  type: "human" | "ai" | "system" | "tool" | string;
  content: string;
  name: string | null;
  tool_call_id: string | null;
  response_metadata: Record<string, unknown>;
  additional_kwargs: Record<string, unknown>;
}

export interface ConversationResponse {
  success: boolean;
  thread_id: string;
  message_count: number;
  conversation: ConversationMessage[];
  checkpoint?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  created_at?: string;
  next?: unknown[];
  tasks?: unknown[];
}

export type EmbedPosition = "bottom-right" | "bottom-left";

export interface EmbedConfig {
  id: string;
  userId: string;
  botName: string;
  welcomeMessage: string;
  primaryColor: string;
  position: EmbedPosition;
  launcherLabel: string;
  avatarInitials: string;
  allowedOrigins: string[];
  suggestedQuestions: string[];
  fallbackMessage: string;
  collectVisitorEmail: boolean;
  model?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  // Extended brand customization (UI-only until backend supports it)
  fontFamily?: string;
  chatBackground?: string;
  launcherStyle?: "circle" | "rounded" | "square";
  borderRadiusStyle?: "rounded" | "very-rounded" | "square";
  widgetShadow?: "none" | "soft" | "strong";
  botDescription?: string;
  showPoweredBy?: boolean;
}

export interface EmbedFeedback {
  id: string;
  botId: string;
  userId: string;
  threadId?: string;
  question: string;
  answer?: string;
  visitorEmail?: string;
  pageUrl?: string;
  parentOrigin?: string;
  reason: "not_helpful" | "needs_human" | "gap_detected";
  createdAt: string;
}

export interface ApiErrorBody {
  detail?: string;
  message?: string;
}
