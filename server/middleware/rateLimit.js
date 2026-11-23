'use strict';

/*
 * Small in-memory limiter. Good enough for a single-process prototype;
 * replace with Redis-backed limiting before running multiple instances.
 */
function rateLimit({ windowMs, max }) {
  const clients = new Map();

  function cleanup(now) {
    for (const [key, record] of clients) {
      if (record.resetAt <= now) clients.delete(key);
    }
  }

  return function limit(request, response, next) {
    const now = Date.now();
    const key = request.ip || request.socket.remoteAddress || 'unknown';
    let record = clients.get(key);

    if (!record || record.resetAt <= now) {
      record = { count: 0, resetAt: now + windowMs };
      clients.set(key, record);
    }

    record.count += 1;
    if (record.count > max) {
      const retryAfter = Math.max(1, Math.ceil((record.resetAt - now) / 1000));
      response.setHeader('Retry-After', String(retryAfter));
      response.status(429).json({
        error: {
          code: 'RATE_LIMITED',
          message: '请求太频繁，请稍后再试。'
        }
      });
      return;
    }

    if (clients.size > 1000) cleanup(now);
    next();
  };
}

module.exports = { rateLimit };
