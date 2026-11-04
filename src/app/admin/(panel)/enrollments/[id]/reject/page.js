import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { FiArrowLeft } from "react-icons/fi";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/dal";
import { parseCertList, displayCertCode } from "@/lib/certCodes";
import { CertChips, InitialsAvatar } from "@/components/Admin/RequestBits";
import { rejectFromPage } from "../../actions";
import RejectForm from "./RejectForm";

export async function generateMetadata({ params }) {
  const { id } = await params;
  return { title: `Reject request #${id} | Iraje Admin` };
}

// Ready-made reasons. The prerequisite one names the earlier certification
// when the request is for a 200-level course ("PAM 201" -> "PAM 101").
function reasonTemplates(codes) {
  const prerequisite = codes
    .map((code) => {
      const m = /^([A-Z]+)([2-9])(\d\d)$/i.exec(code);
      return m
        ? { course: code, needs: `${m[1].toUpperCase()}1${m[3]}` }
        : null;
    })
    .find(Boolean);
  const prerequisiteText = prerequisite
    ? `${displayCertCode(prerequisite.course)} requires the ${displayCertCode(prerequisite.needs)} certification. Please complete ${displayCertCode(prerequisite.needs)} first, then submit a new request.`
    : "This certification has a prerequisite that is not yet complete. Please complete the earlier certification first, then submit a new request.";

  return [
    {
      label: "Incomplete details",
      text: "The details on your request were incomplete. Please submit a new request with your full name, organisation, designation and a work email address.",
    },
    { label: "Prerequisite not met", text: prerequisiteText },
    {
      label: "Duplicate request",
      text: "We already have a request or an active enrolment for you for this certification, so this duplicate has been closed.",
    },
    {
      label: "Not eligible yet",
      text: "You are not yet eligible for this certification. Please write to contact@iraje.com if you would like to discuss eligibility.",
    },
    {
      label: "Use a work email",
      text: "Please submit a new request using your work email address rather than a personal one.",
    },
  ];
}

// /admin/enrollments/42/reject — the reason page behind the list's Reject
// button. Only a "new" request can be rejected; anything else goes back to
// the request page, which shows what was decided.
export default async function RejectRequestPage({ params }) {
  await requireAdmin();

  const { id } = await params;
  const enrollmentId = Number(id);
  if (!Number.isInteger(enrollmentId) || enrollmentId <= 0) notFound();

  const e = await prisma.enrollment.findUnique({
    where: { id: enrollmentId },
    select: {
      id: true,
      name: true,
      email: true,
      organization: true,
      certifications: true,
      status: true,
    },
  });
  if (!e) notFound();
  const requestHref = `/admin/enrollments/${e.id}`;
  if (e.status !== "new") redirect(requestHref);

  const templates = reasonTemplates(parseCertList(e.certifications));

  return (
    <div className="space-y-5">
      <Link
        href={requestHref}
        className="text-shuttle hover:text-brand inline-flex items-center gap-1.5 text-xs"
      >
        <FiArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
        Back to request #{e.id}
      </Link>

      <header>
        <p className="text-sm font-medium text-red-700">Reject request</p>
        <h1 className="font-display text-ink mt-1 text-2xl font-semibold tracking-tight sm:text-[28px]">
          Why are you rejecting this request?
        </h1>
        <p className="text-shuttle mt-2 text-sm">
          Your reason is included in the email to the applicant, so keep it
          clear and helpful.
        </p>
      </header>

      <div className="space-y-5">
        <div className="border-mist bg-catskill/70 flex flex-wrap items-center justify-between gap-3 rounded-2xl border px-4 py-3">
          <div className="flex min-w-0 items-center gap-3">
            <InitialsAvatar name={e.name} className="h-10 w-10 text-xs" />
            <div className="min-w-0 text-sm">
              <p className="truncate">
                <span className="text-shuttle">#{e.id} · </span>
                <span className="text-ink font-semibold">{e.name}</span>
              </p>
              <p className="text-shuttle truncate text-xs">
                {[e.email, e.organization].filter(Boolean).join(" · ")}
              </p>
            </div>
          </div>
          <CertChips value={e.certifications} />
        </div>

        <RejectForm
          templates={templates}
          cancelHref="/admin/enrollments"
          // .bind() fixes the request id into the action on the server, so
          // the browser never has to send it separately.
          action={rejectFromPage.bind(null, e.id)}
        />
      </div>
    </div>
  );
}
