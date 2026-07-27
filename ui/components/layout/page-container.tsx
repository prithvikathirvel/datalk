import { cn } from "@template/ui";
import type { ReactNode } from "react";

export function PageContainer({
  children,
  fullHeight = false,
}: {
  children: ReactNode;
  fullHeight?: boolean;
}) {
  return (
    <div
      className={cn(
        fullHeight
          ? "flex h-[calc(100dvh-4rem)] min-h-0 flex-col overflow-hidden lg:h-full"
          : "mx-auto flex w-full max-w-7xl flex-col gap-6 p-4 pb-24 md:p-6 lg:pb-6",
      )}
    >
      {children}
    </div>
  );
}
