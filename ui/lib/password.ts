import { pbkdf2Sync, randomBytes, timingSafeEqual } from "node:crypto";

const ITERATIONS = 120_000;
const KEY_LENGTH = 64;
const DIGEST = "sha512";

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("base64url");
  const hash = pbkdf2Sync(
    password,
    salt,
    ITERATIONS,
    KEY_LENGTH,
    DIGEST,
  ).toString("base64url");
  return `pbkdf2$${ITERATIONS}$${salt}$${hash}`;
}

export function verifyPassword(password: string, storedHash: string) {
  const [algorithm, iterationsText, salt, hash] = storedHash.split("$");
  if (algorithm !== "pbkdf2" || !iterationsText || !salt || !hash) {
    return false;
  }

  const iterations = Number(iterationsText);
  const calculatedHash = pbkdf2Sync(
    password,
    salt,
    iterations,
    KEY_LENGTH,
    DIGEST,
  ).toString("base64url");
  const left = Buffer.from(hash, "base64url");
  const right = Buffer.from(calculatedHash, "base64url");
  return left.length === right.length && timingSafeEqual(left, right);
}
