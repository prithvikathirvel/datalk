import { NextResponse } from "next/server";

/**
 * Builds CORS response headers for the public embed widget endpoints.
 * The embed chatbot runs on customer websites and calls these endpoints
 * cross-origin, so every public route must set permissive CORS headers.
 */
export function corsHeaders(origin?: string | null) {
  return {
    // Reflect the requesting origin when known, otherwise allow any origin.
    "Access-Control-Allow-Origin": origin ?? "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Api-Key",
    "Access-Control-Max-Age": "86400",
  };
}

/** 204 response for CORS preflight (OPTIONS) requests. */
export function corsPreflight(origin?: string | null) {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders(origin),
  });
}

/** Attach CORS headers to an existing NextResponse. */
export function withCors(
  response: NextResponse,
  origin?: string | null,
): NextResponse {
  const headers = corsHeaders(origin);
  for (const [key, value] of Object.entries(headers)) {
    response.headers.set(key, value);
  }
  return response;
}
