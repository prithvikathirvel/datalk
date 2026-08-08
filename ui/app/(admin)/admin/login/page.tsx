import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminLoginForm } from "@/components/admin/admin-login-form";
import { getAdminSession } from "@/lib/admin-session";

export const metadata: Metadata = {
  title: "Admin sign in · Datalk",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage() {
  // Already signed in? Straight to the panel.
  if (await getAdminSession()) {
    redirect("/admin");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-10">
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
          backgroundSize: "56px 56px",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-x-0 top-0 h-64 bg-[radial-gradient(60%_100%_at_50%_0%,rgba(255,255,255,0.08),transparent_70%)]"
      />

      <div className="relative w-full max-w-sm rounded-2xl border border-white/10 bg-white p-7 shadow-2xl">
        <div className="mb-6 flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-950 font-semibold text-[14px] text-white">
            D
          </span>
          <div>
            <p className="font-semibold text-slate-950">Datalk Admin</p>
            <p className="text-[11px] text-slate-400">
              Internal operations console
            </p>
          </div>
        </div>

        <h1 className="font-semibold text-xl text-slate-950 tracking-tight">
          Sign in
        </h1>
        <p className="mt-1 mb-5 text-[13px] leading-6 text-slate-500">
          Restricted area — staff only. Your session is encrypted and expires
          automatically.
        </p>

        <AdminLoginForm />

        <p className="mt-5 border-t border-slate-100 pt-4 text-center text-[11px] leading-5 text-slate-400">
          Default credentials:{" "}
          <span className="font-mono text-slate-600">admin / admin</span>
          <br />
          Change them from the panel Settings tab or via{" "}
          <span className="font-mono text-slate-600">ADMIN_PASSWORD</span>.
        </p>
      </div>
    </div>
  );
}
