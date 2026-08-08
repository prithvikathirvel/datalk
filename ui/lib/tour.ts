/**
 * Interactive product tour steps.
 *
 * `target` is a CSS selector pointing at an element that exists on the page
 * where the tour is started (the dashboard). The spotlight highlights that
 * element while the tooltip explains what it does. If a target is missing or
 * hidden (e.g. the desktop sidebar on mobile), the tour falls back to a
 * centered card with no spotlight.
 */
export interface TourStep {
  id: string;
  target: string;
  title: string;
  description: string;
  /** Optional "Open" action rendered in the tooltip (relative path). */
  href?: string;
}

export const DASHBOARD_TOUR_STEPS: TourStep[] = [
  {
    id: "nav-overview",
    target: "[data-tour='nav-overview']",
    title: "Overview",
    description:
      "Your workspace at a glance — document count, conversation activity, active chatbots, and the getting-started checklist.",
  },
  {
    id: "nav-documents",
    target: "[data-tour='nav-documents']",
    title: "Documents",
    description:
      "Upload PDFs, Word files, or website URLs. Datalk splits them into chunks, indexes the meaning, and makes them searchable.",
    href: "/documents",
  },
  {
    id: "nav-chat",
    target: "[data-tour='nav-chat']",
    title: "Chat",
    description:
      "Ask questions about your knowledge base. Every answer cites the sources it came from, and conversations are saved per thread.",
    href: "/chat",
  },
  {
    id: "nav-studio",
    target: "[data-tour='nav-studio']",
    title: "Chatbot Studio",
    description:
      "Design your customer-facing assistant: name, colours, welcome message, suggested questions, and where the widget sits on your site.",
    href: "/studio",
  },
  {
    id: "nav-analytics",
    target: "[data-tour='nav-analytics']",
    title: "Analytics",
    description:
      "See conversations, satisfaction ratings, and where your assistant is being used — right down to individual threads.",
    href: "/analytics",
  },
  {
    id: "nav-settings",
    target: "[data-tour='nav-settings']",
    title: "Settings",
    description:
      "Manage your profile, chat model preferences, retrieval behaviour, and update the onboarding details you gave us.",
    href: "/settings",
  },
  {
    id: "getting-started",
    target: "[data-tour='getting-started']",
    title: "Getting started checklist",
    description:
      "A step-by-step checklist that tracks your progress: upload files, test retrieval, start chatting, and publish a chatbot.",
  },
  {
    id: "quick-actions",
    target: "[data-tour='quick-actions']",
    title: "Quick actions",
    description:
      "Shortcuts to the most common tasks — upload a document, start a chat, run a coverage test, or open the guide.",
  },
];
