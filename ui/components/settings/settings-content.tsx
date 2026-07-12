"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
} from "@template/ui";
import { useRouter } from "next/navigation";

export function SettingsContent({
  user,
}: {
  user: { id: string; email: string; name: string };
}) {
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="flex h-[calc(100dvh-4rem)] flex-col overflow-hidden bg-white lg:h-screen">
      <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-6 py-4">
        <div>
          <h1 className="font-semibold text-slate-950">Settings</h1>
          <p className="text-slate-400 text-xs">Account details and integration notes</p>
        </div>
        <button
          type="button"
          onClick={logout}
          className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-slate-600 text-sm transition-colors hover:bg-slate-50"
        >
          Logout
        </button>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="space-y-6 p-6">
          <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
            <Card>
              <CardHeader>
                <CardTitle>Profile</CardTitle>
                <CardDescription>
                  This user identity is encoded into JWT tokens sent to your
                  backends.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" value={user.name} readOnly />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" value={user.email} readOnly />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sub">JWT sub / User UUID</Label>
                  <Input id="sub" value={user.id} readOnly />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Backend integration</CardTitle>
                <CardDescription>
                  Configure these in `ui/.env.local` before running the app.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="font-medium text-slate-950">Required env vars</p>
                  <pre className="mt-3 overflow-x-auto rounded-xl bg-slate-950 p-4 text-slate-100 text-xs leading-6">
                    {`JWT_SECRET="same-secret-as-backends"
INGESTION_API_BASE_URL="http://localhost:8000/api/v1"
CHAT_API_BASE_URL="http://localhost:8001/api/v1"`}
                  </pre>
                </div>
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-800 text-sm leading-6">
                  In production, replace the file-based user store with a database.
                  Keep the HTTP-only cookie and server-side proxy pattern.
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
