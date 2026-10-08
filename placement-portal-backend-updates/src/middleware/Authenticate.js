import { getCookie } from 'hono/cookie'

export const authMiddleware = async (c, next) => {
  // Try to get token from cookie first
  try {
    const cookies = getCookie(c)
    const token =
      cookies['auth-token'] ||
      c.req.header('Authorization')?.replace('Bearer ', '')

    console.log('Received token:', token ? 'present' : 'missing')

    if (!token) {
      return c.json({ error: 'Authentication required' }, 401)
    }

    try {
      const payload = await c.env.verifyJWT(token)
      console.log('JWT payload:', payload)
      c.set('user', payload)
      await next()
    } catch (err) {
      console.error('JWT verification error:', err)
      if (err.name === 'JWTExpired') {
        return c.json({ error: '⏰ Session expired. Please login again.' }, 401)
      }
      return c.json({ error: '❌ Invalid authentication' }, 401)
    }
  } catch (err) {
    console.error('Auth middleware error:', err.message)
    return c.json({ error: err.message }, 500)
  }
}

