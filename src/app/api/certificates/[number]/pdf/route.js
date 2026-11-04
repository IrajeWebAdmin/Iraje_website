import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/dal";
import { getSanityClient } from "@/lib/sanity/client";
import { normalizeCertificateNumber } from "@/lib/learning";
import { renderCertificatePdf } from "@/lib/certificatePdf";
import { learnerOrganization } from "@/lib/exam";

// GET /api/certificates/<number>/pdf — your own certificate again, as a
// download, or shown in the tab with ?view=1.
// The PDF is rebuilt from the database each time, so nothing extra is stored.
export async function GET(request, { params }) {
  const { number: raw } = await params;
  const number = normalizeCertificateNumber(raw);
  // ?view=1 opens the PDF in the tab (the result page's "View certificate");
  // the default is a download.
  const inline = new URL(request.url).searchParams.get("view") === "1";
  const user = await getCurrentUser();
  if (!user) return new Response("Sign in first.", { status: 401 });
  if (!number) return new Response("Not found.", { status: 404 });

  const cert = await prisma.certificate.findUnique({
    where: { certificateNo: number },
    include: { userCertification: { select: { userId: true } } },
  });
  if (
    !cert ||
    (cert.userCertification.userId !== user.id && user.role !== "admin")
  ) {
    return new Response("Not found.", { status: 404 });
  }

  const templateUrl = await getSanityClient().fetch(
    `*[_type == "certification" && code == $code][0].certificateTemplate.asset->url`,
    { code: cert.certificationCode },
  );
  const pdf = await renderCertificatePdf(
    cert,
    templateUrl ?? null,
    await learnerOrganization(cert.userCertification.userId),
  );

  return new Response(pdf, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `${inline ? "inline" : "attachment"}; filename="${cert.certificateNo}.pdf"`,
      "Cache-Control": "private, no-store",
    },
  });
}
