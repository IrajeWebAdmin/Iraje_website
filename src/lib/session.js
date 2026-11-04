import "server-only";
import { randomBytes, createHash } from "node:crypto";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { SESSION_COOKIE } from "@/lib/sessionCookie";

// How long a login lasts before the person must sign in again. Admins can
// approve accounts, so their sessions are kept short.
const SESSION_HOURS = { admin: 12, student: 24 * 7 };

/**
 * The browser holds the raw token; the database holds only its SHA-256.
 * Anyone who reads the sessions table therefore still can't log in as anyone.
 */
export function hashToken(token) {
  return createHash("sha256").update(token).digest("hex");
}

// "Keep me signed in" left unticked: the cookie ends when the browser closes,
// and the server forgets the session after this many hours regardless.
const BROWSER_SESSION_HOURS = 12;

/**
 * Sign `user` in on this browser. Call only from a Server Action.
 * persistent: false = "Keep me signed in" unticked (browser-session cookie).
 */
export async function createSession(user, { persistent = true } = {}) {
  const token = randomBytes(32).toString("base64url");
  const roleHours = SESSION_HOURS[user.role] ?? SESSION_HOURS.admin;
  const hours = persistent ? roleHours : Math.min(roleHours, BROWSER_SESSION_HOURS);
  const expiresAt = new Date(Date.now() + hours * 60 * 60 * 1000);

  await prisma.session.create({
    data: { id: hashToken(token), userId: user.id, expiresAt },
  });

  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true, // page JavaScript can't read it, so injected scripts can't steal it
    secure: process.env.NODE_ENV === "production", // HTTPS only in production
    sameSite: "lax", // not sent on requests other sites trigger in the background
    path: "/",
    // No `expires` = a browser-session cookie, deleted when the browser closes.
    ...(persistent && { expires: expiresAt }),
  });
}

/** Sign out this browser: delete its session row and its cookie. */
export async function deleteCurrentSession() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token) {
    await prisma.session.deleteMany({ where: { id: hashToken(token) } });
  }
  store.delete(SESSION_COOKIE);
}