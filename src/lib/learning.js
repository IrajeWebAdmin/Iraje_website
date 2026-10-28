import { randomInt } from "node:crypto";

// The rules of the learning path, as plain functions with no database or
// Sanity calls — so they can be read, reasoned about and tested on their own.
// The pages and Server Actions fetch the data, then ask these functions what
// is allowed.

/**
 * Work out which modules are done, which one is next, and what is locked.
 *
 * modules:  from Sanity, in order — [{ _id, order, title, checkCount, ... }]
 * progress: rows from module_progress — [{ moduleId, readAt, checkPassedAt }]
 *
 * A module is COMPLETE when its PDF was read to the end AND (it has no
 * knowledge-check questions OR they were all answered correctly).
 * A module is UNLOCKED when it is the first one, or the one before is complete.
 * The exam unlocks only when every module is complete.
 */
export function buildOutline(modules, progress) {
  const byModule = new Map(progress.map((p) => [p.moduleId, p]));
  let previousComplete = true;

  const steps = modules.map((m) => {
    const p = byModule.get(m._id);
    const read = Boolean(p?.readAt);
    const checkPassed = m.checkCount === 0 || Boolean(p?.checkPassedAt);
    const complete = read && checkPassed;
    const unlocked = previousComplete;
    previousComplete = complete;

    return {
      ...m,
      read,
      checkPassed,
      complete,
      unlocked,
      state: complete ? "done" : unlocked ? "current" : "locked",
    };
  });

  const completed = steps.filter((s) => s.complete).length;
  return {
    steps,
    completed,
    total: steps.length,
    percent: steps.length ? Math.round((completed / steps.length) * 100) : 0,
    examUnlocked: steps.length > 0 && completed === steps.length,
  };
}

/** When the next attempt is allowed after a failed one (null = allowed now). */
export function retakeAvailableAt(lastFailedAt, waitDays, now = new Date()) {
  if (!lastFailedAt) return null;
  const at = new Date(new Date(lastFailedAt).getTime() + waitDays * 24 * 60 * 60 * 1000);
  return at > now ? at : null;
}

/**
 * Pick which question set (Set 1, Set 2, …) this attempt uses: a set the
 * learner hasn't sat yet if there is one, otherwise any set.
 */
export function chooseExamSet(availableSets, attemptedSets, rand = randomInt) {
  const sets = [...new Set(availableSets)].filter((s) => Number.isInteger(s));
  if (sets.length === 0) return null;
  const fresh = sets.filter((s) => !attemptedSets.includes(s));
  const pool = fresh.length ? fresh : sets;
  return pool[rand(pool.length)];
}

/** Fisher–Yates shuffle into a new array. */
export function shuffle(items, rand = randomInt) {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = rand(i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/**
 * Freeze the paper for one attempt: question order shuffled, option order
 * shuffled (except True/False, which always reads True then False). Only ids
 * and option keys are stored — the text is read from Sanity when shown.
 */
export function buildAttemptPaper(questions, rand = randomInt) {
  return shuffle(questions, rand).map((q) => {
    const keys = q.options.map((o) => o._key);
    return {
      id: q._id,
      options: q.questionType === "trueFalse" ? keys : shuffle(keys, rand),
    };
  });
}

/**
 * Mark answers. paper: [{ id }], answers: { [questionId]: optionKey },
 * answerKey: { [questionId]: correctOptionKey }.
 */
export function gradeAnswers(paper, answers, answerKey) {
  const total = paper.length;
  let score = 0;
  for (const q of paper) {
    if (answers?.[q.id] && answers[q.id] === answerKey[q.id]) score++;
  }
  return {
    score,
    total,
    percentage: total ? Math.round((score / total) * 100) : 0,
  };
}

// No 0/O or 1/I: certificate numbers are read off paper and typed by hand.
const CERT_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

/** e.g. "IRJ-PAM101-7K2Q-9XM4" — 8 random characters, about a trillion options. */
export function makeCertificateNumber(code, rand = randomInt) {
  let chars = "";
  for (let i = 0; i < 8; i++) chars += CERT_ALPHABET[rand(CERT_ALPHABET.length)];
  return `IRJ-${code}-${chars.slice(0, 4)}-${chars.slice(4)}`;
}

/** Tidy what someone typed into the Verify box: "irj-pam101-7k2q-9xm4 " -> "IRJ-PAM101-7K2Q-9XM4" */
export function normalizeCertificateNumber(raw) {
  const value = String(raw ?? "").trim().toUpperCase().replace(/\s+/g, "");
  return /^IRJ-[A-Z]{2,4}\d{3}-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(value) ? value : null;
}

export function addYears(date, years) {
  const d = new Date(date);
  d.setUTCFullYear(d.getUTCFullYear() + years);
  return d;
}
