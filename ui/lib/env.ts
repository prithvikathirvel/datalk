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
  /** Datalk Chat Service host that serves the embed endpoints. */
  embedApiBaseUrl:
    process.env.EMBED_BASE_URL ??
    process.env.CHAT_API_BASE_URL ??
    "http://localhost:8001",
};

export const cognitoConfig = {
  domain: process.env.NEXT_PUBLIC_COGNITO_DOMAIN ?? "",
  userPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID ?? "",
  userPoolClientId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_CLIENT_ID ?? "",
  redirectSignIn:
    process.env.NEXT_PUBLIC_COGNITO_REDIRECT_SIGN_IN ??
    "http://localhost:3000/api/auth/callback",
  redirectSignOut:
    process.env.NEXT_PUBLIC_COGNITO_REDIRECT_SIGN_OUT ??
    "http://localhost:3000/login",
};
