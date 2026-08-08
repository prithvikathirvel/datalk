import { NextResponse } from "next/server";
import { collectAdminOverview } from "@/lib/admin-data";
import { getAdminSession } from "@/lib/admin-session";

/** Returns the full admin dashboard payload. Admin session required. */
export async function GET() {
  if (!(await getAdminSession())) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }
  const overview = await collectAdminOverview();
  return NextResponse.json(overview);
}
