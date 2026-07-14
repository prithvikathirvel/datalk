import { cookies } from "next/headers";
import { createJwtToken, verifyJwtToken } from "./jwt";

export const authCookieName = "rag_saas_token";

/** Decode a JWT payload without verifying the signature. Safe for Cognito RS256 tokens. */
function decodeJwtPayload(token: string): Record<string, unknown> | null {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  try {
    return JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8")) as Record<string, unknown>;
  } catch {
    return null;
  }
}

/** Returns true if the token was issued by our own HS256 signing (email/password login). */
function isCustomJwt(token: string): boolean {
  try {
    const header = JSON.parse(
      Buffer.from(token.split(".")[0], "base64url").toString("utf8"),
    ) as { alg?: string; typ?: string };
    return header.alg === "HS256";
  } catch {
    return false;
  }
}

export async function setAuthCookie(user: {
  id: string;
  email: string;
  name: string;
}) {
  const token = createJwtToken({
    sub: user.id,
    email: user.email,
    name: user.name,
  });
  const cookieStore = await cookies();
  cookieStore.set(authCookieName, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return token;
}

export async function clearAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(authCookieName);
}

export async function getAuthToken() {
  const cookieStore = await cookies();
  return cookieStore.get(authCookieName)?.value ?? null;
}

export async function getSessionUser() {
  const token = await getAuthToken();
  if (!token) return null;

  // Custom HS256 JWT (email/password login) — verify signature
  if (isCustomJwt(token)) {
    const payload = verifyJwtToken(token);
    if (!payload) return null;
    return { id: payload.sub, email: payload.email, name: payload.name };
  }

  // Cognito RS256 JWT (Google / federated login) — decode without re-signing
  const payload = decodeJwtPayload(token);
  if (!payload) return null;

  // Check expiry
  const exp = typeof payload.exp === "number" ? payload.exp : 0;
  if (exp < Math.floor(Date.now() / 1000)) return null;

  return {
    id: (payload.sub as string) ?? "",
    email: (payload.email as string) ?? "",
    name: ((payload.name ?? payload.username ?? payload.email) as string) ?? "",
  };
}
