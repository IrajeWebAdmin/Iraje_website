import Link from "next/link";
import { notFound } from "next/navigation";
import { FiArrowLeft, FiCheck, FiX } from "react-icons/fi";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/dal";
import { formatDate, formatRelative } from "@/lib/formatDate";
import { parseCertList, displayCertCode } from "@/lib/certCodes";
import { TEMP_PASSWORD_DAYS } from "@/lib/password";
import StatusPill from "@/components/Admin/StatusPill";
import {
  CertChips,
  InitialsAvatar,
  YesNoPill,
} from "@/components/Admin/RequestBits";
import { resendCredentials } from "../actions";
import ResendLogin from "./ResendLogin";

const DAY_MS = 86_400_000;

export async function generateMetadata({ params }) {
  const { id } = await params;
  return { title: `Request #${id} | Iraje Admin` };
}

// Label / value rows. `title` adds the uppercase heading used on a new
// request's cards; a decided request shows one flat card without it.
function Rows({ title, rows }) {
  const id = title
    ? `section-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`
    : undefined;
  return (
    <section
      aria-labelledby={id}
      aria-label={title ? undefined : "Request details"}
      className="border-mist overflow-hidden rounded-2xl border bg-white"
    >
      {title ? (
        <h2
          id={id}
          className="text-brand border-mist border-b px-5 py-3.5 text-[11px] font-semibold tracking-wide uppercase"
        >
          {title}
        </h2>
      ) : null}
      <dl className="divide-mist divide-y">
        {rows.map(([label, value, options]) => (
          <div
            key={label}
            className={`grid gap-1 px-5 py-3 text-sm sm:grid-cols-[220px_1fr] sm:gap-4 ${
              options?.highlight ? "bg-red-50/50" : ""
            }`}
          >
            <dt className="text-shuttle">{label}</dt>
            <dd className="text-ink font-medium wrap-break-word">
              {value === null || value === undefined || value === "" ? (
                <span className="text-slate-soft font-normal">—</span>
              ) : (
                value
              )}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

// /admin/enrollments/42 — everything one request said on the form. Approve /
// Reject happen from the list; the only action here is resending login details.
export default async function EnrollmentDetailPage({ params }) {
  await requireAdmin();

  const { id } = await params;
  const enrollmentId = Number(id);
  if (!Number.isInteger(enrollmentId) || enrollmentId <= 0) notFound();

  const e = await prisma.enrollment.findUnique({
    where: { id: enrollmentId },
    include: {
      reviewedBy: { select: { name: true, email: true } },
      user: {
        select: {
          name: true,
          email: true,
          mustChangePassword: true,
          tempPasswordExpiresAt: true,
          createdAt: true,
        },
      },
    },
  });
  if (!e) notFound();

  // One email = one account. If this email already has an account, its name
  // is the one used in emails and on certificates — warn when the name typed
  // on this request is different, so a "new" name isn't mistaken for a new person.
  const account = await prisma.user.findUnique({
    where: { email: e.email.trim().toLowerCase() },
    select: { name: true, role: true },
  });
  const sameName = (a, b) =>
    a.trim().replace(/\s+/g, " ").toLowerCase() ===
    b.trim().replace(/\s+/g, " ").toLowerCase();
  const nameMismatch =
    account?.role === "student" && !sameName(account.name, e.name);

  const now = Date.now();
  const decided = e.status !== "new";
  const codes = parseCertList(e.certifications).map(displayCertCode).join(", ");
  const reviewer = e.reviewedBy?.email ?? e.reviewedBy?.name ?? "—";
  const summary = decided
    ? [codes || null, `${e.status} ${formatDate(e.reviewedAt)} by ${reviewer}`]
    : [
        codes ? `Requested ${codes}` : null,
        `submitted ${formatRelative(e.createdAt, now)}`,
      ];

  // The linked account was made by this approval if it appeared within a
  // minute of the decision; otherwise the learner already had one.
  const accountCreated =
    e.user && e.reviewedAt
      ? Math.abs(new Date(e.user.createdAt) - new Date(e.reviewedAt)) < 60_000
      : false;
  const banner =
    e.status === "approved"
      ? {
          tone: "border-green-200 bg-green-50 text-green-800",
          badge: "bg-green-600",
          icon: FiCheck,
          title: "Request approved.",
          text: accountCreated
            ? `A learner account was created and login details were emailed to ${e.email}.`
            : e.user
              ? `${e.email} already had a learner account, so the certification was added to it.`
              : `Login details were emailed to ${e.email}.`,
        }
      : e.status === "rejected"
        ? {
            tone: "border-red-200 bg-red-50 text-red-800",
            badge: "bg-red-600",
            icon: FiX,
            title: "Request rejected.",
            text: e.rejectionReason
              ? `No learner account was created. The reason below was emailed to ${e.email}.`
              : `No learner account was created. ${e.email} was emailed.`,
          }
        : null;

  // Show the resend card only while the learner is still on a temporary
  // password. The last login email went out when that password was issued.
  const canResend =
    e.status === "approved" && e.user?.mustChangePassword === true;
  const lastEmailAt = e.user?.tempPasswordExpiresAt
    ? new Date(e.user.tempPasswordExpiresAt).getTime() -
      TEMP_PASSWORD_DAYS * DAY_MS
    : null;
  const firstName = (e.user?.name ?? e.name).trim().split(/\s+/)[0] || e.name;

  const yesNo = [
    ["Existing customer", <YesNoPill value={e.existingCustomer} />],
    ["Existing partner", <YesNoPill value={e.existingPartner} />],
  ];
  const requested = [
    "Certifications requested",
    <CertChips value={e.certifications} />,
  ];
  const submitted = ["Submitted", formatDate(e.createdAt, { withTime: true })];

  return (
    <div className="space-y-5">
      <Link
        href="/admin/enrollments"
        className="text-shuttle hover:text-brand inline-flex items-center gap-1.5 text-xs"
      >
        <FiArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
        All requests
      </Link>

      {banner ? (
        <div
          role="status"
          className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm ${banner.tone}`}
        >
          <span
            aria-hidden="true"
            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-white ${banner.badge}`}
          >
            <banner.icon className="h-3.5 w-3.5" />
          </span>
          <p>
            <span className="font-semibold">{banner.title}</span> {banner.text}
          </p>
        </div>
      ) : null}

      <header className="flex items-start gap-4">
        <InitialsAvatar name={e.name} className="h-12 w-12 text-sm" />
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-display text-ink text-2xl font-semibold tracking-tight sm:text-[28px]">
              <span className="text-shuttle font-normal">#{e.id}</span>
              <span className="text-shuttle font-normal"> · </span>
              {e.name}
            </h1>
            <StatusPill status={e.status} />
          </div>
          <p className="text-shuttle mt-1 text-sm">
            {summary.filter(Boolean).join(" · ")}
          </p>
        </div>
      </header>

      {nameMismatch && (
        <div
          role="alert"
          className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900"
        >
          <p className="font-semibold">
            ⚠️ Name doesn&apos;t match the existing account
          </p>
          <p className="mt-1">
            {`${e.email} already has a learner account under the name "${account.name}". This request says "${e.name}".`}
          </p>
          <p className="mt-1">
            {`Approving adds the certification to the existing account: emails and certificates will use "${account.name}".`}
          </p>
        </div>
      )}

      {decided ? (
        <Rows
          rows={[
            ["Email", e.email],
            ["Mobile", e.mobile],
            ["Organization", e.organization],
            ["Designation", e.designation],
            ["Country", e.country],
            ["Years of experience", e.experience],
            ["Technology domain", e.domain],
            ...yesNo,
            requested,
            submitted,
            [
              "Decided",
              `${formatDate(e.reviewedAt, { withTime: true })} by ${reviewer}`,
            ],
            ...(e.status === "rejected"
              ? [
                  [
                    "Reason for rejection",
                    e.rejectionReason,
                    { highlight: true },
                  ],
                ]
              : []),
          ]}
        />
      ) : (
        <>
          <Rows
            title="Contact"
            rows={[
              ["Email", e.email],
              ["Mobile", e.mobile],
              ["Country", e.country],
            ]}
          />
          <Rows
            title="Professional"
            rows={[
              ["Organization", e.organization],
              ["Designation", e.designation],
              ["Years of experience", e.experience],
              ["Technology domain", e.domain],
            ]}
          />
          <Rows
            title="Relationship & request"
            rows={[...yesNo, requested, submitted]}
          />
        </>
      )}

      {canResend ? (
        <ResendLogin
          firstName={firstName}
          lastEmailLabel={lastEmailAt ? formatRelative(lastEmailAt, now) : null}
          // .bind() fixes the request id into the action on the server, so
          // the browser never has to send it separately.
          action={resendCredentials.bind(null, e.id)}
        />
      ) : null}
    </div>
  );
}
