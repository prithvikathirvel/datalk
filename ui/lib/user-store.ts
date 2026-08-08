import { randomUUID } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import type { UserProfile } from "@template/contracts";
import { hashPassword, verifyPassword } from "./password";

/**
 * Stored user profile — the same shape the rest of the app already relies on
 * (id/email/name/createdAt) plus internal bookkeeping:
 * - passwordHash is only present for email/password (local) accounts;
 *   Google OAuth (Cognito) users authenticate via Cognito instead.
 * - onboardingCompleted tracks whether the user finished the first-time
 *   onboarding questions (country, how they heard about us, ...).
 */
export interface StoredUserProfile extends UserProfile {
  onboardingCompleted: boolean;
  authProvider?: "local" | "cognito";
}

interface StoredUser extends StoredUserProfile {
  passwordHash?: string;
}

const dataDirectory = path.join(process.cwd(), ".data");
const usersFile = path.join(dataDirectory, "users.json");

async function ensureStore() {
  await fs.mkdir(dataDirectory, { recursive: true });
  try {
    await fs.access(usersFile);
  } catch {
    await fs.writeFile(
      usersFile,
      JSON.stringify({ users: [] }, null, 2),
      "utf8",
    );
  }
}

async function readUsers(): Promise<StoredUser[]> {
  await ensureStore();
  const content = await fs.readFile(usersFile, "utf8");
  const parsed = JSON.parse(content) as { users?: StoredUser[] };
  return parsed.users ?? [];
}

async function writeUsers(users: StoredUser[]) {
  await ensureStore();
  await fs.writeFile(usersFile, JSON.stringify({ users }, null, 2), "utf8");
}

function toProfile(user: StoredUser): StoredUserProfile {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    createdAt: user.createdAt,
    onboardingCompleted: Boolean(user.onboardingCompleted),
    authProvider: user.authProvider,
  };
}

/** Normalise a user id — Cognito subs are opaque, email is case-insensitive. */
function normaliseId(id: string) {
  return id.trim().toLowerCase();
}

function normaliseEmail(email: string) {
  return email.trim().toLowerCase();
}

export async function createUser(params: {
  email: string;
  name: string;
  password: string;
}) {
  const email = normaliseEmail(params.email);
  const name = params.name.trim();
  const users = await readUsers();
  if (users.some((user) => user.email === email)) {
    throw new Error("An account with this email already exists.");
  }

  const user: StoredUser = {
    id: randomUUID(),
    email,
    name,
    createdAt: new Date().toISOString(),
    passwordHash: hashPassword(params.password),
    authProvider: "local",
    onboardingCompleted: false,
  };
  users.push(user);
  await writeUsers(users);
  return toProfile(user);
}

/**
 * Create-or-update a profile for a Google OAuth (Cognito) user. Called from
 * the OAuth callback so the local store always knows about every registered
 * account (needed for first-time onboarding detection and the admin panel).
 *
 * Matching is by Cognito `sub` first, then email, so an existing
 * email/password account that signs in with Google keeps its record.
 */
export async function upsertOAuthUser(params: {
  id: string;
  email: string;
  name: string;
}) {
  const id = normaliseId(params.id);
  const email = normaliseEmail(params.email);
  const name = params.name.trim() || email.split("@")[0] || "User";
  const users = await readUsers();

  let existing = users.find((user) => user.id === id || user.email === email);

  if (!existing) {
    existing = {
      id,
      email,
      name,
      createdAt: new Date().toISOString(),
      authProvider: "cognito",
      onboardingCompleted: false,
    };
    users.push(existing);
  } else {
    existing.email = email;
    if (name) existing.name = name;
    if (!existing.authProvider) existing.authProvider = "cognito";
  }

  await writeUsers(users);
  return toProfile(existing);
}

export async function authenticateUser(params: {
  email: string;
  password: string;
}) {
  const email = normaliseEmail(params.email);
  const users = await readUsers();
  const user = users.find((candidate) => candidate.email === email);
  if (
    !user?.passwordHash ||
    !verifyPassword(params.password, user.passwordHash)
  ) {
    return null;
  }
  return toProfile(user);
}

export async function getUserById(id: string) {
  const users = await readUsers();
  const user = users.find((candidate) => candidate.id === id);
  return user ? toProfile(user) : null;
}

export async function getUserByEmail(email: string) {
  const users = await readUsers();
  const user = users.find(
    (candidate) => candidate.email === normaliseEmail(email),
  );
  return user ? toProfile(user) : null;
}

/** Marks onboarding as done for a user. Returns the updated profile or null. */
export async function setOnboardingCompleted(id: string, completed = true) {
  const users = await readUsers();
  const user = users.find((candidate) => candidate.id === id);
  if (!user) return null;
  user.onboardingCompleted = completed;
  await writeUsers(users);
  return toProfile(user);
}

/**
 * Sanitised list of every registered account for the admin panel — never
 * exposes password hashes.
 */
export async function listUsers(): Promise<StoredUserProfile[]> {
  const users = await readUsers();
  return users
    .map((user) => toProfile(user))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
