/**
 * In-memory rate limiter by IP. Use for API routes to throttle abuse.
 * In serverless, state is per-instance; for multi-instance limits use Redis/KV.
 */

const windowMs = 60 * 1000; // 1 minute
const maxPerWindow = 60; // e.g. 60 requests per minute per IP

const store = new Map<string, { count: number; resetAt: number }>();

function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  const real = request.headers.get("x-real-ip");
  if (real) return real;
  return "unknown";
}

export function checkRateLimit(request: Request): { ok: true } | { ok: false; retryAfter: number } {
  const ip = getClientIp(request);
  const now = Date.now();
  let entry = store.get(ip);

  if (!entry) {
    entry = { count: 1, resetAt: now + windowMs };
    store.set(ip, entry);
    return { ok: true };
  }

  if (now >= entry.resetAt) {
    entry.count = 1;
    entry.resetAt = now + windowMs;
    return { ok: true };
  }

  entry.count += 1;
  if (entry.count > maxPerWindow) {
    return { ok: false, retryAfter: Math.ceil((entry.resetAt - now) / 1000) };
  }
  return { ok: true };
}
