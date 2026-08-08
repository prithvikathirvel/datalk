import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-session";
import { updateAdminCredentials, verifyAdminPassword } from "@/lib/admin-store";

/**
 * Changes the admin panel credentials (username + password) from the
 * Settings tab. Requires an active admin session and the current password.
 */
export async function POST(request: Request) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as {
    currentPassword?: unknown;
    newUsername?: unknown;
    newPassword?: unknown;
  } | null;

  const currentPassword =
    typeof body?.currentPassword === "string" ? body.currentPassword : "";
  const newUsername =
    typeof body?.newUsername === "string" ? body.newUsername : "";
  const newPassword =
    typeof body?.newPassword === "string" ? body.newPassword : "";

  if (!currentPassword || !newUsername || !newPassword) {
    return NextResponse.json(
      {
        detail:
          "Current password, new username, and new password are required.",
      },
      { status: 400 },
    );
  }

  // Re-verify the current password before allowing any change.
  const valid = await verifyAdminPassword(currentPassword);
  if (!valid) {
    return NextResponse.json(
      { detail: "Current password is incorrect." },
      { status: 401 },
    );
  }

  try {
    await updateAdminCredentials({ newUsername, newPassword });
  } catch (error) {
    return NextResponse.json(
      {
        detail:
          error instanceof Error
            ? error.message
            : "Could not update credentials.",
      },
      { status: 400 },
    );
  }

  return NextResponse.json({ ok: true });
}
