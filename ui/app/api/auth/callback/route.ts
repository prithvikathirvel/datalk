import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { decodeJwtPayload } from "@/lib/session";
import { upsertOAuthUser } from "@/lib/user-store";

const cognitoDomain = process.env.NEXT_PUBLIC_COGNITO_DOMAIN ?? "";
const clientId = process.env.NEXT_PUBLIC_COGNITO_USER_POOL_CLIENT_ID ?? "";
const clientSecret = process.env.COGNITO_CLIENT_SECRET ?? "";
const redirectUri =
  process.env.NEXT_PUBLIC_COGNITO_REDIRECT_SIGN_IN ??
  "http://localhost:3000/api/auth/callback";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  if (error) {
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(error)}`, request.url),
    );
  }

  if (!code) {
    return NextResponse.redirect(new URL("/login?error=no_code", request.url));
  }

  // Verify CSRF state
  const cookieStore = await cookies();
  const savedState = cookieStore.get("cognito_oauth_state")?.value;
  cookieStore.delete("cognito_oauth_state");
  if (!savedState || savedState !== state) {
    return NextResponse.redirect(
      new URL("/login?error=invalid_state", request.url),
    );
  }

  // Exchange code for tokens at Cognito token endpoint
  const tokenEndpoint = `https://${cognitoDomain}/oauth2/token`;
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: clientId,
    redirect_uri: redirectUri,
    code,
  });

  const headers: Record<string, string> = {
    "Content-Type": "application/x-www-form-urlencoded",
  };

  // Include client secret if configured
  if (clientSecret) {
    const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString(
      "base64",
    );
    headers.Authorization = `Basic ${credentials}`;
  }

  const tokenResponse = await fetch(tokenEndpoint, {
    method: "POST",
    headers,
    body: body.toString(),
  });

  if (!tokenResponse.ok) {
    const detail = await tokenResponse.text();
    console.error("[cognito-callback] token exchange failed:", {
      status: tokenResponse.status,
      detail,
      tokenEndpoint,
      redirectUri,
      clientId,
      hasClientSecret: Boolean(clientSecret),
    });
    return NextResponse.redirect(
      new URL(
        `/login?error=token_exchange_failed&detail=${encodeURIComponent(detail)}`,
        request.url,
      ),
    );
  }

  const tokens = (await tokenResponse.json()) as {
    access_token: string;
    id_token: string;
    refresh_token?: string;
    expires_in: number;
  };

  // Persist the access token in an httpOnly cookie (used as Bearer for API calls)
  cookieStore.set("rag_saas_token", tokens.access_token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: tokens.expires_in,
  });

  // Persist the ID token separately — it carries email, name, and other profile claims
  cookieStore.set("rag_saas_id_token", tokens.id_token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: tokens.expires_in,
  });

  // Also persist the refresh token if present so we can silently refresh later
  if (tokens.refresh_token) {
    cookieStore.set("rag_saas_refresh", tokens.refresh_token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });
  }

  // Return the user to wherever they were originally heading, if it was safe
  const nextPath = cookieStore.get("cognito_oauth_next")?.value;
  cookieStore.delete("cognito_oauth_next");
  const safeNext =
    nextPath?.startsWith("/") && !nextPath.startsWith("//") ? nextPath : null;

  // ── First-time signup detection ──────────────────────────────────────────
  // Register the OAuth profile locally so we can tell a brand-new account
  // (which still needs the onboarding questions) from a returning one.
  // New or incomplete accounts are sent to /onboarding first — the form
  // redirects to the dashboard (or back here) once submitted.
  let needsOnboarding = false;
  const idTokenPayload = decodeJwtPayload(tokens.id_token);
  const oauthSub =
    typeof idTokenPayload?.sub === "string" ? idTokenPayload.sub : "";
  const oauthEmail =
    typeof idTokenPayload?.email === "string" ? idTokenPayload.email : "";
  const oauthName =
    (typeof idTokenPayload?.name === "string" ? idTokenPayload.name : "") ||
    (typeof idTokenPayload?.given_name === "string"
      ? idTokenPayload.given_name
      : "") ||
    oauthEmail.split("@")[0] ||
    "User";

  if (oauthSub && oauthEmail) {
    try {
      const profile = await upsertOAuthUser({
        id: oauthSub,
        email: oauthEmail,
        name: oauthName,
      });
      needsOnboarding = !profile.onboardingCompleted;
    } catch (error) {
      // Never block sign-in because the profile sync failed — fall through
      // to the normal destination.
      console.error("[cognito-callback] profile sync failed:", error);
    }
  }

  const destination = needsOnboarding
    ? "/onboarding"
    : (safeNext ?? "/dashboard");

  return NextResponse.redirect(new URL(destination, request.url));
}
