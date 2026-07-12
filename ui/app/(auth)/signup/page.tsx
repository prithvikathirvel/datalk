import { AuthCard } from "@/components/auth/auth-card";
import { SignupForm } from "@/components/auth/signup-form";

export default function SignupPage() {
  return (
    <AuthCard mode="signup">
      <SignupForm />
    </AuthCard>
  );
}
