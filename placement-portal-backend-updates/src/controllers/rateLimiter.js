const rateLimitMap = new Map()

function rateLimiter(limit, windowMs) {
  return async (c, next) => {
    const ip =
      c.req.header('CF-Connecting-IP') ||
      c.req.header('x-forwarded-for') ||
      c.req.raw?.connection?.remoteAddress ||
      'unknown'

    const now = Date.now()
    const entry = rateLimitMap.get(ip) || { count: 0, lastRequestTime: now }

    if (now - entry.lastRequestTime > windowMs) {
      // Reset rate limit window
      entry.count = 1
      entry.lastRequestTime = now
    } else {
      entry.count++
    }

    rateLimitMap.set(ip, entry)

    if (entry.count > limit) {
      return c.json(
        { error: '⛔ Too many login attempts. Please try again in a minute.' },
        429
      )
    }

    await next()
  }
}

export { rateLimiter }
