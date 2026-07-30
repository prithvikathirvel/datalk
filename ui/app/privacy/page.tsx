import type { Metadata } from "next";
import Link from "next/link";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://datalk.co.in";

export const metadata: Metadata = {
  title: "Privacy Policy · Datalk",
  description: "How Datalk collects, uses, and protects your data.",
  alternates: {
    canonical: `${siteUrl}/privacy`,
  },
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#fafafb] px-6 py-16 text-slate-950">
      <div className="mx-auto max-w-2xl">
        <Link href="/login" className="mb-10 inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-950">
          ← Back to Datalk
        </Link>

        <h1 className="mt-4 text-3xl font-semibold tracking-tight">Privacy Policy</h1>
        <p className="mt-2 text-sm text-slate-400">Last updated: July 2025</p>

        <div className="mt-10 space-y-8 text-slate-600 leading-7">
          <section>
            <h2 className="mb-2 font-semibold text-slate-950 text-lg">1. Who we are</h2>
            <p>
              Datalk ("we", "our", "us") is a SaaS platform that lets businesses build and embed AI chatbots trained on their own documents and website content. Our website is{" "}
              <a href="https://datalk.co.in" className="text-slate-950 underline underline-offset-2">
                datalk.co.in
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="mb-2 font-semibold text-slate-950 text-lg">2. What data we collect</h2>
            <ul className="list-disc space-y-1 pl-5">
              <li><strong>Account data:</strong> your name and email address obtained through Google Sign-In (OAuth 2.0).</li>
              <li><strong>Content data:</strong> documents, PDFs, and URLs you upload to build your knowledge base.</li>
              <li><strong>Usage data:</strong> pages visited, features used, and chat interactions within the app.</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-2 font-semibold text-slate-950 text-lg">3. How we use your data</h2>
            <ul className="list-disc space-y-1 pl-5">
              <li>To provide and operate the Datalk service.</li>
              <li>To index your uploaded content and power your chatbot.</li>
              <li>To send essential service communications (no marketing without consent).</li>
              <li>To improve product reliability and performance.</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-2 font-semibold text-slate-950 text-lg">4. Google OAuth</h2>
            <p>
              We use Google Sign-In solely to authenticate your identity. We request only your name and email address. We do not access your Google Drive, Gmail, or any other Google services. We never see or store your Google password.
            </p>
          </section>

          <section>
            <h2 className="mb-2 font-semibold text-slate-950 text-lg">5. Data sharing</h2>
            <p>
              We do not sell or rent your personal data. We may share data with trusted infrastructure providers (cloud hosting, storage) strictly to operate the service. These providers are bound by confidentiality obligations.
            </p>
          </section>

          <section>
            <h2 className="mb-2 font-semibold text-slate-950 text-lg">6. Data retention and deletion</h2>
            <p>
              You can delete your uploaded documents at any time from the Documents page. To delete your account and all associated data, contact us at{" "}
              <a href="mailto:support@datalk.co.in" className="text-slate-950 underline underline-offset-2">
                support@datalk.co.in
              </a>
              . We will remove your data within 30 days.
            </p>
          </section>

          <section>
            <h2 className="mb-2 font-semibold text-slate-950 text-lg">7. Cookies</h2>
            <p>
              We use a single HTTP-only session cookie to keep you signed in. We do not use third-party tracking or advertising cookies.
            </p>
          </section>

          <section>
            <h2 className="mb-2 font-semibold text-slate-950 text-lg">8. Security</h2>
            <p>
              All data is transmitted over HTTPS. Session tokens are stored in HTTP-only cookies and never exposed to client-side scripts.
            </p>
          </section>

          <section>
            <h2 className="mb-2 font-semibold text-slate-950 text-lg">9. Contact</h2>
            <p>
              If you have any questions about this policy, email us at{" "}
              <a href="mailto:support@datalk.co.in" className="text-slate-950 underline underline-offset-2">
                support@datalk.co.in
              </a>
              .
            </p>
          </section>
        </div>

        <div className="mt-16 flex gap-6 border-t border-slate-200 pt-6 text-sm text-slate-400">
          <Link href="/terms" className="hover:text-slate-950">Terms of Service</Link>
          <Link href="/" className="hover:text-slate-950">Home</Link>
        </div>
      </div>
    </main>
  );
}
