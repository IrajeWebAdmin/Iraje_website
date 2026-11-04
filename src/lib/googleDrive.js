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
