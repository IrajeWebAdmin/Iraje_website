import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEnrollmentNotification } from "@/lib/mailer";
import { createRateLimiter, clientIp } from "@/lib/rateLimit";
import { isHoneypotTripped } from "@/lib/honeypot";
import {
  validateBusinessEmail,
  validateMobile,
  normalizePhone,
} from "@/lib/validation";
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

  const name = String(body.name ?? "").trim();
  const email = String(body.email ?? "").trim();
  const mobile = String(body.mobile ?? "").trim();
  const organization = String(body.organization ?? "").trim();
  const country = String(body.country ?? "").trim();

  // Keep only codes the form actually offers, de-duplicated, in the data's
  // display order so the email always reads the same way.
  const requested = new Set(
    Array.isArray(body.certifications) ? body.certifications.map(String) : [],
  );
  const certifications = certification.enroll.certStep.options
    .map((o) => o.code)
    .filter((code) => requested.has(code));

  const errors = {};
  if (!name) errors.name = "Full name is required.";
  else if (name.length > 120) errors.name = "Full name is too long.";

  // The form asks for a business email and a mobile specifically, so both use
  // the stricter validators rather than the general-purpose ones.
  const emailError = validateBusinessEmail(email);
  if (emailError) errors.email = emailError;

  const mobileError = validateMobile(mobile);
  if (mobileError) errors.mobile = mobileError;

  if (!organization) errors.organization = "Organization is required.";
  else if (organization.length > 150)
    errors.organization = "Organization is too long.";

  if (!country) errors.country = "Country is required.";
  else if (country.length > 100) errors.country = "Country is too long.";

  if (certifications.length === 0) {
    errors.certifications = "Select at least one certification.";
  }

  if (Object.keys(errors).length > 0) {
    return NextResponse.json(
      { ok: false, errors },
      { status: 400, headers: rateLimitHeaders(limit) },
    );
  }

  // 1) Persist the request first — this is the source of truth.
  let enrollment;
  try {
    enrollment = await prisma.enrollment.create({
      data: {
        name,
        email,
        mobile: normalizePhone(mobile),
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
    // Full error (stack, code frame, query) goes to the server log.
    console.error("[enroll] failed to save submission:", err);

    // Prisma prefixes its message with the whole invocation and a code frame,
    // which in a bundled build is mangled module names plus an absolute server
    // path. The last line is the part that says what actually went wrong.
    const cause = String(err?.message ?? "")
      .trim()
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .pop();

    return NextResponse.json(
      {
        ok: false,
        error: "Could not submit your request. Please try again.",
        // Returned deliberately so a failed save can be diagnosed from the
        // response itself, not just the server log. `code` is Prisma's error
        // code (P2000 = value too long, P2002 = unique clash, and so on).
        // NOTE: this exposes database detail to anyone who can POST here —
        // wrap both lines in `process.env.NODE_ENV !== "production" && …`
        // before going live if that is not wanted.
        detail: cause,
        code: err?.code,
      },
      { status: 500, headers: rateLimitHeaders(limit) },
    );
  }

  // 2) Email is best-effort — never lose a saved request because SMTP is down.
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
