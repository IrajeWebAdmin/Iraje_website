import "server-only";
import { randomInt } from "node:crypto";
import bcrypt from "bcryptjs";

// bcrypt work factor: each +1 doubles the time to hash. 12 is ~250 ms on a
// normal server — slow enough to hurt someone guessing, fast enough for a login.
const BCRYPT_COST = 12;

// Temporary passwords are copied out of an email by a person, so leave out the
// characters that look alike: 0/O, 1/l/I.
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";

export const TEMP_PASSWORD_DAYS = 14;

/**
 * A random temporary password such as "Kx7m-Qp2r-Vt9w-Hn4j".
 * randomInt comes from Node's crypto module, so it is unpredictable —
 * Math.random() is not and must never be used for passwords.
 */
export function generateTempPassword() {
  const groups = [];
  for (let g = 0; g < 4; g++) {
    let group = "";
    for (let i = 0; i < 4; i++) group += ALPHABET[randomInt(ALPHABET.length)];
    groups.push(group);
  }
  return groups.join("-");
}

export function tempPasswordExpiry(from = new Date()) {
  return new Date(from.getTime() + TEMP_PASSWORD_DAYS * 24 * 60 * 60 * 1000);
}

export function hashPassword(password) {
  return bcrypt.hash(password, BCRYPT_COST);
}

export function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}

// Login compares against this when the email has no account, so a wrong email
// takes as long as a wrong password and response time can't reveal who exists.
let dummyHash;
export async function getDummyHash() {
  dummyHash ??= await bcrypt.hash("no-such-account", BCRYPT_COST);
  return dummyHash;
}

/** Rules for a password the user chooses. Returns an error string or null. */
export function validateNewPassword(password, confirm) {
  if (password.length < 10) return "Use at least 10 characters.";
  // bcrypt silently ignores everything after 72 bytes.
  if (Buffer.byteLength(password, "utf8") > 72)
    return "Use at most 72 characters.";
  if (password !== confirm) return "The two new passwords do not match.";
  return null;
}