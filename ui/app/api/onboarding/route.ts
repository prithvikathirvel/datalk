import { NextResponse } from "next/server";
import { getOnboardingForUser, upsertOnboarding } from "@/lib/onboarding-store";
import { getSessionUser } from "@/lib/session";
import { setOnboardingCompleted } from "@/lib/user-store";

/**
 * Onboarding BFF route.
 *
 * Session-scoped: GET returns the current user's submission (if any),
 * POST saves/updates it and marks the user's onboarding as completed.
 *
 * Backend contract this route will proxy to once the backend exists is
 * documented in `ONBOARDING_ADMIN_BACKEND_API.md`.
 */

const HEARD_FROM_OPTIONS = [
  "Google search",
  "LinkedIn",
  "Twitter / X",
  "YouTube",
  "Friend or colleague",
  "Blog or article",
  "Event / webinar",
  "Other",
];

const ROLE_OPTIONS = [
  "Founder / Executive",
  "Developer / Engineer",
  "Product manager",
  "Marketing",
  "Customer support",
  "Student / Researcher",
  "Other",
];

const COMPANY_SIZE_OPTIONS = [
  "Just me",
  "2–10",
  "11–50",
  "51–200",
  "201–1000",
  "1000+",
];

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }

  const submission = await getOnboardingForUser(user.id);
  return NextResponse.json({ submission });
}

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as {
    country?: unknown;
    heardFrom?: unknown;
    role?: unknown;
    companySize?: unknown;
    notes?: unknown;
  } | null;

  if (!body) {
    return NextResponse.json(
      { detail: "Invalid request body." },
      { status: 400 },
    );
  }

  const country = typeof body.country === "string" ? body.country.trim() : "";
  const heardFrom =
    typeof body.heardFrom === "string" ? body.heardFrom.trim() : "";

  if (!country) {
    return NextResponse.json(
      { detail: "Please select your country." },
      { status: 400 },
    );
  }
  if (!heardFrom) {
    return NextResponse.json(
      { detail: "Please tell us how you heard about Datalk." },
      { status: 400 },
    );
  }
  if (!HEARD_FROM_OPTIONS.includes(heardFrom)) {
    return NextResponse.json(
      { detail: "Please choose a valid option for how you heard about us." },
      { status: 400 },
    );
  }
  if (
    body.role !== undefined &&
    typeof body.role === "string" &&
    body.role.trim() &&
    !ROLE_OPTIONS.includes(body.role)
  ) {
    return NextResponse.json(
      { detail: "Please choose a valid option for your role." },
      { status: 400 },
    );
  }
  if (
    body.companySize !== undefined &&
    typeof body.companySize === "string" &&
    body.companySize.trim() &&
    !COMPANY_SIZE_OPTIONS.includes(body.companySize)
  ) {
    return NextResponse.json(
      { detail: "Please choose a valid option for your team size." },
      { status: 400 },
    );
  }

  const submission = await upsertOnboarding(user.id, {
    country,
    heardFrom,
    role: typeof body.role === "string" ? body.role : undefined,
    companySize:
      typeof body.companySize === "string" ? body.companySize : undefined,
    notes: typeof body.notes === "string" ? body.notes : undefined,
  });

  const updatedUser = await setOnboardingCompleted(user.id, true);

  return NextResponse.json({ submission, user: updatedUser }, { status: 200 });
}
