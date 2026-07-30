import { NextResponse } from "next/server";
import { mockAnalyticsData } from "@/lib/data";
import {
  getBearerTokenOrResponse,
} from "@/lib/backend";

// Routes to the real backend analytics service
const USE_REAL_BACKEND = true;

export async function GET(request: Request) {
  if (USE_REAL_BACKEND) {
    const { token, response } = await getBearerTokenOrResponse();
    if (response) {
      return response;
    }

    const res = await fetch(
      "https://6aab78sbih.execute-api.ap-south-1.amazonaws.com/analytics",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      },
    );

    if (!res.ok) {
      return NextResponse.json(
        { detail: "Failed to fetch analytics" },
        { status: res.status },
      );
    }

    // Backend returns: [{ analytics: { ... } }]
    // Unwrap to the flat AnalyticsData shape the frontend expects.
    const raw = await res.json();
    const data = Array.isArray(raw) ? raw[0]?.analytics ?? raw[0] : raw;
    return NextResponse.json(data);
  }

  // Return the empty-default analytics data while real backend is unavailable
  return NextResponse.json(mockAnalyticsData);
}
