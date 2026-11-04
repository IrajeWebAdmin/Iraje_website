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

/**
 * How long ago something happened, for a glance: "just now", "25 minutes
 * ago", "3 hours ago", "yesterday", "12 days ago", then the date itself.
 */
export function formatRelative(value, now = Date.now()) {
  if (!value) return "—";
  const diff = Math.max(0, now - new Date(value).getTime());
  const minutes = Math.round(diff / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(diff / 86_400_000);
  if (days <= 1) return "yesterday";
  if (days < 30) return `${days} days ago`;
  return `on ${formatDate(value)}`;
}

/**
 * A day at a glance: "Today", "Yesterday", then "27 Oct" (with the year once
 * it is a different year). Days are counted in India time, like formatDate.
 */
export function formatDay(value, now = new Date()) {
  if (!value) return "—";
  const dayKey = (d) =>
    new Date(d).toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
  const key = dayKey(value);
  const today = dayKey(now);
  if (key === today) return "Today";
  const yesterday = dayKey(new Date(new Date(now).getTime() - 86_400_000));
  if (key === yesterday) return "Yesterday";
  const sameYear = key.slice(0, 4) === today.slice(0, 4);
  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    ...(sameYear ? {} : { year: "numeric" }),
    timeZone: "Asia/Kolkata",
  });
}
