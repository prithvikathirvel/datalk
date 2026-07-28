// Signup is handled entirely via Google OAuth — same flow as login,
// with wording adjusted for people creating a workspace for the first time.
import { LoginForm } from "./login-form";

export function SignupForm({ error, next }: { error?: string; next?: string }) {
  return <LoginForm mode="signup" error={error} next={next} />;
}
