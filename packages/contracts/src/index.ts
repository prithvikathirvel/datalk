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

export interface UploadConfig {
  pageRange: string;
  extract: {
    text: boolean;
    tables: boolean;
    images: boolean;
  };
}

export interface IngestRequest {
  source: "file" | "website";
  mode: "upload" | "url";
  file: string;
  config: UploadConfig;
  meta_data?: Record<string, string>;
  document_id?: string;
}

export interface WebsiteConfig {
  mode: "deep" | "single";
  maxDepth: number;
  maxPages: number;
  includeSubdomains: boolean;
  includePaths: string[];
  excludePaths: string[];
  onlyMainContent: boolean;
  includeImages: boolean;
  includeTables: boolean;
  waitFor: number;
}

export interface WebsiteIngestRequest {
  source: "website";
  mode: "url";
  url: string;
  config: WebsiteConfig;
}

export interface PresignedUrlRequest {
  filename: string;
  contentType: string;
}

export interface PresignedUrlResponse {
  presignedUrl: string;
  key: string;
}

export interface DocumentFile {
  id: string;
  filename: string;
  file_path: string;
  last_modified: string;
  size: number | null;
  type?: string;
  status?: string;
  job_id?: string;
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

export interface ChatResponseMetadata {
  conversation_id?: string;
  is_answered?: boolean;
  answer_status?: string;
  retrieval_response_time_ms?: number;
  usage?: ConversationUsage;
  [key: string]: unknown;
}

export interface ChatResponse {
  thread_id: string;
  final_response: string;
  answer?: string;
  response_type?: string;
  document_ids?: string[];
  source_documents?: string[];
  metadata?: ChatResponseMetadata;
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

/** Token accounting returned by the chat backend. */
export interface ConversationUsage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}

export interface ConversationMessageMetadata {
  response_type?: string;
  model?: string;
  provider?: string;
  response_time_ms?: number;
  documents_retrieved?: number;
  chunks_retrieved?: number;
  is_answered?: boolean;
  answer_status?: string;
  feedback?: number;
  source_documents?: string[];
  [key: string]: unknown;
}

/** A single message of `GET /chat/api/v1/conversation?thread_id=…`. */
export interface ConversationTurn {
  id: string;
  role: "user" | "assistant" | string;
  content: string;
  created_at: string;
  metadata?: ConversationMessageMetadata;
  usage?: ConversationUsage;
}

/** Response of `GET /chat/api/v1/conversation?thread_id=…`. */
export interface ConversationDetail {
  thread_id: string;
  total_messages: number;
  usage?: ConversationUsage;
  messages: ConversationTurn[];
}

/** One row of `GET /chat/api/v1/conversations`. */
export interface ConversationSummary {
  id: string;
  thread_id: string;
  title: string;
  bot_message: string;
  created_at: string;
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

/**
 * API key metadata for an embed chatbot. The raw key is never stored or
 * returned here — only the prefix is kept for display.
 */
export interface ApiKey {
  id: string;
  configId: string;
  /** First 12 chars of the raw key, e.g. "dk_live_a1b2". */
  keyPrefix: string;
  name: string;
  isActive: boolean;
  lastUsedAt?: string;
  expiresAt?: string;
  createdAt: string;
}

/** A document assigned as a knowledge source for one chatbot. */
export interface EmbedConfigSource {
  documentId: string;
  documentFilename: string;
  addedAt: string;
}

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
  contextPrompt?: string;
  showPoweredBy?: boolean;
  /** Chat panel width in px (default 400). */
  widgetWidth?: number;
  /** Chat panel height in px (default 640). */
  widgetHeight?: number;
  /** Placeholder text for the chat input (default "Ask a question..."). */
  inputPlaceholder?: string;
  /** Distance in px between the launcher/panel and the screen corner (default 24). */
  launcherOffset?: number;
  /**
   * Documents this chatbot is allowed to search. Empty means unrestricted —
   * the bot searches the user's whole library.
   */
  sourceDocumentIds?: string[];
}

/**
 * Returned by `POST /api/embed/configs`. `apiKey` is the raw key and is sent
 * exactly once — it cannot be retrieved again after this response.
 */
export interface CreateEmbedConfigResponse {
  config: EmbedConfig;
  apiKey: string;
}

/** Returned by `POST /api/embed/configs/[botId]/rotate-key`. */
export interface RotateApiKeyResponse {
  apiKey: string;
  key: ApiKey;
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
