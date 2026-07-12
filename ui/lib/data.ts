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

export const mockAnalyticsData: AnalyticsData = {
  totalConversations: 284,
  totalMessages: 1_847,
  avgMessagesPerConversation: 6.5,
  avgResponseTimeMs: 820,
  unansweredRate: 0.12,
  topQuestions: [
    { id: "q1", question: "What are the pricing plans?", count: 48, lastAsked: "2026-07-07T14:23:00Z" },
    { id: "q2", question: "How do I cancel my subscription?", count: 37, lastAsked: "2026-07-08T09:11:00Z" },
    { id: "q3", question: "What is the refund policy?", count: 31, lastAsked: "2026-07-07T18:05:00Z" },
    { id: "q4", question: "How do I integrate with Slack?", count: 27, lastAsked: "2026-07-06T12:44:00Z" },
    { id: "q5", question: "Is there an API available?", count: 22, lastAsked: "2026-07-08T07:30:00Z" },
    { id: "q6", question: "How do I export my data?", count: 19, lastAsked: "2026-07-05T16:20:00Z" },
    { id: "q7", question: "Do you support SSO?", count: 15, lastAsked: "2026-07-04T10:00:00Z" },
    { id: "q8", question: "What file formats are supported?", count: 14, lastAsked: "2026-07-03T08:15:00Z" },
  ],
  unansweredQuestions: [
    { id: "u1", question: "Can I white-label the chatbot?", askedAt: "2026-07-08T08:45:00Z", botName: "Docs Assistant" },
    { id: "u2", question: "Do you have HIPAA compliance docs?", askedAt: "2026-07-07T21:15:00Z", botName: "Support Bot" },
    { id: "u3", question: "What is your SLA for enterprise customers?", askedAt: "2026-07-07T17:30:00Z", botName: "Docs Assistant" },
    { id: "u4", question: "How do I configure webhooks?", askedAt: "2026-07-07T14:00:00Z", botName: "Support Bot" },
    { id: "u5", question: "Can I import data from Notion?", askedAt: "2026-07-06T11:20:00Z", botName: "Docs Assistant" },
  ],
  dailyConversations: [
    { date: "2026-07-01", conversations: 28, messages: 182 },
    { date: "2026-07-02", conversations: 34, messages: 221 },
    { date: "2026-07-03", conversations: 22, messages: 143 },
    { date: "2026-07-04", conversations: 18, messages: 117 },
    { date: "2026-07-05", conversations: 31, messages: 201 },
    { date: "2026-07-06", conversations: 45, messages: 293 },
    { date: "2026-07-07", conversations: 52, messages: 338 },
    { date: "2026-07-08", conversations: 54, messages: 352 },
  ],
  satisfaction: {
    thumbsUp: 198,
    thumbsDown: 34,
    noFeedback: 52,
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
    iconPath: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6",
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
    description: "Run a retrieval test to verify your docs are indexed correctly.",
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
