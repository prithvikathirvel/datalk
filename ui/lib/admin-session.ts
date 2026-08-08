import { cookies } from "next/headers";
import { createJwtToken, verifyJwtToken } from "./jwt";

/**
 * Admin panel session — deliberately separate from customer auth.
 * A customer JWT (rag_saas_token) can never be used to reach /admin, and an
 * admin session can never be used as a customer API credential.
 */

export const adminCookieName = "datalk_admin_session";

const ADMIN_SUB = "admin";
const ADMIN_ROLE = "admin";
const ADMIN_EMAIL = "admin@datalk.local";
const ADMIN_NAME = "Administrator";
const SESSION_HOURS = 12;

export async function setAdminCookie() {
  const token = createJwtToken({
    sub: ADMIN_SUB,
    email: ADMIN_EMAIL,
    name: ADMIN_NAME,
    role: ADMIN_ROLE,
    expiresInSeconds: 60 * 60 * SESSION_HOURS,
  });
  const cookieStore = await cookies();
  cookieStore.set(adminCookieName, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * SESSION_HOURS,
  });
}

export async function clearAdminCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(adminCookieName);
}

export async function getAdminSession(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(adminCookieName)?.value;
  if (!token) return false;
  const payload = verifyJwtToken(token);
  return Boolean(
    payload && payload.sub === ADMIN_SUB && payload.role === ADMIN_ROLE,
  );
}
