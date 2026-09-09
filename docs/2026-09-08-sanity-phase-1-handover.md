# Iraje University — Sanity Phase 1 Handover

**Date:** 8 September 2026 · **Session scope:** planning Phase 1 (Sanity CMS / structured data) and executing Stage 1 · **Status:** Stage 1 complete, Sanity project scaffolded, schemas not yet written

This is a record of what was decided, what was changed, what was verified, and what is still outstanding. It assumes familiarity with [`certification-architecture.md`](./certification-architecture.md), which remains the authority on the learner journey, auth, exam integrity and certificates.

---

## 1. Starting position

| Thing | State at session start |
|---|---|
| `frontend/` | Git repo `IrajeWebAdmin/Iraje_website`, branch `main` |
| Stack | Next.js 16.2.9, React 19.2.4, React Compiler on, JavaScript only, Tailwind v4 |
| Database | Prisma + MySQL — `Contact` and `Enrollment` models only |
| Deployment | Docker → Google Cloud Run, with Cloud SQL and a separate `migrator` Cloud Run Job |
| Certification platform | Marketing pages built; registration works; everything after approval is greenfield |
| Sanity | Not installed, not mentioned in the architecture doc |

The five-module project timeline (Sanity → Backend Panel → Frontend Panel → User Progress → Reports) introduced Sanity as the structured content layer. The existing architecture doc predates that decision and describes a MySQL-only design, so a key job of this session was reconciling the two.

### Repository layout discovered

`Iraje_Website/` is **not** a clean monorepo. It contains:

```
Iraje_Website/
├── .git/                  vestigial — ZERO commits, no remote, branch "master"
├── frontend/
│   └── .git/              the real repo — branch "main", GitHub remote
├── Backend/               Express app from June, own package.json + node_modules
├── Frontend_Backup/       old copy
└── Sanity Schema.txt      16-byte placeholder
```

The GitHub repo named `Iraje_website` **is actually just the `frontend` folder**. The outer `.git` is an abandoned `git init` holding a single stray gitlink entry.

---

## 2. Decisions made this session

### 2.1 The boundary — the central architectural decision

> **Sanity holds what a course _is_. MySQL holds what a learner _did_.**

| Sanity | MySQL (Prisma) |
|---|---|
| Certifications, courses, modules, lessons | Users, sessions, passwords |
| Curriculum text, learning objectives | Enrollments, module progress, % complete |
| Exam configuration (question count, duration, pass %) | Exam attempts, answers, scores |
| Question bank content | Certificate issuance, revocation, audit logs |

The join key between the two systems is the **canonical certification code** (e.g. `PAM101`).

### 2.2 No user data in Sanity

The project timeline listed "users/related structured data" under the Sanity module. That was rejected: learner accounts belong in MySQL, where Prisma, sessions and password hashes already live. Putting them in Sanity would create a second source of truth for identity and a PII exposure problem, since Sanity has no per-row access control.

The only user-shaped content that could ever go in Sanity is public instructor/author profiles — deferred.

### 2.3 Course PDFs never become Sanity assets

Sanity file assets sit on a public CDN. Paid course material cannot live there. Modules carry a **`storageKey` string** pointing into private object storage (R2 / S3 / Azure Blob); the bytes are streamed through an authorising API route, per architecture doc §5.

### 2.4 Sanity Studio lives OUTSIDE `frontend/`

Studio was placed at `Iraje_Website/sanity/`, not embedded in the Next app. Reasons, heaviest first:

1. **Docker build context.** The Dockerfile builds from `frontend/` with `COPY . .`, and `.dockerignore` excludes only `node_modules .next .git .env* npm-debug.log`. Studio's dependencies would have to enter `frontend/package.json`, so `npm ci` would install the entire Studio dependency tree into the image Cloud Run serves.
2. **React collision.** `frontend/` is React 19.2.4 with the React Compiler enabled. Studio ships its own React tree and its own Vite build. One `package.json` means one React version wins, and the compiler would try to compile Studio code.
3. **Blast radius.** The frontend build already fails intermittently. A Studio dependency bump should not be able to break the public site's deploy.
4. **It buys nothing.** Studio's location has no effect on how the frontend reads content — both use `@sanity/client` against the same project ID over HTTPS.
5. **Free hosting.** `npx sanity deploy` publishes to `*.sanity.studio` at no Cloud Run cost.

### 2.5 Separate repo, not a monorepo

`sanity/` gets its own git repo. Promoting `Iraje_Website/` to a monorepo would move the Docker build context and break the Cloud Run deploy, and there is no shared code to justify it — architecture doc §8 puts the admin panel at `/admin/*` **inside** the Next app, so no separate backend service is planned.

### 2.6 Canonical certification codes

Three spellings of the same certifications were accumulating (`CT 101`, `CyberTantra 101`, plus display strings used as identifiers). Canonical set agreed:

| Canonical `code` | Track display `label` | Enrol form `label` |
|---|---|---|
| `PAM101` | PAM 101 | PAM 101 |
| `PAM201` | PAM 201 | PAM 201 |
| `EPM101` | EPM 101 | EPM 101 |
| `EPM201` | EPM 201 | EPM 201 |
| `CT101` | CT 101 | CyberTantra 101 |
| `CT201` | CT 201 | CyberTantra 201 |

`code` is the stable, URL-safe business identifier that becomes a Sanity reference and a MySQL foreign key. `label` is display copy and may change freely.

---

## 3. Stage 1 — completed changes

### 3.1 `src/data/certification.js`

- **6 track levels**: `code` changed to canonical; new `label` field carries the old display string
- **Prerequisites**: `prerequisite` now holds a canonical code (`"PAM101"`) or `null`; the `"None"` sentinel moved out of the identifier field into a new `prerequisiteLabel`
- **6 enrol options**: `code` canonical, new `label` preserving `"CyberTantra 101"` / `"CyberTantra 201"` exactly as the form displays them

Deliberately left alone as display-only copy: `dashboard.mock.courses[].code`, `certificate.sample.code`, `exam.rows`, `roadmap.levels[].items`.

### 3.2 `src/data/university.js`

5 product-certification tracks gained canonical `code` plus a `label` (`IAM 101` → `IAM101` included). The existing `pill` field was untouched.

### 3.3 Component display sites

Switched from `code` to the new display fields. **Identifiers, React keys and submitted values still use `code`.**

| File | Change |
|---|---|
| `src/components/Certification/CertTracks.jsx` | line 26 `{level.code}` → `{level.label}`; line 59 `{level.prerequisite}` → `{level.prerequisiteLabel}` |
| `src/components/Certification/CertEnroll.jsx` | line 253 only `{opt.code}` → `{opt.label}` — lines 238, 241, 249 intentionally untouched (submitted value, React key, change handler) |
| `src/components/University/UniversityCertification.jsx` | line 77 `{track.code}` → `{track.label}`; line 56 `track.code.startsWith("EPM")` still correct against `EPM101` |

### 3.4 `prisma/data-fixes/2026-09-08-canonical-certification-codes.sql` — NEW, **NOT RUN**

One-time normalisation of `certification_enrollment.certifications`, which still holds old display strings. Structure: dry-run `SELECT`, then a nested-`REPLACE` `UPDATE` (longest tokens first so `CyberTantra 101` collapses before `CT 101` is considered), then a verification query that must return zero rows. Idempotent.

**Must be run after this code deploys**, or new rows will keep landing in the old format in the gap.

### 3.5 No change needed in `src/app/api/enroll/route.js`

Lines 83–84 intersect submitted values against `certStep.options[].code`, so the route picked up the canonical codes automatically and now rejects the old strings. Verified, not edited.

---

## 4. Verification performed

- Both data files parse cleanly (`node --check` against `.mjs` copies)
- Enrol code set is **exactly** the track code set
- **Zero dangling prerequisites** — every non-null prerequisite resolves to a real code
- `/certification` and `/university` both return **HTTP 200** with zero errors in the dev log
- Every visible string is byte-identical to before the change — `PAM 101`, `CT 101`, `CyberTantra 101` all still render
- **No canonical code leaks into visible text**
- Prettier fails on all five changed files, but **also fails on them at HEAD** — pre-existing, so formatting was deliberately left alone rather than generating a whole-file reformat diff

### Not part of this work

`src/components/Iam/IamLifecycle.jsx` shows a one-character trailing-space change. That was already in the working tree before this session started.

---

## 5. Sanity project created

| | |
|---|---|
| Project ID | `g6lrqpst` |
| Dataset | `production` — **private** (verified via `sanity dataset visibility get`) |
| Sanity version | 6.12.0 |
| Language | **JavaScript** — schema files are `.js`, not `.ts` |
| Location | `C:\Users\user\Desktop\Iraje_Website\sanity` |
| Template | Clean, no predefined schemas — `schemaTypes/index.js` is `export const schemaTypes = []` |
| Plugins | `structureTool()`, `visionTool()` |
| Auto-updates | `autoUpdates: true` in `sanity.cli.js` — the deployed Studio pulls new Sanity versions on its own |

Sanity 6 is newer than the assistant's training data, so the API was verified directly: `defineType`, `defineField` and `defineArrayMember` all still exist as exported functions in 6.12.0.

**Studio Prettier style** (from its own `package.json`) differs from the frontend's — schema files must match it: no semicolons, single quotes, `bracketSpacing: false`, `printWidth: 100`.

---

## 6. What has NOT been done

- [ ] SQL data fix **not run** against MySQL
- [ ] `sanity/` has **no git repo** yet — currently at risk of being absorbed into the stray outer `.git`
- [ ] Studio **not yet confirmed booting** (`npm run dev` → localhost:3333)
- [ ] **No schema files written** — `schemaTypes/` contains only the empty `index.js`
- [ ] No seed data imported
- [ ] No frontend integration — `next-sanity` not installed, no `src/lib/sanity/`
- [ ] No CORS origins added, no read token issued
- [ ] Stage 1 changes **not committed**

---

## 7. Next steps

**Immediate (Stage 2 remainder)**

1. `git init` + commit + GitHub remote in `sanity/`
2. `npm run dev` in `sanity/` to confirm the Studio boots

**Stage 3–4 — the real content-model work**

3. Write six schema files: `certification.js`, `course.js`, `module.js`, `lesson.js`, `question.js`, `questionCategory.js`
4. Register them in `schemaTypes/index.js`; verify all six appear in the Studio sidebar

**Stage 5 — seed**

5. Create the 6 certification + 6 course documents, then script the ~61 modules from `src/data/university.js` into NDJSON and `sanity dataset import`, using deterministic `_id`s so re-import is idempotent

**Stage 6–8 — integration**

6. `npm install next-sanity @sanity/image-url` in `frontend/`; create `src/lib/sanity/{client,queries,image}.js`
7. Two clients: public (`useCdn: true`, no token) for marketing content; server-only (`useCdn: false`, Viewer token) for the question bank and `storageKey` lookups
8. Add Sanity env vars to `.env` and `.env.example`; add CORS origins; issue a **Viewer**-role read token
9. End-to-end test, including confirming `correctAnswer` never appears in a client-facing projection

---

## 8. Open questions

**Raised this session**

1. **Is `Backend/` live or legacy?** It is a real Express project with its own dependencies. The architecture doc says the admin panel goes inside the Next app, which would make it legacy — but if it is in use, the monorepo decision (§2.5) should be revisited.
2. **Module ordering.** The plan orders modules by a manual `order` number. With 19 modules in EPM 201, inserting one at position 5 means renumbering 15 documents by hand. `@sanity/orderable-document-list` gives drag-to-reorder against the same field — decide **before** seeding.
3. **Copy inconsistency preserved deliberately.** The CT 201 card reads "Prerequisite: CyberTantra 101" while the CT 101 card's pill reads "CT 101". Pre-existing display copy, not an identifier bug; left untouched as out of Stage 1 scope.

**Carried forward from the architecture doc**

4. Proctoring — soften the marketing copy, or budget for a third-party service?
5. Temp password by email, or the safer one-time set-password link?
6. Which private storage provider for course PDFs?
7. Is `academy.iraje.com` a hard requirement, or will `/academy` do for v1?
8. Does 3-year certificate validity imply re-examination?
9. Who authors 500+ questions per track, and in what import format?
10. **Outbound email is still blocked** — Microsoft 365 rejects SMTP AUTH for `inquiry@iraje.com` (`535 5.7.139 SmtpClientAuthentication is disabled for the Tenant`). Every phase transition in the platform is an email. This blocks Phase 2 regardless of Sanity progress.

---

## 9. Timeline reality check

The plan states a 24 August start with an October target across 8–10 calendar weeks. Today is 8 September. Phase 1 (2 weeks) had been scheduled to finish around 7 September; schema files are not yet written, so it will realistically land mid-to-late September. Eight to ten weeks from there falls in **early-to-mid November**, not October.

Worth resetting the target now rather than at the end, or explicitly parallelising Modules 2 and 3 once the content model freezes.
