import { cookies } from "next/headers";
import { createJwtToken, verifyJwtToken } from "./jwt";

export const authCookieName = "rag_saas_token";

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
  if (!token) {
    return null;
  }
  const payload = verifyJwtToken(token);
  if (!payload) {
    return null;
  }
  return {
    id: payload.sub,
    email: payload.email,
    name: payload.name,
  };
}
