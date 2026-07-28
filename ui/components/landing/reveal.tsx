"use client";

import {
  type ElementType,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";

export function useInView<T extends HTMLElement>(options?: {
  threshold?: number;
  once?: boolean;
  rootMargin?: string;
}) {
  const {
    threshold = 0.2,
    once = true,
    rootMargin = "0px 0px -10% 0px",
  } = options ?? {};
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setInView(true);
            if (once) observer.unobserve(entry.target);
          } else if (!once) {
            setInView(false);
          }
        }
      },
      { threshold, rootMargin },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold, once, rootMargin]);

  return { ref, inView };
}

interface RevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  as?: ElementType;
}

/** Fades and lifts content into place the first time it scrolls into view. */
export function Reveal({
  children,
  className,
  delay = 0,
  as: Tag = "div",
}: RevealProps) {
  const { ref, inView } = useInView<HTMLDivElement>();

  return (
    <Tag
      ref={ref}
      className={`dk-reveal ${className ?? ""}`}
      data-visible={inView ? "true" : "false"}
      style={{ "--dk-delay": `${delay}ms` } as React.CSSProperties}
    >
      {children}
    </Tag>
  );
}
