import type { Metadata } from "next";
import Link from "next/link";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://datalk.co.in";

export const metadata: Metadata = {
  title: "Terms of Service · Datalk",
  description: "The terms that govern your use of Datalk.",
  alternates: {
    canonical: `${siteUrl}/terms`,
  },
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#fafafb] px-6 py-16 text-slate-950">
      <div className="mx-auto max-w-2xl">
        <Link href="/login" className="mb-10 inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-950">
          ← Back to Datalk
        </Link>

        <h1 className="mt-4 text-3xl font-semibold tracking-tight">Terms of Service</h1>
        <p className="mt-2 text-sm text-slate-400">Last updated: July 2025</p>

        <div className="mt-10 space-y-8 text-slate-600 leading-7">
          <section>
            <h2 className="mb-2 font-semibold text-slate-950 text-lg">1. Acceptance</h2>
            <p>
              By creating an account or using Datalk ("Service"), you agree to these Terms of Service. If you do not agree, do not use the Service.
            </p>
          </section>

          <section>
            <h2 className="mb-2 font-semibold text-slate-950 text-lg">2. Description of service</h2>
            <p>
              Datalk is a SaaS platform that allows users to upload documents and website content, index that content using AI, and deploy an embeddable chatbot on their websites. The chatbot answers questions based solely on the content you provide.
            </p>
          </section>

          <section>
            <h2 className="mb-2 font-semibold text-slate-950 text-lg">3. Your account</h2>
            <ul className="list-disc space-y-1 pl-5">
              <li>You must sign in using Google OAuth. You are responsible for keeping your account secure.</li>
              <li>You must be at least 18 years old or have parental consent to use the Service.</li>
              <li>One person may not operate multiple accounts to circumvent usage limits.</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-2 font-semibold text-slate-950 text-lg">4. Your content</h2>
            <p>
              You retain ownership of all documents and content you upload. By uploading content, you grant Datalk a limited licence to process and index it solely for the purpose of operating your chatbot. You are responsible for ensuring you have the right to upload and use that content.
            </p>
          </section>

          <section>
            <h2 className="mb-2 font-semibold text-slate-950 text-lg">5. Acceptable use</h2>
            <p>You agree not to use Datalk to:</p>
            <ul className="list-disc space-y-1 pl-5">
              <li>Upload content that infringes intellectual property rights.</li>
              <li>Distribute harmful, illegal, or misleading information.</li>
              <li>Attempt to reverse-engineer, scrape, or disrupt the Service.</li>
              <li>Impersonate other users or entities.</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-2 font-semibold text-slate-950 text-lg">6. Service availability</h2>
            <p>
              We aim for high availability but do not guarantee uninterrupted access. We may modify or discontinue features with reasonable notice. During the beta period, features may change without prior notice.
            </p>
          </section>

          <section>
            <h2 className="mb-2 font-semibold text-slate-950 text-lg">7. Limitation of liability</h2>
            <p>
              To the maximum extent permitted by law, Datalk is provided "as is" without warranties of any kind. We are not liable for indirect, incidental, or consequential damages arising from your use of the Service.
            </p>
          </section>

          <section>
            <h2 className="mb-2 font-semibold text-slate-950 text-lg">8. Termination</h2>
            <p>
              You may stop using the Service at any time. We may suspend or terminate accounts that violate these Terms. Upon termination, your data will be deleted in accordance with our Privacy Policy.
            </p>
          </section>

          <section>
            <h2 className="mb-2 font-semibold text-slate-950 text-lg">9. Changes to terms</h2>
            <p>
              We may update these Terms from time to time. We will notify you by updating the date at the top of this page. Continued use of the Service after changes constitutes acceptance.
            </p>
          </section>

          <section>
            <h2 className="mb-2 font-semibold text-slate-950 text-lg">10. Contact</h2>
            <p>
              Questions about these Terms? Email us at{" "}
              <a href="mailto:support@datalk.co.in" className="text-slate-950 underline underline-offset-2">
                support@datalk.co.in
              </a>
              .
            </p>
          </section>
        </div>

        <div className="mt-16 flex gap-6 border-t border-slate-200 pt-6 text-sm text-slate-400">
          <Link href="/privacy" className="hover:text-slate-950">Privacy Policy</Link>
          <Link href="/" className="hover:text-slate-950">Home</Link>
        </div>
      </div>
    </main>
  );
}
