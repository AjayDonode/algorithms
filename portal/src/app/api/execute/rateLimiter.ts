/**
 * Simple in-memory rate limiter for the /api/execute endpoint.
 *
 * Uses a sliding-window approach: each IP gets a bucket of timestamps.
 * Old timestamps outside the window are purged on every check.
 *
 * Not suitable for multi-instance deployments (use Redis there),
 * but perfect for a single Next.js dev server.
 */

interface Bucket {
  timestamps: number[]; // epoch ms of each request
  blocked: boolean;
  blockedUntil: number; // epoch ms when block expires
}

const WINDOW_MS    = 60_000;  // sliding window: 1 minute
const MAX_REQUESTS = 15;      // max runs per window per IP
const BLOCK_MS     = 60_000;  // how long to block after exceeding limit
const CLEANUP_EVERY = 100;    // purge stale buckets every N calls

const store = new Map<string, Bucket>();
let callsSinceCleanup = 0;

function cleanup() {
  const now = Date.now();
  for (const [ip, bucket] of store.entries()) {
    if (!bucket.blocked && bucket.timestamps.every(t => now - t > WINDOW_MS)) {
      store.delete(ip);
    }
  }
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number; // requests left in window
  retryAfterMs: number; // 0 if allowed
}

export function checkRateLimit(ip: string): RateLimitResult {
  const now = Date.now();

  if (++callsSinceCleanup >= CLEANUP_EVERY) {
    callsSinceCleanup = 0;
    cleanup();
  }

  let bucket = store.get(ip);

  // Initialise bucket for new IP
  if (!bucket) {
    bucket = { timestamps: [], blocked: false, blockedUntil: 0 };
    store.set(ip, bucket);
  }

  // Check if still in a block period
  if (bucket.blocked) {
    if (now < bucket.blockedUntil) {
      return { allowed: false, remaining: 0, retryAfterMs: bucket.blockedUntil - now };
    }
    // Block expired — reset
    bucket.blocked = false;
    bucket.timestamps = [];
  }

  // Slide the window: remove timestamps older than WINDOW_MS
  bucket.timestamps = bucket.timestamps.filter(t => now - t <= WINDOW_MS);

  if (bucket.timestamps.length >= MAX_REQUESTS) {
    // Exceeded — apply block
    bucket.blocked = true;
    bucket.blockedUntil = now + BLOCK_MS;
    return { allowed: false, remaining: 0, retryAfterMs: BLOCK_MS };
  }

  // Allow — record this request
  bucket.timestamps.push(now);
  return {
    allowed: true,
    remaining: MAX_REQUESTS - bucket.timestamps.length,
    retryAfterMs: 0,
  };
}
