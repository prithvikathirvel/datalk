"use client";

import { Button } from "@template/ui";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { TextInput } from "@/components/ui/text-input";

export function SignupForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const response = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    setLoading(false);
    if (!response.ok) {
      const data = (await response.json().catch(() => null)) as {
        detail?: string;
      } | null;
      setError(data?.detail ?? "Unable to create account.");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <TextInput
        id="name"
        label="Full name"
        autoComplete="name"
        value={name}
        onChange={(event) => setName(event.target.value)}
        required
      />
      <TextInput
        id="email"
        type="email"
        label="Email"
        autoComplete="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        required
      />
      <TextInput
        id="password"
        type="password"
        label="Password"
        autoComplete="new-password"
        hint="Use at least 8 characters."
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        minLength={8}
        required
      />
      {error ? (
        <div
          className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-red-700 text-sm"
          role="alert"
        >
          {error}
        </div>
      ) : null}
      <Button className="w-full" size="lg" type="submit" disabled={loading}>
        {loading ? "Creating account..." : "Create account"}
      </Button>
    </form>
  );
}
