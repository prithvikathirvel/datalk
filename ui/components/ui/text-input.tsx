"use client";

import * as React from "react";
import { cn } from "@template/ui";

export interface TextInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
  icon?: React.ReactNode;
  iconEnd?: React.ReactNode;
}

export const TextInput = React.forwardRef<HTMLInputElement, TextInputProps>(
  function TextInputInner(
    { className, label, hint, error, icon, iconEnd, id, type, ...props },
    ref,
  ) {
    const generatedId = React.useId();
    const inputId = id ?? generatedId;

    return (
      <div className="space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-slate-700 select-none"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            type={type}
            className={cn(
              "flex h-10 w-full rounded-xl border bg-white px-3 py-2 text-sm text-slate-950",
              "transition-all duration-150",
              "placeholder:text-slate-400",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1",
              "disabled:cursor-not-allowed disabled:bg-slate-50 disabled:opacity-60",
              "file:border-0 file:bg-transparent file:text-sm file:font-medium",
              error
                ? "border-red-300 focus-visible:ring-red-400 bg-red-50/30"
                : "border-slate-200 hover:border-slate-300 focus-visible:ring-slate-900",
              icon ? "pl-9" : "",
              iconEnd ? "pr-9" : "",
              className,
            )}
            {...props}
          />
          {iconEnd && (
            <div className="absolute inset-y-0 right-3 flex items-center text-slate-400">
              {iconEnd}
            </div>
          )}
        </div>
        {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
        {hint && !error && <p className="text-xs text-slate-400 mt-1">{hint}</p>}
      </div>
    );
  },
);
TextInput.displayName = "TextInput";
