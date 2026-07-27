"use client";

import type { ApiKey } from "@template/contracts";
import { Badge, Button } from "@template/ui";
import { useState } from "react";
import { rotateApiKey } from "@/lib/embed-client";
import { formatDateTime } from "@/lib/format";

/**
 * API key management.
 *
 * The chat service exposes no "list keys" endpoint — a key prefix is only
 * returned by create and rotate. So this panel reflects whatever key was
 * issued during this session and otherwise explains that the key is
 * write-only, which is the expected posture for a hashed secret.
 */
export function ApiKeysPanel({
  botId,
  issuedKey,
  onKeyRotated,
  onError,
}: {
  botId: string | null;
  /** Metadata for a key issued during this session, if any. */
  issuedKey: ApiKey | null;
  /** Receives the raw key plus metadata so the parent can show the modal. */
  onKeyRotated: (rawKey: string, key: ApiKey) => void;
  onError: (message: string) => void;
}) {
  const [rotating, setRotating] = useState(false);
  const [confirmRotate, setConfirmRotate] = useState(false);

  async function handleRotate() {
    if (!botId) return;
    setConfirmRotate(false);
    setRotating(true);
    try {
      const result = await rotateApiKey(botId);
      onKeyRotated(result.apiKey, result.key);
    } catch (caught) {
      onError(
        caught instanceof Error ? caught.message : "Unable to rotate the key.",
      );
    } finally {
      setRotating(false);
    }
  }

  if (!botId) {
    return (
      <div className="rounded-xl border border-slate-200 border-dashed px-5 py-12 text-center">
        <p className="font-medium text-slate-700 text-sm">
          Save the chatbot first
        </p>
        <p className="mt-1 text-slate-400 text-xs">
          An API key is issued automatically when you create the chatbot.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {confirmRotate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-red-50">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5 text-red-500"
                aria-hidden="true"
              >
                <path d="M21 2v6h-6" />
                <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
                <path d="M3 22v-6h6" />
                <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
              </svg>
            </div>
            <h3 className="font-semibold text-slate-950 text-sm">
              Rotate API key?
            </h3>
            <p className="mt-1.5 text-[13px] text-slate-500 leading-relaxed">
              The current key is revoked immediately. Any website using it will
              stop working until you update the install snippet with the new
              key.
            </p>
            <div className="mt-5 flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => setConfirmRotate(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                className="flex-1"
                onClick={() => void handleRotate()}
              >
                Rotate key
              </Button>
            </div>
          </div>
        </div>
      )}

      <p className="text-slate-400 text-xs">
        The widget authenticates with this key. It is shown in full only once —
        when the chatbot is created, or when you rotate it.
      </p>

      <div className="rounded-xl border border-slate-200 bg-white">
        <div className="flex items-center justify-between border-slate-100 border-b px-5 py-3.5">
          <div>
            <p className="font-semibold text-slate-950 text-sm">
              {issuedKey?.name || "Default"}
            </p>
            {issuedKey && (
              <p className="mt-0.5 text-[11px] text-slate-400">
                Created {formatDateTime(issuedKey.createdAt)}
              </p>
            )}
          </div>
          {issuedKey ? (
            <Badge variant="success">Active</Badge>
          ) : (
            <Badge variant="secondary">Hidden</Badge>
          )}
        </div>

        <div className="space-y-4 p-5">
          <div>
            <p className="mb-1.5 font-medium text-slate-500 text-xs uppercase tracking-wide">
              Key
            </p>
            <code className="block truncate rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 font-mono text-[12px] text-slate-600">
              {issuedKey
                ? `${issuedKey.keyPrefix}${"•".repeat(20)}`
                : "dk_live_••••••••••••••••••••••••"}
            </code>
            <p className="mt-1.5 text-slate-400 text-xs">
              {issuedKey
                ? "Only the prefix is stored. Lost the key? Rotate to issue a new one."
                : "Keys are stored hashed and cannot be displayed again. Rotate to issue a new one."}
            </p>
          </div>

          {issuedKey?.expiresAt && (
            <div>
              <p className="font-medium text-slate-500 text-xs uppercase tracking-wide">
                Expires
              </p>
              <p className="mt-1 text-slate-700 text-sm">
                {formatDateTime(issuedKey.expiresAt)}
              </p>
            </div>
          )}

          <div className="flex items-center justify-between gap-3 border-slate-100 border-t pt-4">
            <p className="text-slate-400 text-xs">
              Rotating revokes the current key immediately.
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={rotating}
              onClick={() => setConfirmRotate(true)}
            >
              {rotating ? "Rotating…" : "Rotate key"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
