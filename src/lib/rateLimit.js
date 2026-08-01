// Sliding-window-counter rate limiting.
//
// Counters live in this process's memory. That is correct for a single
// always-on Node server — one process, one shared tally — and WRONG on any
// autoscaled or serverless host, where every instance keeps its own counter and
// the effective limit multiplies by the number of instances. If this site moves
// to Vercel (or runs behind more than one Node process), swap the Map for a
// shared store such as Redis; the algorithm below is unchanged by that move.

const HOUR_MS = 60 * 60 * 1000;

/**
 * Create an isolated limiter. Each limiter owns its own counters, so separate
 * concerns (contact form, and later login / password reset) never share quota.
 *
 * Sliding window counter: the previous window's count is blended into the
 * current one, weighted by how far the current window has advanced. That closes
 * the hole in a fixed window, where a caller can spend a full quota just before
 * the boundary and another immediately after it — double the intended rate.
 */
export function createRateLimiter({ limit, windowMs = HOUR_MS }) {
  const buckets = new Map(); // key -> { windowStart, current, previous }
  let lastSweep = Date.now();

  // Drop counters that can no longer affect any estimate. Without this the Map
  // grows for every IP ever seen, which is its own denial-of-service.
  function sweep(now) {
    if (now - lastSweep < windowMs) return;
    lastSweep = now;
    const cutoff = now - 2 * windowMs;
    for (const [key, bucket] of buckets) {
      if (bucket.windowStart < cutoff) buckets.delete(key);
    }
  }

  return {
    limit,
    windowMs,

    /**
     * Record an attempt for `key` and report whether it is allowed.
     *
     * Every call counts, including ones that later turn out to be invalid —
     * otherwise the endpoint can be flooded for free with malformed payloads.
     */
    check(key) {
      const now = Date.now();
      sweep(now);

      const windowStart = Math.floor(now / windowMs) * windowMs;
      let bucket = buckets.get(key);

      if (!bucket) {
        bucket = { windowStart, current: 0, previous: 0 };
        buckets.set(key, bucket);
      } else if (bucket.windowStart !== windowStart) {
        // Exactly one window on: the last count becomes the decaying tail.
        // Two or more windows on: nothing is left to carry forward.
        bucket.previous =
          windowStart - bucket.windowStart === windowMs ? bucket.current : 0;
        bucket.current = 0;
        bucket.windowStart = windowStart;
      }

      const elapsed = now - windowStart;
      const weight = (windowMs - elapsed) / windowMs;
      const estimate = bucket.previous * weight + bucket.current;
      const msToWindowEnd = windowStart + windowMs - now;

      if (estimate >= limit) {
        const waitMs = msUntilAllowed(bucket, limit, windowMs, now, windowStart);
        const retryAfterSeconds = Math.max(1, Math.ceil(waitMs / 1000));
        return {
          allowed: false,
          remaining: 0,
          retryAfterSeconds,
          resetSeconds: retryAfterSeconds,
        };
      }

      bucket.current += 1;
      return {
        allowed: true,
        remaining: Math.max(0, Math.floor(limit - estimate - 1)),
        retryAfterSeconds: 0,
        resetSeconds: Math.ceil(msToWindowEnd / 1000),
      };
    },
  };
}

/**
 * How long until the blended estimate falls back under the limit.
 *
 * Usually the previous window decaying inside this one is enough. If this
 * window has on its own already reached the limit, no amount of decay helps and
 * the wait rolls into the next window — where this window's count becomes the
 * tail that has to decay in turn.
 */
function msUntilAllowed(bucket, limit, windowMs, now, windowStart) {
  const headroom = limit - bucket.current;

  if (headroom > 0 && bucket.previous > 0) {
    const elapsedNeeded = windowMs * (1 - headroom / bucket.previous);
    if (elapsedNeeded <= windowMs) {
      return Math.max(0, windowStart + elapsedNeeded - now);
    }
  }

  const nextWindowStart = windowStart + windowMs;
  if (headroom > 0) return nextWindowStart - now;
  return nextWindowStart + windowMs * (1 - limit / bucket.current) - now;
}

/**
 * Best-effort client IP for an incoming request.
 *
 * `NextRequest.ip` was removed in Next 15, so this reads the headers a reverse
 * proxy sets instead. Order matters — the first two are set by the proxy itself
 * and cannot be forged by the caller, whereas `x-forwarded-for` is appended to,
 * so a client can prepend a fake entry.
 *
 * IMPORTANT: this is only trustworthy if the app sits behind a proxy that
 * overwrites these headers. If Node is ever exposed directly to the internet,
 * anyone can set `x-forwarded-for` freely and sidestep every IP-keyed limit.
 */
export function clientIp(request) {
  const headers = request.headers;

  const cloudflare = headers.get("cf-connecting-ip");
  if (cloudflare) return cloudflare.trim();

  const realIp = headers.get("x-real-ip");
  if (realIp) return realIp.trim();

  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0].trim();
    if (first) return first;
  }

  // No proxy headers at all — local dev, or a direct connection. One shared
  // bucket is the safe failure mode: it throttles rather than waves through.
  return "unknown";
}
