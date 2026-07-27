import { NextResponse } from "next/server";
import { mockAnalyticsData } from "@/lib/data";
import {
  backendUrls,
  getBearerTokenOrResponse,
  joinUrl,
  proxyJson,
} from "@/lib/backend";

// Set this to true to route to the real backend service
const USE_REAL_BACKEND = false;

export async function GET(request: Request) {
  if (USE_REAL_BACKEND) {
    const { token, response } = await getBearerTokenOrResponse();
    if (response) {
      return response;
    }

    // Proxy request to the real backend analytics endpoint
    return proxyJson(
      joinUrl(backendUrls.chat, "/analytics"),
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      }
    );
  }

  // Return the mock analytics data
  return NextResponse.json(mockAnalyticsData);
}
