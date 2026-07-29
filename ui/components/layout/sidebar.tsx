"use client";

import * as React from "react";
import { cn } from "@template/ui";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { type ReactNode, useRef, useState } from "react";

const SIDEBAR_COLLAPSED = 56;
const SIDEBAR_DEFAULT = 240;
const SIDEBAR_MAX = 300;
const COLLAPSED_THRESHOLD = 100;

const navigation: { href: string; label: string; icon: ReactNode }[] = [
  {
    href: "/dashboard",
    label: "Overview",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 shrink-0" aria-hidden="true">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    href: "/documents",
    label: "Documents",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="8" y1="13" x2="16" y2="13" />
        <line x1="8" y1="17" x2="13" y2="17" />
      </svg>
    ),
  },
  {
    href: "/chat",
    label: "Chat",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
  {
    href: "/embed",
    label: "Embed",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
      </svg>
    ),
  },
  {
    href: "/analytics",
    label: "Analytics",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 shrink-0" aria-hidden="true">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
  },
  {
    href: "/quality",
    label: "Coverage",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 shrink-0" aria-hidden="true">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    ),
  },
  {
    href: "/settings",
    label: "Settings",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),
  },
];

export function Sidebar({
  user,
}: {
  user: { email: string; name: string };
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [width, setWidth] = useState(SIDEBAR_DEFAULT);
  const isDragging = useRef(false);
  const dragStartX = useRef(0);
  const dragStartWidth = useRef(0);

  const isOpen = width > COLLAPSED_THRESHOLD;

  function startDrag(e: React.MouseEvent) {
    e.preventDefault();
    isDragging.current = true;
    dragStartX.current = e.clientX;
    dragStartWidth.current = width;

    function onMove(ev: MouseEvent) {
      if (!isDragging.current) return;
      const delta = ev.clientX - dragStartX.current;
      const next = dragStartWidth.current + delta;
      setWidth(
        next < COLLAPSED_THRESHOLD
          ? SIDEBAR_COLLAPSED
          : Math.max(SIDEBAR_COLLAPSED, Math.min(SIDEBAR_MAX, next)),
      );
    }

    function onUp() {
      isDragging.current = false;
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    }

    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  }

  function toggle() {
    setWidth((prev) =>
      prev > COLLAPSED_THRESHOLD ? SIDEBAR_COLLAPSED : SIDEBAR_DEFAULT,
    );
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  const initials = user.name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <aside
      className="relative hidden lg:flex flex-col border-r border-slate-200 bg-white shrink-0 overflow-visible select-none"
      style={{
        width: `${width}px`,
        transition: isDragging.current ? "none" : "width 0.2s ease",
      }}
    >
      {/* Logo / header */}
      <div
        className={cn(
          "flex h-14 shrink-0 items-center border-b border-slate-100 overflow-hidden",
          isOpen ? "justify-between px-4" : "justify-center",
        )}
      >
        {isOpen ? (
          <>
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-950">
                <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
                  <path d="M6 7h4.5c2.49 0 4.5 2.01 4.5 4.5S12.99 16 10.5 16H6V7Z" fill="#ffffff"/>
                  <circle cx="15.5" cy="7.5" r="2" fill="#10b981"/>
                </svg>
              </div>
              <span className="whitespace-nowrap font-semibold text-slate-950 tracking-tight">
                Datalk
              </span>
              <span className="rounded-full bg-amber-100 px-1.5 py-0.5 font-medium text-amber-700 text-[10px] ring-1 ring-amber-200">
                Beta
              </span>
            </div>
            {/* Panel-left-close */}
            <button
              type="button"
              onClick={toggle}
              className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 shrink-0"
              aria-label="Collapse sidebar"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <path d="M9 3v18" />
                <path d="M14 9l-3 3 3 3" />
              </svg>
            </button>
          </>
        ) : (
          /* Panel-left-open */
          <button
            type="button"
            onClick={toggle}
            title="Expand sidebar"
            aria-label="Expand sidebar"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-950"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="M9 3v18" />
              <path d="M13 9l3 3-3 3" />
            </svg>
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav
        className={cn("flex-1 space-y-0.5 py-3 overflow-hidden", isOpen ? "px-2" : "px-2")}
        aria-label="Main navigation"
      >
        {navigation.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              title={!isOpen ? item.label : undefined}
              className={cn(
                "flex items-center rounded-lg py-2 font-medium text-sm transition-colors",
                isOpen ? "gap-3 px-3" : "justify-center px-0",
                active
                  ? "bg-slate-100 text-slate-950"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-950",
              )}
            >
              {item.icon}
              {isOpen && (
                <span className="overflow-hidden whitespace-nowrap">
                  {item.label}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User footer */}
      <div
        className={cn(
          "shrink-0 border-t border-slate-100",
          isOpen ? "px-2 py-2" : "px-2 py-2",
        )}
      >
        {isOpen ? (
          <div className="flex items-center gap-3 rounded-lg px-3 py-2">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 font-semibold text-slate-700 text-xs">
              {initials || "U"}
            </div>
            <div className="min-w-0 flex-1 overflow-hidden">
              <p className="truncate font-medium text-slate-950 text-sm">{user.name}</p>
              <p className="truncate text-slate-400 text-xs">{user.email}</p>
            </div>
            <button
              type="button"
              onClick={logout}
              aria-label="Log out"
              className="shrink-0 rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div
              className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 font-semibold text-slate-700 text-xs"
              title={user.name}
            >
              {initials || "U"}
            </div>
            <button
              type="button"
              onClick={logout}
              aria-label="Log out"
              className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Drag handle on right edge */}
      <div
        className="group absolute inset-y-0 right-0 z-20 flex w-1 cursor-col-resize items-center justify-center"
        onMouseDown={startDrag}
        aria-hidden="true"
      >
        <div className="h-10 w-0.5 rounded-full bg-transparent transition-colors group-hover:bg-slate-300 group-active:bg-slate-500" />
      </div>
    </aside>
  );
}
