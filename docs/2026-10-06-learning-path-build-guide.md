# Build guide — Learning path, exam and certificates

Written 2026-10-06 for building the next phase yourself, one stage at a time. Follow it after the admin-approval guide (`2026-09-24-admin-approval-build-guide.md`).

**What you'll have at the end:**
- Each learner has a list of the certifications they're doing, which can grow over time.
- A Coursera-style dashboard: all courses shown, the learner's own ones open, the rest locked with **Request access**.
- PDFs unlock one at a time. Each PDF is shown **one page at a time** with **Previous / Next** buttons (no scrolling). On the last page the learner clicks **Mark as read**, then answers 2–3 questions (all correct) to unlock the next PDF.
- The final exam unlocks only after the last module. Each attempt uses one complete question **set** with a server-side timer. After a fail, the next attempt is allowed after 24 hours.
- On a pass, a certificate with a unique number like `IRJ-PAM101-7K2Q-9XM4` is generated on **your design**, emailed as a PDF, valid for 3 years, and checkable in the **Verify** box on `/certification`.
- PDFs are stored in **Google Drive**. Admins paste each PDF's Drive link on its module in **Sanity Studio**, and import **Excel question banks** in Studio too.

### How this guide was checked — please read

Unlike the last guide, the code here was **not** run through a full production build. The test copy of the project could not be set up this time. What **was** tested:

| Checked | How |
|---|---|
| Learning rules: lock order, exam unlock, 24-hour retake, set choice, shuffling, marking, certificate numbers | 21 automated tests, all passing |
| Excel import parser | A workbook laid out exactly like your *PAM 101 Set 4* paper (title rows, Q.No/Chapter/Type/Question/Option A–D/Marks, Answer Key sheet), plus deliberately broken rows |
| Every Sanity query (GROQ) | Run read-only against your real dataset |
| New database tables | `prisma validate` passed, and the migration SQL was generated |
| Studio UI components used by the import tool | Confirmed to exist in your installed Sanity version |
| Google Drive links | The website's ID extraction and Sanity's validation rule, tested on 7 link shapes: share links, `open?id=`, `uc?id=` (accepted), and folder links, Google Docs and `http://` (refused) |

**Not yet run anywhere:** the Next.js pages, the PDF viewer in a browser, the Studio import screen, the certificate PDF output, Graph email with an attachment, and downloading from Google Drive. Each stage has a **✅ check**. If a check fails, stop and paste the error; it's most likely a small fix.

---

## The big picture

```
Admin approves Priya for PAM101 (existing admin panel)
        │  creates a row in user_certifications  (Priya, PAM101, in_progress)
        ▼
Priya's dashboard ── PAM101 ▶ open     EPM101 🔒 [Request access]
        ▼
PAM101 outline:  ✓ Module 1 → ▶ Module 2 → 🔒 Module 3 … → 🔒 Final exam
        ▼
Module page: PDF, one page at a time [← Previous] Page 3 of 12 [Next →] → last page: [✓ Mark as read]
            → 2–3 questions, all correct → Module complete → next module
        ▼
Final exam: one random Set (e.g. Set 4: 60 questions, 90 min) → submit
        ├── < pass mark → "Retake from 7 Oct, 14:30" (24 h later)
        └── ≥ pass mark → certificate IRJ-PAM101-7K2Q-9XM4 created
                          → PDF on your design emailed to Priya
                          → Verify box on /certification shows "✓ Valid"
```

### Where things live

| What | Where | Why there |
|---|---|---|
| Certifications, courses, modules, questions, exam rules, certificate design | **Sanity** | Content editors manage it in Studio (Option A) |
| Who is doing what, progress, exam attempts, certificates | **MySQL** (Prisma) | Per-person records that change constantly |
| Module PDFs | **Google Drive**, kept **Restricted** and shared only with the website's Google service account. Sanity holds just the link | You keep using Drive as you do today. Paid material never gets a public link, and learners never see the Drive link |

### New words

| Word | Plain meaning |
|---|---|
| **Knowledge check** | The 2–3 questions right after a PDF ("formative assessment") |
| **Exam set** | One complete question paper, like your "Set 4". Each attempt uses one whole set |
| **Answer key** | Which option is correct. It **never** leaves the server; the browser only ever receives question text and options |
| **Service account** | A Google "robot" account that belongs to your website, e.g. `iraje-run@…iam.gserviceaccount.com`. You share the Drive folder with it like with a colleague, and it can then read the PDFs |
| **PDF.js** | Mozilla's library that draws a PDF page by page inside a web page, so the site can show one page at a time with Previous / Next buttons |

---

## Stage 0 — Before you start

1. **Branch** (in `frontend`):
   ```powershell
   git checkout -b feature/learning-path
   ```
2. **Install the new packages.** Stop both dev servers first (`Ctrl + C`); installing under a running server caused the Sanity errors last week.
   ```powershell
   cd C:\Users\user\Desktop\Iraje_Website\frontend
   npm install pdf-lib pdfjs-dist google-auth-library

   cd C:\Users\user\Desktop\Iraje_Website\sanity
   npm install read-excel-file
   ```
   | Package | Job |
   |---|---|
   | `pdf-lib` | Writes the name, number and dates onto your certificate design |
   | `pdfjs-dist` | PDF.js, the page-by-page reader |
   | `google-auth-library` | Lets the website sign in to Google Drive as its service account |
   | `read-excel-file` (sanity) | Reads your `.xlsx` inside Studio. It's already installed as a dev tool; this makes it a proper dependency |
3. **Have ready:**
   - your question bank `.xlsx` files (Sets 1–6 per course)
   - your certificate design as a **one-page PDF with blank spaces** for the name, number and dates
   - a **Google Drive folder** with the module PDFs. Suggested layout: one sub-folder per certification (`Iraje University/PAM101/Module 01 - Introduction to PAM.pdf` …)
   - access to the **Google Cloud project** that runs the website, for creating and using its service account

---

## Stage 1 — Database: who is doing which certification

### 1a. Add the tables

**Why a separate table, not a column on `users`:** one row per learner per certification. A second certification is just a second row, and each row can hold its own progress, attempts and certificate.

| id | user_id | certification_code | status | started_at | completed_at |
|---|---|---|---|---|---|
| 1 | 2 (Priya) | PAM101 | passed | 02 Oct | 20 Oct |
| 2 | 2 (Priya) | EPM201 | in_progress | 25 Oct | — |

In `frontend/prisma/schema.prisma`:

**(1)** Inside `model User { … }`, under the line `reviewedEnrollments Enrollment[] @relation("EnrollmentReviewer")`, add:

```prisma
  certifications      UserCertification[]
```

**(2)** At the **end** of the file, add the four new models:

```prisma
/// Which certification a learner is doing. One row per learner per
/// certification — a second approved certification is simply a second row.
model UserCertification {
  id                Int       @id @default(autoincrement())
  userId            Int       @map("user_id")
  user              User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  /// Canonical code, the same as in Sanity: "PAM101", "EPM201" …
  certificationCode String    @map("certification_code") @db.VarChar(10)
  status            String    @default("in_progress") @db.VarChar(20) // "in_progress" | "passed"
  startedAt         DateTime  @default(now()) @map("started_at") @db.DateTime(0)
  completedAt       DateTime? @map("completed_at") @db.DateTime(0)

  progress     ModuleProgress[]
  examAttempts ExamAttempt[]
  certificate  Certificate?

  @@unique([userId, certificationCode])
  @@index([certificationCode])
  @@map("user_certifications")
}

/// One row per module a learner has opened: when they finished the PDF and
/// when they passed its knowledge check.
model ModuleProgress {
  id                  Int               @id @default(autoincrement())
  userCertificationId Int               @map("user_certification_id")
  userCertification   UserCertification @relation(fields: [userCertificationId], references: [id], onDelete: Cascade)
  /// The module's Sanity _id.
  moduleId            String            @map("module_id") @db.VarChar(100)
  readAt              DateTime?         @map("read_at") @db.DateTime(0)
  checkPassedAt       DateTime?         @map("check_passed_at") @db.DateTime(0)

  @@unique([userCertificationId, moduleId])
  @@map("module_progress")
}

/// One sitting of the final exam.
model ExamAttempt {
  id                  Int               @id @default(autoincrement())
  userCertificationId Int               @map("user_certification_id")
  userCertification   UserCertification @relation(fields: [userCertificationId], references: [id], onDelete: Cascade)
  examSet             Int               @map("exam_set")
  /// The frozen paper: [{ id, options: [optionKey, …] }] in the order shown.
  paper               Json
  /// What the learner chose: { questionId: optionKey }.
  answers             Json?
  startedAt           DateTime          @default(now()) @map("started_at") @db.DateTime(0)
  deadlineAt          DateTime          @map("deadline_at") @db.DateTime(0)
  submittedAt         DateTime?         @map("submitted_at") @db.DateTime(0)
  score               Int?
  total               Int?
  percentage          Int?
  passed              Boolean?

  certificate Certificate?

  @@index([userCertificationId])
  @@map("exam_attempts")
}

/// An issued certificate. `certificateNo` is what people type into Verify.
model Certificate {
  id                  Int               @id @default(autoincrement())
  certificateNo       String            @unique @map("certificate_no") @db.VarChar(32)
  userCertificationId Int               @unique @map("user_certification_id")
  userCertification   UserCertification @relation(fields: [userCertificationId], references: [id], onDelete: Cascade)
  examAttemptId       Int               @unique @map("exam_attempt_id")
  examAttempt         ExamAttempt       @relation(fields: [examAttemptId], references: [id], onDelete: Cascade)
  /// Copied at issue time, so the certificate never changes if a name is edited later.
  holderName          String            @map("holder_name") @db.VarChar(120)
  certificationCode   String            @map("certification_code") @db.VarChar(10)
  certificationTitle  String            @map("certification_title") @db.VarChar(200)
  scorePercentage     Int               @map("score_percentage")
  issuedAt            DateTime          @default(now()) @map("issued_at") @db.DateTime(0)
  expiresAt           DateTime          @map("expires_at") @db.DateTime(0)
  status              String            @default("valid") @db.VarChar(20) // "valid" | "revoked"

  @@map("certificates")
}
```

**Reading it:**
- `@@unique([userId, certificationCode])` — MySQL itself refuses a second PAM101 row for the same person.
- `ModuleProgress.moduleId` stores the module's **Sanity id**. Modules live in Sanity, so this is a text link rather than a database link.
- `ExamAttempt.paper` is a **frozen copy** of the question order and option order shown, so marking always matches what the learner saw, even if someone edits a question during the exam.
- `Certificate` **copies** the name and title at issue time. A certificate must never change after it's issued.

### 1b. Migrate

Stop the dev server, then:

```powershell
npx prisma migrate dev --name learning_path
```

It should create **4 tables**: `user_certifications`, `module_progress`, `exam_attempts`, `certificates`. If it asks to **reset** the database, answer **N**.

### 1c. Turn certification codes into a standard form

Old requests store `"PAM 101"`, `"CyberTantra 101"` or `"CT101"`; Sanity uses `"PAM101"`. Create **`src/lib/certCodes.js`**:

```js
// Certification codes appear in three spellings in old requests — "PAM 101",
// "CyberTantra 101" and "CT101" — but Sanity and every new table use the
// canonical form "PAM101". Everything that stores or compares a code goes
// through normalizeCertCode() first.

const ALIASES = { CYBERTANTRA: "CT" };

/** "PAM 101" -> "PAM101", "CyberTantra 101" -> "CT101", "pam101" -> "PAM101". */
export function normalizeCertCode(raw) {
  const compact = String(raw ?? "").toUpperCase().replace(/[\s_-]+/g, "");
  const match = compact.match(/^([A-Z]+)(\d{3})$/);
  if (!match) return null;
  const [, letters, digits] = match;
  return (ALIASES[letters] ?? letters) + digits;
}

/** "PAM 101, EPM 201, CyberTantra 101" -> ["PAM101", "EPM201", "CT101"] */
export function parseCertList(value) {
  const codes = String(value ?? "")
    .split(",")
    .map(normalizeCertCode)
    .filter(Boolean);
  return [...new Set(codes)];
}
```

### 1d. Make Accept create the learning records

In `src/app/admin/(panel)/enrollments/actions.js`:

**(1)** Add to the imports at the top:

```js
import { parseCertList } from "@/lib/certCodes";
```

**(2)** In `approveEnrollment`, find:

```js
      await tx.enrollment.update({
        where: { id: enrollmentId },
        data: { userId: user.id },
      });
```

and add right **after** it (still inside the transaction):

```js
      // One learning record per approved certification. If Priya already has
      // PAM101 and is now approved for EPM201, she gets a second row.
      for (const code of parseCertList(enrollment.certifications)) {
        await tx.userCertification.upsert({
          where: { userId_certificationCode: { userId: user.id, certificationCode: code } },
          create: { userId: user.id, certificationCode: code },
          update: {},
        });
      }
```

Because it's inside the transaction, the approval and the learning records are created together or not at all.

### 1e. Records for people approved before today

Create **`scripts/backfill-user-certifications.mjs`**:

```js
// One-time: create learning records (user_certifications) for requests that were
// approved BEFORE this phase — for example Vanshika's. Safe to run more than once.
//
// Run from the frontend/ folder:
//   node --env-file=.env scripts/backfill-user-certifications.mjs

import prismaPkg from "@prisma/client";

const { PrismaClient } = prismaPkg;
const prisma = new PrismaClient();

// Same rules as src/lib/certCodes.js: "PAM 101" -> "PAM101", "CyberTantra 101" -> "CT101".
function normalizeCertCode(raw) {
  const compact = String(raw ?? "").toUpperCase().replace(/[\s_-]+/g, "");
  const match = compact.match(/^([A-Z]+)(\d{3})$/);
  if (!match) return null;
  return (match[1] === "CYBERTANTRA" ? "CT" : match[1]) + match[2];
}

try {
  const approved = await prisma.enrollment.findMany({
    where: { status: "approved", userId: { not: null } },
    select: { id: true, userId: true, certifications: true },
  });

  for (const e of approved) {
    const codes = [...new Set(e.certifications.split(",").map(normalizeCertCode).filter(Boolean))];
    for (const code of codes) {
      await prisma.userCertification.upsert({
        where: { userId_certificationCode: { userId: e.userId, certificationCode: code } },
        create: { userId: e.userId, certificationCode: code },
        update: {},
      });
      console.log(`request #${e.id}: user ${e.userId} -> ${code}`);
    }
  }
  console.log(`Done. Checked ${approved.length} approved request(s).`);
} finally {
  await prisma.$disconnect();
}
```

Run it once:

```powershell
node --env-file=.env scripts/backfill-user-certifications.mjs
```

✅ **Check:** the output lists your approved requests, for example `request #3: user 2 -> PAM101`, `user 2 -> EPM101` and `request #9: user 3 -> CT101`. In MySQL, `SELECT * FROM user_certifications;` shows those rows. Approve a new test request and its rows appear too.
 
---

## Stage 2 — Sanity: question types, sets, PDF links, certificate design

All edits are in the **`sanity`** folder.

### 2a. Questions: type, used for, exam set

In `schemaTypes/question.js`, inside the `fields: [ … ]` array, add these four fields. Put them right after the `status` field.

```js
    defineField({
      name: 'usedFor',
      title: 'Used for',
      description: 'Final exam questions are grouped into sets; knowledge checks appear after a module PDF.',
      type: 'string',
      group: 'classification',
      initialValue: 'exam',
      options: {
        list: [
          {title: 'Final exam', value: 'exam'},
          {title: 'Knowledge check (after a PDF)', value: 'knowledgeCheck'},
        ],
        layout: 'radio',
      },
      validation: (rule) =>
        rule.required().custom((value, {document}) =>
          value === 'knowledgeCheck' && !document?.module?._ref
            ? 'Knowledge-check questions need a Source module'
            : true,
        ),
    }),
    defineField({
      name: 'examSet',
      title: 'Exam set',
      description: 'Which question paper this belongs to (Set 1, Set 2, …). Each exam attempt uses one whole set.',
      type: 'number',
      group: 'classification',
      hidden: ({document}) => document?.usedFor !== 'exam',
      validation: (rule) =>
        rule.custom((value, {document}) =>
          document?.usedFor === 'exam' && !(Number.isInteger(value) && value >= 1)
            ? 'Exam questions need a set number (1, 2, 3 …)'
            : true,
        ),
    }),
    defineField({
      name: 'questionType',
      title: 'Question type',
      type: 'string',
      group: 'content',
      initialValue: 'mcq',
      options: {
        list: [
          {title: 'Multiple choice', value: 'mcq'},
          {title: 'True / False', value: 'trueFalse'},
          {title: 'Fill in the blank', value: 'fillBlank'},
        ],
        layout: 'radio',
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'sourceNo',
      title: 'Q.No in the source file',
      description: 'Filled in by Question import; used to update the same question on re-import.',
      type: 'number',
      group: 'classification',
      readOnly: true,
    }),
```

- **Used for**: `Final exam` (grouped in sets) or `Knowledge check` (tied to a module).
- **Exam set**: 1, 2, 3 … Only shown for exam questions.
- **Question type**: Multiple choice, True / False or Fill in the blank. All three are "pick one option", so your existing "exactly one correct option" rule already fits.
- **Q.No in the source file**: lets a re-import **update** questions instead of duplicating them.

### 2b. Modules: paste the Google Drive link of the PDF

In `schemaTypes/module.js`, **replace** the whole existing `storageKey` field (the `defineField({ name: 'storageKey', … })` block) with:

```js
    defineField({
      name: 'pdfDriveLink',
      title: 'Study material (Google Drive link)',
      description:
        'In Google Drive: right-click the PDF, then Share, then Copy link, and paste it here. Keep the file "Restricted" (do NOT choose "Anyone with the link"): the website reads it through its own Google account, and learners never see this link.',
      type: 'url',
      validation: (rule) =>
        rule.uri({scheme: ['https']}).custom((value) => {
          if (!value) return true
          return /^https:\/\/drive\.google\.com\/(file\/d\/[A-Za-z0-9_-]{10,}|(open|uc)\?([^#]*&)?id=[A-Za-z0-9_-]{10,})/.test(
            value,
          )
            ? true
            : 'Paste a Google Drive FILE link, e.g. https://drive.google.com/file/d/1AbC…/view'
        }),
    }),
```

**How it works, and why it stays private:**

| Step | Who | What happens |
|---|---|---|
| 1 | You, in Google Drive | The PDF sits in a folder shared **only** with the website's service account (set up in Stage 4). Sharing stays **Restricted** |
| 2 | Editor, in Sanity | Opens the module and pastes the PDF's Drive link into **Study material (Google Drive link)**, then **Publish** |
| 3 | Learner | Opens the module. The browser asks `/api/materials/<module>`, never Google |
| 4 | Website (server) | Checks the learner may see this module, downloads the PDF from Drive **as the service account**, and sends the bytes on |

The Drive link is **never sent to a learner's browser**. Even if the folder link leaked, it opens only for people the folder is shared with.

**Don't** use **"Anyone with the link"** in Drive. It would make the PDF public to anyone who finds the address, and the website doesn't need it.

**Replacing a PDF:** upload the new version **into the same Drive file** (in Drive: right-click → *File information* → *Manage versions* → *Upload new version*). The link stays the same, so nothing changes in Sanity. Learners see the new version within about 10 minutes, because the website keeps a copy for up to 10 minutes. Alternatively, upload a new file and paste its new link.

### 2c. Certification: certificate design

In `schemaTypes/certification.js`, add this field (for example right after `status`):

```js
    defineField({
      name: 'certificateTemplate',
      title: 'Certificate design (PDF)',
      description:
        'One-page PDF of the certificate artwork with EMPTY spaces for the name, certificate number and dates — the website prints those on top. Not secret: it is the blank design.',
      type: 'file',
      group: 'identity',
      options: {accept: 'application/pdf'},
    }),
```

### 


Create the folder `sanity/tools/questionImport/` with three files.

**`parseQuestionBank.js`** reads your workbook. It finds the header row even below title rows, reads the **Answer Key** sheet, accepts answers as `A`/`B`/`C`/`D`, `True`/`False` or the option text, and explains every problem with its Excel row number:

```js
// Turns an Iraje question-bank workbook into Sanity question documents.
// Pure functions only (no Studio, no network), so the rules are easy to follow.
//
// Expected workbook (the layout of the PAM 101 "Set 4" paper):
//   Sheet 1  — a few title rows ("Set 4 — 60 questions …"), then a header row:
//              Q.No | Chapter | Type | Question | Option A … Option D (up to F) | Marks
//   "Answer Key" sheet — Q.No | Answer   (A/B/C/D, or True/False, or the option text)
// An "Answer"/"Correct" column on the first sheet also works instead of a key sheet.
// An optional "Explanation" column (either sheet) is shown to learners after
// knowledge checks.

const LETTERS = ['a', 'b', 'c', 'd', 'e', 'f']

const TYPES = [
  {match: /multiple/i, value: 'mcq'},
  {match: /true/i, value: 'trueFalse'},
  {match: /fill/i, value: 'fillBlank'},
]

function clean(value) {
  if (value === null || value === undefined) return ''
  return String(value).replace(/\s+/g, ' ').trim()
}

function headerKey(cell) {
  const h = clean(cell).toLowerCase()
  if (/^(q\.?\s*no\.?|q\s*#|question\s*no\.?|no\.?)$/.test(h)) return 'qNo'
  if (/^(chapter|module)/.test(h)) return 'chapter'
  if (/^(type|question\s*type)$/.test(h)) return 'type'
  if (/^question$/.test(h)) return 'question'
  const option = h.match(/^option\s*([a-f])$/)
  if (option) return 'option_' + option[1]
  if (/^(answer|correct|correct\s*answer|correct\s*option|key)$/.test(h)) return 'answer'
  if (/^(explanation|rationale|reason)/.test(h)) return 'explanation'
  if (/^marks?$/.test(h)) return 'marks'
  return null
}

/** Find the header row (it is not always row 1) and map column positions. */
function findHeader(rows, required) {
  for (let r = 0; r < Math.min(rows.length, 15); r++) {
    const columns = {}
    rows[r].forEach((cell, c) => {
      const key = headerKey(cell)
      if (key && columns[key] === undefined) columns[key] = c
    })
    if (required.every((k) => columns[k] !== undefined)) return {row: r, columns}
  }
  return null
}

function toQNo(value) {
  const n = Number(clean(value))
  return Number.isInteger(n) && n > 0 ? n : null
}

/** "B", "b", "Option B", "(b)", "True", or the option's full text -> option index. */
function resolveAnswer(answer, options) {
  const a = clean(answer)
  if (!a) return -1
  const letter = a.match(/^(?:option\s*)?\(?([a-f])\)?\.?$/i)
  if (letter) return LETTERS.indexOf(letter[1].toLowerCase())
  return options.findIndex((o) => o.toLowerCase() === a.toLowerCase())
}

/**
 * sheets: [{ sheet: 'Sheet1', data: [[...], ...] }] — what read-excel-file returns.
 * Returns { setNumber, questions, errors } where errors are { row, message }.
 */
export function parseQuestionBank(sheets) {
  const errors = []
  const main = sheets.find((s) => findHeader(s.data, ['qNo', 'question', 'option_a']))
  if (!main) {
    return {
      setNumber: null,
      questions: [],
      errors: [{row: null, message: 'No sheet has a header row with "Q.No", "Question" and "Option A".'}],
    }
  }

  // "Set 4 — 60 questions · 60 marks · 90 minutes" in the title rows.
  const header = findHeader(main.data, ['qNo', 'question', 'option_a'])
  let setNumber = null
  for (const row of main.data.slice(0, header.row)) {
    const m = row.map(clean).join(' ').match(/\bset\s*(\d+)/i)
    if (m) {
      setNumber = Number(m[1])
      break
    }
  }

  // Answer key: a separate sheet if there is one.
  const answers = new Map()
  const explanations = new Map()
  for (const s of sheets) {
    if (s === main) continue
    const h = findHeader(s.data, ['qNo', 'answer'])
    if (!h) continue
    for (const row of s.data.slice(h.row + 1)) {
      const qNo = toQNo(row[h.columns.qNo])
      if (!qNo) continue
      answers.set(qNo, row[h.columns.answer])
      if (h.columns.explanation !== undefined) explanations.set(qNo, clean(row[h.columns.explanation]))
    }
  }

  const {columns} = header
  const seen = new Set()
  const questions = []

  main.data.slice(header.row + 1).forEach((row, i) => {
    const excelRow = header.row + i + 2 // 1-based row number as Excel shows it
    const qNo = toQNo(row[columns.qNo])
    if (!qNo) return // blank lines, "Total marks", repeated headers on later pages

    const problems = []
    if (seen.has(qNo)) problems.push(`Q.No ${qNo} appears twice`)
    seen.add(qNo)

    const typeText = clean(row[columns.type])
    const type = TYPES.find((t) => t.match.test(typeText))?.value
    if (!type) problems.push(`unknown type "${typeText}" (use Multiple Choice, True / False or Fill in the Blank)`)

    const prompt = clean(row[columns.question])
    if (prompt.length < 10) problems.push('question text is missing or shorter than 10 characters')

    const options = LETTERS.map((l) => clean(row[columns['option_' + l]])).filter(
      (text, idx) => columns['option_' + LETTERS[idx]] !== undefined && text,
    )
    if (options.length < 2) problems.push('needs at least 2 options')
    if (type === 'trueFalse' && options.length !== 2) problems.push('True / False needs exactly 2 options')

    const chapter = columns.chapter === undefined ? null : toQNo(row[columns.chapter])
    if (columns.chapter !== undefined && !chapter) problems.push('Chapter must be a whole number')

    const rawAnswer = columns.answer !== undefined ? row[columns.answer] : answers.get(qNo)
    const correctIndex = resolveAnswer(rawAnswer, options)
    if (!clean(rawAnswer)) problems.push('no correct answer (add it to the Answer Key sheet)')
    else if (correctIndex < 0 || correctIndex >= options.length)
      problems.push(`answer "${clean(rawAnswer)}" doesn't match any option`)

    const explanation =
      (columns.explanation !== undefined ? clean(row[columns.explanation]) : '') ||
      explanations.get(qNo) ||
      ''

    if (problems.length) {
      errors.push({row: excelRow, message: `Q.No ${qNo}: ${problems.join('; ')}`})
      return
    }
    questions.push({qNo, chapter, type, prompt, options, correctIndex, explanation})
  })

  return {setNumber, questions, errors}
}

/**
 * Sanity documents for the parsed questions. IDs are fixed per certification,
 * set and Q.No, so importing the same file again UPDATES those questions
 * instead of creating duplicates.
 *
 * moduleIdByChapter: { 1: '<module _id>', 2: … } from the certification's course.
 */
export function buildQuestionDocuments({questions, certificationId, code, usedFor, setNumber, moduleIdByChapter}) {
  const errors = []
  const docs = []
  const group = usedFor === 'exam' ? `set${setNumber}` : 'kc'

  for (const q of questions) {
    const moduleId = q.chapter ? moduleIdByChapter[q.chapter] : undefined
    if (q.chapter && !moduleId) {
      errors.push({row: null, message: `Q.No ${q.qNo}: there is no module with order ${q.chapter} in ${code}`})
      continue
    }
    if (usedFor === 'knowledgeCheck' && !moduleId) {
      errors.push({row: null, message: `Q.No ${q.qNo}: knowledge-check questions need a Chapter`})
      continue
    }

    docs.push({
      _id: `question-${code.toLowerCase()}-${group}-q${q.qNo}`,
      _type: 'question',
      certification: {_type: 'reference', _ref: certificationId},
      ...(moduleId && {module: {_type: 'reference', _ref: moduleId}}),
      usedFor,
      ...(usedFor === 'exam' && {examSet: setNumber}),
      questionType: q.type,
      sourceNo: q.qNo,
      difficulty: 'medium',
      status: 'active',
      prompt: q.prompt,
      options: q.options.map((text, i) => ({
        _key: LETTERS[i],
        _type: 'answerOption',
        text,
        isCorrect: i === q.correctIndex,
      })),
      ...(q.explanation && {explanation: q.explanation}),
    })
  }
  return {docs, errors}
}
```

**`QuestionImportTool.jsx`** is the screen itself:

```jsx
import {useEffect, useState} from 'react'
import {useClient} from 'sanity'
import {Box, Button, Card, Flex, Heading, Radio, Select, Stack, Text, TextInput} from '@sanity/ui'
import readExcelFile from 'read-excel-file/browser'
import {buildQuestionDocuments, parseQuestionBank} from './parseQuestionBank'

// A page inside Sanity Studio: pick a certification, choose "Final exam — Set N"
// or "Knowledge checks", choose the .xlsx, check the preview, then Import.
//
// The workbook is read IN THE BROWSER — it is never uploaded anywhere, so the
// answer key never becomes a public file. Questions are written with the
// editor's own Sanity login, so only project members can import.

const CERTS_QUERY = `*[_type == "certification"] | order(code asc) {
  _id, code, title,
  "modules": *[_type == "module" && course->certification._ref == ^._id] {_id, order}
}`

export function QuestionImportTool() {
  const client = useClient({apiVersion: '2026-02-01'})
  const [certs, setCerts] = useState([])
  const [certId, setCertId] = useState('')
  const [usedFor, setUsedFor] = useState('exam')
  const [setNumber, setSetNumber] = useState('')
  const [fileName, setFileName] = useState('')
  const [parsed, setParsed] = useState(null)
  const [status, setStatus] = useState({tone: 'default', text: ''})
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    client.fetch(CERTS_QUERY).then(setCerts)
  }, [client])

  const cert = certs.find((c) => c._id === certId)

  async function onFile(event) {
    const file = event.target.files?.[0]
    if (!file) return
    setFileName(file.name)
    setStatus({tone: 'default', text: ''})
    try {
      const result = parseQuestionBank(await readExcelFile(file))
      setParsed(result)
      if (result.setNumber && !setNumber) setSetNumber(String(result.setNumber))
    } catch (err) {
      setParsed(null)
      setStatus({tone: 'critical', text: `Could not read the file: ${err.message}`})
    }
  }

  // Everything that would go wrong, worked out before anything is written.
  let built = null
  if (parsed && cert) {
    const moduleIdByChapter = Object.fromEntries(cert.modules.map((m) => [m.order, m._id]))
    built = buildQuestionDocuments({
      questions: parsed.questions,
      certificationId: cert._id,
      code: cert.code,
      usedFor,
      setNumber: Number(setNumber),
      moduleIdByChapter,
    })
  }
  const setMissing = usedFor === 'exam' && !(Number(setNumber) >= 1)
  const allErrors = [...(parsed?.errors ?? []), ...(built?.errors ?? [])]
  const canImport = built && built.docs.length > 0 && allErrors.length === 0 && !setMissing && !busy

  async function onImport() {
    setBusy(true)
    setStatus({tone: 'default', text: 'Importing…'})
    try {
      // 50 questions per transaction keeps each request small.
      for (let i = 0; i < built.docs.length; i += 50) {
        const tx = client.transaction()
        built.docs.slice(i, i + 50).forEach((doc) => tx.createOrReplace(doc))
        await tx.commit()
      }
      setStatus({
        tone: 'positive',
        text: `Imported ${built.docs.length} questions into ${cert.code} (${usedFor === 'exam' ? `Set ${setNumber}` : 'knowledge checks'}). They are published and live.`,
      })
    } catch (err) {
      setStatus({tone: 'critical', text: `Import failed — nothing after the failing batch was written: ${err.message}`})
    } finally {
      setBusy(false)
    }
  }

  return (
    <Box padding={5} style={{maxWidth: 900}}>
      <Stack space={5}>
        <Heading size={3}>Import questions from Excel</Heading>

        <Stack space={3}>
          <Text weight="semibold">1. Certification</Text>
          <Select value={certId} onChange={(e) => setCertId(e.currentTarget.value)}>
            <option value="">Choose…</option>
            {certs.map((c) => (
              <option key={c._id} value={c._id}>
                {c.code} — {c.title}
              </option>
            ))}
          </Select>
        </Stack>

        <Stack space={3}>
          <Text weight="semibold">2. What is in this file?</Text>
          <Flex gap={4} align="center">
            <Flex as="label" gap={2} align="center">
              <Radio checked={usedFor === 'exam'} onChange={() => setUsedFor('exam')} />
              <Text>Final exam — Set</Text>
            </Flex>
            <Box style={{width: 80}}>
              <TextInput
                value={setNumber}
                disabled={usedFor !== 'exam'}
                onChange={(e) => setSetNumber(e.currentTarget.value)}
                placeholder="4"
              />
            </Box>
            <Flex as="label" gap={2} align="center">
              <Radio checked={usedFor === 'knowledgeCheck'} onChange={() => setUsedFor('knowledgeCheck')} />
              <Text>Knowledge checks (2–3 per chapter)</Text>
            </Flex>
          </Flex>
        </Stack>

        <Stack space={3}>
          <Text weight="semibold">3. Excel file (.xlsx)</Text>
          <input type="file" accept=".xlsx" onChange={onFile} />
          {fileName && <Text size={1} muted>{fileName}</Text>}
        </Stack>

        {parsed && (
          <Card padding={4} radius={2} tone={allErrors.length ? 'caution' : 'positive'} border>
            <Stack space={3}>
              <Text weight="semibold">
                {built ? built.docs.length : parsed.questions.length} questions ready
                {allErrors.length ? `, ${allErrors.length} problem(s) to fix first` : ''}
              </Text>
              {!cert && <Text size={1}>Choose a certification to check chapters against its modules.</Text>}
              {setMissing && <Text size={1}>Enter the set number.</Text>}
              {allErrors.map((e, i) => (
                <Text key={i} size={1}>
                  {e.row ? `Row ${e.row}: ` : ''}
                  {e.message}
                </Text>
              ))}
            </Stack>
          </Card>
        )}

        <Flex gap={3} align="center">
          <Button text="Import" tone="primary" disabled={!canImport} onClick={onImport} />
          {status.text && (
            <Card padding={3} radius={2} tone={status.tone}>
              <Text size={1}>{status.text}</Text>
            </Card>
          )}
        </Flex>

        <Text size={1} muted>
          Importing the same set again updates those questions (matched by Q.No) instead of making copies.
        </Text>
      </Stack>
    </Box>
  )
}
```

**`index.js`** adds the screen to Studio's top menu:

```js
import {definePlugin} from 'sanity'
import {QuestionImportTool} from './QuestionImportTool'

// Adds "Question import" to the Studio's top menu, next to Structure and Vision.
export const questionImport = definePlugin({
  name: 'iraje-question-import',
  tools: [
    {
      name: 'question-import',
      title: 'Question import',
      component: QuestionImportTool,
    },
  ],
})
```

Then register it in **`sanity/sanity.config.js`** (replace the file):

```js
import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemaTypes'
import {questionImport} from './tools/questionImport'

export default defineConfig({
  name: 'default',
  title: 'Iraje University',

  projectId: 'g6lrqpst',
  dataset: 'production',

  plugins: [structureTool(), visionTool(), questionImport()],

  schema: {
    types: schemaTypes,
  },
})
```

**Why the Excel file is read in the browser and never uploaded:** your workbook contains the **answer key**. Uploading it to Sanity would give it a public link. The tool reads it on the editor's computer and writes only the questions.

### 2e. Check the exam settings in Studio

Run `npm run dev` in `sanity` and open each certification → **Exam** tab:

| Setting | What to set | Why |
|---|---|---|
| Duration (minutes) | **90** for PAM101 (matches "Set 4 — 90 minutes") | The timer |
| Pass mark (%) | Your required %, e.g. 70 | |
| Retake wait (days) | **1** | = 24 hours after a failed attempt |
| Questions drawn per attempt | Leave as is | Not used: each attempt uses one whole set |
| Validity (years) | **3** (already set) | Certificate expiry |

Upload each certificate design under **Identity → Certificate design (PDF)**.

✅ **Check:** Studio starts with no errors. The top menu shows **Question import**. A Module shows **Study material (Google Drive link)**. Pasting a folder link or a Google Docs link shows a red *Paste a Google Drive FILE link* message. A Question shows **Used for**, **Exam set** and **Question type**.

### 2f. Deploy the Studio

```powershell
npx sanity deploy
```

Use the hostname `iraje-university` (lower case, with a hyphen).

---

## Stage 3 — Import your question banks

1. In Studio, open **Question import**.
2. **Certification:** PAM101. **What is in this file?:** Final exam — Set **4**. The set number is filled in automatically from "Set 4" in the title.
3. Choose the `.xlsx`. The preview shows **"60 questions ready"** or a list like `Row 23: Q.No 20: answer "E" doesn't match any option`.
4. Fix any problems in Excel, choose the file again, then **Import**.
5. Repeat for every set of every course.

**Knowledge checks need their own questions.** If the 2–3 questions after a PDF came from the exam sets, learners would see exam questions in advance. Write a separate workbook in the **same layout** (Q.No, Chapter, Type, Question, Option A–D, Answer Key sheet), with 2–3 questions per chapter, and import it as **Knowledge checks**. **Chapter = module number** (PAM101 has modules 1–11).

✅ **Check:** in **Structure → Question**, each set's questions appear with *Used for = Final exam* and the right *Exam set*. Re-importing the same file says the same count, and no duplicates appear.

---

## Stage 4 — PDFs from Google Drive

**What you're setting up:** the website gets its own Google identity (a *service account*). You share your PDF folder with it, the way you'd share with a colleague. From then on the website can read any PDF in that folder, and nobody else can, except the people you've shared it with yourself.

```
Google Drive folder "Iraje University"  (sharing: Restricted)
   ├── shared with: you, your content team
   └── shared with: iraje-run@PROJECT.iam.gserviceaccount.com  (Viewer)  ← the website
          │
          ▼
   website server ── checks the learner ──► PDF bytes ──► learner's browser
```

In the commands below, replace `PROJECT` with your Google Cloud **project ID** (the one Cloud Run uses) and `YOUR_GOOGLE_EMAIL` with your Google account.

### 4a. The website's service account and the Drive API (once)4

Cloud Run already runs as a service account: `_RUNTIME_SA` in `cloudbuild.yaml`, `iraje-run@PROJECT.iam.gserviceaccount.com`. Use that one. If it doesn't exist yet, create it:

```powershell
gcloud iam service-accounts create iraje-run --display-name="Iraje website" --project=PROJECT
```

Turn on the two Google APIs this needs:

```powershell
gcloud services enable drive.googleapis.com iamcredentials.googleapis.com --project=PROJECT
```

- **Drive API**: lets the website read files from Drive.
- **IAM Credentials API**: lets your PC act as the service account during development (rc).

### 4b. Share the PDF folder with it

1. In Google Drive, right-click your **Iraje University** folder → **Share**.
2. Add `iraje-run@PROJECT.iam.gserviceaccount.com` as **Viewer**.
3. Untick **Notify people** (it's a robot; it has no inbox), then **Share**.
4. Check **General access** still says **Restricted**.

Everything inside the folder, including sub-folders and files added later, is now readable by the website.

> If Drive says **"can't share outside your organisation"**, your Google Workspace blocks external sharing. Ask your Google Workspace admin to allow sharing with this one service account, or to put the PDFs in a shared drive that allows it.

### 4c. Let your PC act as the service account (development only)

On Cloud Run the website is the service account automatically. On your PC, you sign in once so that Google treats your PC as that service account. This uses **no key files**: a downloaded key is a password that never expires.
 

**(1)** Allow yourself to do this (once):

```powershell
gcloud iam service-accounts add-iam-policy-binding iraje-run@PROJECT.iam.gserviceaccount.com `
  --member="user:YOUR_GOOGLE_EMAIL" `
  --role="roles/iam.serviceAccountTokenCreator" --project=PROJECT
```

**(2)** Sign in (a browser window opens; use `YOUR_GOOGLE_EMAIL`):

```powershell
gcloud auth application-default login --impersonate-service-account=iraje-run@PROJECT.iam.gserviceaccount.com
```

This saves a small credentials file in your Windows profile. `google-auth-library` finds it automatically, so there's nothing to add to `.env`. **Restart the dev server** afterwards.

> Why not just sign in as yourself? Google blocks the `gcloud` tool from asking for Drive access on a personal login ("This app is blocked"). Acting as the service account avoids that, and it also tests exactly the access production will have.

### 4d. `src/lib/googleDrive.js` — download a PDF from Drive

```js
import "server-only";
import { GoogleAuth } from "google-auth-library";

// Course PDFs live in Google Drive, kept PRIVATE ("Restricted" sharing) and
// shared only with the website's Google service account. Editors paste each
// PDF's Drive link on its Module in Sanity. This file downloads the PDF on the
// server; learners only ever receive the bytes through /api/materials/<id>,
// after the lock checks — never the Drive link itself.
//
// Who the website "is" when it talks to Drive:
//   - on Cloud Run: its service account, automatically
//   - on your PC:   the same service account, via
//     `gcloud auth application-default login --impersonate-service-account …`
//     (see the guide, Stage 4)

const auth = new GoogleAuth({ scopes: ["https://www.googleapis.com/auth/drive.readonly"] });

/**
 * The file ID inside a Drive link. Accepts the usual shapes:
 *   https://drive.google.com/file/d/<ID>/view?usp=sharing
 *   https://drive.google.com/open?id=<ID>
 *   https://drive.google.com/uc?id=<ID>&export=download
 */
export function driveFileId(link) {
  const s = String(link ?? "").trim();
  const match = s.match(/\/file\/d\/([A-Za-z0-9_-]{10,})/) || s.match(/[?&]id=([A-Za-z0-9_-]{10,})/);
  return match ? match[1] : null;
}

// Keep recently used PDFs in memory for 10 minutes, so a learner paging
// back and forth (or a class opening the same module) doesn't re-download
// from Drive every time. At most 20 files per server instance.
const CACHE_MS = 10 * 60 * 1000;
const CACHE_MAX = 20;
const cache = new Map(); // fileId -> { bytes, at }

/** Download a PDF from Drive. Throws with a readable message on failure. */
export async function downloadDrivePdf(link) {
  const id = driveFileId(link);
  if (!id) throw new Error("This is not a Google Drive file link.");

  const hit = cache.get(id);
  if (hit && Date.now() - hit.at < CACHE_MS) return hit.bytes;

  const client = await auth.getClient();
  let res;
  try {
    res = await client.request({
      url: `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(id)}`,
      params: { alt: "media", supportsAllDrives: true },
      responseType: "arraybuffer",
    });
  } catch (err) {
    const status = err?.response?.status ?? err?.status;
    if (status === 404) {
      throw new Error("Drive says the file doesn't exist, or it isn't shared with the website's service account.");
    }
    if (status === 403) {
      throw new Error("Drive refused access: check the Drive API is enabled and the file is shared with the service account.");
    }
    throw err;
  }

  const bytes = Buffer.from(res.data);
  // Every real PDF starts with "%PDF" — this catches a Google Doc or Word file.
  if (bytes.subarray(0, 4).toString("latin1") !== "%PDF") {
    throw new Error("The Drive file is not a PDF. Upload the PDF itself, not a Google Doc.");
  }

  if (cache.size >= CACHE_MAX) cache.delete(cache.keys().next().value);
  cache.set(id, { bytes, at: Date.now() });
  return bytes;
}
```

### 4e. `src/app/api/materials/[moduleId]/route.js` — the only way a PDF reaches a browser

```js
import { getCurrentUser } from "@/lib/dal";
import { getSanityClient } from "@/lib/sanity/client";
import { loadLearnerCourse } from "@/lib/learner";
import { downloadDrivePdf } from "@/lib/googleDrive";

const MODULE_QUERY = `*[_type == "module" && _id == $id][0] {
  _id, pdfDriveLink, "code": course->certification->code
}`;

// GET /api/materials/<moduleId> — the ONLY way a PDF reaches a browser.
// Checked on every request: signed in, enrolled in this certification, and
// this module unlocked. Admins may preview any module. The Drive link itself
// is never sent to the browser.
export async function GET(request, { params }) {
  const { moduleId } = await params;
  const user = await getCurrentUser();
  if (!user || user.mustChangePassword) return new Response("Sign in first.", { status: 401 });

  const mod = await getSanityClient().fetch(MODULE_QUERY, { id: moduleId });
  if (!mod?.pdfDriveLink) return new Response("Not found.", { status: 404 });

  if (user.role !== "admin") {
    const course = await loadLearnerCourse(user.id, mod.code);
    const step = course?.outline?.steps.find((s) => s._id === moduleId);
    if (!step || !step.unlocked) return new Response("This module is locked.", { status: 403 });
  }

  let bytes;
  try {
    bytes = await downloadDrivePdf(mod.pdfDriveLink);
  } catch (err) {
    console.error(`[materials] module ${moduleId}:`, err);
    // Admins see the reason (to fix the link); learners see a polite message.
    const message = user.role === "admin" ? err.message : "The study material is temporarily unavailable.";
    return new Response(message, { status: 502 });
  }

  return new Response(bytes, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": "inline",
      // Personal content: never keep it in shared caches.
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
```

### 4f. Admin page: Study materials

Lists every module and whether it has a PDF link. **Preview** fetches the PDF exactly the way a learner would, so it proves both the link and the sharing work.

`src/app/admin/(panel)/materials/page.js`:

```js
import { requireAdmin } from "@/lib/dal";
import { getSanityClient } from "@/lib/sanity/client";

const MODULES_QUERY = `*[_type == "module"] | order(course->certification->code asc, order asc) {
  _id, order, title,
  "code": course->certification->code,
  "hasPdf": defined(pdfDriveLink)
}`;

// /admin/materials — which modules have a Google Drive PDF link. "Preview"
// fetches it exactly the way a learner would, so it proves the link works and
// the file is shared with the website's service account.
export default async function MaterialsPage() {
  await requireAdmin();
  const modules = await getSanityClient().fetch(MODULES_QUERY);
  const withPdf = modules.filter((m) => m.hasPdf).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Study materials</h1>
        <p className="mt-1 text-sm text-shuttle">
          Paste each PDF&apos;s Google Drive link on its Module in Sanity Studio. {withPdf} of {modules.length} modules have
          a PDF.
        </p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-mist bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-catskill text-xs text-shuttle uppercase">
            <tr>
              <th className="px-4 py-3">Certification</th>
              <th className="px-4 py-3">Module</th>
              <th className="px-4 py-3">PDF</th>
            </tr>
          </thead>
          <tbody>
            {modules.map((m) => (
              <tr key={m._id} className="border-t border-mist">
                <td className="px-4 py-3 font-medium">{m.code ?? "—"}</td>
                <td className="px-4 py-3">
                  {m.order}. {m.title}
                </td>
                <td className="px-4 py-3">
                  {m.hasPdf ? (
                    <a href={`/api/materials/${m._id}`} target="_blank" rel="noreferrer" className="text-brand hover:underline">
                      Preview
                    </a>
                  ) : (
                    <span className="text-slate-soft">Missing</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

Add the new admin pages to the top bar. In `src/app/admin/(panel)/layout.js`, replace the `<nav className="text-sm"> … </nav>` block with:

```jsx
            <nav className="flex gap-4 text-sm">
              <Link href="/admin/enrollments" className="text-ink hover:text-brand">
                Certification requests
              </Link>
              <Link href="/admin/learners" className="text-ink hover:text-brand">
                Learners
              </Link>
              <Link href="/admin/materials" className="text-ink hover:text-brand">
                Study materials
              </Link>
            </nav>
```

(The **Learners** link points to the page built in Stage 10; it shows a 404 until then.)

> **Build Stage 5a–5c before this check.** The PDF route in 4e uses `src/lib/learner.js`, which is created in Stage 5c (and needs 5a–5b). Without them the site fails with `Module not found: Can't resolve '@/lib/learner'`. Order: 4a → 4f, then 5a → 5c, then run this check.

✅ **Check:**
1. Put a test PDF in the shared folder. Right-click it → **Share** → **Copy link**. If Drive offers to change access, keep it **Restricted**.
2. Studio → PAM101 → Module 1 → paste the link into **Study material (Google Drive link)** → **Publish**.
3. Admin panel → **Study materials** → Module 1 → **Preview**. The PDF opens.
4. **Privacy test:** paste the same Drive link into a **private/incognito** window where you're not signed in to Google. Drive asks you to sign in or request access, which proves the PDF isn't public.

If **Preview** shows an error instead, the message says why:

| Message | Meaning | Fix |
|---|---|---|
| *Drive says the file doesn't exist, or it isn't shared with the website's service account* | Folder not shared with `iraje-run@…`, or a wrong link | Repeat 4b; re-copy the link |
| *Drive refused access: check the Drive API is enabled…* | API off, or the PC sign-in from 4c is missing | Repeat 4a and 4c, then restart the dev server |
| *The Drive file is not a PDF* | The link points at a Google Doc or Word file | In Drive, **File → Download → PDF**, upload that PDF, use its link |
| *Could not load the default credentials* (in the terminal) | Step 4c not done on this PC | Do 4c, restart the dev server |

---

## Stage 5 — Learning rules and Sanity queries

### 5a. `src/lib/learning.js` — the rules, as plain functions

```js
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
```

### 5b. Add the queries

At the **end** of `src/lib/sanity/queries.js`, add:

```js
// ---- Learning path -----------------------------------------------------------

// Every certification a learner could see on the dashboard.
export const CATALOG_QUERY = `*[_type == "certification" && status in ["active", "comingSoon"]] | order(code asc) {
  code,
  label,
  title,
  track,
  level,
  status,
  "moduleCount": count(*[_type == "module" && course->certification._ref == ^._id])
}`;

// One certification with its course, modules in order, how many knowledge-check
// questions each module has, and which exam sets exist. Only `hasPdf` is read
// here — the Drive link itself is fetched by /api/materials and never reaches a page.
export const COURSE_QUERY = `*[_type == "certification" && code == $code][0] {
  _id,
  code,
  label,
  title,
  status,
  validityYears,
  exam,
  "templateUrl": certificateTemplate.asset->url,
  "course": *[_type == "course" && certification._ref == ^._id && status != "archived"] | order(_createdAt asc)[0] {
    _id,
    title,
    summary,
    "modules": *[_type == "module" && course._ref == ^._id] | order(order asc) {
      _id,
      order,
      title,
      summary,
      estimatedMinutes,
      "hasPdf": defined(pdfDriveLink),
      "checkCount": count(*[_type == "question" && usedFor == "knowledgeCheck" && status == "active" && module._ref == ^._id])
    }
  },
  "examSets": array::unique(*[_type == "question" && usedFor == "exam" && status == "active" && certification._ref == ^._id].examSet)
}`;

// The 2–3 questions shown after one module's PDF. No answer key.
export const KNOWLEDGE_CHECK_QUERY = `*[_type == "question" && usedFor == "knowledgeCheck" && status == "active" && module._ref == $moduleId] | order(sourceNo asc)[0...3] {
  _id,
  prompt,
  questionType,
  "options": options[]${EXAM_OPTION_PROJECTION}
}`;

// Every question in one exam set. No answer key.
export const EXAM_SET_QUESTIONS_QUERY = `*[_type == "question" && usedFor == "exam" && status == "active" && certification->code == $code && examSet == $set] {
  _id,
  prompt,
  questionType,
  "options": options[]${EXAM_OPTION_PROJECTION}
}`;

// Questions by id, for showing a frozen exam paper. No answer key.
export const QUESTIONS_BY_ID_QUERY = `*[_type == "question" && _id in $ids] {
  _id,
  prompt,
  questionType,
  "options": options[]${EXAM_OPTION_PROJECTION}
}`;

// SERVER ONLY — the answer key. The result of this query is used to mark
// answers and must never be returned to the browser as-is.
export const ANSWER_KEY_QUERY = `*[_type == "question" && _id in $ids] {
  _id,
  "correct": options[isCorrect == true][0]._key,
  explanation
}`;
```

All learner-facing queries use `EXAM_OPTION_PROJECTION` (`{_key, text}`), the safe projection your file already defines. Only `ANSWER_KEY_QUERY` reads the correct answers, and its result is only ever used on the server.

### 5c. `src/lib/learner.js` — "may this learner see this course?" in one place

```js
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
```

---

## Stage 6 — Certificates and email

### 6a. `src/lib/certificatePdf.js`

Prints the name, title, number and dates onto **your design** (from Sanity). It draws a plain certificate if no design is uploaded yet.

```js
import "server-only";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

// Builds the certificate PDF. If the certification has a "Certificate design"
// uploaded in Sanity, the text is printed on top of it; otherwise a plain
// branded certificate is drawn, so the feature works before the design is ready.
//
// TO FIT YOUR DESIGN: change the numbers in LAYOUT. Each `y` is a fraction of the
// page height measured from the BOTTOM (0.5 = middle), each `x` a fraction of the
// width (0.5 = centred). Adjust, issue a test certificate, look, repeat.
const LAYOUT = {
  name: { x: 0.5, y: 0.5, size: 34, font: "bold" },
  title: { x: 0.5, y: 0.41, size: 16, font: "regular" },
  number: { x: 0.5, y: 0.2, size: 11, font: "regular", prefix: "Certificate No: " },
  issued: { x: 0.3, y: 0.13, size: 11, font: "regular", prefix: "Issued: " },
  expires: { x: 0.7, y: 0.13, size: 11, font: "regular", prefix: "Valid until: " },
};

const INK = rgb(0.047, 0.118, 0.227); // #0C1E3A
const BRAND = rgb(0.016, 0.318, 0.8); // #0451CC

function formatDate(date) {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  });
}

// The built-in PDF fonts only know Western European characters. Swap common
// typographic punctuation for plain equivalents, and anything else for "?",
// rather than crash on an unusual name.
function printable(text) {
  return String(text)
    .replace(/[–—]/g, "-")
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[^\x20-\x7E -ÿ]/g, "?");
}

/**
 * certificate: { certificateNo, holderName, certificationTitle, certificationCode, issuedAt, expiresAt }
 * templateUrl: the Sanity file URL of the design, or null.
 * Returns the PDF as a Uint8Array.
 */
export async function renderCertificatePdf(certificate, templateUrl) {
  let pdf;
  let page;
  if (templateUrl) {
    const res = await fetch(templateUrl);
    if (!res.ok) throw new Error(`Could not download the certificate design (${res.status})`);
    pdf = await PDFDocument.load(await res.arrayBuffer());
    page = pdf.getPage(0);
  } else {
    pdf = await PDFDocument.create();
    page = pdf.addPage([842, 595]); // A4 landscape, in points
    drawPlainDesign(page, await pdf.embedFont(StandardFonts.HelveticaBold));
  }

  const fonts = {
    bold: await pdf.embedFont(StandardFonts.HelveticaBold),
    regular: await pdf.embedFont(StandardFonts.Helvetica),
  };
  const { width, height } = page.getSize();

  const values = {
    name: certificate.holderName,
    title: `${certificate.certificationCode} - ${certificate.certificationTitle}`,
    number: certificate.certificateNo,
    issued: formatDate(certificate.issuedAt),
    expires: formatDate(certificate.expiresAt),
  };

  for (const [field, spec] of Object.entries(LAYOUT)) {
    const font = fonts[spec.font];
    const text = printable((spec.prefix ?? "") + values[field]);
    const textWidth = font.widthOfTextAtSize(text, spec.size);
    page.drawText(text, {
      x: width * spec.x - textWidth / 2, // centred on x
      y: height * spec.y,
      size: spec.size,
      font,
      color: field === "name" ? BRAND : INK,
    });
  }

  pdf.setTitle(`Iraje certificate ${certificate.certificateNo}`);
  return pdf.save();
}

function drawPlainDesign(page, bold) {
  const { width, height } = page.getSize();
  page.drawRectangle({ x: 24, y: 24, width: width - 48, height: height - 48, borderColor: BRAND, borderWidth: 3 });
  const heading = "Iraje University";
  page.drawText(heading, { x: width / 2 - bold.widthOfTextAtSize(heading, 20) / 2, y: height * 0.8, size: 20, font: bold, color: BRAND });
  const sub = "CERTIFICATE OF COMPLETION";
  page.drawText(sub, { x: width / 2 - bold.widthOfTextAtSize(sub, 14) / 2, y: height * 0.7, size: 14, font: bold, color: INK });
  const lead = "This certifies that";
  page.drawText(lead, { x: width / 2 - bold.widthOfTextAtSize(lead, 11) / 2, y: height * 0.59, size: 11, font: bold, color: INK });
}
```

**Fitting your design:** issue a test certificate (Stage 10), open the PDF, and adjust the `y` and `x` numbers in `LAYOUT` until the text sits in your blank spaces. For example, if the name is too low, raise `name.y` from `0.5` to `0.55`.

### 6b. Mailer: attachments and the certificate email

In `src/lib/mailer.js`:

**(1)** Replace the whole `async function sendMail(…) { … }` with this version, which adds an `attachments` option:

```js
async function sendMail({ to, subject, text, html, replyTo, attachments = [] }) {
  const transport =
    process.env.MAIL_TRANSPORT ||
    (process.env.NODE_ENV === "production" ? "graph" : "console");

  if (transport === "console") {
    console.info(
      [`\n----- EMAIL (not sent: MAIL_TRANSPORT=console) -----`,
        `To:       ${to}`,
        `Reply-To: ${replyTo ?? "—"}`,
        `Subject:  ${subject}`,
        ...attachments.map((a) => `Attached: ${a.name} (${Math.round(a.bytes.length / 1024)} KB)`),
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
          // Files up to ~3 MB can travel inside the request itself.
          ...(attachments.length && {
            attachments: attachments.map((a) => ({
              "@odata.type": "#microsoft.graph.fileAttachment",
              name: a.name,
              contentType: a.contentType,
              contentBytes: Buffer.from(a.bytes).toString("base64"),
            })),
          }),
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
```

**(2)** Add at the **end** of the file:

```js
/** Email a learner their certificate, with the PDF attached. */
export async function sendCertificateEmail({ to, certificate, pdf }) {
  return sendMail({
    to,
    ...buildCertificateEmail({
      ...certificate,
      verifyUrl: appUrl("/certification#verify"),
      dashboardUrl: appUrl("/certification/dashboard"),
    }),
    attachments: [
      { name: `${certificate.certificateNo}.pdf`, contentType: "application/pdf", bytes: pdf },
    ],
  });
}

export function buildCertificateEmail({
  holderName,
  certificationCode,
  certificationTitle,
  certificateNo,
  scorePercentage,
  expiresAt,
  verifyUrl,
  dashboardUrl,
}) {
  return {
    subject: `Congratulations — you are ${certificationCode} certified`,
    text: [
      `Hi ${holderName},`,
      ``,
      `Congratulations! You passed the ${certificationCode} — ${certificationTitle} exam with ${scorePercentage}%.`,
      ``,
      `Your certificate is attached.`,
      `Certificate number: ${certificateNo}`,
      `Valid until:        ${formatEmailDate(expiresAt)}`,
      ``,
      `Anyone can confirm it at ${verifyUrl} using the certificate number.`,
      `You can download it again any time from ${dashboardUrl}.`,
      ``,
      `— Iraje University`,
    ].join("\n"),
    html: `
      <p style="font-family:sans-serif">Hi ${escapeHtml(holderName)},</p>
      <p style="font-family:sans-serif">Congratulations! You passed the <strong>${escapeHtml(certificationCode)} — ${escapeHtml(certificationTitle)}</strong> exam with <strong>${scorePercentage}%</strong>.</p>
      <p style="font-family:sans-serif">Your certificate is attached.</p>
      <table cellpadding="6" style="border-collapse:collapse;font-family:sans-serif">
        <tr><td><strong>Certificate number</strong></td><td style="font-family:monospace;font-size:16px">${escapeHtml(certificateNo)}</td></tr>
        <tr><td><strong>Valid until</strong></td><td>${formatEmailDate(expiresAt)}</td></tr>
      </table>
      <p style="font-family:sans-serif">Anyone can confirm it on our website using the certificate number.</p>
      <p style="font-family:sans-serif">${button(verifyUrl, "Verify a certificate")}</p>
      <hr />
      <p style="color:#888;font-family:sans-serif">— Iraje University</p>
    `,
  };
}
```

### 6c. `src/lib/exam.js` — mark an attempt and issue the certificate

```js
import "server-only";
import { prisma } from "@/lib/prisma";
import { getSanityClient } from "@/lib/sanity/client";
import { ANSWER_KEY_QUERY } from "@/lib/sanity/queries";
import { addYears, gradeAnswers, makeCertificateNumber } from "@/lib/learning";
import { renderCertificatePdf } from "@/lib/certificatePdf";
import { sendCertificateEmail } from "@/lib/mailer";

// Answers arriving this long after the timer ends still count — covers a slow
// network on the final click. Anything later is marked as unanswered.
export const SUBMIT_GRACE_MS = 2 * 60 * 1000;

/**
 * Mark an attempt, and if it passed, issue the certificate — all in one
 * transaction. Safe to call twice: an attempt that is already marked is
 * returned unchanged. Returns the updated attempt (with `certificate`).
 *
 * `answers` is ignored when it arrives after the deadline + grace period.
 */
export async function finishAttempt(attemptId, answers, now = new Date()) {
  const attempt = await prisma.examAttempt.findUniqueOrThrow({
    where: { id: attemptId },
    include: { userCertification: { include: { user: true } }, certificate: true },
  });
  if (attempt.submittedAt) return attempt;

  const inTime = now.getTime() <= attempt.deadlineAt.getTime() + SUBMIT_GRACE_MS;
  const given = inTime && answers && typeof answers === "object" ? answers : {};

  const paper = attempt.paper;
  const keyRows = await getSanityClient().fetch(ANSWER_KEY_QUERY, { ids: paper.map((q) => q.id) });
  const answerKey = Object.fromEntries(keyRows.map((r) => [r._id, r.correct]));

  // Keep only answers to questions on this paper, with option keys that exist.
  const cleanAnswers = {};
  for (const q of paper) {
    if (typeof given[q.id] === "string" && q.options.includes(given[q.id])) cleanAnswers[q.id] = given[q.id];
  }

  const { score, total, percentage } = gradeAnswers(paper, cleanAnswers, answerKey);
  const enrolment = attempt.userCertification;
  const cert = await getSanityClient().fetch(
    `*[_type == "certification" && code == $code][0]{ title, validityYears, exam, "templateUrl": certificateTemplate.asset->url }`,
    { code: enrolment.certificationCode },
  );
  const passed = percentage >= (cert?.exam?.passPercentage ?? 100);

  const updated = await prisma.$transaction(async (tx) => {
    // Only mark it if no one else has in the meantime (double-click, two tabs).
    const claimed = await tx.examAttempt.updateMany({
      where: { id: attemptId, submittedAt: null },
      data: { submittedAt: now, answers: cleanAnswers, score, total, percentage, passed },
    });
    if (claimed.count === 0) return null;

    if (passed) {
      await tx.userCertification.update({
        where: { id: enrolment.id },
        data: { status: "passed", completedAt: now },
      });
      // Retry in the (astronomically unlikely) case two numbers collide.
      for (let i = 0; i < 3; i++) {
        try {
          await tx.certificate.create({
            data: {
              certificateNo: makeCertificateNumber(enrolment.certificationCode),
              userCertificationId: enrolment.id,
              examAttemptId: attemptId,
              holderName: enrolment.user.name,
              certificationCode: enrolment.certificationCode,
              certificationTitle: cert?.title ?? enrolment.certificationCode,
              scorePercentage: percentage,
              issuedAt: now,
              expiresAt: addYears(now, cert?.validityYears ?? 3),
            },
          });
          break;
        } catch (err) {
          if (err?.code !== "P2002" || i === 2) throw err;
        }
      }
    }
    return true;
  });

  const result = await prisma.examAttempt.findUniqueOrThrow({
    where: { id: attemptId },
    include: { certificate: true },
  });

  // Email after the transaction: a mail problem never undoes a pass.
  if (updated && result.certificate) {
    try {
      const pdf = await renderCertificatePdf(result.certificate, cert?.templateUrl ?? null);
      await sendCertificateEmail({
        to: enrolment.user.email,
        certificate: result.certificate,
        pdf,
      });
    } catch (err) {
      console.error("[exam] certificate email failed:", err);
    }
  }
  return result;
}
```

The same "claim" trick as Accept: `updateMany({ where: { id, submittedAt: null } })` marks an attempt only once, even if **Submit** is clicked twice.

---

## Stage 7 — Dashboard with locked courses

### 7a. Replace `src/app/certification/dashboard/page.js`

```js
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireStudent } from "@/lib/dal";
import { getSanityClient } from "@/lib/sanity/client";
import { CATALOG_QUERY } from "@/lib/sanity/queries";
import { loadLearnerCourse } from "@/lib/learner";
import LogoutButton from "@/components/Auth/LogoutButton";

export const metadata = {
  title: "My dashboard | Iraje University",
  robots: { index: false, follow: false },
};

// Every certification is shown, like a course catalogue. The learner's own are
// open with a progress bar; the rest are locked with a "Request access" button.
// Locking is enforced again on every course page and PDF request — greying out
// a card here is only the visible part.
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
      mine.map(async (m) => [m.certificationCode, (await loadLearnerCourse(user.id, m.certificationCode))?.outline]),
    ),
  );
  const enrolled = new Map(mine.map((m) => [m.certificationCode, m]));

  // The learner's own certifications first, then the rest in code order.
  const cards = [...catalog].sort((a, b) => Number(enrolled.has(b.code)) - Number(enrolled.has(a.code)));

  return (
    <section className="bg-catskill px-4 py-16">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold tracking-[0.14em] text-brand uppercase">Iraje University</p>
            <h1 className="mt-1 text-3xl font-semibold text-ink">Welcome, {user.name}</h1>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Link href="/certification/change-password" className="text-shuttle hover:text-brand">
              Change password
            </Link>
            <LogoutButton />
          </div>
        </div>

        <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((c) => {
            const mineRow = enrolled.get(c.code);
            const outline = outlines[c.code];
            const href = `/certification/learn/${c.code.toLowerCase()}`;

            if (!mineRow) {
              return (
                <li key={c.code} className="flex flex-col rounded-2xl border border-mist bg-white/60 p-6 opacity-80">
                  <p className="text-xs font-semibold text-slate-soft">🔒 {c.label}</p>
                  <p className="mt-2 font-semibold text-shuttle">{c.title}</p>
                  <div className="mt-auto pt-6">
                    {c.status === "comingSoon" ? (
                      <span className="text-sm text-slate-soft">Coming soon</span>
                    ) : (
                      <Link
                        href={`/certification?enroll=${c.code}#enroll`}
                        className="inline-block rounded-xl border border-brand px-4 py-2 text-sm font-semibold text-brand hover:bg-white"
                      >
                        Request access
                      </Link>
                    )}
                  </div>
                </li>
              );
            }

            return (
              <li key={c.code} className="flex flex-col rounded-2xl border border-mist bg-white p-6 shadow-sm">
                <p className="text-xs font-semibold text-brand">{c.label}</p>
                <p className="mt-2 font-semibold text-ink">{c.title}</p>

                {mineRow.status === "passed" ? (
                  <div className="mt-auto pt-6 text-sm">
                    <p className="font-semibold text-green-700">✓ Certified</p>
                    <p className="mt-1 font-mono text-xs text-shuttle">{mineRow.certificate?.certificateNo}</p>
                    {mineRow.certificate && (
                      <a
                        href={`/api/certificates/${mineRow.certificate.certificateNo}/pdf`}
                        className="mt-3 inline-block rounded-xl bg-brand px-4 py-2 font-semibold text-white"
                      >
                        Download certificate
                      </a>
                    )}
                  </div>
                ) : outline ? (
                  <div className="mt-auto pt-6">
                    <div className="h-2 rounded-full bg-mist">
                      <div className="h-2 rounded-full bg-brand" style={{ width: `${outline.percent}%` }} />
                    </div>
                    <p className="mt-2 text-xs text-shuttle">
                      {outline.completed} of {outline.total} modules · {outline.percent}%
                    </p>
                    <Link href={href} className="mt-4 inline-block rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white">
                      {outline.completed ? "Continue" : "Start"}
                    </Link>
                  </div>
                ) : (
                  <p className="mt-auto pt-6 text-sm text-shuttle">Course content coming soon.</p>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
```

### 7b. "Request access" ticks the right certification

The locked card links to `/certification?enroll=PAM201#enroll`. In `src/components/Certification/CertEnroll.jsx`:

**(1)** Change the first import line to:

```js
import { useEffect, useState } from "react";
```

**(2)** Inside `CertEnroll()`, right after the `useState` lines, add:

```js
  // Arriving from the dashboard's "Request access" (?enroll=PAM201): tick that
  // certification in the form.
  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get("enroll");
    if (code && certStep.options.some((o) => o.code === code)) {
      setValues((v) =>
        v.certifications.includes(code) ? v : { ...v, certifications: [...v.certifications, code] },
      );
    }
  }, []);
```

✅ **Check:**
1. Sign in as a learner. All certifications show; theirs are on top with a progress bar, the rest are greyed out with 🔒.
2. **Request access** on a locked one opens the form with that certification ticked.
3. CT101 (no course yet) shows *Course content coming soon*.

---

## Stage 8 — Course outline, PDF reader and knowledge checks

### 8a. Copy the PDF.js worker automatically

Create `scripts/copy-pdf-worker.mjs`:

```js
// Copies PDF.js's background "worker" file into public/ so the browser can load
// it from /pdf.worker.min.mjs. Runs automatically before `npm run dev` and
// `npm run build` ("predev" / "prebuild" in package.json), so it always matches
// the installed pdfjs-dist version.
import { copyFileSync } from "node:fs";

copyFileSync("node_modules/pdfjs-dist/build/pdf.worker.min.mjs", "public/pdf.worker.min.mjs");
console.log("Copied pdf.worker.min.mjs to public/");
```

In `package.json` → `"scripts"`, add two lines:

```json
    "predev": "node scripts/copy-pdf-worker.mjs",
    "prebuild": "node scripts/copy-pdf-worker.mjs",
```

npm runs `predev` before every `npm run dev`, and `prebuild` before every build, including the one inside Docker.

The copied file is generated, so keep it out of git. Add this line to `frontend/.gitignore`:

```
/public/pdf.worker.min.mjs
```

In `next.config.mjs`, inside `nextConfig`, add:

```js
  // Loaded by Node at runtime instead of bundled: Google's sign-in library
  // reads its own files and environment at runtime.
  serverExternalPackages: ["google-auth-library"],
```

### 8b. Learner actions: `src/app/certification/learn/actions.js`

```js
"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireStudent } from "@/lib/dal";
import { getSanityClient } from "@/lib/sanity/client";
import {
  ANSWER_KEY_QUERY,
  EXAM_SET_QUESTIONS_QUERY,
  KNOWLEDGE_CHECK_QUERY,
} from "@/lib/sanity/queries";
import { loadLearnerCourse } from "@/lib/learner";
import { buildAttemptPaper, chooseExamSet, retakeAvailableAt } from "@/lib/learning";
import { finishAttempt, SUBMIT_GRACE_MS } from "@/lib/exam";
import { formatDate } from "@/lib/formatDate";

// Every action re-checks: signed-in learner, enrolled, and the step unlocked.
// The page that rendered the button already checked — but these are public
// endpoints, so they never trust that.

async function findUnlockedStep(userId, code, moduleId) {
  const course = await loadLearnerCourse(userId, code);
  const step = course?.outline?.steps.find((s) => s._id === moduleId);
  return step?.unlocked ? { course, step } : null;
}

function refresh(code) {
  revalidatePath(`/certification/learn/${code.toLowerCase()}`, "layout");
  revalidatePath("/certification/dashboard");
}

/** The learner reached the last page and clicked "Mark as read". */
export async function markModuleRead(code, moduleId) {
  const user = await requireStudent();
  const found = await findUnlockedStep(user.id, code, moduleId);
  if (!found) return { error: "This module is locked." };
  if (!found.step.hasPdf) return { error: "This module has no study material yet." };

  const userCertificationId = found.course.enrolment.id;
  await prisma.moduleProgress.upsert({
    where: { userCertificationId_moduleId: { userCertificationId, moduleId } },
    create: { userCertificationId, moduleId, readAt: new Date() },
    update: found.step.read ? {} : { readAt: new Date() },
  });
  refresh(found.course.code);
  return { ok: true };
}

/**
 * Mark the 2–3 questions after a PDF. All must be correct to move on.
 * answers: { [questionId]: optionKey }
 * The right answers are only revealed once every answer is correct.
 */
export async function submitKnowledgeCheck(code, moduleId, answers) {
  const user = await requireStudent();
  const found = await findUnlockedStep(user.id, code, moduleId);
  if (!found) return { error: "This module is locked." };
  if (!found.step.read) return { error: "Finish reading the PDF first." };

  const sanity = getSanityClient();
  const questions = await sanity.fetch(KNOWLEDGE_CHECK_QUERY, { moduleId });
  if (!questions.length) return { error: "This module has no questions." };

  const keyRows = await sanity.fetch(ANSWER_KEY_QUERY, { ids: questions.map((q) => q._id) });
  const key = Object.fromEntries(keyRows.map((r) => [r._id, r]));

  const results = questions.map((q) => ({
    id: q._id,
    correct: typeof answers?.[q._id] === "string" && answers[q._id] === key[q._id]?.correct,
  }));
  const right = results.filter((r) => r.correct).length;

  if (right < results.length) {
    return {
      passed: false,
      results,
      message: `${right} of ${results.length} correct. Review the PDF and try the ones marked wrong again.`,
    };
  }

  const userCertificationId = found.course.enrolment.id;
  await prisma.moduleProgress.update({
    where: { userCertificationId_moduleId: { userCertificationId, moduleId } },
    data: { checkPassedAt: new Date() },
  });
  refresh(found.course.code);

  return {
    passed: true,
    results,
    explanations: Object.fromEntries(questions.map((q) => [q._id, key[q._id]?.explanation ?? ""])),
  };
}

/** Start the final exam: pick a set, freeze the paper, start the clock. */
export async function startExam(code) {
  const user = await requireStudent();
  const course = await loadLearnerCourse(user.id, code);
  if (!course?.outline?.examUnlocked) return { error: "Finish every module first." };
  if (course.enrolment.status === "passed") return { error: "You have already passed this exam." };

  const attempts = await prisma.examAttempt.findMany({
    where: { userCertificationId: course.enrolment.id },
    orderBy: { startedAt: "desc" },
  });

  // Already sitting it (another tab, or a double click)? Just carry on.
  const open = attempts.find((a) => !a.submittedAt);
  if (open && open.deadlineAt.getTime() + SUBMIT_GRACE_MS > Date.now()) {
    refresh(course.code);
    return { ok: true };
  }
  if (open) {
    await finishAttempt(open.id, null); // timed out without submitting
    refresh(course.code);
    return { error: "Your previous attempt ran out of time and has been marked. Reload the page." };
  }

  const lastFailed = attempts.find((a) => a.submittedAt && a.passed === false);
  const waitUntil = retakeAvailableAt(lastFailed?.submittedAt, course.cert.exam?.retakeWaitDays ?? 1);
  if (waitUntil) {
    return { error: `You can retake the exam from ${formatDate(waitUntil, { withTime: true })}.` };
  }

  const set = chooseExamSet(course.cert.examSets ?? [], attempts.map((a) => a.examSet));
  if (set === null) return { error: "The exam isn't available yet. Please check back later." };

  const questions = await getSanityClient().fetch(EXAM_SET_QUESTIONS_QUERY, { code: course.code, set });
  if (!questions.length) return { error: "The exam isn't available yet. Please check back later." };

  const minutes = course.cert.exam?.durationMinutes ?? 60;
  const now = new Date();
  await prisma.examAttempt.create({
    data: {
      userCertificationId: course.enrolment.id,
      examSet: set,
      paper: buildAttemptPaper(questions),
      startedAt: now,
      deadlineAt: new Date(now.getTime() + minutes * 60 * 1000),
    },
  });
  refresh(course.code);
  return { ok: true };
}

/** Hand in the exam. answers: { [questionId]: optionKey } */
export async function submitExam(attemptId, answers) {
  const user = await requireStudent();
  const attempt = await prisma.examAttempt.findUnique({
    where: { id: Number(attemptId) },
    include: { userCertification: true },
  });
  if (!attempt || attempt.userCertification.userId !== user.id) return { error: "Attempt not found." };

  const done = await finishAttempt(attempt.id, answers);
  refresh(attempt.userCertification.certificationCode);
  return { ok: true, passed: done.passed, percentage: done.percentage };
}
```

### 8c. Components (`src/components/Learn/`)

`PdfReader.jsx`: shows the PDF **one page at a time**, with no scrolling:

```
┌──────────────────────────────────────────────┐
│              (one PDF page)                  │
├──────────────────────────────────────────────┤
│  [← Previous]     Page 3 of 12     [Next →]  │
│  ▓▓▓▓▓░░░░░░░░░░░░░░  (progress bar)         │
└──────────────────────────────────────────────┘
        … on the last page, Next becomes:   [✓ Mark as read]
```

- The page is fitted to the width of the reader. **Next** / **Previous** (or the ← / → keys) turn pages.
- There is no "jump to page", so the only way to **Mark as read** is through every page.
- Only the current page is drawn, which keeps big PDFs fast on phones. Clicking Next quickly cancels drawing the previous page.

```jsx
"use client";

import { useEffect, useRef, useState } from "react";

// Shows a PDF ONE PAGE AT A TIME with Previous / Next buttons — no scrolling.
// On the last page, "Next" becomes "Mark as read", which calls onFinish().
// There is no "jump to page", so the only way to the last page is through
// every page. ← / → keys turn pages too.
//
// PDF.js decodes the file; its background "worker" is served from
// /pdf.worker.min.mjs (copied into public/ by scripts/copy-pdf-worker.mjs).
export default function PdfReader({ src, onFinish, finishing = false, alreadyRead = false }) {
  const frameRef = useRef(null);
  const canvasRef = useRef(null);
  const [pdf, setPdf] = useState(null);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("loading"); // loading | ready | error
  const [drawing, setDrawing] = useState(false);

  // 1) Load the document once per file.
  useEffect(() => {
    let cancelled = false;
    let doc;
    (async () => {
      const pdfjs = await import("pdfjs-dist");
      pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
      doc = await pdfjs.getDocument({ url: src }).promise;
      if (cancelled) return doc.destroy();
      setPdf(doc);
      setPage(1);
      setStatus("ready");
    })().catch((err) => {
      console.error("[PdfReader]", err);
      if (!cancelled) setStatus("error");
    });
    return () => {
      cancelled = true;
      doc?.destroy();
    };
  }, [src]);

  // 2) Draw the current page whenever it changes, fitted to the frame's width.
  useEffect(() => {
    if (!pdf) return;
    let cancelled = false;
    let task;
    (async () => {
      setDrawing(true);
      const p = await pdf.getPage(page);
      if (cancelled) return;
      const fit = frameRef.current.clientWidth / p.getViewport({ scale: 1 }).width;
      const viewport = p.getViewport({ scale: fit * (window.devicePixelRatio || 1) });
      const canvas = canvasRef.current;
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      task = p.render({ canvas, canvasContext: canvas.getContext("2d"), viewport });
      await task.promise;
      if (!cancelled) setDrawing(false);
    })().catch((err) => {
      // Clicking Next quickly cancels the old page's drawing — that is expected.
      if (err?.name !== "RenderingCancelledException") console.error("[PdfReader]", err);
    });
    return () => {
      cancelled = true;
      task?.cancel();
    };
  }, [pdf, page]);

  const total = pdf?.numPages ?? 0;
  const onLastPage = total > 0 && page === total;
  const go = (step) => setPage((p) => Math.min(Math.max(p + step, 1), total));

  // Keyboard: ← and → turn pages (→ stops at the last page).
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowRight" && !onLastPage) go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  if (status === "error") {
    return (
      <p className="py-10 text-center text-sm text-red-600">
        The study material could not be loaded. Refresh the page to try again.
      </p>
    );
  }

  return (
    <div onContextMenu={(e) => e.preventDefault()} className="rounded-2xl border border-mist bg-white">
      <div ref={frameRef} className="relative min-h-[300px] p-3">
        {status === "loading" && <p className="py-10 text-center text-sm text-shuttle">Loading study material…</p>}
        <canvas
          ref={canvasRef}
          className={`w-full rounded-lg transition-opacity ${drawing ? "opacity-60" : ""}`}
          aria-label={`Page ${page} of ${total}`}
        />
      </div>

      {total > 0 && (
        <div className="border-t border-mist p-4">
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => go(-1)}
              disabled={page === 1}
              className="rounded-xl border border-mist px-4 py-2 text-sm font-semibold text-ink disabled:opacity-40"
            >
              ← Previous
            </button>

            <span className="text-sm text-shuttle">
              Page {page} of {total}
            </span>

            {onLastPage ? (
              <button
                type="button"
                onClick={onFinish}
                disabled={finishing || alreadyRead}
                className="rounded-xl bg-green-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
              >
                {alreadyRead ? "✓ Read" : finishing ? "Saving…" : "✓ Mark as read"}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => go(1)}
                className="rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white"
              >
                Next →
              </button>
            )}
          </div>

          <div className="mt-3 h-1.5 rounded-full bg-mist">
            <div className="h-1.5 rounded-full bg-brand transition-all" style={{ width: `${(page / total) * 100}%` }} />
          </div>
        </div>
      )}
    </div>
  );
}
```

`ModuleStep.jsx`: PDF → **Mark as read** (last page) → knowledge check → next. If the module has **no** knowledge-check questions, **Mark as read** goes straight to the next module:

```jsx
"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import PdfReader from "./PdfReader";

// One module: click through the PDF page by page → "Mark as read" on the last
// page → answer the knowledge check (all correct to continue) → next module or
// exam. With no knowledge check, "Mark as read" goes straight to the next module.
export default function ModuleStep({
  hasPdf,
  materialUrl,
  initialRead,
  initialPassed,
  questions,
  markReadAction,
  submitCheckAction,
  nextHref,
  nextLabel,
}) {
  const router = useRouter();
  const [read, setRead] = useState(initialRead);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(initialPassed ? { passed: true } : null);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  const complete = read && (questions.length === 0 || result?.passed);

  function finishReading() {
    setError("");
    startTransition(async () => {
      const r = await markReadAction();
      if (r?.error) return setError(r.error);
      setRead(true);
      // Nothing to answer for this module: straight on to the next one.
      if (questions.length === 0) router.push(nextHref);
    });
  }

  function submitCheck(event) {
    event.preventDefault();
    setError("");
    startTransition(async () => {
      const r = await submitCheckAction(answers);
      if (r?.error) setError(r.error);
      else setResult(r);
    });
  }

  const wrong = new Set(result?.results?.filter((r) => !r.correct).map((r) => r.id));

  return (
    <div className="space-y-8">
      {hasPdf ? (
        <PdfReader src={materialUrl} onFinish={finishReading} finishing={pending} alreadyRead={read} />
      ) : (
        <p className="rounded-xl border border-mist bg-white p-6 text-sm text-shuttle">
          The study material for this module is coming soon.
        </p>
      )}

      {read && questions.length > 0 && (
        <form onSubmit={submitCheck} className="space-y-6 rounded-2xl border border-mist bg-white p-6">
          <div>
            <h2 className="text-lg font-semibold text-ink">Knowledge check</h2>
            <p className="text-sm text-shuttle">Answer all {questions.length} correctly to unlock the next module.</p>
          </div>

          {questions.map((q, i) => (
            <fieldset key={q._id} className={`rounded-xl border p-4 ${wrong.has(q._id) ? "border-red-300 bg-red-50" : "border-mist"}`}>
              <legend className="px-1 text-sm font-medium text-ink">
                {i + 1}. {q.prompt}
              </legend>
              <div className="mt-2 space-y-2">
                {q.options.map((o) => (
                  <label key={o._key} className="flex items-start gap-2 text-sm">
                    <input
                      type="radio"
                      name={q._id}
                      checked={answers[q._id] === o._key}
                      disabled={result?.passed}
                      onChange={() => setAnswers((a) => ({ ...a, [q._id]: o._key }))}
                      className="mt-1"
                    />
                    <span>{o.text}</span>
                  </label>
                ))}
              </div>
              {wrong.has(q._id) && <p className="mt-2 text-xs text-red-700">Not quite — try again.</p>}
              {result?.passed && result.explanations?.[q._id] && (
                <p className="mt-2 text-xs text-green-800">{result.explanations[q._id]}</p>
              )}
            </fieldset>
          ))}

          {result && !result.passed && <p className="text-sm text-red-700">{result.message}</p>}

          {!result?.passed && (
            <button
              type="submit"
              disabled={pending || Object.keys(answers).length < questions.length}
              className="rounded-xl bg-brand px-6 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
            >
              {pending ? "Checking…" : "Check answers"}
            </button>
          )}
        </form>
      )}

      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}

      {complete && (
        <div className="rounded-2xl border border-green-200 bg-green-50 p-6">
          <p className="font-semibold text-green-800">Module complete ✓</p>
          <Link href={nextHref} className="mt-3 inline-block rounded-xl bg-brand px-6 py-2.5 text-sm font-semibold text-white">
            {nextLabel} →
          </Link>
        </div>
      )}
    </div>
  );
}
```

### 8d. Pages

`src/app/certification/learn/[code]/page.js`, the outline:

```js
import Link from "next/link";
import { redirect } from "next/navigation";
import { requireStudent } from "@/lib/dal";
import { loadLearnerCourse } from "@/lib/learner";

export const metadata = { robots: { index: false, follow: false } };

const ICON = { done: "✓", current: "▶", locked: "🔒" };

// /certification/learn/pam101 — the learning path: modules in order, then the exam.
export default async function CoursePage({ params }) {
  const user = await requireStudent();
  const { code } = await params;
  const course = await loadLearnerCourse(user.id, code);
  if (!course) redirect("/certification/dashboard"); // not theirs, or unknown

  const base = `/certification/learn/${course.code.toLowerCase()}`;
  const outline = course.outline;

  return (
    <section className="bg-catskill px-4 py-16">
      <div className="mx-auto max-w-3xl">
        <Link href="/certification/dashboard" className="text-sm text-shuttle hover:text-brand">
          ← My dashboard
        </Link>
        <p className="mt-6 text-xs font-semibold text-brand">{course.cert.label}</p>
        <h1 className="mt-1 text-3xl font-semibold text-ink">{course.cert.course?.title ?? course.cert.title}</h1>

        {!outline ? (
          <p className="mt-8 text-shuttle">Course content is coming soon.</p>
        ) : (
          <>
            <p className="mt-2 text-sm text-shuttle">
              {outline.completed} of {outline.total} modules complete
            </p>
            <ol className="mt-8 space-y-3">
              {outline.steps.map((s) => {
                const row = (
                  <div className="flex items-center gap-4">
                    <span className="w-6 text-center">{ICON[s.state]}</span>
                    <div className="flex-1">
                      <p className={`font-medium ${s.state === "locked" ? "text-slate-soft" : "text-ink"}`}>
                        Module {s.order}: {s.title}
                      </p>
                      {s.checkCount > 0 && (
                        <p className="text-xs text-shuttle">PDF + {s.checkCount}-question knowledge check</p>
                      )}
                    </div>
                  </div>
                );
                return (
                  <li key={s._id} className="rounded-xl border border-mist bg-white p-4">
                    {s.unlocked ? <Link href={`${base}/${s._id}`}>{row}</Link> : row}
                  </li>
                );
              })}

              <li className="rounded-xl border-2 border-brand/30 bg-white p-4">
                {outline.examUnlocked ? (
                  <Link href={`${base}/exam`} className="flex items-center gap-4">
                    <span className="w-6 text-center">{course.enrolment.status === "passed" ? "✓" : "▶"}</span>
                    <span className="font-semibold text-ink">Final exam</span>
                  </Link>
                ) : (
                  <div className="flex items-center gap-4">
                    <span className="w-6 text-center">🔒</span>
                    <span className="font-semibold text-slate-soft">Final exam — unlocks after the last module</span>
                  </div>
                )}
              </li>
            </ol>
          </>
        )}
      </div>
    </section>
  );
}
```

`src/app/certification/learn/[code]/[moduleId]/page.js`, one module:

```js
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { requireStudent } from "@/lib/dal";
import { getSanityClient } from "@/lib/sanity/client";
import { KNOWLEDGE_CHECK_QUERY } from "@/lib/sanity/queries";
import { loadLearnerCourse } from "@/lib/learner";
import { markModuleRead, submitKnowledgeCheck } from "../../actions";
import ModuleStep from "@/components/Learn/ModuleStep";

export const metadata = { robots: { index: false, follow: false } };

// /certification/learn/pam101/<moduleId> — one module's PDF and knowledge check.
export default async function ModulePage({ params }) {
  const user = await requireStudent();
  const { code, moduleId } = await params;
  const course = await loadLearnerCourse(user.id, code);
  if (!course?.outline) redirect("/certification/dashboard");

  const base = `/certification/learn/${course.code.toLowerCase()}`;
  const steps = course.outline.steps;
  const index = steps.findIndex((s) => s._id === moduleId);
  if (index < 0) notFound();
  const step = steps[index];
  if (!step.unlocked) redirect(base); // typed the address of a locked module

  const questions = step.checkCount
    ? await getSanityClient().fetch(KNOWLEDGE_CHECK_QUERY, { moduleId: step._id })
    : [];
  const next = steps[index + 1];

  return (
    <section className="bg-catskill px-4 py-12">
      <div className="mx-auto max-w-4xl">
        <Link href={base} className="text-sm text-shuttle hover:text-brand">
          ← {course.cert.label} outline
        </Link>
        <h1 className="mt-4 text-2xl font-semibold text-ink">
          Module {step.order}: {step.title}
        </h1>
        {step.summary && <p className="mt-2 text-sm text-shuttle">{step.summary}</p>}

        <div className="mt-8">
          <ModuleStep
            key={step._id}
            hasPdf={step.hasPdf}
            materialUrl={`/api/materials/${step._id}`}
            initialRead={step.read}
            initialPassed={step.checkCount > 0 && step.checkPassed}
            questions={questions}
            markReadAction={markModuleRead.bind(null, course.code, step._id)}
            submitCheckAction={submitKnowledgeCheck.bind(null, course.code, step._id)}
            nextHref={next ? `${base}/${next._id}` : `${base}/exam`}
            nextLabel={next ? `Next: Module ${next.order}` : "Go to the final exam"}
          />
        </div>
      </div>
    </section>
  );
}
```

### 8e. Protect the new pages in the proxy

In `src/proxy.js`:

**(1)** Change the dashboard condition to also cover `/certification/learn`:

```js
  if (
    pathname.startsWith("/certification/dashboard") ||
    pathname.startsWith("/certification/learn") ||
    pathname === "/certification/change-password"
  ) {
```

**(2)** Add `"/certification/learn/:path*",` to the `matcher` list.

✅ **Check** (learner enrolled in PAM101, Module 1 Drive link added, knowledge checks imported):
1. Dashboard → PAM101 → **Start** shows Module 1 ▶ and the rest 🔒.
2. Open Module 1. The PDF shows **page 1 only**, with *Page 1 of N* and a **Next →** button. There is no scroll bar for the document.
3. Click **Next →** until the last page (or use the → key). **← Previous** goes back. On the last page, **Next** changes to **✓ Mark as read**.
4. Click **Mark as read**. The knowledge check appears. If the module has no knowledge check, you go straight to the next module.
5. Answer one wrong. It's marked *Not quite — try again*, and the correct answer is **not** revealed.
6. Answer all correctly. You see the explanations, *Module complete ✓* and **Next: Module 2 →**.
7. Type the address of Module 3 directly. You're sent back to the outline.
8. While signed out, open `/api/materials/<module3 id>`. You get `Sign in first`. Signed in, with Module 3 still locked, you get `This module is locked`.

---

## Stage 9 — Final exam

`src/components/Learn/ExamStart.jsx`:

```jsx
"use client";

import { useActionState } from "react";

// "Start exam" button with a last confirmation. `action` is startExam with the
// certification code bound by the page.
export default function ExamStart({ action, minutes }) {
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form
      action={formAction}
      onSubmit={(e) => {
        if (!window.confirm(`Start the exam now? The ${minutes}-minute timer starts immediately and cannot be paused.`)) {
          e.preventDefault();
        }
      }}
    >
      <button
        type="submit"
        disabled={pending}
        className="rounded-xl bg-brand px-8 py-3 text-sm font-semibold text-white disabled:opacity-60"
      >
        {pending ? "Preparing your paper…" : "Start exam"}
      </button>
      {state?.error && <p role="alert" className="mt-3 text-sm text-red-600">{state.error}</p>}
    </form>
  );
}
```

`src/components/Learn/ExamRunner.jsx`, the paper and timer:

```jsx
"use client";

import { useEffect, useRef, useState, useTransition } from "react";

// The exam paper with a countdown. Answers are kept in this browser tab
// (sessionStorage) so an accidental refresh doesn't lose them, and sent to the
// server only on "Submit" — or automatically when time runs out. The server
// keeps its own clock, so changing the computer's time changes nothing.
export default function ExamRunner({ attemptId, deadlineAt, serverNow, questions, submitAction }) {
  const storageKey = `iraje-exam-${attemptId}`;
  const [answers, setAnswers] = useState({});
  const [secondsLeft, setSecondsLeft] = useState(null);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const submitted = useRef(false);

  // Restore answers saved in this tab (after mount, so server and browser
  // render the same first screen).
  useEffect(() => {
    try {
      const saved = JSON.parse(sessionStorage.getItem(storageKey) || "{}");
      if (saved && typeof saved === "object") setAnswers(saved);
    } catch {}
  }, [storageKey]);

  function choose(questionId, optionKey) {
    setAnswers((prev) => {
      const next = { ...prev, [questionId]: optionKey };
      try {
        sessionStorage.setItem(storageKey, JSON.stringify(next));
      } catch {}
      return next;
    });
  }

  function submit(auto = false) {
    if (submitted.current) return;
    const unanswered = questions.length - Object.keys(answers).length;
    if (!auto && unanswered > 0 && !window.confirm(`${unanswered} question(s) are unanswered. Submit anyway?`)) return;
    submitted.current = true;
    startTransition(async () => {
      const r = await submitAction(attemptId, answers);
      if (r?.error) {
        submitted.current = false;
        setError(r.error);
        return;
      }
      try {
        sessionStorage.removeItem(storageKey);
      } catch {}
      // The page refreshes itself (the action revalidates it) and shows the result.
    });
  }

  // Countdown, corrected for any difference between this computer's clock and the server's.
  // The timer always calls the newest submit(), which knows the latest answers.
  const latestSubmit = useRef(submit);
  useEffect(() => {
    latestSubmit.current = submit;
  });
  useEffect(() => {
    const offset = new Date(serverNow).getTime() - Date.now();
    const deadline = new Date(deadlineAt).getTime();
    const tick = () => {
      const left = Math.max(0, Math.round((deadline - (Date.now() + offset)) / 1000));
      setSecondsLeft(left);
      if (left === 0) latestSubmit.current(true);
    };
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [deadlineAt, serverNow]);

  const answered = Object.keys(answers).length;
  const mm = secondsLeft === null ? "--" : String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const ss = secondsLeft === null ? "--" : String(secondsLeft % 60).padStart(2, "0");

  return (
    <div>
      <div className="sticky top-0 z-10 -mx-4 mb-6 flex items-center justify-between border-b border-mist bg-white/95 px-4 py-3 backdrop-blur">
        <p className="text-sm text-shuttle">
          Answered <strong className="text-ink">{answered}</strong> of {questions.length}
        </p>
        <p className={`font-mono text-lg font-semibold ${secondsLeft !== null && secondsLeft < 300 ? "text-red-600" : "text-ink"}`}>
          {mm}:{ss}
        </p>
      </div>

      <ol className="space-y-6">
        {questions.map((q, i) => (
          <li key={q.id} className="rounded-2xl border border-mist bg-white p-5">
            <p className="text-sm font-medium text-ink">
              {i + 1}. {q.prompt}
            </p>
            <div className="mt-3 space-y-2">
              {q.options.map((o) => (
                <label key={o._key} className="flex items-start gap-2 text-sm">
                  <input
                    type="radio"
                    name={q.id}
                    checked={answers[q.id] === o._key}
                    disabled={pending}
                    onChange={() => choose(q.id, o._key)}
                    className="mt-1"
                  />
                  <span>{o.text}</span>
                </label>
              ))}
            </div>
          </li>
        ))}
      </ol>

      {error && <p role="alert" className="mt-4 text-sm text-red-600">{error}</p>}

      <button
        type="button"
        onClick={() => submit(false)}
        disabled={pending}
        className="mt-8 w-full rounded-xl bg-brand px-6 py-3 text-sm font-semibold text-white disabled:opacity-60"
      >
        {pending ? "Submitting…" : "Submit exam"}
      </button>
    </div>
  );
}
```

`src/app/certification/learn/[code]/exam/page.js`:

```js
import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireStudent } from "@/lib/dal";
import { getSanityClient } from "@/lib/sanity/client";
import { QUESTIONS_BY_ID_QUERY } from "@/lib/sanity/queries";
import { loadLearnerCourse } from "@/lib/learner";
import { finishAttempt, SUBMIT_GRACE_MS } from "@/lib/exam";
import { retakeAvailableAt } from "@/lib/learning";
import { formatDate } from "@/lib/formatDate";
import { startExam, submitExam } from "../../actions";
import ExamStart from "@/components/Learn/ExamStart";
import ExamRunner from "@/components/Learn/ExamRunner";

export const metadata = { robots: { index: false, follow: false } };

// /certification/learn/pam101/exam — start screen, the paper itself, or the result.
export default async function ExamPage({ params }) {
  const user = await requireStudent();
  const { code } = await params;
  const course = await loadLearnerCourse(user.id, code);
  if (!course?.outline) redirect("/certification/dashboard");
  const base = `/certification/learn/${course.code.toLowerCase()}`;
  const exam = course.cert.exam ?? {};

  const loadAttempts = () =>
    prisma.examAttempt.findMany({
      where: { userCertificationId: course.enrolment.id },
      orderBy: { startedAt: "desc" },
      include: { certificate: true },
    });
  let attempts = await loadAttempts();

  // Close any attempt whose time ran out without a submit (tab closed, etc.).
  const expired = attempts.filter((a) => !a.submittedAt && a.deadlineAt.getTime() + SUBMIT_GRACE_MS < Date.now());
  if (expired.length) {
    for (const a of expired) await finishAttempt(a.id, null);
    attempts = await loadAttempts();
  }

  const open = attempts.find((a) => !a.submittedAt);
  const passed = attempts.find((a) => a.passed);
  const last = attempts.find((a) => a.submittedAt);

  let body;
  if (passed) {
    const cert = passed.certificate;
    body = (
      <div className="rounded-2xl border border-green-200 bg-green-50 p-8">
        <p className="text-2xl font-semibold text-green-800">Passed — {passed.percentage}% 🎉</p>
        {cert && (
          <>
            <p className="mt-3 text-sm text-ink">
              Certificate number: <span className="font-mono font-semibold">{cert.certificateNo}</span>
            </p>
            <p className="text-sm text-shuttle">Valid until {formatDate(cert.expiresAt)} · emailed to {user.email}</p>
            <a
              href={`/api/certificates/${cert.certificateNo}/pdf`}
              className="mt-5 inline-block rounded-xl bg-brand px-6 py-2.5 text-sm font-semibold text-white"
            >
              Download certificate
            </a>
          </>
        )}
      </div>
    );
  } else if (open) {
    // Show the frozen paper in its saved order, with no answer key.
    const rows = await getSanityClient().fetch(QUESTIONS_BY_ID_QUERY, { ids: open.paper.map((q) => q.id) });
    const byId = new Map(rows.map((q) => [q._id, q]));
    const questions = open.paper
      .filter((p) => byId.has(p.id))
      .map((p) => {
        const q = byId.get(p.id);
        const options = new Map(q.options.map((o) => [o._key, o]));
        return { id: q._id, prompt: q.prompt, options: p.options.map((k) => options.get(k)).filter(Boolean) };
      });
    body = (
      <ExamRunner
        attemptId={open.id}
        deadlineAt={open.deadlineAt.toISOString()}
        serverNow={new Date().toISOString()}
        questions={questions}
        submitAction={submitExam}
      />
    );
  } else if (!course.outline.examUnlocked) {
    body = <p className="text-shuttle">The exam unlocks after you complete every module.</p>;
  } else {
    const failedAt = attempts.find((a) => a.passed === false)?.submittedAt;
    const waitUntil = retakeAvailableAt(failedAt, exam.retakeWaitDays ?? 1);
    body = (
      <div className="space-y-6">
        {last && (
          <p className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            Last attempt: {last.percentage}% — the pass mark is {exam.passPercentage}%.
          </p>
        )}
        <ul className="list-disc space-y-1 pl-5 text-sm text-ink">
          <li>Time allowed: {exam.durationMinutes} minutes — the timer cannot be paused.</li>
          <li>Pass mark: {exam.passPercentage}%. One mark per question, no negative marking.</li>
          <li>Multiple choice, True / False and fill-in-the-blank questions.</li>
          <li>If you don&apos;t pass, you can try again after {exam.retakeWaitDays === 1 ? "24 hours" : `${exam.retakeWaitDays} days`}.</li>
        </ul>
        {waitUntil ? (
          <p className="text-sm font-semibold text-ink">
            You can retake the exam from {formatDate(waitUntil, { withTime: true })}.
          </p>
        ) : (
          <ExamStart action={startExam.bind(null, course.code)} minutes={exam.durationMinutes} />
        )}
      </div>
    );
  }

  return (
    <section className="bg-catskill px-4 py-12">
      <div className="mx-auto max-w-3xl">
        <Link href={base} className="text-sm text-shuttle hover:text-brand">
          ← {course.cert.label} outline
        </Link>
        <h1 className="mt-4 mb-8 text-2xl font-semibold text-ink">{course.cert.label} — Final exam</h1>
        {body}
      </div>
    </section>
  );
}
```

**Exam rules, all enforced on the server:**
- The paper is **frozen when you click Start**: which set, question order and option order. Refreshing doesn't change it.
- Answers are kept in the browser tab until **Submit**, so a refresh doesn't lose them. When time runs out, the paper is **submitted automatically**.
- Answers that arrive more than 2 minutes after the deadline count as unanswered. If the tab is closed, the attempt is marked when the learner next opens the exam page.
- A failed attempt means the next one is allowed after `retakeWaitDays` (1 = 24 hours). A new attempt prefers a **set not seen before**.

✅ **Check:**
1. Complete every module. The outline's **Final exam** unlocks.
2. **Start exam** shows the paper with a timer counting down.
3. Answer badly and submit. You see *Last attempt: 20%* and *You can retake the exam from …* about 24 hours later.
4. To test a pass without waiting, set that learner's last attempt back in time in MySQL:
   ```sql
   UPDATE exam_attempts SET submitted_at = UTC_TIMESTAMP() - INTERVAL 2 DAY WHERE id = <attempt id>;
   ```
   Retake and answer correctly. You see **Passed 🎉**, a certificate number and **Download certificate**.
5. The dev-server terminal shows the certificate email with `Attached: IRJ-PAM101-….pdf`.

---

## Stage 10 — Certificate download and the Verify portal

`src/app/api/certificates/[number]/pdf/route.js`, for downloading your own certificate again:

```js
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/dal";
import { getSanityClient } from "@/lib/sanity/client";
import { normalizeCertificateNumber } from "@/lib/learning";
import { renderCertificatePdf } from "@/lib/certificatePdf";

// GET /api/certificates/<number>/pdf — download your own certificate again.
// The PDF is rebuilt from the database each time, so nothing extra is stored.
export async function GET(request, { params }) {
  const { number: raw } = await params;
  const number = normalizeCertificateNumber(raw);
  const user = await getCurrentUser();
  if (!user) return new Response("Sign in first.", { status: 401 });
  if (!number) return new Response("Not found.", { status: 404 });

  const cert = await prisma.certificate.findUnique({
    where: { certificateNo: number },
    include: { userCertification: { select: { userId: true } } },
  });
  if (!cert || (cert.userCertification.userId !== user.id && user.role !== "admin")) {
    return new Response("Not found.", { status: 404 });
  }

  const templateUrl = await getSanityClient().fetch(
    `*[_type == "certification" && code == $code][0].certificateTemplate.asset->url`,
    { code: cert.certificationCode },
  );
  const pdf = await renderCertificatePdf(cert, templateUrl ?? null);

  return new Response(pdf, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${cert.certificateNo}.pdf"`,
      "Cache-Control": "private, no-store",
    },
  });
}
```

`src/app/api/certificates/verify/route.js`, public and rate-limited:

```js
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { normalizeCertificateNumber } from "@/lib/learning";
import { createRateLimiter, clientIp } from "@/lib/rateLimit";

// 30 checks per 15 minutes per network: plenty for a person, too few to guess
// numbers by brute force (there are about a trillion per certification).
const limiter = createRateLimiter({ limit: 30, windowMs: 15 * 60 * 1000 });

// GET /api/certificates/verify?number=IRJ-PAM101-7K2Q-9XM4 — public.
// Answers only what a verifier needs; never the email or anything private.
export async function GET(request) {
  if (!limiter.check(clientIp(request)).allowed) {
    return NextResponse.json({ status: "error", message: "Too many checks. Please try again in a few minutes." }, { status: 429 });
  }

  const number = normalizeCertificateNumber(new URL(request.url).searchParams.get("number"));
  if (!number) {
    return NextResponse.json({ status: "invalid", message: "That doesn't look like an Iraje certificate number (IRJ-XXX000-XXXX-XXXX)." });
  }

  const cert = await prisma.certificate.findUnique({ where: { certificateNo: number } });
  if (!cert) return NextResponse.json({ status: "not_found", number });

  const status =
    cert.status === "revoked" ? "revoked" : cert.expiresAt < new Date() ? "expired" : "valid";

  return NextResponse.json({
    status,
    number,
    holderName: cert.holderName,
    certificationCode: cert.certificationCode,
    certificationTitle: cert.certificationTitle,
    issuedAt: cert.issuedAt,
    expiresAt: cert.expiresAt,
  });
}
```

Replace `src/components/Certification/CertVerify.jsx`. It's now a working form:

```jsx
"use client";

import { useState } from "react";
import CertSection from "./CertSection";
import certification from "@/data/certification";

// Verification Portal: type a certificate number, press Verify, and see whether
// it is valid, expired, revoked or unknown. Calls /api/certificates/verify.
const STATUS = {
  valid: { tone: "bg-green-50 text-green-900", title: "✓ Verified — this certificate is valid" },
  expired: { tone: "bg-amber-50 text-amber-900", title: "This certificate was genuine but has expired" },
  revoked: { tone: "bg-red-50 text-red-900", title: "This certificate has been revoked" },
  not_found: { tone: "bg-red-50 text-red-900", title: "No certificate with this number exists" },
};

function formatDate(iso) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

export default function CertVerify() {
  const { eyebrow, heading, intro, placeholder, cta, hint } = certification.verify;
  const [number, setNumber] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  async function verify(event) {
    event.preventDefault();
    if (!number.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch(`/api/certificates/verify?number=${encodeURIComponent(number.trim())}`);
      setResult(await res.json());
    } catch {
      setResult({ status: "error", message: "Could not reach the server. Please try again." });
    } finally {
      setLoading(false);
    }
  }

  const look = result && STATUS[result.status];

  return (
    <CertSection id="verify" tone="light">
      <div className="rounded-[55px] bg-[linear-gradient(180deg,#0451CC_0%,#022966_100%)] p-10 md:p-14">
        <span className="epm-eyebrow epm-eyebrow-normal font-medium text-white/70">{eyebrow}</span>
        <h2 className="mt-4 epm-heading leading-[1.05] font-medium tracking-[-2px] text-white">{heading}</h2>
        <p className="mt-6 max-w-xl epm-body leading-relaxed text-white/80">{intro}</p>

        <form onSubmit={verify} className="mt-8 flex max-w-xl flex-col gap-3 sm:flex-row">
          <input
            type="text"
            value={number}
            onChange={(e) => setNumber(e.target.value)}
            placeholder={placeholder}
            aria-label="Certificate number"
            className="flex-1 rounded-xl bg-white px-5 py-3.5 text-sm text-ink uppercase outline-none placeholder:text-slate-soft/70 placeholder:normal-case"
          />
          <button
            type="submit"
            disabled={loading}
            className="rounded-full bg-white px-8 py-3.5 text-sm font-semibold text-brand transition hover:bg-white/90 disabled:opacity-60"
          >
            {loading ? "Checking…" : cta}
          </button>
        </form>
        <p className="mt-4 text-xs text-white/60">{hint}</p>

        {result && (
          <div role="status" className={`mt-6 max-w-xl rounded-2xl p-5 text-sm ${look?.tone ?? "bg-white text-ink"}`}>
            <p className="font-semibold">{look?.title ?? result.message}</p>
            {result.holderName && (
              <dl className="mt-3 grid grid-cols-3 gap-y-1">
                <dt className="opacity-70">Holder</dt>
                <dd className="col-span-2 font-medium">{result.holderName}</dd>
                <dt className="opacity-70">Certification</dt>
                <dd className="col-span-2">
                  {result.certificationCode} — {result.certificationTitle}
                </dd>
                <dt className="opacity-70">Number</dt>
                <dd className="col-span-2 font-mono">{result.number}</dd>
                <dt className="opacity-70">Issued</dt>
                <dd className="col-span-2">{formatDate(result.issuedAt)}</dd>
                <dt className="opacity-70">Valid until</dt>
                <dd className="col-span-2">{formatDate(result.expiresAt)}</dd>
              </dl>
            )}
          </div>
        )}
      </div>
    </CertSection>
  );
}
```

In `src/data/certification.js`, update the `verify` block. Verification is by **number** only; looking people up by email would let anyone check who is certified.

```js
  verify: {
    eyebrow: "Verification Portal",
    heading: "Verify an Iraje certificate",
    intro:
      "Employers and customers can confirm any Iraje certification instantly. Enter the certificate number printed on the certificate.",
    placeholder: "e.g. IRJ-PAM101-7K2Q-9XM4",
    cta: "Verify",
    hint: "Certificate numbers look like IRJ-PAM101-XXXX-XXXX.",
  },
```

Finally, the admin **Learners** page, `src/app/admin/(panel)/learners/page.js`:

```js
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/dal";
import { formatDate } from "@/lib/formatDate";

const STATUS_STYLES = {
  in_progress: "bg-amber-100 text-amber-800",
  passed: "bg-green-100 text-green-800",
};

// /admin/learners — who is doing which certification, and how far they are.
export default async function LearnersPage() {
  await requireAdmin();

  const learners = await prisma.user.findMany({
    where: { role: "student" },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      mustChangePassword: true,
      certifications: {
        orderBy: { certificationCode: "asc" },
        select: {
          id: true,
          certificationCode: true,
          status: true,
          startedAt: true,
          progress: { select: { readAt: true } },
          examAttempts: { where: { submittedAt: { not: null } }, select: { percentage: true } },
          certificate: { select: { certificateNo: true } },
        },
      },
    },
  });

  return (
    <div>
      <h1 className="text-2xl font-semibold">Learners</h1>
      <p className="mt-1 text-sm text-shuttle">{learners.length} learner(s)</p>

      <div className="mt-6 overflow-x-auto rounded-xl border border-mist bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-catskill text-xs text-shuttle uppercase">
            <tr>
              <th className="px-4 py-3">Learner</th>
              <th className="px-4 py-3">Certification</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">PDFs read</th>
              <th className="px-4 py-3">Exam attempts (best)</th>
              <th className="px-4 py-3">Certificate</th>
            </tr>
          </thead>
          <tbody>
            {learners.flatMap((l) =>
              (l.certifications.length ? l.certifications : [null]).map((c, i) => (
                <tr key={`${l.id}-${c?.id ?? "none"}`} className="border-t border-mist align-top">
                  <td className="px-4 py-3">
                    {i === 0 && (
                      <>
                        <div className="font-medium">{l.name}</div>
                        <div className="text-xs text-shuttle">{l.email}</div>
                        {l.mustChangePassword && <div className="text-xs text-amber-700">Not signed in yet</div>}
                      </>
                    )}
                  </td>
                  {c ? (
                    <>
                      <td className="px-4 py-3 font-medium">
                        {c.certificationCode}
                        <div className="text-xs font-normal text-shuttle">since {formatDate(c.startedAt)}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_STYLES[c.status] ?? "bg-mist"}`}>
                          {c.status === "passed" ? "passed" : "in progress"}
                        </span>
                      </td>
                      <td className="px-4 py-3">{c.progress.filter((p) => p.readAt).length}</td>
                      <td className="px-4 py-3">
                        {c.examAttempts.length
                          ? `${c.examAttempts.length} (best ${Math.max(...c.examAttempts.map((a) => a.percentage ?? 0))}%)`
                          : "—"}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs">{c.certificate?.certificateNo ?? "—"}</td>
                    </>
                  ) : (
                    <td className="px-4 py-3 text-shuttle" colSpan={5}>
                      No certifications
                    </td>
                  )}
                </tr>
              )),
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

✅ **Check:**
1. **Download certificate** gives a PDF with the name, title, number and dates in the right places. Adjust `LAYOUT` until they are.
2. On `/certification#verify`, enter the number in **lower case**. You see *✓ Verified* with the name, certification and dates.
3. Enter `IRJ-PAM101-AAAA-AAAA`. You see *No certificate with this number exists*.
4. In MySQL, `UPDATE certificates SET expires_at = UTC_TIMESTAMP() - INTERVAL 1 DAY WHERE id = 1;`, then verify again. You see *…has expired*. Undo it afterwards.
5. **Admin → Learners** lists each learner's certifications, PDFs read, attempts and certificate number.

---

## Stage 11 — Deploy

### 11a. Nothing extra for Drive

Cloud Run already runs as `iraje-run@PROJECT.iam.gserviceaccount.com`, the account you shared the Drive folder with in Stage 4. On Cloud Run the website signs in as it automatically: no keys, no extra settings. The Drive API is already enabled (4a).

### 11b. Secrets (once)

The site has never had the Sanity settings on Cloud Run (the `--set-env-vars` note from last time). Pages now need them. Store the two tokens in Secret Manager, the same way as the Graph secret:

```powershell
"<read token>"  | Out-File -NoNewline -Encoding ascii s.txt; gcloud secrets create iraje-sanity-read-token  --data-file=s.txt
"<write token>" | Out-File -NoNewline -Encoding ascii s.txt; gcloud secrets create iraje-sanity-write-token --data-file=s.txt
Remove-Item s.txt
```

Grant the runtime service account `roles/secretmanager.secretAccessor` on each, as in Step 13a last time.

### 11c. `cloudbuild.yaml`, deploy step

Extend the two lines (keep what's already there and add the Sanity settings):

```yaml
      - --set-secrets=DATABASE_URL=${_DB_SECRET}:latest,GRAPH_CLIENT_SECRET=${_GRAPH_SECRET}:latest,SANITY_API_READ_TOKEN=iraje-sanity-read-token:latest,SANITY_API_WRITE_TOKEN=iraje-sanity-write-token:latest
      - --set-env-vars=MAIL_TRANSPORT=graph,MAIL_FROM=${_MAIL_FROM},CONTACT_TO=${_CONTACT_TO},APP_URL=${_APP_URL},GRAPH_TENANT_ID=${_GRAPH_TENANT_ID},GRAPH_CLIENT_ID=${_GRAPH_CLIENT_ID},SANITY_PROJECT_ID=g6lrqpst,SANITY_DATASET=production,SANITY_API_VERSION=2026-02-01
```

Deploy with `gcloud builds submit --config cloudbuild.yaml`. The migration job creates the 4 new tables on production first.

✅ **Check:** on the live site, sign in as Sharayu → **Study materials** → **Preview** a module. The PDF opens, which proves Cloud Run can read the Drive folder.

> If it fails with *Drive refused access* only on Cloud Run (it works on your PC): open the Cloud Run service → **Security** tab and confirm the service account is `iraje-run@…`. Your PC acts as that account, so they must match.

---

## Full end-to-end test

| # | Do | Expect |
|---|---|---|
| 1 | Approve a request for PAM101 + EPM101 | 2 rows in `user_certifications` |
| 2 | Learner signs in, changes password | Dashboard: PAM101 and EPM101 open, others 🔒 |
| 3 | Request access on PAM201 | Form opens with PAM201 ticked |
| 4 | Open PAM101 Module 2 directly before Module 1 | Sent back to the outline |
| 5 | Module 1: look for **Mark as read** on page 1 | Not there. Only **Next →** until the last page |
| 6 | Knowledge check with a wrong answer | Marked wrong; correct answer not shown |
| 7 | All correct | Module 2 unlocks |
| 8 | Finish all modules | Final exam unlocks |
| 9 | Fail the exam | Retake from +24 h |
| 10 | Try to start again at once | "You can retake the exam from …" |
| 11 | Pass (after moving time back in MySQL) | Certificate number, email with PDF attached |
| 12 | Verify the number | ✓ Valid, with name, certification and dates |
| 13 | Verify a made-up number | Not found |
| 14 | Admin → Learners | Shows passed and the certificate number |
| 15 | Browser dev tools → Network, during a knowledge check or exam | No response contains `isCorrect` |

---

## Troubleshooting

| Problem | Likely cause | Fix |
|---|---|---|
| PDF area says *could not be loaded*; browser console mentions `pdf.worker` | Worker not copied | Restart `npm run dev` (it runs `predev`), and check `public/pdf.worker.min.mjs` exists |
| *This module is locked* when it shouldn't be | Previous module's check not passed | Admin → Learners, or check `module_progress` |
| Import says `there is no module with order 11` | Chapter number has no matching module | Check module **Order** values in Studio |
| **Preview** or a learner gets *temporarily unavailable* | Drive link or sharing problem | Open **Admin → Study materials → Preview**; admins see the exact reason (table in Stage 4) |
| A replaced PDF still shows the old version | The website keeps each PDF for up to 10 minutes | Wait 10 minutes, or restart the server |
| Certificate text in the wrong place | Your design's layout | Adjust `LAYOUT` in `certificatePdf.js` |
| Certificate email not arriving | Email is still in console mode, or Graph isn't set up | Step 12 of the previous guide |
| *This app is blocked* when signing in for 4c | Plain `gcloud auth application-default login` asking for Drive | Use the `--impersonate-service-account` command exactly as in 4c |

---

## Not included (candidates for later)

- **Revoking a certificate** from the admin panel. For now, `UPDATE certificates SET status='revoked' WHERE certificate_no='…';`.
- **Resuming a half-finished exam on a different computer.** Answers are saved in the browser tab; a different device starts with no answers, while the timer keeps running.
- **Video lessons** (`lesson` type in Sanity): the path is PDF-only for now.
- **Proctoring** (webcam, tab-switch detection).
