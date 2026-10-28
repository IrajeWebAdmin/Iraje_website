import { prisma } from "@/lib/prisma";
import { requireStudent } from "@/lib/dal";
import { getSanityClient } from "@/lib/sanity/client";
import { CATALOG_QUERY } from "@/lib/sanity/queries";
import { loadLearnerCourse } from "@/lib/learner";
import {
  courseState,
  groupByTrack,
  pickUpNext,
  countStates,
} from "@/lib/dashboard";
import PortalHeader from "@/components/Portal/PortalHeader";
import PortalSidebar from "@/components/Portal/PortalSidebar";
import UpNextBanner from "@/components/Portal/UpNextBanner";
import TrackSection from "@/components/Portal/TrackSection";

export const metadata = {
  title: "My dashboard | Iraje University",
  robots: { index: false, follow: false },
};

// Every certification is shown, grouped by track like a course catalogue. The
// learner's own carry a progress bar and an action; the rest are locked.
// Locking is enforced again on every course page and PDF request — a locked
// card here is only the visible part.
export default async function CertificationDashboardPage() {
  const user = await requireStudent();

  const [catalog, mine] = await Promise.all([
    getSanityClient().fetch(CATALOG_QUERY),
    prisma.userCertification.findMany({
      where: { userId: user.id },
      include: { certificate: { select: { certificateNo: true } } },
    }),
  ]);

  const outlines = Object.fromEntries(
    await Promise.all(
      mine.map(async (m) => [
        m.certificationCode,
        (await loadLearnerCourse(user.id, m.certificationCode))?.outline,
      ]),
    ),
  );
  const enrolled = new Map(mine.map((m) => [m.certificationCode, m]));
  const passedCodes = new Set(
    mine.filter((m) => m.status === "passed").map((m) => m.certificationCode),
  );

  const cards = catalog.map((cert) => {
    const enrolment = enrolled.get(cert.code) ?? null;
    const outline = outlines[cert.code] ?? null;
    return { cert, enrolment, outline, state: courseState(enrolment, outline) };
  });
  const tracks = groupByTrack(cards);
  const upNext = pickUpNext(cards);
  const stats = countStates(cards);
  const firstName = user.name.trim().split(/\s+/)[0] || user.name;

  const tiles = [
    { value: stats.enrolled, label: "Courses enrolled" },
    { value: stats.certified, label: "Certified" },
    { value: stats.examReady, label: "Exam ready" },
    { value: stats.inProgress, label: "In progress" },
  ];

  return (
    <div className="bg-catskill min-h-screen">
      <PortalHeader user={user} />

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:grid lg:grid-cols-[224px_minmax(0,1fr)] lg:items-start lg:gap-6 lg:px-8 lg:py-8">
        <PortalSidebar />

        <div className="mt-6 min-w-0 lg:mt-0">
          <p className="text-brand text-xs font-semibold">Student Dashboard</p>
          <h1 className="text-ink mt-1 text-3xl font-semibold">
            Welcome back, {firstName}
          </h1>
          <p className="text-shuttle mt-2 text-sm">
            Track your courses, take exams once modules are complete, and
            download your certificates.
          </p>

          {upNext && <UpNextBanner id="exams" card={upNext} />}

          <ul
            id="progress"
            className="mt-5 grid scroll-mt-24 grid-cols-2 gap-4 md:grid-cols-4"
          >
            {tiles.map((t) => (
              <li
                key={t.label}
                className="border-mist rounded-2xl border bg-white px-5 py-4"
              >
                <p className="text-brand text-2xl font-semibold">{t.value}</p>
                <p className="text-shuttle mt-1 text-xs">{t.label}</p>
              </li>
            ))}
          </ul>

          {/* #courses and #certifications are the same list — the sidebar
              links to both until they become pages of their own. */}
          <div id="courses" className="scroll-mt-24">
            <div id="certifications" className="mt-8 space-y-8">
              {tracks.map((group) => (
                <TrackSection
                  key={group.track}
                  group={group}
                  passedCodes={passedCodes}
                />
              ))}
              {tracks.length === 0 && (
                <p className="border-mist text-shuttle rounded-2xl border bg-white p-6 text-sm">
                  No certifications are open yet. Check back soon.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
