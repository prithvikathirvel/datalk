import type { ReactNode } from "react";

export function AuthCard({
  children,
}: {
  children: ReactNode;
  mode?: "login" | "signup";
}) {
  return (
    <div className="w-full max-w-sm">
      {/* Mobile logo */}
      <div className="mb-8 flex items-center gap-3 lg:hidden">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-950 font-bold text-sm text-white">
          D
        </div>
        <span className="font-semibold text-slate-950 tracking-tight">Datalk</span>
      </div>

      <div className="mb-8 text-center">
        <h1 className="font-semibold text-2xl text-slate-950 tracking-tight">
          Welcome to Datalk
        </h1>
        <p className="mt-2 text-slate-500 text-sm">
          Sign in with your Google account to continue.
        </p>
      </div>

      {children}
    </div>
  );
}
