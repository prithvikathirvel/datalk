import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { clearAuthCookie } from "@/lib/session";

export async function POST() {
  await clearAuthCookie();
  // Also clear Cognito refresh token if present
  const cookieStore = await cookies();
  cookieStore.delete("rag_saas_refresh");
  return NextResponse.json({ success: true });
}
