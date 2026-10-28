// Rules for the learner dashboard as plain functions — no database or Sanity
// calls — so the card states, counters and the "up next" pick can be read and
// tested on their own. The page fetches, then asks these what to show.
//
// A "card" is { cert, enrolment, outline, state }:
//   cert       one row of CATALOG_QUERY (code, label, title, track, level, prerequisite, exam …)
//   enrolment  the learner's user_certifications row, or null when not enrolled
//   outline    buildOutline() result, or null when the course has no modules yet
//   state      one of the words from courseState()

export const TRACKS = {
  pam: {
    title: "Privileged Access Management",
    subtitle: "Iraje PAM certifications",
  },
  epm: {
    title: "Endpoint Privilege Management",
    subtitle: "Iraje EPM certifications",
  },
  cybertantra: { title: "CyberTantra", subtitle: "CyberTantra certifications" },
  iam: {
    title: "Identity & Access Management",
    subtitle: "Iraje IAM certifications",
  },
};
const TRACK_ORDER = Object.keys(TRACKS);

export const LEVEL_LABEL = {
  associate: "Associate",
  administrator: "Administrator",
  professional: "Professional",
};

/**
 * Where the learner stands with one certification:
 *   locked      not enrolled
 *   certified   enrolled and passed
 *   noContent   enrolled, but the course has no modules in Sanity yet
 *   examReady   every module complete, exam not passed yet
 *   inProgress  at least one module complete
 *   notStarted  enrolled, nothing done yet
 */
export function courseState(enrolment, outline) {
  if (!enrolment) return "locked";
  if (enrolment.status === "passed") return "certified";
  if (!outline) return "noContent";
  if (outline.examUnlocked) return "examReady";
  if (outline.completed > 0) return "inProgress";
  return "notStarted";
}

/** Cards grouped by track, PAM → EPM → CyberTantra → IAM, unknown tracks last. */
export function groupByTrack(cards) {
  const groups = new Map();
  for (const card of cards) {
    const key = card.cert.track ?? "other";
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(card);
  }
  const rank = (key) => {
    const i = TRACK_ORDER.indexOf(key);
    return i === -1 ? TRACK_ORDER.length : i;
  };
  return [...groups.entries()]
    .sort(([a], [b]) => rank(a) - rank(b) || a.localeCompare(b))
    .map(([track, items]) => ({
      track,
      ...(TRACKS[track] ?? { title: track, subtitle: "" }),
      items,
    }));
}

/** The one thing for the "Up next" banner: an exam that is ready, else a course to continue, else one to start. */
export function pickUpNext(cards) {
  for (const state of ["examReady", "inProgress", "notStarted"]) {
    const card = cards.find((c) => c.state === state);
    if (card) return card;
  }
  return null;
}

/** Numbers for the four stat tiles. */
export function countStates(cards) {
  const count = (state) => cards.filter((c) => c.state === state).length;
  return {
    enrolled: cards.filter((c) => c.enrolment).length,
    certified: count("certified"),
    examReady: count("examReady"),
    inProgress: count("inProgress"),
  };
}

/**
 * Where "Continue" / "Start" should land for a course: the module to read
 * next, the exam once every module is done, or the course root as a fallback.
 * Linking straight there avoids a server-side redirect on the course page.
 */
export function continueHref(outline, base) {
  if (!outline) return base;
  const current = outline.steps?.find((s) => s.state === "current");
  if (current) return `${base}/${current._id}`;
  return outline.examUnlocked ? `${base}/exam` : base;
}
