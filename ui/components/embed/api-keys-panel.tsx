"use client";

import type { ApiKey } from "@template/contracts";
import { Badge, Button } from "@template/ui";
import { useCallback, useEffect, useState } from "react";
import {
  EmbedApiError,
  fetchApiKeys,
  maskKey,
  rotateApiKey,
} from "@/lib/embed-client";
import { formatDateTime } from "@/lib/format";

function PendingBackendNotice() {
  return (
    <div className="rounded-xl border border-slate-200 border-dashed px-5 py-10 text-center">
      <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-5 w-5 text-slate-400"
          aria-hidden="true"
        >
          <rect x="3" y="11" width="18" height="11" rx="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      </div>
      <p className="font-medium text-slate-700 text-sm">
        API keys are not available yet
      </p>
      <p className="mx-auto mt-1 max-w-sm text-slate-400 text-xs leading-relaxed">
        This chatbot was created before key-based authentication was enabled.
        Once the key service is live, a key will be issued here.
      </p>
    </div>
  );
}

export function ApiKeysPanel({
  botId,
  onKeyRotated,
  onError,
}: {
  botId: string | null;
  /** Receives the raw key so the parent can show the one-time modal. */
  onKeyRotated: (rawKey: string) => void;
  onError: (message: string) => void;
}) {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(false);
  const [rotating, setRotating] = useState(false);
  const [pending, setPending] = useState(false);
  const [confirmRotate, setConfirmRotate] = useState(false);

  const load = useCallback(async () => {
    if (!botId) return;
    setLoading(true);
    try {
      setKeys(await fetchApiKeys(botId));
      setPending(false);
    } catch (caught) {
      if (caught instanceof EmbedApiError && caught.pending) {
        setPending(true);
      } else {
        onError(
          caught instanceof Error ? caught.message : "Unable to load API keys.",
        );
      }
    } finally {
      setLoading(false);
    }
  }, [botId, onError]);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleRotate() {
    if (!botId) return;
    setConfirmRotate(false);
    setRotating(true);
    try {
      const result = await rotateApiKey(botId);
      onKeyRotated(result.apiKey);
      await load();
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

  const activeKey = keys.find((key) => key.isActive) ?? keys[0] ?? null;

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
              The current key stops working immediately. Any website using it
              will break until you update the install snippet with the new key.
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
        The widget authenticates with this key. It is shown in full only once,
        when created or rotated.
      </p>

      {pending ? (
        <PendingBackendNotice />
      ) : loading ? (
        <div className="h-24 animate-pulse rounded-xl bg-slate-100" />
      ) : !activeKey ? (
        <PendingBackendNotice />
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white">
          <div className="flex items-center justify-between border-slate-100 border-b px-5 py-3.5">
            <div>
              <p className="font-semibold text-slate-950 text-sm">
                {activeKey.name || "Default"}
              </p>
              <p className="mt-0.5 text-[11px] text-slate-400">
                Created {formatDateTime(activeKey.createdAt)}
              </p>
            </div>
            <Badge variant={activeKey.isActive ? "success" : "secondary"}>
              {activeKey.isActive ? "Active" : "Revoked"}
            </Badge>
          </div>

          <div className="space-y-4 p-5">
            <div>
              <p className="mb-1.5 font-medium text-slate-500 text-xs uppercase tracking-wide">
                Key
              </p>
              <code className="block truncate rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 font-mono text-[12px] text-slate-600">
                {maskKey(activeKey.keyPrefix)}
              </code>
              <p className="mt-1.5 text-slate-400 text-xs">
                Only the prefix is stored. Lost the key? Rotate to issue a new
                one.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="font-medium text-slate-500 text-xs uppercase tracking-wide">
                  Last used
                </p>
                <p className="mt-1 text-slate-700 text-sm">
                  {activeKey.lastUsedAt
                    ? formatDateTime(activeKey.lastUsedAt)
                    : "Never"}
                </p>
              </div>
              <div>
                <p className="font-medium text-slate-500 text-xs uppercase tracking-wide">
                  Expires
                </p>
                <p className="mt-1 text-slate-700 text-sm">
                  {activeKey.expiresAt
                    ? formatDateTime(activeKey.expiresAt)
                    : "Never"}
                </p>
              </div>
            </div>

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
      )}
    </div>
  );
}
