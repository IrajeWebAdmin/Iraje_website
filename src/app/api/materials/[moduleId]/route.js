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
