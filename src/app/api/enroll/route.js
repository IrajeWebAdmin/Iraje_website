import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEnrollmentNotification } from "@/lib/mailer";
import { createRateLimiter, clientIp } from "@/lib/rateLimit";
import { isHoneypotTripped } from "@/lib/honeypot";
import { validateBusinessEmail } from "@/lib/validation";
import {
  formatPersonName,
  validatePersonName,
  validateCountryName,
  validateMobileForCountry,
  toE164,
} from "@/lib/enrollValidation";
import certification from "@/data/certification";

// Its own limiter, separate from /api/contact — enrolment abuse must not eat
// the contact form's quota, or vice versa. 10/hour is generous for a form a
// person fills in once.
const limiter = createRateLimiter({ limit: 10, windowMs: 60 * 60 * 1000 });

function rateLimitHeaders(result) {
  const headers = {
    "RateLimit-Limit": String(limiter.limit),
    "RateLimit-Remaining": String(result.remaining),
    "RateLimit-Reset": String(result.resetSeconds),
  };
  if (!result.allowed) {
    headers["Retry-After"] = String(result.retryAfterSeconds);
  }
  return headers;
}

// Trim, and collapse an empty string to null so optional columns stay NULL
// rather than storing "".
function optional(value) {
  const v = String(value ?? "").trim();
  return v === "" ? null : v;
}

const CERT_OPTIONS = certification.enroll.certStep.options;

// POST /api/enroll — save a certification enrolment, then notify the team.
export async function POST(request) {
  // Throttle before any parsing or I/O, so malformed floods spend quota too.
  const limit = limiter.check(clientIp(request));
  if (!limit.allowed) {
    const minutes = Math.max(1, Math.round(limit.retryAfterSeconds / 60));
    return NextResponse.json(
      {
        ok: false,
        error: `Too many enrolment requests have been sent from your network. Please try again in about ${minutes} minute${minutes === 1 ? "" : "s"}.`,
      },
      { status: 429, headers: rateLimitHeaders(limit) },
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid request body." },
      { status: 400, headers: rateLimitHeaders(limit) },
    );
  }

  // Honeypot: answer with the same success shape a real submission gets, so a
  // bot has no signal to adapt to — just store nothing and send nothing.
  if (isHoneypotTripped(body)) {
    console.warn("[enroll] honeypot tripped — submission discarded");
    return NextResponse.json(
      { ok: true },
      { status: 201, headers: rateLimitHeaders(limit) },
    );
  }

  // The name is stored in Pascal case ("John Smith") whatever was typed.
  const name = formatPersonName(body.name);
  const email = String(body.email ?? "").trim();
  const mobile = String(body.mobile ?? "").trim();
  const mobileCountry = String(body.mobileCountry ?? "")
    .trim()
    .toUpperCase();
  const organization = String(body.organization ?? "").trim();
  const country = String(body.country ?? "").trim();

  // Keep only codes the form actually offers, in the data's display order.
  const requested = new Set(
    Array.isArray(body.certifications) ? body.certifications.map(String) : [],
  );
  const certifications = CERT_OPTIONS.map((o) => o.code).filter((code) =>
    requested.has(code),
  );

  const errors = {};
  const nameError = validatePersonName(name);
  if (nameError) errors.name = nameError;

  // The form asks for a business email, so the stricter validator applies.
  const emailError = validateBusinessEmail(email);
  if (emailError) errors.email = emailError;

  // Mobile is checked against the chosen country: its dialling code, the
  // national number's shape where known, and the 15-digit E.164 ceiling.
  const mobileError = validateMobileForCountry(mobile, mobileCountry);
  if (mobileError) errors.mobile = mobileError;

  if (!organization) errors.organization = "Organization is required.";
  else if (organization.length > 150)
    errors.organization = "Organization is too long.";

  const countryError = validateCountryName(country);
  if (countryError) errors.country = countryError;

  // One certification per request.
  if (certifications.length === 0)
    errors.certifications = "Select the certification you want to request.";
  else if (certifications.length > 1)
    errors.certifications = "Choose one certification per request.";

  if (Object.keys(errors).length > 0) {
    return NextResponse.json(
      { ok: false, errors },
      { status: 400, headers: rateLimitHeaders(limit) },
    );
  }

  let enrollment;
  try {
    // One request at a time: while an earlier request from this address is
    // still waiting for review, a new one is turned away rather than queued.
    const pending = await prisma.enrollment.findFirst({
      where: { email, status: "new" },
      select: { certifications: true },
    });
    if (pending) {
      const code = pending.certifications.trim();
      const label = CERT_OPTIONS.find((o) => o.code === code)?.label ?? code;
      return NextResponse.json(
        {
          ok: false,
          error: `You already have a request for ${label} waiting for review. We'll email you once it has been reviewed — you can request another certification after that.`,
          errors: { certifications: "One request at a time." },
        },
        { status: 409, headers: rateLimitHeaders(limit) },
      );
    }

    // Persist the request first — this is the source of truth.
    enrollment = await prisma.enrollment.create({
      data: {
        name,
        email,
        mobile: toE164(mobile, mobileCountry),
        organization,
        designation: optional(body.designation),
        country,
        experience: optional(body.experience),
        domain: optional(body.domain),
        existingCustomer: optional(body.existingCustomer),
        existingPartner: optional(body.existingPartner),
        certifications: certifications.join(", "),
      },
    });
  } catch (err) {
    // Full error (stack, code frame, query) goes to the server log only —
    // never back to the browser, where it would reveal database details.
    console.error("[enroll] failed to save submission:", err);

    return NextResponse.json(
      { ok: false, error: "Could not submit your request. Please try again." },
      { status: 500, headers: rateLimitHeaders(limit) },
    );
  }

  // Email is best-effort — never lose a saved request because SMTP is down.
  try {
    await sendEnrollmentNotification(enrollment);
  } catch (err) {
    console.error("[enroll] email notification failed:", err);
  }

  return NextResponse.json(
    { ok: true, id: enrollment.id },
    { status: 201, headers: rateLimitHeaders(limit) },
  );
}
