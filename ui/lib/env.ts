export function getEnv(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const appConfig = {
  appName: process.env.NEXT_PUBLIC_APP_NAME ?? "Datalk",
  jwtSecret: process.env.JWT_SECRET ?? "development-only-change-me",
  ingestionApiBaseUrl:
    process.env.INGESTION_API_BASE_URL ?? "http://localhost:8000/api/v1",
  chatApiBaseUrl:
    process.env.CHAT_API_BASE_URL ?? "http://localhost:8001/api/v1",
};
