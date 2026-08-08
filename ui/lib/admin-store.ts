import { promises as fs } from "node:fs";
import path from "node:path";
import { hashPassword, verifyPassword } from "./password";

/**
 * Admin panel credentials.
 *
 * Precedence:
 *   1. `.data/admin.json` overrides written by the admin Settings tab
 *      (`ADMIN_*` env vars and the built-in defaults apply only until the
 *      admin first changes their credentials in the panel).
 *   2. `ADMIN_USERNAME` / `ADMIN_PASSWORD` environment variables.
 *   3. Built-in development defaults: admin / admin.
 *
 * NEVER ship a production deployment with the default password — set
 * ADMIN_PASSWORD (or change it from the panel) before going live.
 */

const dataDirectory = path.join(process.cwd(), ".data");
const adminFile = path.join(dataDirectory, "admin.json");

interface AdminCredentials {
  username: string;
  passwordHash: string;
}

async function readOverrides(): Promise<AdminCredentials | null> {
  try {
    const content = await fs.readFile(adminFile, "utf8");
    const parsed = JSON.parse(content) as AdminCredentials;
    if (parsed?.username && parsed?.passwordHash) return parsed;
    return null;
  } catch {
    return null;
  }
}

async function writeOverrides(credentials: AdminCredentials) {
  await fs.mkdir(dataDirectory, { recursive: true });
  await fs.writeFile(adminFile, JSON.stringify(credentials, null, 2), "utf8");
}

function envCredentials(): AdminCredentials | null {
  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;
  if (!username || !password) return null;
  return { username, passwordHash: hashPassword(password) };
}

async function resolveCredentials(): Promise<AdminCredentials> {
  const overrides = await readOverrides();
  if (overrides) return overrides;
  const fromEnv = envCredentials();
  if (fromEnv) return fromEnv;
  // Development default: admin / admin
  return { username: "admin", passwordHash: hashPassword("admin") };
}

export async function getAdminUsername(): Promise<string> {
  const credentials = await resolveCredentials();
  return credentials.username;
}

/** Verifies an admin login attempt. Constant-ish time via PBKDF2 compare. */
export async function verifyAdminCredentials(
  username: string,
  password: string,
): Promise<boolean> {
  const credentials = await resolveCredentials();
  const usernameOk =
    username.trim().toLowerCase() === credentials.username.toLowerCase();
  return usernameOk && verifyPassword(password, credentials.passwordHash);
}

/** Verifies just the password — used when the admin is already signed in. */
export async function verifyAdminPassword(password: string): Promise<boolean> {
  const credentials = await resolveCredentials();
  return verifyPassword(password, credentials.passwordHash);
}

/**
 * Changes the stored admin credentials (called from the admin Settings tab,
 * after the current password has been verified). Writes the override file so
 * the change survives restarts and takes precedence over env/default values.
 */
export async function updateAdminCredentials(params: {
  newUsername: string;
  newPassword: string;
}): Promise<void> {
  const username = params.newUsername.trim();
  if (username.length < 3) {
    throw new Error("Admin username must be at least 3 characters.");
  }
  if (params.newPassword.length < 6) {
    throw new Error("Admin password must be at least 6 characters.");
  }
  await writeOverrides({
    username,
    passwordHash: hashPassword(params.newPassword),
  });
}
