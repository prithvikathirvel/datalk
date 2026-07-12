import { randomUUID } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import type { UserProfile } from "@template/contracts";
import { hashPassword, verifyPassword } from "./password";

interface StoredUser extends UserProfile {
  passwordHash: string;
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

function toProfile(user: StoredUser): UserProfile {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    createdAt: user.createdAt,
  };
}

export async function createUser(params: {
  email: string;
  name: string;
  password: string;
}) {
  const email = params.email.trim().toLowerCase();
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
  };
  users.push(user);
  await writeUsers(users);
  return toProfile(user);
}

export async function authenticateUser(params: {
  email: string;
  password: string;
}) {
  const email = params.email.trim().toLowerCase();
  const users = await readUsers();
  const user = users.find((candidate) => candidate.email === email);
  if (!user || !verifyPassword(params.password, user.passwordHash)) {
    return null;
  }
  return toProfile(user);
}

export async function getUserById(id: string) {
  const users = await readUsers();
  const user = users.find((candidate) => candidate.id === id);
  return user ? toProfile(user) : null;
}
