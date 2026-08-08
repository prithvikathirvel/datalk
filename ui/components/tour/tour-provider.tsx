"use client";

import { cn } from "@template/ui";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { TourStep } from "@/lib/tour";

interface TourContextValue {
  /** Starts the tour from step 0. Safe to call from anywhere under the provider. */
  start: () => void;
  /** True while the tour overlay is visible. */
  isActive: boolean;
}

const TourContext = createContext<TourContextValue>({
  start: () => {},
  isActive: false,
});

export function useTour() {
  return useContext(TourContext);
}

interface SpotlightState {
  top: number;
  left: number;
  width: number;
  height: number;
}

const PADDING = 6;
const VIEWPORT_MARGIN = 16;

function useTourPositioning(active: boolean, target: string) {
  const [spot, setSpot] = useState<SpotlightState | null>(null);

  useEffect(() => {
    if (!active) {
      setSpot(null);
      return;
    }
    let raf = 0;
    const measure = () => {
      const el = document.querySelector(target);
      if (el) {
        const rect = el.getBoundingClientRect();
        const visible = rect.width > 4 && rect.height > 4;
        if (visible) {
          el.scrollIntoView({ block: "nearest", behavior: "smooth" });
          // Re-measure after scroll settles.
          window.setTimeout(() => {
            const r2 = el.getBoundingClientRect();
            if (r2.width > 4 && r2.height > 4) {
              setSpot({
                top: r2.top - PADDING,
                left: r2.left - PADDING,
                width: r2.width + PADDING * 2,
                height: r2.height + PADDING * 2,
              });
            } else {
              setSpot(null);
            }
          }, 320);
        } else {
          setSpot(null);
        }
      } else {
        setSpot(null);
      }
    };
    raf = window.requestAnimationFrame(measure);
    return () => window.cancelAnimationFrame(raf);
  }, [active, target]);

  return { spot };
}

function TourOverlay({
  steps,
  index,
  onClose,
  onPrev,
  onNext,
}: {
  steps: TourStep[];
  index: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  const step = steps[index];
  const { spot } = useTourPositioning(true, step.target);
  const [tooltipPos, setTooltipPos] = useState<"below" | "above" | "center">(
    "below",
  );

  useEffect(() => {
    if (!spot) return;
    // Decide placement once the spotlight rect is known.
    const below = spot.top + spot.height + 190;
    if (below < window.innerHeight - VIEWPORT_MARGIN) {
      setTooltipPos("below");
    } else if (spot.top - 210 > VIEWPORT_MARGIN) {
      setTooltipPos("above");
    } else {
      setTooltipPos("center");
    }
  }, [spot]);

  // Keyboard: Esc closes, arrows navigate.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onNext();
      if (e.key === "ArrowLeft") onPrev();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, onPrev, onNext]);

  const isLast = index === steps.length - 1;

  return (
    <div
      className="fixed inset-0 z-[9990]"
      role="dialog"
      aria-modal="true"
      aria-label={`Tour step ${index + 1} of ${steps.length}: ${step.title}`}
    >
      {/* Dimmed backdrop with a spotlight cut-out around the target */}
      {spot && (
        <div
          className="dk-spotlight pointer-events-none fixed z-[9991] rounded-xl transition-all duration-300"
          style={{
            top: spot.top,
            left: spot.left,
            width: spot.width,
            height: spot.height,
          }}
        />
      )}
      {!spot && (
        <div className="pointer-events-none fixed inset-0 z-[9991] bg-slate-950/62" />
      )}

      {/* Tooltip card */}
      <div
        className={cn(
          "fixed z-[9992] w-[min(92vw,340px)] rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl shadow-slate-950/25 transition-all duration-300",
          tooltipPos === "center" &&
            "left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
        )}
        style={
          spot && tooltipPos !== "center"
            ? tooltipPos === "below"
              ? {
                  top: spot.top + spot.height + 14,
                  left: Math.min(
                    Math.max(spot.left, VIEWPORT_MARGIN),
                    window.innerWidth - 340 - VIEWPORT_MARGIN,
                  ),
                }
              : {
                  top: Math.max(spot.top - 14 - 210, VIEWPORT_MARGIN),
                  left: Math.min(
                    Math.max(spot.left, VIEWPORT_MARGIN),
                    window.innerWidth - 340 - VIEWPORT_MARGIN,
                  ),
                }
            : undefined
        }
      >
        <div className="flex items-start justify-between gap-3">
          <p className="text-[11px] font-medium text-slate-400 uppercase tracking-[0.14em]">
            Step {index + 1} of {steps.length}
          </p>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close tour"
            className="rounded-md p-1 text-slate-300 transition-colors hover:bg-slate-50 hover:text-slate-600"
          >
            <svg
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              className="h-3.5 w-3.5"
              aria-hidden="true"
            >
              <path d="M4 4l8 8M12 4l-8 8" />
            </svg>
          </button>
        </div>

        <h3 className="mt-2 font-semibold text-slate-950 leading-tight">
          {step.title}
        </h3>
        <p className="mt-1.5 text-[13px] leading-6 text-slate-500">
          {step.description}
        </p>

        <div className="mt-4 flex items-center justify-between">
          <div className="flex gap-1.5">
            {steps.map((s, i) => (
              <span
                key={s.id}
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  i === index ? "w-5 bg-slate-950" : "w-1.5 bg-slate-200",
                )}
              />
            ))}
          </div>
          <div className="flex items-center gap-2">
            {index > 0 && (
              <button
                type="button"
                onClick={onPrev}
                className="cursor-pointer rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50"
              >
                Back
              </button>
            )}
            {isLast ? (
              <button
                type="button"
                onClick={onClose}
                className="cursor-pointer rounded-lg bg-slate-950 px-3.5 py-1.5 text-xs font-medium text-white transition-colors hover:bg-slate-800"
              >
                Done
              </button>
            ) : (
              <button
                type="button"
                onClick={onNext}
                className="cursor-pointer rounded-lg bg-slate-950 px-3.5 py-1.5 text-xs font-medium text-white transition-colors hover:bg-slate-800"
              >
                Next
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function TourProvider({
  steps,
  children,
}: {
  steps: TourStep[];
  children: React.ReactNode;
}) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const start = useCallback(() => {
    setActiveIndex(0);
  }, []);

  const close = useCallback(() => {
    setActiveIndex(null);
  }, []);

  // Reset the tour whenever the user navigates to a different route — the
  // targets no longer exist, so the overlay would dangle.
  useEffect(() => {
    const onPopState = () => close();
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [close]);

  const value = useMemo<TourContextValue>(
    () => ({ start, isActive: activeIndex !== null }),
    [start, activeIndex],
  );

  if (activeIndex === null) {
    return (
      <TourContext.Provider value={value}>{children}</TourContext.Provider>
    );
  }

  const step = steps[Math.min(activeIndex, steps.length - 1)];

  return (
    <TourContext.Provider value={value}>
      {children}
      <TourOverlay
        key={step.id}
        steps={steps}
        index={Math.min(activeIndex, steps.length - 1)}
        onClose={close}
        onPrev={() =>
          setActiveIndex((i) => (i === null ? 0 : Math.max(0, i - 1)))
        }
        onNext={() =>
          setActiveIndex((i) =>
            i === null ? 0 : i >= steps.length - 1 ? null : i + 1,
          )
        }
      />
    </TourContext.Provider>
  );
}
