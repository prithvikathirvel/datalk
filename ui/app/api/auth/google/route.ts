import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const cognitoDomain = process.env.NEXT_PUBLIC_COGNITO_DOMAIN ?? "";
const clientId = process.env.NEXT_PUBLIC_COGNITO_USER_POOL_CLIENT_ID ?? "";
const redirectUri =
  process.env.NEXT_PUBLIC_COGNITO_REDIRECT_SIGN_IN ??
  "http://localhost:3000/api/auth/callback";

/** Only allow same-origin relative paths, so `next` can never be used as an open redirect. */
function safeNextPath(value: string | null): string | null {
  if (!value) return null;
  if (!value.startsWith("/") || value.startsWith("//")) return null;
  return value;
}

export async function GET(request: Request) {
  // Generate a random state value to prevent CSRF
  const state = randomBytes(32).toString("hex");

  const params = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    redirect_uri: redirectUri,
    identity_provider: "Google",
    scope: "openid email profile",
    state,
  });

  const authorizeUrl = `https://${cognitoDomain}/oauth2/authorize?${params.toString()}`;

  // Store state in a short-lived httpOnly cookie to verify on callback
  const cookieStore = await cookies();
  cookieStore.set("cognito_oauth_state", state, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 10, // 10 minutes
  });

  // Remember where the user was heading so the callback can return them there
  const next = safeNextPath(new URL(request.url).searchParams.get("next"));
  if (next) {
    cookieStore.set("cognito_oauth_next", next, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 10,
    });
  }

  return NextResponse.redirect(authorizeUrl);
}
