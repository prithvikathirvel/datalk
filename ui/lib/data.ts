/**
 * lib/data.ts
 * Static / mock data shaped like real API responses.
 * Swap any section with a real `fetch()` call when the backend is ready.
 */

// ─── Analytics ────────────────────────────────────────────────────────────────

export interface TopQuestion {
  id: string;
  question: string;
  count: number;
  lastAsked: string;
}

export interface UnansweredQuestion {
  id: string;
  question: string;
  askedAt: string;
  botName: string;
}

export interface DailyConversation {
  date: string; // ISO date string, e.g. "2026-07-01"
  conversations: number;
  messages: number;
}

export interface SatisfactionBreakdown {
  thumbsUp: number;
  thumbsDown: number;
  noFeedback: number;
}

export interface AnalyticsData {
  totalConversations: number;
  totalMessages: number;
  avgMessagesPerConversation: number;
  avgResponseTimeMs: number;
  unansweredRate: number; // 0–1
  topQuestions: TopQuestion[];
  unansweredQuestions: UnansweredQuestion[];
  dailyConversations: DailyConversation[];
  satisfaction: SatisfactionBreakdown;
}

// Empty defaults shown while the real analytics API is loading.
export const mockAnalyticsData: AnalyticsData = {
  totalConversations: 0,
  totalMessages: 0,
  avgMessagesPerConversation: 0,
  avgResponseTimeMs: 0,
  unansweredRate: 0,
  topQuestions: [],
  unansweredQuestions: [],
  dailyConversations: [],
  satisfaction: {
    thumbsUp: 0,
    thumbsDown: 0,
    noFeedback: 0,
  },
};

// ─── Dashboard Quick-action labels ────────────────────────────────────────────

export interface QuickAction {
  label: string;
  description: string;
  href: string;
  iconPath: string;
}

export const dashboardQuickActions: QuickAction[] = [
  {
    label: "Chat",
    description: "Test your knowledge base",
    href: "/chat",
    iconPath: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z",
  },
  {
    label: "Upload docs",
    description: "Add files to your knowledge base",
    href: "/documents",
    iconPath:
      "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6",
  },
  {
    label: "Analytics",
    description: "View conversation insights",
    href: "/analytics",
    iconPath: "M18 20V10M12 20V4M6 20v-6",
  },
  {
    label: "Embed",
    description: "Deploy a chatbot widget",
    href: "/embed",
    iconPath: "M16 18l6-6-6-6M8 6L2 12l6 6",
  },
  {
    label: "Guide",
    description: "Learn what every feature does",
    href: "/tutorial",
    iconPath:
      "M4 19.5A2.5 2.5 0 0 1 6.5 17H20M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z",
  },
];

// ─── Setup / Onboarding Steps ──────────────────────────────────────────────────

export interface SetupStep {
  id: string;
  label: string;
  description: string;
  href: string;
}

export const setupSteps: SetupStep[] = [
  {
    id: "upload",
    label: "Upload documents",
    description: "Add PDFs, Word docs, or text files to your knowledge base.",
    href: "/documents",
  },
  {
    id: "test",
    label: "Test retrieval",
    description:
      "Run a retrieval test to verify your docs are indexed correctly.",
    href: "/documents",
  },
  {
    id: "chat",
    label: "Chat with your data",
    description: "Ask questions and see answers powered by your documents.",
    href: "/chat",
  },
  {
    id: "embed",
    label: "Create embed chatbot",
    description: "Deploy a widget on your website for your users.",
    href: "/embed",
  },
  {
    id: "analytics",
    label: "Monitor analytics",
    description: "Track usage, find knowledge gaps, and improve over time.",
    href: "/analytics",
  },
];
