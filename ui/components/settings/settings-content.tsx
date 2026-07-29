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
          <p className="text-slate-400 text-xs">Manage your account</p>
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
          <div className="max-w-md">
            <Card>
              <CardHeader>
                <CardTitle>Profile</CardTitle>
                <CardDescription>
                  Your account information.
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
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
