"use client";

import { Button, Input } from "@template/ui";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { readApiError } from "@/lib/api-error";
import { toast } from "@/stores/toast-store";

export function AdminLoginForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!username || !password) {
      setError("Username and password are required.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const message = await readApiError(
          response,
          "Invalid admin credentials.",
        );
        setError(message);
        toast.error(message, "Sign-in failed");
        return;
      }

      toast.success("Signed in to the admin panel.");
      router.push("/admin");
      router.refresh();
    } catch {
      toast.error("Could not reach the server. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      {error && (
        <p
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-[13px] leading-5 text-red-700"
        >
          {error}
        </p>
      )}

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="admin-username"
          className="text-[13px] font-medium text-slate-700"
        >
          Username
        </label>
        <Input
          id="admin-username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoComplete="username"
          placeholder="admin"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="admin-password"
          className="text-[13px] font-medium text-slate-700"
        >
          Password
        </label>
        <Input
          id="admin-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          placeholder="••••••••"
        />
      </div>

      <Button type="submit" disabled={loading} className="mt-1 w-full">
        {loading ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
