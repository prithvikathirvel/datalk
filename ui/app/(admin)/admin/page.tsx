import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminDashboard } from "@/components/admin/admin-dashboard";
import { collectAdminOverview } from "@/lib/admin-data";
import { getAdminSession } from "@/lib/admin-session";

export const metadata: Metadata = {
  title: "Admin · Datalk",
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  if (!(await getAdminSession())) {
    redirect("/admin/login");
  }

  const initialData = await collectAdminOverview();

  return <AdminDashboard initialData={initialData} />;
}
