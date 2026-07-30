import type { Metadata } from "next";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { AppShell } from "@/components/layout";
import { getSessionUser } from "@/lib/session";

/**
 * Every route under this layout (dashboard, documents, chat, analytics,
 * quality, settings, embed builder) requires an authenticated session —
 * anonymous visitors, including Googlebot, are redirected to /login before
 * any content renders. Search Console was logging these as "Page with
 * redirect" / "Crawled - not indexed" noise. Setting `noindex` here (instead
 * of on every page individually) tells Google not to index them at all,
 * which also matches the robots.txt disallow rules in app/robots.ts.
 *
 * Next.js metadata inheritance: child pages under this layout that don't
 * declare their own `robots` field inherit this value automatically.
 */
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function ProtectedLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login");
  }

  return <AppShell user={user}>{children}</AppShell>;
}
