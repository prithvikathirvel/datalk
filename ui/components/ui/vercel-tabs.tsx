"use client";

import * as React from "react";
import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@template/ui";

interface Tab {
  id: string;
  label: string;
  icon?: ReactNode;
}

interface VercelTabsProps extends React.HTMLAttributes<HTMLDivElement> {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export const VercelTabs = React.forwardRef<HTMLDivElement, VercelTabsProps>(
  ({ className, tabs, activeTab, onTabChange, ...props }, ref) => {
    const activeIndex = Math.max(
      tabs.findIndex((t) => t.id === activeTab),
      0,
    );
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
    const [hoverStyle, setHoverStyle] = useState<React.CSSProperties>({});
    const [activeStyle, setActiveStyle] = useState<React.CSSProperties>({
      left: "0px",
      width: "0px",
    });
    const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

    useEffect(() => {
      if (hoveredIndex !== null) {
        const el = tabRefs.current[hoveredIndex];
        if (el) {
          setHoverStyle({
            left: `${el.offsetLeft}px`,
            width: `${el.offsetWidth}px`,
          });
        }
      }
    }, [hoveredIndex]);

    useEffect(() => {
      const el = tabRefs.current[activeIndex];
      if (el) {
        setActiveStyle({
          left: `${el.offsetLeft}px`,
          width: `${el.offsetWidth}px`,
        });
      }
    }, [activeIndex]);

    useEffect(() => {
      requestAnimationFrame(() => {
        const el = tabRefs.current[activeIndex];
        if (el) {
          setActiveStyle({
            left: `${el.offsetLeft}px`,
            width: `${el.offsetWidth}px`,
          });
        }
      });
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
      <div ref={ref} className={cn("relative", className)} {...props}>
        <div className="relative">
          {/* Hover highlight */}
          <div
            className="pointer-events-none absolute h-[30px] rounded-[6px] bg-slate-100 transition-all duration-200 ease-out"
            style={{
              ...hoverStyle,
              opacity: hoveredIndex !== null ? 1 : 0,
            }}
          />
          {/* Active underline */}
          <div
            className="pointer-events-none absolute -bottom-px h-[2px] bg-slate-950 transition-all duration-200 ease-out"
            style={activeStyle}
          />
          {/* Tab buttons */}
          <div className="relative flex items-center gap-0.5">
            {tabs.map((tab, index) => (
              <button
                key={tab.id}
                ref={(el) => {
                  tabRefs.current[index] = el;
                }}
                type="button"
                className={cn(
                  "relative inline-flex h-[30px] cursor-pointer select-none items-center gap-1.5 whitespace-nowrap px-3 text-sm font-medium transition-colors duration-200",
                  index === activeIndex
                    ? "text-slate-950"
                    : "text-slate-400 hover:text-slate-700",
                )}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                onClick={() => onTabChange(tab.id)}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  },
);

VercelTabs.displayName = "VercelTabs";
