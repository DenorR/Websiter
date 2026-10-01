/** Скользящее окно в памяти. Достаточно для одного процесса; для нескольких — вынесите в Redis. */
export function createRateLimiter({ limit, windowMs = 60 * 60 * 1000 }) {
  const hits = new Map();

  const prune = (key, now) => {
    const list = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
    if (list.length) hits.set(key, list);
    else hits.delete(key);
    return list;
  };

  const timer = setInterval(() => {
    const now = Date.now();
    for (const key of [...hits.keys()]) prune(key, now);
  }, 10 * 60 * 1000);
  timer.unref();

  return {
    take(key) {
      if (!limit) return { ok: true };
      const now = Date.now();
      const list = prune(key, now);
      if (list.length >= limit) {
        return { ok: false, retryAfterSec: Math.ceil((windowMs - (now - list[0])) / 1000) };
      }
      list.push(now);
      hits.set(key, list);
      return { ok: true };
    },
    refund(key) {
      const list = hits.get(key);
      if (list?.length) list.pop();
    },
  };
}
