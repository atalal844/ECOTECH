type RateRecord = {
  count: number;
  resetAt: number;
};

const store = new Map<string, RateRecord>();

export function checkRateLimit(
  key: string,
  maxRequests = 15,
  windowMs = 60_000
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const existing = store.get(key);

  if (!existing || now > existing.resetAt) {
    const record: RateRecord = { count: 1, resetAt: now + windowMs };
    store.set(key, record);
    return { allowed: true, remaining: maxRequests - 1, resetAt: record.resetAt };
  }

  if (existing.count >= maxRequests) {
    return { allowed: false, remaining: 0, resetAt: existing.resetAt };
  }

  existing.count += 1;
  return {
    allowed: true,
    remaining: Math.max(0, maxRequests - existing.count),
    resetAt: existing.resetAt,
  };
}
