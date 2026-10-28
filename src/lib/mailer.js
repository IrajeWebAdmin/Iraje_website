// ---- Transport ---------------------------------------------------------------
// MAIL_TRANSPORT=graph   -> send through Microsoft Graph as MAIL_FROM (production)
// MAIL_TRANSPORT=console -> print the email in the terminal instead (development)
// When unset: "graph" in production, "console" everywhere else.
//
// Returns { sent: true } when Microsoft accepted the email, or { sent: false }
// in console mode, so callers never claim an email went out when it didn't.

async function sendMail({ to, subject, text, html, replyTo, attachments = [] }) {
  const transport =
    process.env.MAIL_TRANSPORT ||
    (process.env.NODE_ENV === "production" ? "graph" : "console");

  if (transport === "console") {
    console.info(
      [`\n----- EMAIL (not sent: MAIL_TRANSPORT=console) -----`,
        `To:       ${to}`,
        `Reply-To: ${replyTo ?? "—"}`,
        `Subject:  ${subject}`,
        ...attachments.map((a) => `Attached: ${a.name} (${Math.round(a.bytes.length / 1024)} KB)`),
        ``,
        text,
        `----------------------------------------------------\n`].join("\n"),
    );
    return { sent: false };
  }
  if (transport !== "graph") {
    throw new Error(`Unknown MAIL_TRANSPORT "${transport}" — use "graph" or "console".`);
  }

  const from = process.env.MAIL_FROM;
  if (!from) throw new Error("MAIL_FROM is not set (e.g. inquiry@iraje.com).");

  console.info(`[mail] Sending via Microsoft Graph — from ${from} to ${to}: "${subject}"`);
  const token = await getGraphToken();
  const res = await fetch(
    `https://graph.microsoft.com/v1.0/users/${encodeURIComponent(from)}/sendMail`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        message: {
          subject,
          body: { contentType: "HTML", content: html },
          toRecipients: [{ emailAddress: { address: to } }],
          ...(replyTo && { replyTo: [{ emailAddress: { address: replyTo } }] }),
          // Files up to ~3 MB can travel inside the request itself.
          ...(attachments.length && {
            attachments: attachments.map((a) => ({
              "@odata.type": "#microsoft.graph.fileAttachment",
              name: a.name,
              contentType: a.contentType,
              contentBytes: Buffer.from(a.bytes).toString("base64"),
            })),
          }),
        },
        saveToSentItems: true, // a copy appears in the mailbox's Sent Items
      }),
    },
  );
  // Graph answers 202 Accepted with an empty body when the mail is queued.
  if (res.status !== 202) {
    const detail = await res.text().catch(() => "");
    console.error(`[mail] ✗ Microsoft refused to send (HTTP ${res.status}) — from ${from} to ${to}:\n${detail}`);
    throw new Error(`Graph sendMail failed (${res.status}): ${detail.slice(0, 500)}`);
  }
  console.info(`[mail] ✓ Microsoft accepted the email (HTTP 202) — to ${to}. Check the inbox and ${from}'s Sent Items.`);
  return { sent: true };
}

// An access token lasts about an hour; reuse it instead of asking every time.
let cachedToken = null; // { value, expiresAt }

async function getGraphToken() {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) {
    return cachedToken.value;
  }

  const { GRAPH_TENANT_ID, GRAPH_CLIENT_ID, GRAPH_CLIENT_SECRET } = process.env;
  if (!GRAPH_TENANT_ID || !GRAPH_CLIENT_ID || !GRAPH_CLIENT_SECRET) {
    throw new Error(
      "Microsoft Graph is not configured — set GRAPH_TENANT_ID, GRAPH_CLIENT_ID and GRAPH_CLIENT_SECRET.",
    );
  }

  // "Client credentials": the website signs in as itself (the app registered
  // in Entra ID), not as a person, so no one's mailbox password is involved.
  const res = await fetch(
    `https://login.microsoftonline.com/${encodeURIComponent(GRAPH_TENANT_ID)}/oauth2/v2.0/token`,
    {
      method: "POST",
      body: new URLSearchParams({
        client_id: GRAPH_CLIENT_ID,
        client_secret: GRAPH_CLIENT_SECRET,
        scope: "https://graph.microsoft.com/.default",
        grant_type: "client_credentials",
      }),
    },
  );
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.access_token) {
    // Never log the secret itself — only its length, which is enough to spot a
    // Secret ID (36 characters) pasted instead of the secret Value (~40).
    console.error(
      `[mail] ✗ Microsoft sign-in failed (HTTP ${res.status}): ${data.error ?? "no error code"}\n` +
        `       ${data.error_description ?? "no details"}\n` +
        `       tenant=${GRAPH_TENANT_ID} client=${GRAPH_CLIENT_ID} secret length=${GRAPH_CLIENT_SECRET.length}`,
    );
    throw new Error(
      `Graph token request failed (${res.status}): ${data.error_description || data.error || "no details"}`,
    );
  }

  cachedToken = {
    value: data.access_token,
    expiresAt: Date.now() + Number(data.expires_in || 0) * 1000,
  };
  return cachedToken.value;
}

/** Full link to a page on this site, for use inside emails. */
function appUrl(path) {
  return new URL(path, process.env.APP_URL || "http://localhost:3000").toString();
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
export async function sendContactNotification(contact) {
  return sendMail({
    to: teamInbox(),
    replyTo: contact.email, // reply straight to the enquirer
    ...buildContactEmail(contact),
  });
}

/** Both team notifications go to the same inbox (contact@iraje.com in production). */
function teamInbox() {
  const to = process.env.CONTACT_TO;
  if (!to) throw new Error("CONTACT_TO is not set (e.g. contact@iraje.com).");
  return to;
}

/**
 * Build the contact notification body. Split out from the send so the exact
 * subject/text/html can be rendered and checked without an SMTP server.
 */
export function buildContactEmail({
  id,
  name,
  contactNo,
  email,
  message,
  submittedAt = new Date().toISOString(),
}) {
  return {
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
  };
}

/**
 * Notify the team about a new certification enrolment request.
 *
 * Deliberately built to the same shape as sendContactNotification above — same
 * recipient, same heading/table/rule/footer layout — so both land in the
 * contact inbox looking like one family of messages. Only the rows differ.
 */
export async function sendEnrollmentNotification(enrollment) {
  return sendMail({
    to: teamInbox(),
    replyTo: enrollment.email, // reply straight to the applicant
    ...buildEnrollmentEmail({
      ...enrollment,
      reviewUrl: appUrl(`/admin/enrollments/${enrollment.id}`),
    }),
  });
}

/**
 * Build the enrolment notification body — same split as buildContactEmail, so
 * both layouts can be rendered side by side and checked without sending.
 */
export function buildEnrollmentEmail({
  id,
  name,
  email,
  mobile,
  organization,
  designation,
  country,
  experience,
  domain,
  existingCustomer,
  existingPartner,
  certifications,
  reviewUrl,
  submittedAt = new Date().toISOString(),
}) {
  // Same label/value pairs drive the plain-text and HTML bodies, so the two
  // can't drift apart as fields are added.
  const rows = [
    ["Name", name],
    ["Email", email],
    ["Mobile", mobile],
    ["Organization", organization],
    ["Designation", designation],
    ["Country", country],
    ["Years of experience", experience],
    ["Technology domain", domain],
    ["Existing customer", existingCustomer],
    ["Existing partner", existingPartner],
  ];

  const pad = Math.max(...rows.map(([label]) => label.length)) + 2;

  return {
    subject: `New certification enrolment from ${name}`,
    text: [
      `New Certification enrolment (#${id})`,
      ``,
      ...rows.map(([label, value]) => `${(label + ":").padEnd(pad)}${shown(value)}`),
      ``,
      `Certifications requested:`,
      certifications,
      ``,
      `Review it in the admin panel: ${reviewUrl}`,
      ``,
      `Submitted: ${submittedAt}`,
    ].join("\n"),
    html: `
      <h2 style="font-family:sans-serif">New Certification enrolment (#${id})</h2>
      <table cellpadding="6" style="border-collapse:collapse;font-family:sans-serif">
        ${rows
          .map(
            ([label, value]) =>
              `<tr><td><strong>${label}</strong></td><td>${escapeHtml(shown(value))}</td></tr>`,
          )
          .join("\n        ")}
      </table>
      <p style="font-family:sans-serif"><strong>Certifications requested</strong></p>
      <p style="white-space:pre-wrap;font-family:sans-serif">${escapeHtml(certifications)}</p>
      <p style="font-family:sans-serif">${button(reviewUrl, "Review in admin panel")}</p>
      <hr />
      <p style="color:#888;font-family:sans-serif">Submitted ${submittedAt}</p>
    `,
  };
}

// A link styled as a button. Emails can't run code — this just opens the page.
function button(href, label) {
  return `<a href="${escapeHtml(href)}" style="display:inline-block;background:#0451CC;color:#ffffff;padding:10px 18px;border-radius:8px;text-decoration:none;font-weight:600">${escapeHtml(label)}</a>`;
}

function formatEmailDate(date) {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  });
}

/** Tell an applicant they were approved, with their login details. */
export async function sendApprovalEmail(details) {
  return sendMail({
    to: details.email,
    ...buildApprovalEmail({ ...details, loginUrl: appUrl("/certification/login") }),
  });
}

/**
 * `tempPassword` is null when the learner already has a password of their own
 * (an earlier approval) — then the email says to use that instead.
 */
export function buildApprovalEmail({
  name,
  email,
  certifications,
  tempPassword,
  expiresAt,
  loginUrl,
}) {
  const subject = "Your Iraje certification request has been approved";

  const credentialsText = tempPassword
    ? [
        `Login page:         ${loginUrl}`,
        `Login ID:           ${email}`,
        `Temporary password: ${tempPassword}`,
        ``,
        `You'll be asked to choose your own password when you first sign in.`,
        `This temporary password expires on ${formatEmailDate(expiresAt)}.`,
      ]
    : [
        `Sign in at ${loginUrl} with your email (${email}) and your existing password.`,
      ];

  const credentialsHtml = tempPassword
    ? `
      <table cellpadding="6" style="border-collapse:collapse;font-family:sans-serif">
        <tr><td><strong>Login ID</strong></td><td>${escapeHtml(email)}</td></tr>
        <tr><td><strong>Temporary password</strong></td><td style="font-family:monospace;font-size:16px">${escapeHtml(tempPassword)}</td></tr>
      </table>
      <p style="font-family:sans-serif">${button(loginUrl, "Sign in")}</p>
      <p style="font-family:sans-serif">You'll be asked to choose your own password when you first sign in.
        This temporary password expires on <strong>${formatEmailDate(expiresAt)}</strong>.</p>`
    : `
      <p style="font-family:sans-serif">Sign in with your email (${escapeHtml(email)}) and your existing password.</p>
      <p style="font-family:sans-serif">${button(loginUrl, "Sign in")}</p>`;

  return {
    subject,
    text: [
      `Hi ${name},`,
      ``,
      `Your request for ${certifications} has been approved.`,
      ``,
      ...credentialsText,
      ``,
      `Questions? Write to contact@iraje.com.`,
      ``,
      `— Iraje University`,
    ].join("\n"),
    html: `
      <p style="font-family:sans-serif">Hi ${escapeHtml(name)},</p>
      <p style="font-family:sans-serif">Your request for <strong>${escapeHtml(certifications)}</strong> has been approved.</p>
      ${credentialsHtml}
      <hr />
      <p style="color:#888;font-family:sans-serif">Questions? Write to contact@iraje.com. — Iraje University</p>
    `,
  };
}

/** Tell an applicant their request was not approved. */
export async function sendRejectionEmail(enrollment) {
  return sendMail({ to: enrollment.email, ...buildRejectionEmail(enrollment) });
}

export function buildRejectionEmail({ name, certifications, rejectionReason }) {
  return {
    subject: "Update on your Iraje certification request",
    text: [
      `Hi ${name},`,
      ``,
      `Thank you for your interest in Iraje certification. Unfortunately, we are unable to approve your request for ${certifications} at this time.`,
      ...(rejectionReason ? [``, `Reason: ${rejectionReason}`] : []),
      ``,
      `If you have questions, write to contact@iraje.com.`,
      ``,
      `— Iraje University`,
    ].join("\n"),
    html: `
      <p style="font-family:sans-serif">Hi ${escapeHtml(name)},</p>
      <p style="font-family:sans-serif">Thank you for your interest in Iraje certification. Unfortunately, we are unable to approve your request for <strong>${escapeHtml(certifications)}</strong> at this time.</p>
      ${rejectionReason ? `<p style="font-family:sans-serif;white-space:pre-wrap"><strong>Reason:</strong> ${escapeHtml(rejectionReason)}</p>` : ""}
      <p style="font-family:sans-serif">If you have questions, write to contact@iraje.com.</p>
      <hr />
      <p style="color:#888;font-family:sans-serif">— Iraje University</p>
    `,
  };
}

/** Email a learner their certificate, with the PDF attached. */
export async function sendCertificateEmail({ to, certificate, pdf }) {
  return sendMail({
    to,
    ...buildCertificateEmail({
      ...certificate,
      verifyUrl: appUrl("/certification#verify"),
      dashboardUrl: appUrl("/certification/dashboard"),
    }),
    attachments: [
      { name: `${certificate.certificateNo}.pdf`, contentType: "application/pdf", bytes: pdf },
    ],
  });
}

export function buildCertificateEmail({
  holderName,
  certificationCode,
  certificationTitle,
  certificateNo,
  scorePercentage,
  expiresAt,
  verifyUrl,
  dashboardUrl,
}) {
  return {
    subject: `Congratulations — you are ${certificationCode} certified`,
    text: [
      `Hi ${holderName},`,
      ``,
      `Congratulations! You passed the ${certificationCode} — ${certificationTitle} exam with ${scorePercentage}%.`,
      ``,
      `Your certificate is attached.`,
      `Certificate number: ${certificateNo}`,
      `Valid until:        ${formatEmailDate(expiresAt)}`,
      ``,
      `Anyone can confirm it at ${verifyUrl} using the certificate number.`,
      `You can download it again any time from ${dashboardUrl}.`,
      ``,
      `— Iraje University`,
    ].join("\n"),
    html: `
      <p style="font-family:sans-serif">Hi ${escapeHtml(holderName)},</p>
      <p style="font-family:sans-serif">Congratulations! You passed the <strong>${escapeHtml(certificationCode)} — ${escapeHtml(certificationTitle)}</strong> exam with <strong>${scorePercentage}%</strong>.</p>
      <p style="font-family:sans-serif">Your certificate is attached.</p>
      <table cellpadding="6" style="border-collapse:collapse;font-family:sans-serif">
        <tr><td><strong>Certificate number</strong></td><td style="font-family:monospace;font-size:16px">${escapeHtml(certificateNo)}</td></tr>
        <tr><td><strong>Valid until</strong></td><td>${formatEmailDate(expiresAt)}</td></tr>
      </table>
      <p style="font-family:sans-serif">Anyone can confirm it on our website using the certificate number.</p>
      <p style="font-family:sans-serif">${button(verifyUrl, "Verify a certificate")}</p>
      <hr />
      <p style="color:#888;font-family:sans-serif">— Iraje University</p>
    `,
  };
}
