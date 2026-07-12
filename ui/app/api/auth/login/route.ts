import { NextResponse } from "next/server";
import { setAuthCookie } from "@/lib/session";
import { authenticateUser } from "@/lib/user-store";

export async function POST(request: Request) {
  const body = (await request.json()) as { email?: string; password?: string };
  if (!body.email || !body.password) {
    return NextResponse.json(
      { detail: "Email and password are required." },
      { status: 400 },
    );
  }

  const user = await authenticateUser({
    email: body.email,
    password: body.password,
  });
  if (!user) {
    return NextResponse.json(
      { detail: "Invalid email or password." },
      { status: 401 },
    );
  }

  await setAuthCookie(user);
  return NextResponse.json({ user });
}
