# Handover: `/products/pam` shows "This page couldn't load" (ChunkLoadError)

_Investigated 2026-11-17. Self-contained: written so another person (or another Claude session on a different machine) can pick this up without the original conversation._

---

## 1. Symptom

- Visiting https://iraje.com/products/pam sometimes shows the Next.js default error screen: **"This page couldn't load — Reload to try again, or go back. [Reload] [Back]"**.
- Clicking **Reload** makes the page load correctly.
- Opening `/products/pam` directly in a fresh tab always works. It fails when arriving **from the home page** (`/`) via a client-side link (e.g. the "Explore Privileged Access Manager" card), reliably reproduced in a browser.

Browser console at the moment of failure:

```
ChunkLoadError: Failed to load chunk /_next/static/chunks/1lz3_8bkw3q2l.js from module 64893
    at https://iraje.com/_next/static/chunks/turbopack-2mw8c5a630y7a.js:1:6162
```

`https://iraje.com/_next/static/chunks/1lz3_8bkw3q2l.js` → **404 Not Found**.

---

## 2. Root cause

**The CDN (Firebase Hosting) is serving a stale copy of the home page from an older build.** That old page's JavaScript asks for chunk files that were removed when a newer build was deployed.

### Hosting setup (confirmed)

- `iraje.com` is served by **Firebase Hosting** (project **`iraje-web-prod-506114`**, project number `914802649601`), which rewrites all traffic to **Cloud Run** (`asia-south1`, service name in `cloudbuild.yaml` = `iraje-website`).
  - Evidence: response header `x-fh-requested-host`; `https://iraje.com/__/firebase/init.json` returns `projectId: iraje-web-prod-506114`; `src/lib/sessionCookie.js` notes the `__session` cookie is required because of Firebase Hosting.
- Deploys go through `cloudbuild.yaml`: build → push → migrate → **`gcloud run deploy`**. Before the change in §4 there was **no Firebase Hosting release step**.
- **Firebase Hosting only purges its CDN cache on a new _Hosting_ release** — not when the Cloud Run service is redeployed.

### Why pages are cached so long

- No file under `src/app` sets `revalidate` / `dynamic` / `generateStaticParams`, so every public page is fully static and Next.js sends:
  `Cache-Control: s-maxage=31536000` (1 year).
- Firebase Hosting honours that and keeps each page for up to a year.

### Evidence of mixed builds (2026-11-17)

Build ID (`"b"` field in the HTML / `buildId` in RSC payloads):

| URL | Build ID | CDN |
|---|---|---|
| `/` (home HTML) | `NAz5jY1HgAEA4hwo8oLAP` ← **old** | `X-Cache: HIT` |
| `/products/pam`, `/about`, `/events`, `/products/epm`, `/products/iam`, `/contact`, `/university`, `/certification` | `95ZWvBZhFrfYjbaMkbueP` ← current | |
| `/products/pam?_rsc=…` (`/_tree` prefetch) | `NlLZjqHcBVJcdpns6fjuh` ← another old one | `X-Cache: HIT` |

The stale home page also references `083wsj5ch0ve1.css` and `3ltkans0xxv3z.js`, both **404**.

### Failure sequence

1. User opens `/` → gets the old cached home page (old build JS).
2. Clicks to PAM → old client runtime loads PAM via its own (old) chunk map → requests `1lz3_8bkw3q2l.js` → 404.
3. `ChunkLoadError` → no `global-error.js` in the app → Next.js default "This page couldn't load" screen.
4. **Reload** = full page load of `/products/pam`, whose cached HTML is the current build → works.

---

## 3. How to check the current state

Run in Git Bash:

```bash
# 1. Cache lifetime. Now: s-maxage=31536000. After fix: s-maxage=3600 (+ stale-while-revalidate)
curl -sI https://iraje.com/ | grep -i cache-control

# 2. Build IDs must MATCH across pages. Now: NAz5… vs 95ZW…
curl -s https://iraje.com/             | grep -oE '\\"b\\":\\"[^\\]+'
curl -s https://iraje.com/products/pam | grep -oE '\\"b\\":\\"[^\\]+'

# 3. deploymentId active? Now: prints nothing. After fix: prints ?dpl=<id>
curl -s https://iraje.com/ | grep -oE '\?dpl=[^"&]+' | head -1

# 4. Is the response from the CDN cache?
curl -sI https://iraje.com/ | grep -i x-cache
```

Baseline output captured 2026-11-17 (before any fix):

```
Cache-Control: s-maxage=31536000
\"b\":\"NAz5jY1HgAEA4hwo8oLAP
\"b\":\"95ZWvBZhFrfYjbaMkbueP
(no ?dpl= output)
```

---

## 4. Changes already made in this repo (UNCOMMITTED as of writing)

These are in the working tree of `Iraje_website` and have **not** been committed. Per the team git workflow, put them on a task branch (e.g. `fix/firebase-hosting-cache`) and open a PR — no direct commits to `main`.

| File | Change |
|---|---|
| `cloudbuild.yaml` | New substitution `_FIREBASE_PROJECT: iraje-web-prod-506114`. New final step `release-hosting` that runs `npx -y firebase-tools@latest deploy --only hosting --project ${_FIREBASE_PROJECT} --non-interactive`, with `allowFailure: true`. |
| `firebase.json` (new) | `hosting.public = "firebase-hosting"` (empty dir) + rewrite `"**"` → Cloud Run `serviceId: iraje-website`, `region: asia-south1`. |
| `.firebaserc` (new) | default project `iraje-web-prod-506114`. |
| `firebase-hosting/.gitkeep` (new) | Empty public dir so Hosting serves no static files itself; everything goes to Next.js (matches current live behaviour). |

### ⚠ Risks / must confirm before this step can succeed

1. **The Cloud Run service name must be correct.** `firebase.json` uses `iraje-website` (from `cloudbuild.yaml`'s `_SERVICE`). If the trigger overrides `_SERVICE`, or the real service has a different name, a successful Hosting deploy will **point the whole site at a non-existent service → site down**. Check the `gcloud run deploy …` line in a past build log, or the Cloud Run page.
2. **A Hosting deploy replaces the entire live Hosting config.** The original `firebase.json` was never in this repo. Live behaviour observed (all paths → Next.js, trailing-slash 308 comes from Next, `www.iraje.com` and `iraje-web-prod-506114.web.app` both serve the app, no Hosting-level static files) matches the simple rewrite above. If whoever set it up added custom redirects/headers, compare with their copy first.
3. **The trigger may not use `cloudbuild.yaml`.** The file's comments mention a trigger created from the Cloud Run console; some of those build directly from the Dockerfile and ignore this file. If so, the new step never runs.

### What happens if this is pushed to `main` now

- Build and Cloud Run deploy run as before (no app code changed) → site behaves the same.
- `release-hosting` step runs. Two outcomes:
  - **403 / "does not have permission"** → step fails, build stays green (`allowFailure`). Nothing fixed, nothing broken.
  - **"Deploy complete!"** → the build service account already had permission (e.g. builds run as the Compute Engine default SA with the Editor role). Hosting config is replaced and the CDN cache is purged → stale home page fixed. **This is why risk #1 must be confirmed first.**

---

## 5. Access / permissions needed

The Firebase CLI on the original machine was logged in as a teammate's account that gets **`403 The caller does not have permission`** on `iraje-web-prod-506114`, so neither the person investigating nor the build can currently release Hosting.

| Task | Needs | Notes |
|---|---|---|
| **A. Clear the stale home page right now** | Someone with Firebase Hosting rights on `iraje-web-prod-506114` runs `firebase deploy --only hosting` from this repo (after confirming §4 risks), **or** one successful build with the new step. | Only a Hosting release purges what's already cached. Code changes alone will NOT clear the cached home page. |
| **B. Let the `release-hosting` step work** | The service account Cloud Build runs as needs **Firebase Hosting Admin** (`roles/firebasehosting.admin`). | Same project is not enough by itself. Legacy SA `914802649601@cloudbuild.gserviceaccount.com` does NOT have it by default. Compute default SA `914802649601-compute@developer.gserviceaccount.com` usually does (Editor), unless the org disabled that. The build log of the step tells you which. |
| **C. Code changes in §6** | No console access — normal push / deploy. | Prevents recurrence even if the Hosting step fails. |

---

## 6. Code changes still TO DO (not yet made)

This repo runs **Next.js 16.2.9**, JavaScript only, App Router under **`src/app`**. Per `AGENTS.md`/`CLAUDE.md`, check `node_modules/next/dist/docs/01-app/` before writing Next.js code.

### 6.1 Cap the CDN cache at 1 hour: `src/app/layout.js`

Add (route segment config on the root layout applies to every route below it; admin/certification pages are dynamic via cookies and are unaffected):

```js
export const revalidate = 3600;
```

Next then sends `s-maxage=3600, stale-while-revalidate=…` instead of a year.
Do **not** try to set `Cache-Control` for pages in `next.config` `headers()` — Next overwrites it for pages in production.
Checked 2026-11-17: no other file in `src/app` sets `revalidate`/`dynamic`, so nothing overrides this.

### 6.2 Version-skew protection: `deploymentId`

`next.config.mjs`, add inside `nextConfig`:

```js
deploymentId: process.env.DEPLOYMENT_VERSION || `build-${Date.now()}`,
```

(Don't use `git rev-parse`: `.dockerignore` excludes `.git`, so it fails inside the Docker build.)

`Dockerfile`, in the **`builder`** stage, before `RUN npm run build`:

```dockerfile
ARG DEPLOYMENT_VERSION
ENV DEPLOYMENT_VERSION=${DEPLOYMENT_VERSION}
```

`cloudbuild.yaml`, `build-app` step args, before the final `- .`:

```yaml
      - --build-arg=DEPLOYMENT_VERSION=$BUILD_ID
```

Effect: static assets get `?dpl=<id>`, client navigations send `x-deployment-id`, and on a client/server mismatch Next does a hard reload instead of fetching chunks that no longer exist. `output: 'standalone'` serialises the config at build time, so server and client always agree on the ID.

### 6.3 Auto-recover from ChunkLoadError: `src/app/global-error.js` (new)

No `global-error.js` exists today (the only `error.js` is `src/app/admin/(panel)/reports/error.js`, which doesn't cover public pages).

```js
"use client";

import { useEffect } from "react";

const RELOAD_FLAG = "chunk-error-reloaded";

function isChunkError(error) {
  if (!(error instanceof Error)) return false;
  return (
    error.name === "ChunkLoadError" ||
    /Failed to load chunk|Loading chunk .* failed|Failed to fetch dynamically imported module/i.test(error.message)
  );
}

export default function GlobalError({ error, retry }) {
  const chunkError = isChunkError(error);

  useEffect(() => {
    if (!chunkError) return;
    try {
      if (sessionStorage.getItem(RELOAD_FLAG)) return; // already retried once
      sessionStorage.setItem(RELOAD_FLAG, "1");
    } catch {}
    window.location.reload();
  }, [chunkError]);

  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui", display: "grid", placeItems: "center", minHeight: "100vh" }}>
        {chunkError ? (
          <p>Updating to the latest version…</p>
        ) : (
          <div style={{ textAlign: "center" }}>
            <h2>Something went wrong</h2>
            <button onClick={() => retry?.()}>Try again</button>{" "}
            <button onClick={() => window.location.reload()}>Reload</button>
          </div>
        )}
      </body>
    </html>
  );
}
```

New `src/app/clear-chunk-flag.js`:

```js
"use client";

import { useEffect } from "react";

// Clears the one-time auto-reload flag set by global-error.js once a page renders OK.
export function ClearChunkFlag() {
  useEffect(() => {
    try {
      sessionStorage.removeItem("chunk-error-reloaded");
    } catch {}
  }, []);
  return null;
}
```

And in `src/app/layout.js`: `import { ClearChunkFlag } from "./clear-chunk-flag";` and render `<ClearChunkFlag />` as the first child of `<body>`.

(React Compiler is enabled — don't add `useMemo`/`useCallback`.)

### 6.4 Unrelated bug found: broken icon (404 on every page)

`public/icons/Ownershi- &-impact.svg`, referenced at `src/data/about.js:150`. The space + `&` in the filename break the URL (`/icons/Ownershi-%20&-impact.svg` → 404). Rename the file to e.g. `ownership-impact.svg` and update the reference.

---

## 7. Recommended order

1. **Now:** someone with Firebase access confirms the Cloud Run service name, then runs `firebase deploy --only hosting` once → stale home page gone, users fixed.
2. Task branch + PR with §4 (already in the working tree) + §6 code changes. Local check before pushing:
   ```bash
   npm run build && node .next/standalone/server.js   # or npm start
   curl -s http://localhost:3000/ | grep -oE '\?dpl=[^"&]+' | head -1        # expect ?dpl=…
   curl -sI http://localhost:3000/products/pam | grep -i cache-control       # expect s-maxage=3600
   ```
3. Grant Firebase Hosting Admin to the Cloud Build service account, if the `release-hosting` step log shows a 403.
4. After deploy: rerun the §3 checks. Expect `s-maxage=3600`, identical build IDs on `/` and `/products/pam`, and a `?dpl=` value.
