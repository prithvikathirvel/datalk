import { NextResponse } from "next/server";
import { setAdminCookie } from "@/lib/admin-session";
import { verifyAdminCredentials } from "@/lib/admin-store";

/**
 * Admin panel login. Verifies against the admin credential store
 * (env vars ADMIN_USERNAME/ADMIN_PASSWORD, or .data/admin.json overrides,
 * or the development default admin/admin).
 */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    username?: unknown;
    password?: unknown;
  } | null;

  const username = typeof body?.username === "string" ? body.username : "";
  const password = typeof body?.password === "string" ? body.password : "";

  if (!username || !password) {
    return NextResponse.json(
      { detail: "Username and password are required." },
      { status: 400 },
    );
  }

  const valid = await verifyAdminCredentials(username, password);
  if (!valid) {
    return NextResponse.json(
      { detail: "Invalid admin credentials." },
      { status: 401 },
    );
  }

  await setAdminCookie();
  return NextResponse.json({ ok: true });
}
