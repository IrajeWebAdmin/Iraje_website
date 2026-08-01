import nodemailer from "nodemailer";

// Lazily create a single SMTP transport and reuse it across requests.
let transporter;

function getTransporter() {
  if (transporter) return transporter;

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_SECURE } =
    process.env;

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    throw new Error(
      "SMTP is not configured — set SMTP_HOST, SMTP_USER and SMTP_PASS in .env",
    );
  }

  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT) || 587,
    // true for port 465 (implicit TLS); false for 587 (STARTTLS)
    secure: SMTP_SECURE === "true",
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });

  return transporter;
}

// Optional fields (currently just the phone number) arrive as null when the
// enquirer left them blank — show a dash rather than the string "null".
function shown(value) {
  return value === null || value === undefined || value === "" ? "—" : value;
}

// Minimal HTML escaping so user input can't break the notification markup.
function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

/**
 * Notify the team about a new contact submission.
 * Throws if sending fails — the caller decides how to handle it (the API route
 * treats email as best-effort so a mail outage never loses a saved lead).
 */
export async function sendContactNotification({
  id,
  name,
  contactNo,
  email,
  message,
}) {
  const to = process.env.CONTACT_TO || process.env.SMTP_USER;
  const from = process.env.CONTACT_FROM || process.env.SMTP_USER;
  const submittedAt = new Date().toISOString();

  return getTransporter().sendMail({
    from,
    to,
    replyTo: email, // reply straight to the enquirer
    subject: `New contact enquiry from ${name}`,
    text: [
      `New Contact Us submission (#${id})`,
      ``,
      `Name:    ${name}`,
      `Email:   ${email}`,
      `Phone:   ${shown(contactNo)}`,
      ``,
      `Message:`,
      message,
      ``,
      `Submitted: ${submittedAt}`,
    ].join("\n"),
    html: `
      <h2 style="font-family:sans-serif">New Contact Us submission (#${id})</h2>
      <table cellpadding="6" style="border-collapse:collapse;font-family:sans-serif">
        <tr><td><strong>Name</strong></td><td>${escapeHtml(name)}</td></tr>
        <tr><td><strong>Email</strong></td><td>${escapeHtml(email)}</td></tr>
        <tr><td><strong>Phone</strong></td><td>${escapeHtml(shown(contactNo))}</td></tr>
      </table>
      <p style="font-family:sans-serif"><strong>Message</strong></p>
      <p style="white-space:pre-wrap;font-family:sans-serif">${escapeHtml(message)}</p>
      <hr />
      <p style="color:#888;font-family:sans-serif">Submitted ${submittedAt}</p>
    `,
  });
}
