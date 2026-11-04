import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { prisma } from "@/lib/prisma";

// "Forgot password" links. Nothing is stored for them: a link is the user's
// id, an expiry time and a signature over both, keyed with the server secret
// mixed with the user's *current* password hash. Setting a new password
// changes that hash, so every outstanding link stops working the moment one
// of them is used — single use, with no table to clean up.
//
// Set AUTH_SECRET (any long random string) in .env and in production. Without
// it the signature rests on the password hash alone, which still keeps
// outsiders out but would let anyone who can read the database forge a link.

export const RESET_LINK_MINUTES = 60;

function keyFor(user) {
  return createHmac("sha256", process.env.AUTH_SECRET || "iraje-password-reset")
    .update(user.passwordHash)
    .digest();
}

function sign(user, expiresAt) {
  return createHmac("sha256", keyFor(user))
    .update(`${user.id}.${expiresAt}`)
    .digest("base64url");
}

/** A fresh link token for `user` (a full user row), good for RESET_LINK_MINUTES. */
export function issueResetToken(user, now = Date.now()) {
  const expiresAt = now + RESET_LINK_MINUTES * 60 * 1000;
  return `${user.id}.${expiresAt}.${sign(user, expiresAt)}`;
}

/**
 * The learner a link token belongs to, or null when the token is malformed,
 * expired, already used (the password changed since) or for an account that
 * cannot reset this way (admins, suspended accounts).
 */
export async function userForResetToken(token, now = Date.now()) {
  const [idPart, expiresPart, signature] = String(token ?? "").split(".");
  const id = Number(idPart);
  const expiresAt = Number(expiresPart);
  if (!Number.isInteger(id) || id <= 0) return null;
  if (!Number.isFinite(expiresAt) || expiresAt <= now) return null;
  if (!signature) return null;

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user || user.role !== "student" || user.status !== "active") return null;

  const expected = Buffer.from(sign(user, expiresAt));
  const given = Buffer.from(signature);
  if (expected.length !== given.length || !timingSafeEqual(expected, given))
    return null;
  return user;
}
