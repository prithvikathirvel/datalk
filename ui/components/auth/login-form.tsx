"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "@/stores/toast-store";

const errorMessages: Record<string, string> = {
  no_code: "Google did not send us an authorization code. Please try again.",
  invalid_state: "Your sign-in session expired. Please try again.",
  token_exchange_failed:
    "We could not complete sign-in with Google. Please try again.",
  access_denied:
    "Sign-in was cancelled. You can try again whenever you are ready.",
  session_expired: "Your session expired. Please sign in again.",
};

export function LoginForm({
  mode = "login",
  error,
  next,
}: {
  mode?: "login" | "signup";
  error?: string;
  next?: string;
}) {
  const [loading, setLoading] = useState(false);

  const errorMessage = error
    ? (errorMessages[error] ??
      "Something went wrong during sign-in. Please try again.")
    : null;

  // Sign-in errors arrive via ?error= after the OAuth redirect — surface them
  // as a toast instead of an inline banner.
  useEffect(() => {
    if (errorMessage) {
      toast.error(errorMessage, "Sign-in failed");
    }
  }, [errorMessage]);

  function handleGoogleSignIn() {
    setLoading(true);
    const target =
      next?.startsWith("/") && !next.startsWith("//")
        ? `/api/auth/google?next=${encodeURIComponent(next)}`
        : "/api/auth/google";
    window.location.href = target;
  }

  return (
    <div className="flex flex-col gap-5">
      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={loading}
        className="group flex w-full cursor-pointer items-center justify-center gap-3 rounded-lg border border-slate-300 bg-white px-4 py-3 font-medium text-[0.9375rem] text-slate-900 transition-colors hover:border-slate-400 hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-slate-900 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-white"
      >
        {loading ? (
          <>
            <svg
              className="h-4 w-4 animate-spin text-slate-500"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            <span>Redirecting to Google…</span>
          </>
        ) : (
          <>
            <GoogleIcon />
            <span>
              {mode === "signup"
                ? "Sign up with Google"
                : "Continue with Google"}
            </span>
          </>
        )}
      </button>

      <p className="flex items-center gap-2 text-[13px] text-slate-400">
        <svg
          className="h-3.5 w-3.5 shrink-0"
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M4 7V5.5a4 4 0 1 1 8 0V7"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth="1.3"
          />
          <rect
            x="3"
            y="7"
            width="10"
            height="7"
            rx="2"
            stroke="currentColor"
            strokeWidth="1.3"
          />
        </svg>
        Secure sign-in — we never see your Google password.
      </p>

      <p className="text-[13px] text-slate-400 leading-6">
        By continuing, you agree to our{" "}
        <Link
          href="/terms"
          className="underline decoration-slate-300 underline-offset-2 transition-colors hover:text-slate-700"
        >
          Terms of Service
        </Link>{" "}
        and{" "}
        <Link
          href="/privacy"
          className="underline decoration-slate-300 underline-offset-2 transition-colors hover:text-slate-700"
        >
          Privacy Policy
        </Link>
        .
      </p>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg
      className="h-[18px] w-[18px] shrink-0"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}
