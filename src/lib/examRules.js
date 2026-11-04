// Exam rules read by both the server (enforcement) and the browser (copy), so
// what the instructions say is always what the exam engine does. No Node
// imports here — Client Components import this file too.

/** How long a learner waits after a failed attempt before the next one. */
export const RETAKE_WAIT_HOURS = 24;

/** The same wait in days, the unit retakeAvailableAt() works in. */
export const RETAKE_WAIT_DAYS = RETAKE_WAIT_HOURS / 24;

/** How the wait reads in the instructions: "24 hours", or "3 days" if it ever changes. */
export const RETAKE_WAIT_LABEL =
  RETAKE_WAIT_HOURS % 24 === 0 && RETAKE_WAIT_HOURS > 24
    ? `${RETAKE_WAIT_DAYS} days`
    : `${RETAKE_WAIT_HOURS} hours`;

/** The wait as a tile value: "24 hrs", or "3 days" if it ever changes. */
export const RETAKE_WAIT_SHORT =
  RETAKE_WAIT_HOURS % 24 === 0 && RETAKE_WAIT_HOURS > 24
    ? `${RETAKE_WAIT_DAYS} days`
    : `${RETAKE_WAIT_HOURS} hrs`;
