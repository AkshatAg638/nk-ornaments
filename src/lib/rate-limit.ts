/**
 * Lightweight In-Memory Rate Limiter
 *
 * Implements a sliding window counter keyed by IP or identifier.
 * Prevents brute force on sensitive endpoints (login, registration, admin setup, enquiries).
 */

interface RateLimitRecord {
  timestamps: number[];
}

const rateLimitStore = new Map<string, RateLimitRecord>();

// Clean up old entries every 5 minutes
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of rateLimitStore.entries()) {
      const validTimestamps = record.timestamps.filter((ts) => now - ts < 300000);
      if (validTimestamps.length === 0) {
        rateLimitStore.delete(key);
      } else {
        rateLimitStore.set(key, { timestamps: validTimestamps });
      }
    }
  }, 300000);
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetSeconds: number;
}

/**
 * Check if a given key has exceeded the rate limit.
 *
 * @param key Unique key (e.g., `login:${clientIp}`)
 * @param limit Max allowed requests within the window (default 5)
 * @param windowMs Time window in milliseconds (default 60,000 ms = 1 minute)
 */
export function checkRateLimit(
  key: string,
  limit: number = 5,
  windowMs: number = 60000
): RateLimitResult {
  const now = Date.now();
  const record = rateLimitStore.get(key) || { timestamps: [] };

  // Filter timestamps within the current window
  const activeTimestamps = record.timestamps.filter((ts) => now - ts < windowMs);

  if (activeTimestamps.length >= limit) {
    const oldestTimestamp = activeTimestamps[0];
    const resetSeconds = Math.max(1, Math.ceil((oldestTimestamp + windowMs - now) / 1000));
    return {
      success: false,
      limit,
      remaining: 0,
      resetSeconds,
    };
  }

  // Record this request
  activeTimestamps.push(now);
  rateLimitStore.set(key, { timestamps: activeTimestamps });

  return {
    success: true,
    limit,
    remaining: limit - activeTimestamps.length,
    resetSeconds: Math.ceil(windowMs / 1000),
  };
}

/**
 * Helper to extract client IP from Next.js request headers
 */
export function getClientIp(headers: Headers): string {
  const forwardedFor = headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }
  const realIp = headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }
  return "127.0.0.1";
}
