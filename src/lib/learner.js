import "server-only";
import { prisma } from "@/lib/prisma";
import { getSanityClient } from "@/lib/sanity/client";
import { COURSE_QUERY } from "@/lib/sanity/queries";
import { normalizeCertCode } from "@/lib/certCodes";
import { buildOutline } from "@/lib/learning";

/**
 * Everything one learner needs for one certification, or null if they are not
 * enrolled in it. Every learning page and action starts here, so "is this
 * learner allowed to see this course?" is answered in exactly one place.
 *
 * Returns { code, enrolment, cert, outline } — outline is null when the
 * certification has no course content in Sanity yet.
 */
export async function loadLearnerCourse(userId, rawCode) {
  const code = normalizeCertCode(rawCode);
  if (!code) return null;

  const enrolment = await prisma.userCertification.findUnique({
    where: { userId_certificationCode: { userId, certificationCode: code } },
    include: { progress: true },
  });
  if (!enrolment) return null;

  const cert = await getSanityClient().fetch(COURSE_QUERY, { code });
  if (!cert) return null;

  const modules = cert.course?.modules ?? [];
  const outline = modules.length ? buildOutline(modules, enrolment.progress) : null;
  return { code, enrolment, cert, outline };
}
