import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendContactNotification } from "@/lib/mailer";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// POST /api/contact — save a Contact Us submission, then notify the team.
export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid request body." },
      { status: 400 },
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

  if (!contactNo) errors.contactNo = "Contact number is required.";
  else if (contactNo.length > 40)
    errors.contactNo = "Contact number is too long.";

  if (!email) errors.email = "Email is required.";
  else if (!EMAIL_RE.test(email)) errors.email = "Enter a valid email address.";
  else if (email.length > 160) errors.email = "Email is too long.";

  if (!message) errors.message = "Message is required.";
  else if (message.length > 5000)
    errors.message = "Message is too long (5000 characters max).";

  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ ok: false, errors }, { status: 400 });
  }

  // 1) Persist the lead first — this is the source of truth.
  let contact;
  try {
    contact = await prisma.contact.create({
      data: { name, contactNo, email, message },
    });
  } catch (err) {
    console.error("[contact] failed to save submission:", err);
    return NextResponse.json(
      { ok: false, error: "Could not save your message. Please try again." },
      { status: 500 },
    );
  }

  // 2) Email is best-effort — never lose a saved lead because SMTP is down
  //    or not configured yet.
  try {
    await sendContactNotification(contact);
  } catch (err) {
    console.error("[contact] email notification failed:", err);
  }

  return NextResponse.json({ ok: true, id: contact.id }, { status: 201 });
}
