"use client";

import { configureAmplify } from "@/lib/amplify";
import type { ReactNode } from "react";

// Configure Amplify once on the client side
configureAmplify();

export function AmplifyProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
