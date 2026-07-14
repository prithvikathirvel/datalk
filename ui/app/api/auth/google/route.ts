import { NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";

const cognitoDomain = process.env.NEXT_PUBLIC_COGNITO_DOMAIN ?? "";
const clientId = process.env.NEXT_PUBLIC_COGNITO_USER_POOL_CLIENT_ID ?? "";
const redirectUri =
  process.env.NEXT_PUBLIC_COGNITO_REDIRECT_SIGN_IN ??
  "http://localhost:3000/api/auth/callback";

export async function GET() {
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

  return NextResponse.redirect(authorizeUrl);
}
