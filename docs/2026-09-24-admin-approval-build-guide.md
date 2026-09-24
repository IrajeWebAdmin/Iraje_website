# Build guide — Admin approval, learner login and dashboard

Written 2026-09-24 for building the certification approval flow yourself, one step at a time.
Every code file below was built and checked with a production build (`next build`) on a copy of this project before this guide was written.

---

## How to use this guide

- **Do the steps in order.** Later steps import files made in earlier ones.
- Each step has three parts: **what you're building (in plain words)**, **the code**, and **✅ check it works**. Don't move on until the check passes.
- Run every command in a terminal **inside the `frontend` folder** unless the step says otherwise.
- **Stop the dev server (`Ctrl + C`) before any `prisma` command.** On Windows, a running dev server locks Prisma's files and the command fails with `EPERM`.
- If something goes wrong, see [Troubleshooting](#troubleshooting) at the end.

---

## The big picture

```
Applicant fills the form on /certification
      │
      ▼
/api/enroll saves it in MySQL  (status = "new")
      │
      ▼
Email to contact@iraje.com: "New request from Priya — Review in admin panel"
      │
      ▼
Sharayu signs in at /admin/login → /admin/enrollments → opens Priya's request
      │
  ┌───┴─────────────────┐
Accept               Reject (+ optional reason)
  │                      │
  ▼                      ▼
Create learner account  status = "rejected"
+ temporary password     │
status = "approved"      ▼
  │                   "Sorry" email to Priya
  ▼
"Approved" email to Priya (login ID + temporary password)
  │
  ▼
Priya signs in at /certification/login → must set her own password → /certification/dashboard
```

### Words you'll meet

| Word | Plain meaning | Real example here |
|---|---|---|
| **Server Action** | A function that runs on the server but can be called straight from a form. A file that starts with `"use server"` is full of them. | `approveEnrollment()` runs when Sharayu clicks **Accept request**. |
| **Hash** (bcrypt) | A one-way scramble. You can check a password against it, but you can't turn it back into the password. | The `users` table stores `$2b$12$Qe…`, never `Kx7m-Qp2r-Vt9w-Hn4j`. |
| **Session** | "This browser is signed in as Priya." A random token lives in a cookie; its hash is stored in the `sessions` table. | Deleting Priya's session rows signs her out everywhere. |
| **Cookie** | A small value the browser sends back with every request to our site. | `iraje_session=Vf3k…` |
| **Transaction** | Several database changes that happen **all together or not at all**. | Create account + mark approved — never one without the other. |
| **Proxy** | A doorman that runs before pages load (Next.js 16 renamed "middleware" to "proxy"). | Visitors with no cookie are sent to the login page. |
| **DAL** (Data Access Layer) | The one file that decides who is signed in and what role they have. | `requireAdmin()` in `src/lib/dal.js`. |
| **Migration** | A saved SQL script that changes the database structure, so every copy of the database (your PC, production) changes the same way. | Adds the `users` and `sessions` tables. |

### Two kinds of user, one login system

| | Admin (Sharayu) | Learner (Priya) |
|---|---|---|
| Signs in at | `/admin/login` | `/certification/login` |
| Lands on | `/admin/enrollments` | `/certification/dashboard` |
| `role` in the `users` table | `admin` | `student` |
| Session length | 12 hours | 7 days |

An admin can't sign in on the learner page, and a learner can't sign in on the admin page. Both get "Invalid email or password".

### Files you'll create or change

```
frontend/
├── prisma/schema.prisma                              CHANGE  (Step 2)
├── prisma/migrations/<date>_add_users_sessions_review CREATED BY PRISMA (Step 2)
├── scripts/create-admin.mjs                          NEW     (Step 5)
├── .env / .env.example                               CHANGE  (Steps 6, 12)
├── cloudbuild.yaml                                   CHANGE  (Step 13)
└── src/
    ├── proxy.js                                      NEW     (Step 3)
    ├── lib/
    │   ├── password.js                               NEW     (Step 3)
    │   ├── sessionCookie.js                          NEW     (Step 3)
    │   ├── session.js                                NEW     (Step 3)
    │   ├── dal.js                                    NEW     (Step 3)
    │   ├── formatDate.js                             NEW     (Step 3)
    │   └── mailer.js                                 CHANGE  (Step 6)
    ├── components/Auth/
    │   ├── LoginForm.jsx                             NEW     (Step 4)
    │   ├── ChangePasswordForm.jsx                    NEW     (Step 4)
    │   └── LogoutButton.jsx                          NEW     (Step 4)
    └── app/
        ├── actions/auth.js                           NEW     (Step 4)
        ├── api/enroll/route.js                       CHANGE  (Step 10)
        ├── admin/
        │   ├── layout.js                             NEW     (Step 4)
        │   ├── page.js                               NEW     (Step 4)
        │   ├── login/page.js                         NEW     (Step 4)
        │   ├── change-password/page.js               NEW     (Step 4)
        │   └── (panel)/
        │       ├── layout.js                         NEW     (Step 7)
        │       └── enrollments/
        │           ├── page.js                       NEW     (Step 7)
        │           ├── actions.js                    NEW     (Step 8)
        │           └── [id]/
        │               ├── page.js                   NEW     (Step 8)
        │               └── ReviewActions.jsx         NEW     (Step 8)
        └── certification/
            ├── login/page.js                         NEW     (Step 9)
            ├── change-password/page.js               NEW     (Step 9)
            └── dashboard/page.js                     NEW     (Step 9)
```

> **Folder names with brackets.** `(panel)` in round brackets is a *route group*. It lets those pages share a layout but doesn't appear in the web address, so `admin/(panel)/enrollments/page.js` is still `/admin/enrollments`. `[id]` in square brackets is a *dynamic segment*: `admin/(panel)/enrollments/[id]/page.js` serves `/admin/enrollments/42`, `/admin/enrollments/43`, and so on.

---

## Step 0 — Housekeeping

**What:** remove the old unused Express server, and start a separate git branch so your work is easy to review or undo.

1. Remove the `Backend` folder. In a terminal at the **repository root** (`Iraje_Website`, not `frontend`):

   ```powershell
   git rm -r --cached -q Backend
   Remove-Item -Recurse -Force Backend
   ```

   The first line takes `Backend` out of git's list of files to commit. It holds a real database password in `Backend/.env`, which must never be committed. The second line deletes the folder. Nothing uses it: the site's backend is the Next.js app in `frontend`.

2. `frontend` is its own git repository. Start a branch there:

   ```powershell
   cd frontend
   git checkout -b feature/admin-approval
   ```

✅ **Check:** `git status` in `frontend` says `On branch feature/admin-approval`.

---

## Step 1 — Install the password library

**What:** `bcryptjs` does the one-way password scrambling. It's pure JavaScript, so it works the same on Windows and on Cloud Run's Linux.

```powershell
npm install bcryptjs
```

✅ **Check:** `package.json` now lists `"bcryptjs"` under `dependencies`.

---

## Step 2 — Database: users, sessions, and review details

**What:** two new tables and four new columns.

- `users` — everyone who can sign in (Sharayu and approved learners).
- `sessions` — one row per signed-in browser.
- New columns on `certification_enrollment`: **who** decided, **when**, the **rejection reason**, and **which account** was created.

### 2a. Edit `prisma/schema.prisma`

Find the end of the `Enrollment` model. It currently ends like this:

```prisma
  status    String    @default("new") @db.VarChar(20)
  createdAt DateTime? @default(now()) @map("created_at") @db.Timestamp(0)

  @@index([email])
  @@map("certification_enrollment")
}
```

Replace those lines with the following. This adds the new fields to `Enrollment` and the two new models after it:

```prisma
  status    String    @default("new") @db.VarChar(20)
  createdAt DateTime? @default(now()) @map("created_at") @db.Timestamp(0)

  // Filled in when an admin approves or rejects the request.
  reviewedAt      DateTime? @map("reviewed_at") @db.DateTime(0)
  reviewedById    Int?      @map("reviewed_by")
  reviewedBy      User?     @relation("EnrollmentReviewer", fields: [reviewedById], references: [id], onDelete: SetNull)
  rejectionReason String?   @map("rejection_reason") @db.VarChar(500)

  /// The learner account this request was approved into (null until approved).
  userId Int?  @map("user_id")
  user   User? @relation("EnrollmentLearner", fields: [userId], references: [id], onDelete: SetNull)

  @@index([email])
  @@index([status])
  @@map("certification_enrollment")
}

/// Anyone who can sign in: learners (role "student") and Iraje staff (role "admin").
model User {
  id           Int    @id @default(autoincrement())
  /// The login ID. Always stored lower-case.
  email        String @unique @db.VarChar(255)
  name         String @db.VarChar(120)
  /// bcrypt hash — the real password is never stored.
  passwordHash String @map("password_hash") @db.VarChar(255)
  role         String @default("student") @db.VarChar(20) // "student" | "admin"
  status       String @default("active") @db.VarChar(20) // "active" | "suspended"

  /// True while the account still has a temporary password.
  mustChangePassword    Boolean   @default(true) @map("must_change_password")
  tempPasswordExpiresAt DateTime? @map("temp_password_expires_at") @db.DateTime(0)

  createdAt DateTime @default(now()) @map("created_at") @db.DateTime(0)
  updatedAt DateTime @updatedAt @map("updated_at") @db.DateTime(0)

  sessions            Session[]
  enrollments         Enrollment[] @relation("EnrollmentLearner")
  reviewedEnrollments Enrollment[] @relation("EnrollmentReviewer")

  @@map("users")
}

/// One row per signed-in browser. Deleting a row signs that browser out.
model Session {
  /// SHA-256 of the cookie value, so a database leak can't be replayed as a login.
  id        String   @id @db.Char(64)
  userId    Int      @map("user_id")
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  expiresAt DateTime @map("expires_at") @db.DateTime(0)
  createdAt DateTime @default(now()) @map("created_at") @db.DateTime(0)

  @@index([userId])
  @@map("sessions")
}
```

**Reading it:**
- `@map("reviewed_at")` — in JavaScript you write `reviewedAt`; in MySQL the column is `reviewed_at`.
- `@relation(...)` — links two tables. `reviewedBy` points at the admin's row in `users`, and `user` points at the learner's row. There are two links between the same tables, so each has a name (`"EnrollmentReviewer"`, `"EnrollmentLearner"`) to tell them apart.
- `onDelete: SetNull` — if a user is ever deleted, the enrollment keeps its history and the link just becomes empty.
- `onDelete: Cascade` on `Session` — delete a user and their sessions go too.
- `@unique` on `email` — MySQL itself refuses a second account with the same email, even if our code had a bug.

### 2b. Create and apply the migration

Stop the dev server, then:

```powershell
npx prisma migrate dev --name add_users_sessions_review
```

This does three things:
1. writes a new folder `prisma/migrations/<timestamp>_add_users_sessions_review/migration.sql`
2. runs that SQL on your local database (the one in `DATABASE_URL`)
3. regenerates the Prisma client, so `prisma.user` and `prisma.session` exist in code

The SQL it writes should look like this. It was generated from the same schema on the test copy:

```sql
-- AlterTable
ALTER TABLE `certification_enrollment` ADD COLUMN `rejection_reason` VARCHAR(500) NULL,
    ADD COLUMN `reviewed_at` DATETIME(0) NULL,
    ADD COLUMN `reviewed_by` INTEGER NULL,
    ADD COLUMN `user_id` INTEGER NULL;

-- CreateTable
CREATE TABLE `users` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(255) NOT NULL,
    `name` VARCHAR(120) NOT NULL,
    `password_hash` VARCHAR(255) NOT NULL,
    `role` VARCHAR(20) NOT NULL DEFAULT 'student',
    `status` VARCHAR(20) NOT NULL DEFAULT 'active',
    `must_change_password` BOOLEAN NOT NULL DEFAULT true,
    `temp_password_expires_at` DATETIME(0) NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sessions` (
    `id` CHAR(64) NOT NULL,
    `user_id` INTEGER NOT NULL,
    `expires_at` DATETIME(0) NOT NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `sessions_user_id_idx`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `certification_enrollment_status_idx` ON `certification_enrollment`(`status`);

-- AddForeignKey
ALTER TABLE `certification_enrollment` ADD CONSTRAINT `certification_enrollment_reviewed_by_fkey` FOREIGN KEY (`reviewed_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `certification_enrollment` ADD CONSTRAINT `certification_enrollment_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sessions` ADD CONSTRAINT `sessions_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
```

> ⚠️ If Prisma says **"Drift detected"** and asks **"Do you want to reset the database? All data will be lost"**, answer **No** (`N`). It means your local database doesn't match the migration history, and resetting deletes every saved enrollment. Stop and ask for help instead.

✅ **Check:** open MySQL Workbench and look at your database. You should see the new `users` and `sessions` tables, and `certification_enrollment` should have `reviewed_at`, `reviewed_by`, `rejection_reason` and `user_id` columns. Your existing enrollment rows should all still be there, with `status = new`.

---

## Step 3 — The security building blocks

**What:** five small files that every later step uses. Nothing visible changes yet; this step puts the locks on the doors.

### `src/lib/password.js` — making and checking passwords

- `generateTempPassword()` makes passwords like `Kx7m-Qp2r-Vt9w-Hn4j`. It uses Node's **crypto** random generator (never `Math.random()`, which is predictable) and leaves out look-alike characters (0/O, 1/l/I) because people type these from an email.
- `hashPassword()` / `verifyPassword()` scramble a password and check one against its scramble.
- `getDummyHash()` handles a subtle attack. If "unknown email" answered faster than "wrong password", an attacker could time the replies to find out who has an account. So an unknown email is still checked against a dummy hash, which takes the same time.
- `validateNewPassword()` sets the rules for a password the user chooses: at least 10 characters, at most 72 bytes (bcrypt ignores anything longer), and both copies must match.

```js
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
```

`import "server-only"` at the top makes the build **fail** if a browser-side component ever imports this file. It's a safety net that keeps server code out of the browser.

### `src/lib/sessionCookie.js` — the cookie's name

```js
// Name of the login cookie. Kept in its own tiny file because src/proxy.js
// needs it too, and the proxy must not import the database code in session.js.
export const SESSION_COOKIE = "iraje_session";
```

### `src/lib/session.js` — signing in and out

- `createSession(user)` makes a 32-byte random token and saves its **SHA-256 hash** in the `sessions` table. The raw token goes in the browser cookie. If someone ever read the database, the hashes wouldn't let them sign in.
- The cookie options each block a specific attack. They're explained in the comments.

```js
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

/** Sign `user` in on this browser. Call only from a Server Action. */
export async function createSession(user) {
  const token = randomBytes(32).toString("base64url");
  const hours = SESSION_HOURS[user.role] ?? SESSION_HOURS.admin;
  const expiresAt = new Date(Date.now() + hours * 60 * 60 * 1000);

  await prisma.session.create({
    data: { id: hashToken(token), userId: user.id, expiresAt },
  });

  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true, // page JavaScript can't read it, so injected scripts can't steal it
    secure: process.env.NODE_ENV === "production", // HTTPS only in production
    sameSite: "lax", // not sent on requests other sites trigger in the background
    path: "/",
    expires: expiresAt,
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
```

### `src/lib/dal.js` — who is signed in?

This is **the real security check**. Every protected page and every admin action calls `requireAdmin()` or `requireStudent()`:
- no valid session → sent to the right login page
- wrong role (a learner opening `/admin/...`) → sent to the admin login page
- still on a temporary password → sent to change it first

`getCurrentUser()` is wrapped in `cache()`, so if the page and its layout both ask "who is this?", the database is queried once.

```js
import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { hashToken } from "@/lib/session";
import { SESSION_COOKIE } from "@/lib/sessionCookie";

// Data Access Layer: the one place that decides who is signed in. Every
// protected page and Server Action calls requireAdmin() or requireStudent().

// Where each kind of user signs in, changes password, and lands afterwards.
export const AREAS = {
  admin: {
    login: "/admin/login",
    changePassword: "/admin/change-password",
    home: "/admin/enrollments",
  },
  student: {
    login: "/certification/login",
    changePassword: "/certification/change-password",
    home: "/certification/dashboard",
  },
};

/**
 * The signed-in user, or null. Wrapped in cache() so a page that calls it
 * several times makes only one database query per request.
 * Selects only safe fields — the password hash never leaves this file.
 */
export const getCurrentUser = cache(async () => {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const session = await prisma.session.findUnique({
    where: { id: hashToken(token) },
    select: {
      expiresAt: true,
      user: {
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          status: true,
          mustChangePassword: true,
        },
      },
    },
  });

  if (!session || session.expiresAt <= new Date()) return null;
  if (session.user.status !== "active") return null;
  return session.user;
});

/**
 * Stop here unless the signed-in user has `role`. Sends everyone else to the
 * right login page, and anyone still on a temporary password to the
 * change-password page (unless that is the page asking).
 */
async function requireRole(role, { allowPasswordChange = false } = {}) {
  const user = await getCurrentUser();
  const area = AREAS[role];

  if (!user || user.role !== role) redirect(area.login);
  if (user.mustChangePassword && !allowPasswordChange) {
    redirect(area.changePassword);
  }
  return user;
}

export function requireAdmin(options) {
  return requireRole("admin", options);
}

export function requireStudent(options) {
  return requireRole("student", options);
}
```

### `src/proxy.js` — the doorman

It runs before `/admin/...`, `/certification/dashboard` and `/certification/change-password`. Visitors with **no cookie at all** are redirected straight to a login page. It doesn't open the database; Next.js's own guide says the proxy should only do quick checks. The real check is still `dal.js`.

> Note the location: `src/proxy.js`, next to `src/app`, **not** the project root. In this project the `app` folder is inside `src`, and Next.js looks for the proxy beside it.

```js
import { NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/sessionCookie";

// The doorman. Runs before every matched page and turns away visitors who have
// no login cookie at all. It does NOT check the cookie is valid — that needs
// the database and happens in src/lib/dal.js on every protected page. This only
// saves a round trip for people who are obviously logged out.
export function proxy(request) {
  if (request.cookies.has(SESSION_COOKIE)) return NextResponse.next();

  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }
  if (
    pathname.startsWith("/certification/dashboard") ||
    pathname === "/certification/change-password"
  ) {
    return NextResponse.redirect(new URL("/certification/login", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/certification/dashboard/:path*",
    "/certification/change-password",
  ],
};
```

### `src/lib/formatDate.js` — dates in India time

```js
// Dates shown to admins and in emails, always in India time so "24 Sep" means
// the same day for everyone regardless of where the server runs.
export function formatDate(value, { withTime = false } = {}) {
  if (!value) return "—";
  return new Date(value).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    ...(withTime && { hour: "2-digit", minute: "2-digit" }),
    timeZone: "Asia/Kolkata",
  });
}
```

✅ **Check:** `npm run dev` still starts, and the public site (`/`, `/certification`) works as before. Visiting `http://localhost:3000/admin` now redirects to `/admin/login`, which shows a 404 page for now. That's the doorman working; the page itself comes in the next step.

---

## Step 4 — Login, logout and change password

**What:** the Server Actions that sign people in and out, the forms that call them, and the admin login pages.

### `src/app/actions/auth.js` — the three actions

- `login(role, …)`:
  1. rate-limits (10 tries per 15 minutes per network)
  2. looks the email up
  3. always runs one bcrypt check (see "dummy hash" above)
  4. refuses the wrong role
  5. refuses an expired temporary password
  6. creates a session
  7. redirects
- `logout()` deletes this browser's session and cookie.
- `changePassword()` checks the current password, saves the new hash, clears the "must change password" flag, then **signs out every browser** and signs this one back in. If someone else knew the temporary password, they're kicked out.

```js
"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  verifyPassword,
  getDummyHash,
  hashPassword,
  validateNewPassword,
} from "@/lib/password";
import { createSession, deleteCurrentSession } from "@/lib/session";
import { getCurrentUser, AREAS } from "@/lib/dal";
import { createRateLimiter, clientIp } from "@/lib/rateLimit";

// Every function in a "use server" file can be called from the browser, so
// each one checks its own inputs and permissions — never trust the form.

// 10 sign-in attempts per 15 minutes per network, shared by both login pages.
const loginLimiter = createRateLimiter({ limit: 10, windowMs: 15 * 60 * 1000 });

/**
 * Sign in. `role` is bound by the page ("admin" or "student"), so the admin
 * page only lets admins in and the learner page only lets learners in.
 * Returns { error, email } for the form to show, or redirects on success.
 */
export async function login(role, _previousState, formData) {
  const area = AREAS[role];
  if (!area) return { error: "Invalid sign-in request." };

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  const limit = loginLimiter.check(clientIp({ headers: await headers() }));
  if (!limit.allowed) {
    const minutes = Math.max(1, Math.ceil(limit.retryAfterSeconds / 60));
    return {
      error: `Too many sign-in attempts. Please try again in ${minutes} minute${minutes === 1 ? "" : "s"}.`,
      email,
    };
  }

  if (!email || !password) {
    return { error: "Enter your email and password.", email };
  }

  const user = await prisma.user.findUnique({ where: { email } });

  // Always run one bcrypt comparison, even when the email is unknown.
  const passwordOk = await verifyPassword(
    password,
    user?.passwordHash ?? (await getDummyHash()),
  );

  // One message for every failure, so nobody can learn which emails exist.
  if (!user || !passwordOk || user.role !== role || user.status !== "active") {
    return { error: "Invalid email or password.", email };
  }

  if (
    user.mustChangePassword &&
    user.tempPasswordExpiresAt &&
    user.tempPasswordExpiresAt <= new Date()
  ) {
    return {
      error:
        "Your temporary password has expired. Please contact contact@iraje.com for a new one.",
      email,
    };
  }

  await createSession(user);
  // redirect() works by throwing, so it must stay outside any try/catch.
  redirect(user.mustChangePassword ? area.changePassword : area.home);
}

export async function logout() {
  const user = await getCurrentUser();
  await deleteCurrentSession();
  redirect(user?.role === "admin" ? AREAS.admin.login : AREAS.student.login);
}

/** Change password — used for the forced first change and any later change. */
export async function changePassword(_previousState, formData) {
  const user = await getCurrentUser();
  if (!user) redirect(AREAS.student.login);

  const current = String(formData.get("currentPassword") ?? "");
  const next = String(formData.get("newPassword") ?? "");
  const confirm = String(formData.get("confirmPassword") ?? "");

  const { passwordHash } = await prisma.user.findUniqueOrThrow({
    where: { id: user.id },
    select: { passwordHash: true },
  });
  if (!(await verifyPassword(current, passwordHash))) {
    return { error: "Your current password is incorrect." };
  }

  const problem = validateNewPassword(next, confirm);
  if (problem) return { error: problem };
  if (next === current) {
    return { error: "Choose a password different from your current one." };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash: await hashPassword(next),
      mustChangePassword: false,
      tempPasswordExpiresAt: null,
    },
  });

  // Sign out every browser (including any that knew the old password), then
  // sign this one back in.
  await prisma.session.deleteMany({ where: { userId: user.id } });
  await createSession(user);

  redirect(AREAS[user.role].home);
}
```

> **Why `redirect()` is never inside `try { … } catch`.** `redirect()` works by throwing a special error that Next.js catches. A `catch` block around it would swallow that error, and the redirect would silently not happen.

### `src/components/Auth/LoginForm.jsx`

A **client component** (`"use client"`), because it shows "Signing in…" and error messages as you type and submit. `useActionState` connects the form to the Server Action: whatever the action returns (like `{ error: "Invalid email or password." }`) becomes `state`.

```jsx
"use client";

import { useActionState } from "react";

// Email + password card shared by /admin/login and /certification/login.
// `action` is the login Server Action with the role already bound by the page.
export default function LoginForm({ action, title, subtitle }) {
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <div className="mx-auto w-full max-w-md rounded-2xl border border-mist bg-white p-8 shadow-sm">
      <h1 className="text-2xl font-semibold text-ink">{title}</h1>
      {subtitle && <p className="mt-1 text-sm text-shuttle">{subtitle}</p>}

      <form action={formAction} className="mt-6 space-y-4">
        <div>
          <label htmlFor="email" className="mb-1.5 block text-xs font-semibold text-ink">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="username"
            required
            defaultValue={state?.email ?? ""}
            className="w-full rounded-xl border border-mist px-3.5 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
          />
        </div>
        <div>
          <label htmlFor="password" className="mb-1.5 block text-xs font-semibold text-ink">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="w-full rounded-xl border border-mist px-3.5 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
          />
        </div>

        {state?.error && (
          <p role="alert" className="text-sm text-red-600">
            {state.error}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-navy disabled:opacity-60"
        >
          {pending ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}
```

### `src/components/Auth/ChangePasswordForm.jsx`

```jsx
"use client";

import { useActionState } from "react";
import { changePassword } from "@/app/actions/auth";

const FIELDS = [
  { name: "currentPassword", label: "Current (or temporary) password", autoComplete: "current-password" },
  { name: "newPassword", label: "New password (at least 10 characters)", autoComplete: "new-password" },
  { name: "confirmPassword", label: "Type the new password again", autoComplete: "new-password" },
];

// Used by /admin/change-password and /certification/change-password.
export default function ChangePasswordForm({ firstTime }) {
  const [state, formAction, pending] = useActionState(changePassword, undefined);

  return (
    <div className="mx-auto w-full max-w-md rounded-2xl border border-mist bg-white p-8 shadow-sm">
      <h1 className="text-2xl font-semibold text-ink">
        {firstTime ? "Set your password" : "Change password"}
      </h1>
      {firstTime && (
        <p className="mt-1 text-sm text-shuttle">
          You signed in with a temporary password. Choose your own to continue.
        </p>
      )}

      <form action={formAction} className="mt-6 space-y-4">
        {FIELDS.map((f) => (
          <div key={f.name}>
            <label htmlFor={f.name} className="mb-1.5 block text-xs font-semibold text-ink">
              {f.label}
            </label>
            <input
              id={f.name}
              name={f.name}
              type="password"
              autoComplete={f.autoComplete}
              required
              className="w-full rounded-xl border border-mist px-3.5 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
            />
          </div>
        ))}

        {state?.error && (
          <p role="alert" className="text-sm text-red-600">
            {state.error}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-navy disabled:opacity-60"
        >
          {pending ? "Saving…" : "Save password"}
        </button>
      </form>
    </div>
  );
}
```

### `src/components/Auth/LogoutButton.jsx`

Signing out is a small **form** with a button, not a plain link. Links can be triggered by other websites (for example, an image tag pointing at `/logout`); form posts from other sites are blocked.

```jsx
import { logout } from "@/app/actions/auth";

// A form, not a link: signing out changes data, so it must be a POST that
// another site can't trigger just by linking to it.
export default function LogoutButton({ className = "" }) {
  return (
    <form action={logout}>
      <button
        type="submit"
        className={`rounded-lg border border-mist px-3 py-1.5 text-sm text-ink transition hover:bg-catskill ${className}`}
      >
        Sign out
      </button>
    </form>
  );
}
```

### The admin pages

`src/app/admin/layout.js` — a plain grey background with no marketing navbar, and tells search engines not to list any admin page:

```js
// Shell for everything under /admin. No marketing navbar or footer — this is a
// staff tool. robots: tells search engines never to list these pages.
export const metadata = {
  title: "Iraje Admin",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }) {
  return <div className="min-h-screen bg-catskill text-ink antialiased">{children}</div>;
}
```

`src/app/admin/page.js` — `/admin` on its own goes to the queue:

```js
import { redirect } from "next/navigation";

// /admin on its own goes straight to the requests queue.
export default function AdminHome() {
  redirect("/admin/enrollments");
}
```

`src/app/admin/login/page.js` — `login.bind(null, "admin")` makes a copy of `login` with `role` fixed to `"admin"`. The page passes that copy to the form, so this page can only ever sign in admins.

```js
import { redirect } from "next/navigation";
import LoginForm from "@/components/Auth/LoginForm";
import { login } from "@/app/actions/auth";
import { getCurrentUser, AREAS } from "@/lib/dal";

export default async function AdminLoginPage() {
  // Already signed in as an admin? Skip the form.
  const user = await getCurrentUser();
  if (user?.role === "admin") {
    redirect(user.mustChangePassword ? AREAS.admin.changePassword : AREAS.admin.home);
  }

  return (
    <main className="flex min-h-screen items-center px-4 py-16">
      <LoginForm
        action={login.bind(null, "admin")}
        title="Iraje Admin"
        subtitle="Sign in to review certification requests."
      />
    </main>
  );
}
```

`src/app/admin/change-password/page.js` — `allowPasswordChange: true` tells `requireAdmin` not to redirect away from this page. Otherwise someone on a temporary password would bounce between pages forever.

```js
import ChangePasswordForm from "@/components/Auth/ChangePasswordForm";
import { requireAdmin } from "@/lib/dal";

export default async function AdminChangePasswordPage() {
  const user = await requireAdmin({ allowPasswordChange: true });

  return (
    <main className="flex min-h-screen items-center px-4 py-16">
      <ChangePasswordForm firstTime={user.mustChangePassword} />
    </main>
  );
}
```

✅ **Check:** `http://localhost:3000/admin/login` shows the sign-in card. Signing in with any email says **"Invalid email or password."**, because no accounts exist yet.

---

## Step 5 — Create Sharayu's admin account

**What:** there's no "sign up as admin" page, and there must never be one, or anyone could make themselves an admin. Instead, a one-time script run from your terminal creates the account.

### `scripts/create-admin.mjs`

```js
// Create the admin account, or give an existing admin a new temporary password.
//
// Run from the frontend/ folder:
//   node --env-file=.env scripts/create-admin.mjs Sharayu.Rokde@iraje.com "Sharayu Rokde"
//
// Prints a temporary password. The admin must change it at first sign-in.
//
// This is a plain Node script, not part of the Next.js app, so it cannot import
// from src/lib (those files use Next-only features). The password generator
// below deliberately matches src/lib/password.js.

import { randomInt } from "node:crypto";
import bcrypt from "bcryptjs";
import prismaPkg from "@prisma/client";

const { PrismaClient } = prismaPkg;
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
const TEMP_PASSWORD_DAYS = 14;

function generateTempPassword() {
  const groups = [];
  for (let g = 0; g < 4; g++) {
    let group = "";
    for (let i = 0; i < 4; i++) group += ALPHABET[randomInt(ALPHABET.length)];
    groups.push(group);
  }
  return groups.join("-");
}

const [, , rawEmail, ...nameParts] = process.argv;
const email = String(rawEmail ?? "").trim().toLowerCase();
const name = nameParts.join(" ").trim();

if (!email.includes("@") || !name) {
  console.error(
    'Usage: node --env-file=.env scripts/create-admin.mjs <email> "<Full Name>"',
  );
  process.exit(1);
}

const prisma = new PrismaClient();

try {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing && existing.role !== "admin") {
    console.error(`${email} already has a learner account — refusing to change it.`);
    process.exit(1);
  }

  const tempPassword = generateTempPassword();
  const data = {
    name,
    passwordHash: await bcrypt.hash(tempPassword, 12),
    mustChangePassword: true,
    tempPasswordExpiresAt: new Date(
      Date.now() + TEMP_PASSWORD_DAYS * 24 * 60 * 60 * 1000,
    ),
  };

  if (existing) {
    await prisma.user.update({ where: { id: existing.id }, data });
    // Sign the admin out everywhere, since the old password no longer works.
    await prisma.session.deleteMany({ where: { userId: existing.id } });
    console.log(`Reset the password for admin ${email}.`);
  } else {
    await prisma.user.create({ data: { ...data, email, role: "admin" } });
    console.log(`Created admin ${email}.`);
  }

  console.log(`Temporary password: ${tempPassword}`);
  console.log(`Sign in at /admin/login within ${TEMP_PASSWORD_DAYS} days.`);
} finally {
  await prisma.$disconnect();
}
```

The same script also **resets** an admin's password if it's ever forgotten: run it again with the same email.

Run it (stop the dev server first if Prisma complains):

```powershell
node --env-file=.env scripts/create-admin.mjs Sharayu.Rokde@iraje.com "Sharayu Rokde"
```

Output:

```
Created admin sharayu.rokde@iraje.com.
Temporary password: dZ5N-VqkN-p6iu-HnVn
Sign in at /admin/login within 14 days.
```

(The email is stored in lower case, so sign-in works however it's typed.)

> Give Sharayu the temporary password **by phone or Teams chat, not by email**. It's short-lived and she must change it at first sign-in, but it shouldn't sit in an inbox.

✅ **Check:**
1. `npm run dev`, then open `/admin/login` and sign in with `sharayu.rokde@iraje.com` and the temporary password.
2. You land on **Set your password**. Enter the temporary password, then a new one twice.
3. You're redirected to `/admin/enrollments`, which is a **404 for now**. That's expected; Step 7 builds it.
4. In MySQL Workbench, `SELECT * FROM users;` shows Sharayu with `must_change_password = 0`, and `password_hash` starts with `$2b$12$`.

---

## Step 6 — Email: switch from SMTP to Microsoft Graph

**What:** Microsoft 365 already rejects the site's SMTP password sign-in, and switches it off for good in 2026–27. The new mailer sends through **Microsoft Graph**, Microsoft's official API. The website signs in *as an app*, with no mailbox password.

Until your IT admin finishes their setup (see the separate IT instructions), use **console mode**: every email is printed in the terminal instead of being sent. That lets you build and test the whole flow today.

### 6a. Replace `src/lib/mailer.js` with this

What changed compared with the current file:
- `nodemailer` and SMTP are gone. `sendMail()` now either prints to the console or calls Graph.
- `getGraphToken()` gets an access token from Microsoft (it lasts about an hour, so it's reused).
- The team notification gains a **"Review in admin panel"** link. It's just a link: nothing is approved from the email.
- New: `sendApprovalEmail` / `buildApprovalEmail` and `sendRejectionEmail` / `buildRejectionEmail`.
- Everything a user typed goes through `escapeHtml()` before it's placed in an email, so a name like `<script>` shows as text instead of breaking the email.

```js
// ---- Transport ---------------------------------------------------------------
// MAIL_TRANSPORT=graph   -> send through Microsoft Graph as MAIL_FROM (production)
// MAIL_TRANSPORT=console -> print the email in the terminal instead (development)
// When unset: "graph" in production, "console" everywhere else.

async function sendMail({ to, subject, text, html, replyTo }) {
  const transport =
    process.env.MAIL_TRANSPORT ||
    (process.env.NODE_ENV === "production" ? "graph" : "console");

  if (transport === "console") {
    console.info(
      [`\n----- EMAIL (not sent: MAIL_TRANSPORT=console) -----`,
        `To:       ${to}`,
        `Reply-To: ${replyTo ?? "—"}`,
        `Subject:  ${subject}`,
        ``,
        text,
        `----------------------------------------------------\n`].join("\n"),
    );
    return;
  }
  if (transport !== "graph") {
    throw new Error(`Unknown MAIL_TRANSPORT "${transport}" — use "graph" or "console".`);
  }

  const from = process.env.MAIL_FROM;
  if (!from) throw new Error("MAIL_FROM is not set (e.g. inquiry@iraje.com).");

  const token = await getGraphToken();
  const res = await fetch(
    `https://graph.microsoft.com/v1.0/users/${encodeURIComponent(from)}/sendMail`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        message: {
          subject,
          body: { contentType: "HTML", content: html },
          toRecipients: [{ emailAddress: { address: to } }],
          ...(replyTo && { replyTo: [{ emailAddress: { address: replyTo } }] }),
        },
        saveToSentItems: true, // a copy appears in the mailbox's Sent Items
      }),
    },
  );
  // Graph answers 202 Accepted with an empty body when the mail is queued.
  if (res.status !== 202) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Graph sendMail failed (${res.status}): ${detail.slice(0, 500)}`);
  }
}

// An access token lasts about an hour; reuse it instead of asking every time.
let cachedToken = null; // { value, expiresAt }

async function getGraphToken() {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) {
    return cachedToken.value;
  }

  const { GRAPH_TENANT_ID, GRAPH_CLIENT_ID, GRAPH_CLIENT_SECRET } = process.env;
  if (!GRAPH_TENANT_ID || !GRAPH_CLIENT_ID || !GRAPH_CLIENT_SECRET) {
    throw new Error(
      "Microsoft Graph is not configured — set GRAPH_TENANT_ID, GRAPH_CLIENT_ID and GRAPH_CLIENT_SECRET.",
    );
  }

  // "Client credentials": the website signs in as itself (the app registered
  // in Entra ID), not as a person, so no one's mailbox password is involved.
  const res = await fetch(
    `https://login.microsoftonline.com/${encodeURIComponent(GRAPH_TENANT_ID)}/oauth2/v2.0/token`,
    {
      method: "POST",
      body: new URLSearchParams({
        client_id: GRAPH_CLIENT_ID,
        client_secret: GRAPH_CLIENT_SECRET,
        scope: "https://graph.microsoft.com/.default",
        grant_type: "client_credentials",
      }),
    },
  );
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.access_token) {
    throw new Error(
      `Graph token request failed (${res.status}): ${data.error_description || data.error || "no details"}`,
    );
  }

  cachedToken = {
    value: data.access_token,
    expiresAt: Date.now() + Number(data.expires_in || 0) * 1000,
  };
  return cachedToken.value;
}

/** Full link to a page on this site, for use inside emails. */
function appUrl(path) {
  return new URL(path, process.env.APP_URL || "http://localhost:3000").toString();
}

// Optional fields (currently just the phone number) arrive as null when the
// enquirer left them blank — show a dash rather than the string "null".
function shown(value) {
  return value === null || value === undefined || value === "" ? "—" : value;
}

// Minimal HTML escaping so user input can't break the notification markup.
function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

/**
 * Notify the team about a new contact submission.
 * Throws if sending fails — the caller decides how to handle it (the API route
 * treats email as best-effort so a mail outage never loses a saved lead).
 */
export async function sendContactNotification(contact) {
  return sendMail({
    to: teamInbox(),
    replyTo: contact.email, // reply straight to the enquirer
    ...buildContactEmail(contact),
  });
}

/** Both team notifications go to the same inbox (contact@iraje.com in production). */
function teamInbox() {
  const to = process.env.CONTACT_TO;
  if (!to) throw new Error("CONTACT_TO is not set (e.g. contact@iraje.com).");
  return to;
}

/**
 * Build the contact notification body. Split out from the send so the exact
 * subject/text/html can be rendered and checked without an SMTP server.
 */
export function buildContactEmail({
  id,
  name,
  contactNo,
  email,
  message,
  submittedAt = new Date().toISOString(),
}) {
  return {
    subject: `New contact enquiry from ${name}`,
    text: [
      `New Contact Us submission (#${id})`,
      ``,
      `Name:    ${name}`,
      `Email:   ${email}`,
      `Phone:   ${shown(contactNo)}`,
      ``,
      `Message:`,
      message,
      ``,
      `Submitted: ${submittedAt}`,
    ].join("\n"),
    html: `
      <h2 style="font-family:sans-serif">New Contact Us submission (#${id})</h2>
      <table cellpadding="6" style="border-collapse:collapse;font-family:sans-serif">
        <tr><td><strong>Name</strong></td><td>${escapeHtml(name)}</td></tr>
        <tr><td><strong>Email</strong></td><td>${escapeHtml(email)}</td></tr>
        <tr><td><strong>Phone</strong></td><td>${escapeHtml(shown(contactNo))}</td></tr>
      </table>
      <p style="font-family:sans-serif"><strong>Message</strong></p>
      <p style="white-space:pre-wrap;font-family:sans-serif">${escapeHtml(message)}</p>
      <hr />
      <p style="color:#888;font-family:sans-serif">Submitted ${submittedAt}</p>
    `,
  };
}

/**
 * Notify the team about a new certification enrolment request.
 *
 * Deliberately built to the same shape as sendContactNotification above — same
 * recipient, same heading/table/rule/footer layout — so both land in the
 * contact inbox looking like one family of messages. Only the rows differ.
 */
export async function sendEnrollmentNotification(enrollment) {
  return sendMail({
    to: teamInbox(),
    replyTo: enrollment.email, // reply straight to the applicant
    ...buildEnrollmentEmail({
      ...enrollment,
      reviewUrl: appUrl(`/admin/enrollments/${enrollment.id}`),
    }),
  });
}

/**
 * Build the enrolment notification body — same split as buildContactEmail, so
 * both layouts can be rendered side by side and checked without sending.
 */
export function buildEnrollmentEmail({
  id,
  name,
  email,
  mobile,
  organization,
  designation,
  country,
  experience,
  domain,
  existingCustomer,
  existingPartner,
  certifications,
  reviewUrl,
  submittedAt = new Date().toISOString(),
}) {
  // Same label/value pairs drive the plain-text and HTML bodies, so the two
  // can't drift apart as fields are added.
  const rows = [
    ["Name", name],
    ["Email", email],
    ["Mobile", mobile],
    ["Organization", organization],
    ["Designation", designation],
    ["Country", country],
    ["Years of experience", experience],
    ["Technology domain", domain],
    ["Existing customer", existingCustomer],
    ["Existing partner", existingPartner],
  ];

  const pad = Math.max(...rows.map(([label]) => label.length)) + 2;

  return {
    subject: `New certification enrolment from ${name}`,
    text: [
      `New Certification enrolment (#${id})`,
      ``,
      ...rows.map(([label, value]) => `${(label + ":").padEnd(pad)}${shown(value)}`),
      ``,
      `Certifications requested:`,
      certifications,
      ``,
      `Review it in the admin panel: ${reviewUrl}`,
      ``,
      `Submitted: ${submittedAt}`,
    ].join("\n"),
    html: `
      <h2 style="font-family:sans-serif">New Certification enrolment (#${id})</h2>
      <table cellpadding="6" style="border-collapse:collapse;font-family:sans-serif">
        ${rows
          .map(
            ([label, value]) =>
              `<tr><td><strong>${label}</strong></td><td>${escapeHtml(shown(value))}</td></tr>`,
          )
          .join("\n        ")}
      </table>
      <p style="font-family:sans-serif"><strong>Certifications requested</strong></p>
      <p style="white-space:pre-wrap;font-family:sans-serif">${escapeHtml(certifications)}</p>
      <p style="font-family:sans-serif">${button(reviewUrl, "Review in admin panel")}</p>
      <hr />
      <p style="color:#888;font-family:sans-serif">Submitted ${submittedAt}</p>
    `,
  };
}

// A link styled as a button. Emails can't run code — this just opens the page.
function button(href, label) {
  return `<a href="${escapeHtml(href)}" style="display:inline-block;background:#0451CC;color:#ffffff;padding:10px 18px;border-radius:8px;text-decoration:none;font-weight:600">${escapeHtml(label)}</a>`;
}

function formatEmailDate(date) {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  });
}

/** Tell an applicant they were approved, with their login details. */
export async function sendApprovalEmail(details) {
  return sendMail({
    to: details.email,
    ...buildApprovalEmail({ ...details, loginUrl: appUrl("/certification/login") }),
  });
}

/**
 * `tempPassword` is null when the learner already has a password of their own
 * (an earlier approval) — then the email says to use that instead.
 */
export function buildApprovalEmail({
  name,
  email,
  certifications,
  tempPassword,
  expiresAt,
  loginUrl,
}) {
  const subject = "Your Iraje certification request has been approved";

  const credentialsText = tempPassword
    ? [
        `Login page:         ${loginUrl}`,
        `Login ID:           ${email}`,
        `Temporary password: ${tempPassword}`,
        ``,
        `You'll be asked to choose your own password when you first sign in.`,
        `This temporary password expires on ${formatEmailDate(expiresAt)}.`,
      ]
    : [
        `Sign in at ${loginUrl} with your email (${email}) and your existing password.`,
      ];

  const credentialsHtml = tempPassword
    ? `
      <table cellpadding="6" style="border-collapse:collapse;font-family:sans-serif">
        <tr><td><strong>Login ID</strong></td><td>${escapeHtml(email)}</td></tr>
        <tr><td><strong>Temporary password</strong></td><td style="font-family:monospace;font-size:16px">${escapeHtml(tempPassword)}</td></tr>
      </table>
      <p style="font-family:sans-serif">${button(loginUrl, "Sign in")}</p>
      <p style="font-family:sans-serif">You'll be asked to choose your own password when you first sign in.
        This temporary password expires on <strong>${formatEmailDate(expiresAt)}</strong>.</p>`
    : `
      <p style="font-family:sans-serif">Sign in with your email (${escapeHtml(email)}) and your existing password.</p>
      <p style="font-family:sans-serif">${button(loginUrl, "Sign in")}</p>`;

  return {
    subject,
    text: [
      `Hi ${name},`,
      ``,
      `Your request for ${certifications} has been approved.`,
      ``,
      ...credentialsText,
      ``,
      `Questions? Write to contact@iraje.com.`,
      ``,
      `— Iraje University`,
    ].join("\n"),
    html: `
      <p style="font-family:sans-serif">Hi ${escapeHtml(name)},</p>
      <p style="font-family:sans-serif">Your request for <strong>${escapeHtml(certifications)}</strong> has been approved.</p>
      ${credentialsHtml}
      <hr />
      <p style="color:#888;font-family:sans-serif">Questions? Write to contact@iraje.com. — Iraje University</p>
    `,
  };
}

/** Tell an applicant their request was not approved. */
export async function sendRejectionEmail(enrollment) {
  return sendMail({ to: enrollment.email, ...buildRejectionEmail(enrollment) });
}

export function buildRejectionEmail({ name, certifications, rejectionReason }) {
  return {
    subject: "Update on your Iraje certification request",
    text: [
      `Hi ${name},`,
      ``,
      `Thank you for your interest in Iraje certification. Unfortunately, we are unable to approve your request for ${certifications} at this time.`,
      ...(rejectionReason ? [``, `Reason: ${rejectionReason}`] : []),
      ``,
      `If you have questions, write to contact@iraje.com.`,
      ``,
      `— Iraje University`,
    ].join("\n"),
    html: `
      <p style="font-family:sans-serif">Hi ${escapeHtml(name)},</p>
      <p style="font-family:sans-serif">Thank you for your interest in Iraje certification. Unfortunately, we are unable to approve your request for <strong>${escapeHtml(certifications)}</strong> at this time.</p>
      ${rejectionReason ? `<p style="font-family:sans-serif;white-space:pre-wrap"><strong>Reason:</strong> ${escapeHtml(rejectionReason)}</p>` : ""}
      <p style="font-family:sans-serif">If you have questions, write to contact@iraje.com.</p>
      <hr />
      <p style="color:#888;font-family:sans-serif">— Iraje University</p>
    `,
  };
}
```

### 6b. Remove the old SMTP library

```powershell
npm uninstall nodemailer
```

### 6c. Update your `.env`

Delete the `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS` and `CONTACT_FROM` lines, and add:

```ini
APP_URL="http://localhost:3000"
MAIL_TRANSPORT="console"
MAIL_FROM="inquiry@iraje.com"
CONTACT_TO="contact@iraje.com"
GRAPH_TENANT_ID=""
GRAPH_CLIENT_ID=""
GRAPH_CLIENT_SECRET=""
```

Make the same change in `.env.example`, which is the template that *is* committed:

```ini
# ---- Site address -----------------------------------------------------------
# Used to build links inside emails (login page, admin review page).
# Production: https://www.iraje.com (no trailing slash)
APP_URL="http://localhost:3000"

# ---- Email (Microsoft Graph) -----------------------------------------------
# "console" prints emails in the terminal instead of sending (development).
# "graph" sends through Microsoft 365. Unset = graph in production, console otherwise.
MAIL_TRANSPORT="console"
# Mailbox every email is sent FROM. The Entra app is only allowed to send as this one.
MAIL_FROM="inquiry@iraje.com"
# Team inbox that receives contact-form and certification-request notifications.
CONTACT_TO="contact@iraje.com"
# From the Entra ID app registration "Iraje Website Mailer" (IT admin provides these).
# GRAPH_CLIENT_SECRET is a secret: on Cloud Run keep it in Secret Manager.
GRAPH_TENANT_ID=""
GRAPH_CLIENT_ID=""
GRAPH_CLIENT_SECRET=""
```

✅ **Check:** restart `npm run dev`, then submit the enrollment form on `/certification`. The terminal prints:

```
----- EMAIL (not sent: MAIL_TRANSPORT=console) -----
To:       contact@iraje.com
Reply-To: priya@acmebank.com
Subject:  New certification enrolment from Priya Nair
...
Review it in the admin panel: http://localhost:3000/admin/enrollments/1
```

---

## Step 7 — The requests list

**What:** `/admin/enrollments`, a table of requests with **New / Approved / Rejected** tabs and a count on each.

### `src/app/admin/(panel)/layout.js` — the admin top bar

It shows the signed-in email, "Change password" and "Sign out". The layout **only displays** things and isn't the security check: layouts don't re-run on every click, so each page calls `requireAdmin()` itself.

```js
import Link from "next/link";
import LogoutButton from "@/components/Auth/LogoutButton";
import { getCurrentUser } from "@/lib/dal";

// Top bar for the signed-in admin pages. "(panel)" is a route group: the
// brackets keep it out of the URL, so this folder's pages are still /admin/...
//
// This layout only *displays* who is signed in. It is not the security check —
// layouts don't re-run on every navigation, so each page calls requireAdmin().
export default async function AdminPanelLayout({ children }) {
  const user = await getCurrentUser();

  return (
    <>
      <header className="border-b border-mist bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <div className="flex items-center gap-6">
            <Link href="/admin/enrollments" className="font-semibold text-brand">
              Iraje Admin
            </Link>
            <nav className="text-sm">
              <Link href="/admin/enrollments" className="text-ink hover:text-brand">
                Certification requests
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-3 text-sm text-shuttle">
            {user && <span className="hidden sm:inline">{user.email}</span>}
            <Link href="/admin/change-password" className="hover:text-brand">
              Change password
            </Link>
            <LogoutButton />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </>
  );
}
```

### `src/app/admin/(panel)/enrollments/page.js`

- `await searchParams` — in this version of Next.js, the `?status=new` part of the address arrives as a Promise, so it must be awaited.
- New requests are listed **oldest first** (a queue); decided ones newest first.
- `select: { … }` fetches only the columns the table needs.

```js
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/dal";
import { formatDate } from "@/lib/formatDate";

const TABS = [
  { key: "new", label: "New" },
  { key: "approved", label: "Approved" },
  { key: "rejected", label: "Rejected" },
];

// /admin/enrollments?status=new — the queue of certification requests.
export default async function EnrollmentsPage({ searchParams }) {
  await requireAdmin();

  // In this Next.js version searchParams is a Promise and must be awaited.
  const { status } = await searchParams;
  const active = TABS.some((t) => t.key === status) ? status : "new";

  const [enrollments, grouped] = await Promise.all([
    prisma.enrollment.findMany({
      where: { status: active },
      // New requests oldest-first (a queue); decided ones newest-first.
      orderBy: { createdAt: active === "new" ? "asc" : "desc" },
      take: 200,
      select: {
        id: true,
        name: true,
        email: true,
        organization: true,
        certifications: true,
        createdAt: true,
        reviewedAt: true,
      },
    }),
    prisma.enrollment.groupBy({ by: ["status"], _count: { _all: true } }),
  ]);

  const counts = Object.fromEntries(grouped.map((g) => [g.status, g._count._all]));

  return (
    <div>
      <h1 className="text-2xl font-semibold">Certification requests</h1>

      <div className="mt-6 flex gap-2 border-b border-mist">
        {TABS.map((tab) => (
          <Link
            key={tab.key}
            href={`/admin/enrollments?status=${tab.key}`}
            className={`-mb-px border-b-2 px-4 py-2 text-sm font-medium ${
              tab.key === active
                ? "border-brand text-brand"
                : "border-transparent text-shuttle hover:text-ink"
            }`}
          >
            {tab.label} ({counts[tab.key] ?? 0})
          </Link>
        ))}
      </div>

      {enrollments.length === 0 ? (
        <p className="mt-8 text-sm text-shuttle">No {active} requests.</p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-xl border border-mist bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-catskill text-xs text-shuttle uppercase">
              <tr>
                <th className="px-4 py-3">#</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Organization</th>
                <th className="px-4 py-3">Certifications</th>
                <th className="px-4 py-3">{active === "new" ? "Submitted" : "Decided"}</th>
              </tr>
            </thead>
            <tbody>
              {enrollments.map((e) => (
                <tr key={e.id} className="border-t border-mist hover:bg-catskill/60">
                  <td className="px-4 py-3 text-shuttle">{e.id}</td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/enrollments/${e.id}`} className="font-medium text-brand hover:underline">
                      {e.name}
                    </Link>
                    <div className="text-xs text-shuttle">{e.email}</div>
                  </td>
                  <td className="px-4 py-3">{e.organization}</td>
                  <td className="px-4 py-3">{e.certifications}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {formatDate(active === "new" ? e.createdAt : e.reviewedAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
```

✅ **Check:** signed in as Sharayu, `/admin/enrollments` shows your test request under **New (1)**. Clicking the name goes to `/admin/enrollments/1`, which is a 404 until the next step.

---

## Step 8 — Accept, Reject and Resend

**What:** the detail page, its buttons, and the three Server Actions behind them. This is the heart of the feature.

### `src/app/admin/(panel)/enrollments/actions.js`

Key ideas in `approveEnrollment`:

1. **`requireAdmin()` first.** A Server Action can be called by anyone who can reach the site, not just from our button. Without this line, anyone could approve themselves.
2. **Hash before the transaction.** bcrypt is slow on purpose (about 250 ms). Doing it outside the transaction keeps the database locked for as little time as possible.
3. **The "claim".** `updateMany({ where: { id, status: "new" } })` changes the row *only if it's still new*, and MySQL does that check-and-change in one step. If Sharayu double-clicks, or two tabs are open, exactly one Accept wins; the other gets "already decided".
4. **All together or not at all.** Claiming the request, creating the account and linking them run inside `prisma.$transaction`. If anything fails (including our own `ReviewError`), MySQL undoes all of it.
5. **Existing learners.** If Priya was approved earlier for PAM 101 and now asks for EPM 201:
   - if she already set her own password, it's **left alone** and the email says "use your existing password"
   - if she never signed in, she gets a **fresh** temporary password
6. **Email after the commit.** The approval is saved first. If the email then fails, the approval still stands and the admin sees a message telling them to use **Resend login details**.

`rejectEnrollment` uses the same claim, saves the optional reason (max 500 characters) and emails the applicant.

`resendCredentials` only works while the learner has never set their own password. It issues a new temporary password and signs out any old sessions.

```js
"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/dal";
import {
  generateTempPassword,
  hashPassword,
  tempPasswordExpiry,
} from "@/lib/password";
import { sendApprovalEmail, sendRejectionEmail } from "@/lib/mailer";

// Thrown inside a transaction to cancel it with a message the admin should see.
class ReviewError extends Error {}

function refresh(enrollmentId) {
  revalidatePath("/admin/enrollments");
  revalidatePath(`/admin/enrollments/${enrollmentId}`);
}

/**
 * Accept a request: create (or reuse) the learner account and email the login
 * details. `enrollmentId` is bound on the server by the detail page.
 */
export async function approveEnrollment(enrollmentId) {
  const admin = await requireAdmin();

  // Hash before the transaction: bcrypt is slow on purpose, and a database
  // transaction should hold its locks for as short a time as possible.
  const tempPassword = generateTempPassword();
  const tempHash = await hashPassword(tempPassword);
  const now = new Date();
  const expiresAt = tempPasswordExpiry(now);

  let result;
  try {
    // Everything inside $transaction happens together or not at all.
    result = await prisma.$transaction(async (tx) => {
      // "Claim" the request: this only matches while it is still "new", so if
      // two admins click Accept at once, exactly one of them wins.
      const claimed = await tx.enrollment.updateMany({
        where: { id: enrollmentId, status: "new" },
        data: { status: "approved", reviewedAt: now, reviewedById: admin.id },
      });
      if (claimed.count === 0) {
        throw new ReviewError("This request has already been decided. Refresh the page to see the result.");
      }

      const enrollment = await tx.enrollment.findUniqueOrThrow({ where: { id: enrollmentId } });
      const email = enrollment.email.trim().toLowerCase();

      let user = await tx.user.findUnique({ where: { email } });
      let sentPassword = null;

      if (!user) {
        user = await tx.user.create({
          data: {
            email,
            name: enrollment.name,
            passwordHash: tempHash,
            role: "student",
            mustChangePassword: true,
            tempPasswordExpiresAt: expiresAt,
          },
        });
        sentPassword = tempPassword;
      } else if (user.role !== "student") {
        throw new ReviewError("This email address belongs to an admin account, so it can't be approved as a learner.");
      } else if (user.mustChangePassword) {
        // Approved before but never signed in — their old temporary password
        // may be lost or expired, so issue a fresh one.
        await tx.user.update({
          where: { id: user.id },
          data: { passwordHash: tempHash, tempPasswordExpiresAt: expiresAt },
        });
        sentPassword = tempPassword;
      }
      // Otherwise they already have a password of their own: leave it alone.

      await tx.enrollment.update({
        where: { id: enrollmentId },
        data: { userId: user.id },
      });

      return { enrollment, email, sentPassword };
    });
  } catch (err) {
    if (err instanceof ReviewError) return { error: err.message };
    console.error("[admin] approve failed:", err);
    return { error: "Could not approve this request. Nothing was changed — please try again." };
  }

  refresh(enrollmentId);

  // The approval is saved. Email is sent after, and a failure doesn't undo it.
  try {
    await sendApprovalEmail({
      name: result.enrollment.name,
      email: result.email,
      certifications: result.enrollment.certifications,
      tempPassword: result.sentPassword,
      expiresAt,
    });
    return { message: `Approved. Login details were emailed to ${result.email}.` };
  } catch (err) {
    console.error("[admin] approval email failed:", err);
    return { error: 'Approved, but the email could not be sent. Use "Resend login details" once email is working.' };
  }
}

/** Reject a request, with an optional reason that goes into the email. */
export async function rejectEnrollment(enrollmentId, _previousState, formData) {
  const admin = await requireAdmin();

  const reason = String(formData.get("reason") ?? "").trim();
  if (reason.length > 500) {
    return { error: "Please keep the reason under 500 characters." };
  }

  let enrollment;
  try {
    const claimed = await prisma.enrollment.updateMany({
      where: { id: enrollmentId, status: "new" },
      data: {
        status: "rejected",
        rejectionReason: reason || null,
        reviewedAt: new Date(),
        reviewedById: admin.id,
      },
    });
    if (claimed.count === 0) {
      return { error: "This request has already been decided. Refresh the page to see the result." };
    }
    enrollment = await prisma.enrollment.findUniqueOrThrow({ where: { id: enrollmentId } });
  } catch (err) {
    console.error("[admin] reject failed:", err);
    return { error: "Could not reject this request. Please try again." };
  }

  refresh(enrollmentId);

  try {
    await sendRejectionEmail(enrollment);
    return { message: `Rejected. ${enrollment.email} has been emailed.` };
  } catch (err) {
    console.error("[admin] rejection email failed:", err);
    return { error: "Rejected, but the email to the applicant could not be sent." };
  }
}

/** Give an approved learner who never signed in a new temporary password. */
export async function resendCredentials(enrollmentId) {
  await requireAdmin();

  const enrollment = await prisma.enrollment.findUnique({
    where: { id: enrollmentId },
    select: {
      name: true,
      status: true,
      certifications: true,
      user: { select: { id: true, email: true, mustChangePassword: true } },
    },
  });

  if (!enrollment || enrollment.status !== "approved" || !enrollment.user) {
    return { error: "Only approved requests have login details to resend." };
  }
  if (!enrollment.user.mustChangePassword) {
    return { error: "This learner has already set their own password." };
  }

  const tempPassword = generateTempPassword();
  const expiresAt = tempPasswordExpiry();

  try {
    await prisma.$transaction([
      prisma.user.update({
        where: { id: enrollment.user.id },
        data: { passwordHash: await hashPassword(tempPassword), tempPasswordExpiresAt: expiresAt },
      }),
      prisma.session.deleteMany({ where: { userId: enrollment.user.id } }),
    ]);
  } catch (err) {
    console.error("[admin] resend failed:", err);
    return { error: "Could not create new login details. Please try again." };
  }

  try {
    await sendApprovalEmail({
      name: enrollment.name,
      email: enrollment.user.email,
      certifications: enrollment.certifications,
      tempPassword,
      expiresAt,
    });
    return { message: `New login details were emailed to ${enrollment.user.email}.` };
  } catch (err) {
    console.error("[admin] resend email failed:", err);
    return { error: "The password was reset, but the email could not be sent. Try again once email is working." };
  }
}
```

### `src/app/admin/(panel)/enrollments/[id]/page.js`

- `await params` — the `42` from `/admin/enrollments/42`, also a Promise in this Next.js version.
- `notFound()` for anything that isn't a positive whole number, or doesn't exist.
- `approveEnrollment.bind(null, e.id)` — fixes the request id into the action on the server, the same trick as the login role.

```js
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
```

### `src/app/admin/(panel)/enrollments/[id]/ReviewActions.jsx`

- A client component with one `useActionState` per button, so each shows its own "Approving…" text and result message.
- `window.confirm(...)` asks "Are you sure?". Clicking **Cancel** calls `event.preventDefault()`, which stops the form from submitting.
- After an action, the page re-renders with the new status, and the buttons are replaced by the result.

```jsx
"use client";

import { useActionState } from "react";

// Result message under the buttons: green for done, red for a problem.
function Result({ state }) {
  if (!state) return null;
  return (
    <p role="status" className={`mt-3 text-sm ${state.error ? "text-red-600" : "text-green-700"}`}>
      {state.error ?? state.message}
    </p>
  );
}

// Ask "are you sure?" before submitting; Cancel stops the action.
function confirmFirst(message) {
  return (event) => {
    if (!window.confirm(message)) event.preventDefault();
  };
}

export default function ReviewActions({
  name,
  status,
  canResend,
  approveAction,
  rejectAction,
  resendAction,
}) {
  const [approveState, approve, approving] = useActionState(approveAction, undefined);
  const [rejectState, reject, rejecting] = useActionState(rejectAction, undefined);
  const [resendState, resend, resending] = useActionState(resendAction, undefined);
  const busy = approving || rejecting || resending;

  if (status === "approved") {
    return (
      <section className="mt-8 rounded-xl border border-mist bg-white p-5">
        <Result state={approveState} />
        {canResend ? (
          <form action={resend} onSubmit={confirmFirst(`Send ${name} a NEW temporary password? The old one will stop working.`)}>
            <p className="text-sm text-shuttle">
              {name} hasn&apos;t set their own password yet.
            </p>
            <button
              type="submit"
              disabled={busy}
              className="mt-3 rounded-xl border border-brand px-4 py-2 text-sm font-semibold text-brand hover:bg-catskill disabled:opacity-60"
            >
              {resending ? "Sending…" : "Resend login details"}
            </button>
            <Result state={resendState} />
          </form>
        ) : (
          <p className="text-sm text-shuttle">{name} has signed in and set their own password.</p>
        )}
      </section>
    );
  }

  if (status !== "new") {
    return <Result state={rejectState} />;
  }

  return (
    <section className="mt-8 grid gap-4 sm:grid-cols-2">
      <form
        action={approve}
        onSubmit={confirmFirst(`Approve ${name}? An account will be created and login details emailed to them.`)}
        className="rounded-xl border border-mist bg-white p-5"
      >
        <h2 className="font-semibold">Accept</h2>
        <p className="mt-1 text-sm text-shuttle">
          Creates a learner account and emails the login ID and a temporary password.
        </p>
        <button
          type="submit"
          disabled={busy}
          className="mt-4 w-full rounded-xl bg-green-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-60"
        >
          {approving ? "Approving…" : "Accept request"}
        </button>
        <Result state={approveState} />
      </form>

      <form
        action={reject}
        onSubmit={confirmFirst(`Reject ${name}'s request? They will be emailed.`)}
        className="rounded-xl border border-mist bg-white p-5"
      >
        <h2 className="font-semibold">Reject</h2>
        <label htmlFor="reason" className="mt-1 block text-sm text-shuttle">
          Reason (optional — included in the email to the applicant)
        </label>
        <textarea
          id="reason"
          name="reason"
          rows={3}
          maxLength={500}
          className="mt-2 w-full rounded-xl border border-mist px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
        />
        <button
          type="submit"
          disabled={busy}
          className="mt-3 w-full rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
        >
          {rejecting ? "Rejecting…" : "Reject request"}
        </button>
        <Result state={rejectState} />
      </form>
    </section>
  );
}
```

✅ **Check (Accept):**
1. Open your test request and click **Accept request** → **OK**.
2. The status badge turns green (**approved**) and the message says "Approved. Login details were emailed to …".
3. The terminal prints the approval email with a temporary password. **Copy it**; you need it in Step 9.
4. In MySQL: `SELECT * FROM users;` has a new `student` row, and the enrollment has `status = approved`, `reviewed_by` = Sharayu's id, and `user_id` = the new user's id.

✅ **Check (Reject):** submit a second test request, open it, type a reason, click **Reject request** → **OK**. The terminal prints the "Update on your Iraje certification request" email including the reason, and **no** new row appears in `users`.

✅ **Check (double-click protection):** open the same *new* request in two browser tabs. Accept in the first tab, then Accept in the second. The second says **"This request has already been decided."**

---

## Step 9 — The learner pages

**What:** the learner's login page, forced password change, and a first version of the dashboard. These pages live inside `/certification`, so they get the Iraje University navbar and footer automatically from the existing `certification/layout.js`.

`src/app/certification/login/page.js`:

```js
import { redirect } from "next/navigation";
import LoginForm from "@/components/Auth/LoginForm";
import { login } from "@/app/actions/auth";
import { getCurrentUser, AREAS } from "@/lib/dal";

export const metadata = {
  title: "Sign in | Iraje University",
  robots: { index: false, follow: false },
};

export default async function CertificationLoginPage() {
  const user = await getCurrentUser();
  if (user?.role === "student") {
    redirect(user.mustChangePassword ? AREAS.student.changePassword : AREAS.student.home);
  }

  return (
    <section className="bg-catskill px-4 py-20">
      <LoginForm
        action={login.bind(null, "student")}
        title="Sign in to Iraje University"
        subtitle="Use the login ID and password from your approval email."
      />
    </section>
  );
}
```

`src/app/certification/change-password/page.js`:

```js
import ChangePasswordForm from "@/components/Auth/ChangePasswordForm";
import { requireStudent } from "@/lib/dal";

export const metadata = {
  title: "Change password | Iraje University",
  robots: { index: false, follow: false },
};

export default async function CertificationChangePasswordPage() {
  const user = await requireStudent({ allowPasswordChange: true });

  return (
    <section className="bg-catskill px-4 py-20">
      <ChangePasswordForm firstTime={user.mustChangePassword} />
    </section>
  );
}
```

`src/app/certification/dashboard/page.js` — lists the learner's approved certifications. Courses, exams and certificates come in later phases.

```js
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireStudent } from "@/lib/dal";
import LogoutButton from "@/components/Auth/LogoutButton";

export const metadata = {
  title: "My dashboard | Iraje University",
  robots: { index: false, follow: false },
};

// First version of the learner dashboard: who you are and what you're approved
// for. Courses, exams and certificates are added in later phases.
export default async function CertificationDashboardPage() {
  const user = await requireStudent();

  const approved = await prisma.enrollment.findMany({
    where: { userId: user.id, status: "approved" },
    orderBy: { reviewedAt: "asc" },
    select: { certifications: true },
  });

  // Each request stores codes as "PAM 101, EPM 201"; flatten and de-duplicate.
  const codes = [
    ...new Set(
      approved.flatMap((e) =>
        e.certifications.split(",").map((c) => c.trim()).filter(Boolean),
      ),
    ),
  ];

  return (
    <section className="bg-catskill px-4 py-16">
      <div className="mx-auto max-w-4xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold tracking-[0.14em] text-brand uppercase">
              Iraje University
            </p>
            <h1 className="mt-1 text-3xl font-semibold text-ink">Welcome, {user.name}</h1>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Link href="/certification/change-password" className="text-shuttle hover:text-brand">
              Change password
            </Link>
            <LogoutButton />
          </div>
        </div>

        <h2 className="mt-10 text-lg font-semibold text-ink">Your certifications</h2>
        {codes.length === 0 ? (
          <p className="mt-3 text-sm text-shuttle">No approved certifications yet.</p>
        ) : (
          <ul className="mt-4 grid gap-4 sm:grid-cols-2">
            {codes.map((code) => (
              <li key={code} className="rounded-2xl border border-mist bg-white p-5">
                <p className="text-lg font-semibold text-ink">{code}</p>
                <p className="mt-1 text-sm text-shuttle">Approved · course content coming soon</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
```

✅ **Check:**
1. In a **private/incognito window**, open `/certification/login` and sign in with the learner's email and the temporary password from Step 8.
2. You're sent to **Set your password**. Choose one.
3. You land on **Welcome, Priya Nair**, with **PAM 101** listed.
4. Now try `/admin/enrollments` in the same window. You're sent to the admin login, because learners can't get in.
5. **Sign out**, then open `/certification/dashboard`. You're sent to the login page.

---

## Step 10 — Security fix in `/api/enroll`

**What:** when saving fails, the enroll route currently sends database error details back to the browser. Anyone could read them. The full error still goes to the server log; the browser only gets a polite message.

In `src/app/api/enroll/route.js`, replace the whole `catch (err) { … }` block after `prisma.enrollment.create(...)` with:

```js
  } catch (err) {
    // Full error (stack, code frame, query) goes to the server log only —
    // never back to the browser, where it would reveal database details.
    console.error("[enroll] failed to save submission:", err);

    return NextResponse.json(
      { ok: false, error: "Could not submit your request. Please try again." },
      { status: 500, headers: rateLimitHeaders(limit) },
    );
  }
```

✅ **Check:** the form still submits normally.

---

## Step 11 — Full test checklist

Do all of these once, in order, with the dev server running and `MAIL_TRANSPORT="console"`.

| # | Do this | Expected |
|---|---|---|
| 1 | Submit the form on `/certification` | Terminal shows the team email with a "Review" link |
| 2 | Open the link while signed out | Redirected to `/admin/login` |
| 3 | Sign in as Sharayu | Requests list, **New** tab shows the request |
| 4 | Accept it | Green "approved"; terminal shows the approval email with a temporary password |
| 5 | Accept the same request again (second tab) | "Already decided"; no second account |
| 6 | Submit and **reject** another request with a reason | Rejection email with the reason; no account |
| 7 | Sign in on `/certification/login` with the temporary password | Forced to set a password, then dashboard |
| 8 | As the learner, open `/admin/enrollments` | Sent to admin login |
| 9 | As Sharayu, try `/certification/login` | "Invalid email or password" |
| 10 | Enter a wrong password 11 times quickly | "Too many sign-in attempts…" |
| 11 | Approve a new request, then click **Resend login details** before the learner signs in | New password emailed; the old one no longer works |
| 12 | In MySQL: `UPDATE users SET temp_password_expires_at = UTC_TIMESTAMP() - INTERVAL 1 DAY WHERE email = '<learner>';` (Prisma stores times in UTC) then sign in with the temporary password | "Your temporary password has expired…" |
| 13 | Sign out | Back on the right login page; the Back button doesn't show the dashboard |
| 14 | `npx next build` (dev server stopped) | Build succeeds |

When everything passes, commit:

```powershell
git add -A
git commit -m "Add admin approval, learner login and dashboard"
```

---

## Step 12 — Turn on real email

Do this **after** your IT admin has finished their setup and sent you three values: **tenant ID**, **client ID**, and **client secret**.

1. In `.env`:

   ```ini
   MAIL_TRANSPORT="graph"
   GRAPH_TENANT_ID="<tenant ID from IT>"
   GRAPH_CLIENT_ID="<client ID from IT>"
   GRAPH_CLIENT_SECRET="<client secret from IT>"
   ```

2. Restart the dev server. Submit the form using **your own** email address, then accept it in the admin panel.

✅ **Check:**
- contact@iraje.com receives the notification.
- Your inbox receives the approval email **from inquiry@iraje.com**.
- A copy appears in inquiry@iraje.com's **Sent Items**.

If it fails, the terminal shows the reason. Common ones:

| Error in terminal | Meaning | Fix |
|---|---|---|
| `Graph token request failed (400/401): … AADSTS7000215` | Wrong client secret (often the secret's **ID** was copied instead of its **Value**) | Ask IT for the secret **Value** |
| `Graph token request failed … AADSTS90002` | Wrong tenant ID | Check `GRAPH_TENANT_ID` |
| `Graph sendMail failed (403): ErrorAccessDenied` | The app isn't yet allowed to send as inquiry@iraje.com | IT's permission can take **up to 2 hours** to apply. Wait, then ask IT to run the test command in their guide |
| `Graph sendMail failed (404)` | `MAIL_FROM` isn't a real mailbox | Check the spelling of `MAIL_FROM` |

---

## Step 13 — Deploy to Cloud Run

### 13a. Store the client secret in Google Secret Manager

The secret must never be committed or typed into `cloudbuild.yaml`. In PowerShell (with `gcloud` signed in to your project):

```powershell
"<client secret from IT>" | Out-File -NoNewline -Encoding ascii secret.txt
gcloud secrets create iraje-graph-client-secret --data-file=secret.txt
Remove-Item secret.txt
gcloud secrets add-iam-policy-binding iraje-graph-client-secret `
  --member="serviceAccount:iraje-run@PROJECT.iam.gserviceaccount.com" `
  --role="roles/secretmanager.secretAccessor"
```

(Replace `PROJECT` with your Google Cloud project ID. This must be the same service account as `_RUNTIME_SA` in `cloudbuild.yaml`.)

### 13b. Update `cloudbuild.yaml`

Your deploy step uses `--set-env-vars` and `--set-secrets`. These **replace every** environment variable on each deploy, so anything added by hand in the Cloud Run console would be wiped next time. The settings must live in this file.

In `substitutions:`, replace the three `_SMTP_…` lines and `_CONTACT_FROM` with:

```yaml
  _GRAPH_SECRET: iraje-graph-client-secret # holds GRAPH_CLIENT_SECRET

  # Microsoft Graph app "Iraje Website Mailer" — IDs from the IT admin.
  _GRAPH_TENANT_ID: "TENANT-ID"
  _GRAPH_CLIENT_ID: "CLIENT-ID"
  _APP_URL: https://www.iraje.com # used for links inside emails
  _CONTACT_TO: contact@iraje.com
  _MAIL_FROM: inquiry@iraje.com
```

In the `deploy` step, replace the `--set-secrets` and `--set-env-vars` lines with:

```yaml
      - --set-secrets=DATABASE_URL=${_DB_SECRET}:latest,GRAPH_CLIENT_SECRET=${_GRAPH_SECRET}:latest
      - --set-env-vars=MAIL_TRANSPORT=graph,MAIL_FROM=${_MAIL_FROM},CONTACT_TO=${_CONTACT_TO},APP_URL=${_APP_URL},GRAPH_TENANT_ID=${_GRAPH_TENANT_ID},GRAPH_CLIENT_ID=${_GRAPH_CLIENT_ID}
```

Fill in the real tenant ID and client ID. Unlike the secret, they're safe to commit. Also check that `_APP_URL` is the site's real address.

> **Heads-up, separate from this feature:** `--set-env-vars` also means the `SANITY_…` variables are **not** set on Cloud Run today. That doesn't matter yet (only `/dev/sanity-check` uses Sanity), but it will once course pages read from Sanity.

### 13c. Deploy

```powershell
gcloud builds submit --config cloudbuild.yaml
```

Cloud Build builds the image, then **runs the new migration on the production database** (the `migrate` step runs `prisma migrate deploy`), then deploys. If the migration fails, the deploy stops and the old site keeps running.

### 13d. Create Sharayu's admin account in production

The production database is on Cloud SQL, so connect to it through the **Cloud SQL Auth Proxy** from your PC:

```powershell
# Terminal 1 — leave this running
cloud-sql-proxy PROJECT:REGION:INSTANCE --port 3307

# Terminal 2 — in the frontend folder
$env:DATABASE_URL = "mysql://USER:PASSWORD@127.0.0.1:3307/DATABASE"
node scripts/create-admin.mjs Sharayu.Rokde@iraje.com "Sharayu Rokde"
Remove-Item Env:DATABASE_URL
```

(No `--env-file` here: `DATABASE_URL` comes from the line above, pointing at production.)

### 13e. Final live check

Repeat checks 1, 4, 6 and 7 from Step 11 on the live site, using your own email address as the applicant.

---

## Troubleshooting

| Problem | Likely cause | Fix |
|---|---|---|
| `EPERM: operation not permitted … query_engine` | Dev server is running during a Prisma command | Stop it (`Ctrl + C`), run the command again |
| `Property 'user' does not exist` / `prisma.user is undefined` | Prisma client not regenerated after the schema change | `npx prisma generate` |
| Redirect loop between `/admin/login` and `/admin/change-password` | `requireAdmin()` on the change-password page is missing `{ allowPasswordChange: true }` | Compare with Step 4 |
| Signed in, but every page sends you back to login | Cookie not set. In production this usually means the site isn't on HTTPS (`secure` cookies) | Use the `https://` address |
| 404 on `/admin/enrollments` | Folder name typo, e.g. `panel` without brackets, or `enrollment` without the `s` | Compare with the tree at the top |
| `You're importing a component that needs "server-only"` | A `"use client"` file imported `password.js`, `session.js` or `dal.js` | Only Server Components and Server Actions may import those |
| Emails print in the terminal in production | `MAIL_TRANSPORT` is `console` on Cloud Run | Check `cloudbuild.yaml` sets `MAIL_TRANSPORT=graph` |

---

## Not included yet (candidates for the next round)

- **Forgot password** for learners. For now, an admin uses **Resend login details** if the learner never signed in. Otherwise an admin can reset them by hand.
- **Adding more admins from the panel.** For now, run `scripts/create-admin.mjs` again with the new person's email.
- **Suspending a learner.** The `status` column exists (`active` / `suspended`) and sign-in already refuses suspended users, but there's no button yet.
- **Cleaning up old sessions.** Expired rows in `sessions` are ignored but not deleted. A monthly `DELETE FROM sessions WHERE expires_at < NOW();` is enough.
- **Audit log** beyond "who decided, and when", which is already stored on each request.
- **Real course content** on the dashboard: modules, PDFs, exams and certificates are the next phases in `docs/certification-architecture.md`.
