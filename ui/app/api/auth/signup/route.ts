import { NextResponse } from "next/server";
import { setAuthCookie } from "@/lib/session";
import { createUser } from "@/lib/user-store";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      email?: string;
      name?: string;
      password?: string;
    };
    if (!body.email || !body.name || !body.password) {
      return NextResponse.json(
        { detail: "Name, email, and password are required." },
        { status: 400 },
      );
    }
    if (body.password.length < 8) {
      return NextResponse.json(
        { detail: "Password must be at least 8 characters." },
        { status: 400 },
      );
    }

    const user = await createUser({
      email: body.email,
      name: body.name,
      password: body.password,
    });
    await setAuthCookie(user);
    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        detail:
          error instanceof Error ? error.message : "Unable to create account.",
      },
      { status: 400 },
    );
  }
}
