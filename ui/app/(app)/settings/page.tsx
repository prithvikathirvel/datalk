import { redirect } from "next/navigation";
import { SettingsContent } from "@/components/settings/settings-content";
import { getSessionUser } from "@/lib/session";

export default async function SettingsPage() {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login");
  }

  return <SettingsContent user={user} />;
}
