import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendContactNotification } from "@/lib/mailer";
import { createRateLimiter, clientIp } from "@/lib/rateLimit";
import { isHoneypotTripped } from "@/lib/honeypot";
import {
  validateEmail,
  validatePhone,
  validateBusinessEmail,
  validateMobile,
  normalizePhone,
} from "@/lib/validation";

// 15 submissions per IP per hour. Generous for a real visitor — and for an
// office where everyone shares one public IP — but low enough that scripted
// abuse stops long before it can flood the leads table or burn the SMTP quota
// and get the sending mailbox flagged as a spammer.
const limiter = createRateLimiter({ limit: 15, windowMs: 60 * 60 * 1000 });

// RFC 6585 (429) + the IETF RateLimit header conventions, so clients can back
// off deliberately instead of retrying blind.
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

// POST /api/contact — save a Contact Us submission, then notify the team.
export async function POST(request) {
  // Throttle first, before any parsing or I/O. Malformed bodies have to spend
  // quota too, or the endpoint can be flooded for free with junk payloads.
  const limit = limiter.check(clientIp(request));
  if (!limit.allowed) {
    const minutes = Math.max(1, Math.round(limit.retryAfterSeconds / 60));
    return NextResponse.json(
      {
        ok: false,
        error: `Too many messages have been sent from your network. Please try again in about ${minutes} minute${minutes === 1 ? "" : "s"}.`,
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

  // Honeypot: only an automated filler populates the hidden field. Reply with
  // the same shape a real submission gets, so the bot has no signal to adapt
  // to — just store nothing and send nothing.
  if (isHoneypotTripped(body)) {
    console.warn("[contact] honeypot tripped — submission discarded");
    return NextResponse.json(
      { ok: true },
      { status: 201, headers: rateLimitHeaders(limit) },
    );
  }

  // Accept camelCase (contactNo) or snake_case (contact_no) from clients.
  const name = String(body.name ?? "").trim();
  const email = String(body.email ?? "").trim();
  const contactNo = String(body.contactNo ?? body.contact_no ?? "").trim();
  const message = String(body.message ?? "").trim();

  const errors = {};
  if (!name) errors.name = "Name is required.";
  else if (name.length > 120) errors.name = "Name is too long.";

  // Three forms share this endpoint. The University training request asks for
  // a WORK email and a mobile, so it is held to the stricter rules; the two
  // Contact Us forms are general enquiries where a personal address is fine.
  const fromUniversity = String(body.source ?? "") === "university";

  // Optional here, format-checked when present: the two Contact Us forms mark
  // the number required in the browser, but the University form does not.
  const contactNoError = fromUniversity
    ? validateMobile(contactNo, { required: false })
    : validatePhone(contactNo, { required: false });
  if (contactNoError) errors.contactNo = contactNoError;

  const emailError = fromUniversity
    ? validateBusinessEmail(email)
    : validateEmail(email);
  if (emailError) errors.email = emailError;

  if (!message) errors.message = "Message is required.";
  else if (message.length > 5000)
    errors.message = "Message is too long (5000 characters max).";

  if (Object.keys(errors).length > 0) {
    return NextResponse.json(
      { ok: false, errors },
      { status: 400, headers: rateLimitHeaders(limit) },
    );
  }

  // 1) Persist the lead first — this is the source of truth.
  let contact;
  try {
    contact = await prisma.contact.create({
      // Store the number in normalized form ("+919876543210") rather than as
      // typed. It is consistent to search on, directly dialable, and can never
      // exceed the 20-char column the way free-form input could.
      data: { name, contactNo: normalizePhone(contactNo), email, message },
    });
  } catch (err) {
    console.error("[contact] failed to save submission:", err);
    return NextResponse.json(
      { ok: false, error: "Could not save your message. Please try again." },
      { status: 500, headers: rateLimitHeaders(limit) },
    );
  }

  // 2) Email is best-effort — never lose a saved lead because SMTP is down
  //    or not configured yet.
  try {
    await sendContactNotification(contact);
  } catch (err) {
    console.error("[contact] email notification failed:", err);
  }

  return NextResponse.json(
    { ok: true, id: contact.id },
    { status: 201, headers: rateLimitHeaders(limit) },
  );
}
