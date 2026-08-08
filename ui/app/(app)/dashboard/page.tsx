import { DashboardContent } from "@/components/dashboard/dashboard-content";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ tour?: string }>;
}) {
  const { tour } = await searchParams;
  return <DashboardContent autoStartTour={tour === "1"} />;
}
