import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/dal";
import { formatDate } from "@/lib/formatDate";
import {
  approveEnrollment,
  rejectEnrollment,
  resendCredentials,
} from "../actions";
import ReviewActions from "./ReviewActions";

const STATUS_STYLES = {
  new: "bg-amber-100 text-amber-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
};

// /admin/enrollments/42 — one request, with Accept / Reject.
export default async function EnrollmentDetailPage({ params }) {
  await requireAdmin();

  const { id } = await params;
  const enrollmentId = Number(id);
  if (!Number.isInteger(enrollmentId) || enrollmentId <= 0) notFound();

  const e = await prisma.enrollment.findUnique({
    where: { id: enrollmentId },
    include: {
      reviewedBy: { select: { name: true } },
      user: { select: { mustChangePassword: true } },
    },
  });
  if (!e) notFound();

  const rows = [
    ["Email", e.email],
    ["Mobile", e.mobile],
    ["Organization", e.organization],
    ["Designation", e.designation],
    ["Country", e.country],
    ["Years of experience", e.experience],
    ["Technology domain", e.domain],
    ["Existing customer", e.existingCustomer],
    ["Existing partner", e.existingPartner],
    ["Certifications requested", e.certifications],
    ["Submitted", formatDate(e.createdAt, { withTime: true })],
  ];
  if (e.status !== "new") {
    rows.push(["Decided", `${formatDate(e.reviewedAt, { withTime: true })} by ${e.reviewedBy?.name ?? "—"}`]);
  }
  if (e.status === "rejected") {
    rows.push(["Rejection reason", e.rejectionReason]);
  }

  return (
    <div className="max-w-3xl">
      <Link href="/admin/enrollments" className="text-sm text-shuttle hover:text-brand">
        ← All requests
      </Link>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-semibold">
          #{e.id} · {e.name}
        </h1>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${STATUS_STYLES[e.status] ?? "bg-mist"}`}>
          {e.status}
        </span>
      </div>

      <dl className="mt-6 divide-y divide-mist rounded-xl border border-mist bg-white">
        {rows.map(([label, value]) => (
          <div key={label} className="grid grid-cols-3 gap-4 px-4 py-3 text-sm">
            <dt className="font-medium text-shuttle">{label}</dt>
            <dd className="col-span-2 break-words">{value || "—"}</dd>
          </div>
        ))}
      </dl>

      {/* .bind() fixes the request id into each action on the server, so the
          browser never has to send it separately. */}
      <ReviewActions
        name={e.name}
        status={e.status}
        canResend={e.status === "approved" && e.user?.mustChangePassword === true}
        approveAction={approveEnrollment.bind(null, e.id)}
        rejectAction={rejectEnrollment.bind(null, e.id)}
        resendAction={resendCredentials.bind(null, e.id)}
      />
    </div>
  );
}