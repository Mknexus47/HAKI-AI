// Minimal in-memory sliding-window rate limiter.
//
// Serverless caveat: state lives per runtime instance, so a limit is enforced
// per instance — still effective against single-client hammering (the main
// abuse pattern for this endpoint), without adding external dependencies.

const windows = new Map<string, number[]>()

const WINDOW_MS = 60_000

/** Returns true when the request is allowed, false when the limit is hit. */
export function rateLimit(key: string, limit: number): boolean {
  const now = Date.now()
  const recent = (windows.get(key) ?? []).filter(
    (time) => now - time < WINDOW_MS
  )
  if (recent.length >= limit) {
    windows.set(key, recent)
    return false
  }
  recent.push(now)
  windows.set(key, recent)
  // Bound memory: drop windows that have fully expired.
  if (windows.size > 10_000) {
    for (const [key2, times] of windows) {
      if (times.every((time) => now - time >= WINDOW_MS)) windows.delete(key2)
    }
  }
  return true
}

/** Best-effort client IP (Vercel/Next set x-forwarded-for). */
export function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for")
  if (!forwarded) return "unknown"
  return forwarded.split(",")[0].trim() || "unknown"
}
