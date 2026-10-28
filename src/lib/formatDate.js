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