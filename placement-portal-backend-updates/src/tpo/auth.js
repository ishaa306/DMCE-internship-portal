import { Hono } from 'hono'
import bcrypt from 'bcryptjs'
import { setCookie } from 'hono/cookie'
import { getCookie } from 'hono/cookie'
import { rateLimiter } from '../controllers/rateLimiter'

const tpoauth = new Hono()

const securityHeaders = {
  'Content-Security-Policy': "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline';",
  'X-XSS-Protection': '1; mode=block',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'no-referrer-when-downgrade',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
}

// Helper function to get current UTC date in YYYY-MM-DD HH:MM:SS format
const getCurrentUTCDateTime = () => {
  const now = new Date();
  return now.toISOString().replace('T', ' ').slice(0, 19);
};

tpoauth.post('/login', rateLimiter(5, 60 * 1000), async (c) => {
  try {
    const { email, password } = await c.req.json();
    const db = c.env.DB;

    if (!email || !password) {
      return c.json({ error: 'Email and password are required.' }, 400);
    }

    const { results } = await db.prepare(
      'SELECT * FROM tpo_login WHERE email = ?'
    ).bind(email).all();

    if (!results.length) {
      return c.json({ error: 'Invalid credentials' }, 401);
    }

    const user = results[0];
    const isValid = await bcrypt.compare(password, user.password_hash);

    if (!isValid) {
      return c.json({ error: 'Invalid credentials' }, 401);
    }

    const expiresIn = 60 * 60 * 24; // 24 hours

    // Get current UTC datetime
    const currentDateTime = getCurrentUTCDateTime();

    // Generate JWT using middleware-provided signJWT (set in your main app)
    const token = await c.env.signJWT({
      id: user.email,
      email: user.email,
      password_updated: user.password_updated,
      login_time: currentDateTime,
      exp: Math.floor(Date.now() / 1000) + expiresIn
    });

    // Set security headers
    for (const [key, value] of Object.entries(securityHeaders)) {
      c.header(key, value);
    }

    // Set JWT cookie
    setCookie(c, 'auth-token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'None',
      path: '/',
      maxAge: expiresIn
    });

    // Final response
    return c.json({
      message: '✅ TPO login successful',
      password_updated: user.password_updated,
      login_time: currentDateTime,
      email: user.email,
      name: user.name,
    });

  } catch (err) {
    console.error('TnP Login error:', err);
    return c.json({
      error: err.message || 'Login failed',
      details: err.stack || ''
    }, 500);
  }
});

tpoauth.get('/verify', async (c) => {
  try {
    const cookies = getCookie(c)
    const token = cookies['auth-token'] || c.req.header('Authorization')?.replace('Bearer ', '')

    if (!token) {
      return c.json({
        authenticated: false,
        error: 'Authentication required',
        current_datetime: getCurrentUTCDateTime(),
        current_user_login: 'unknown'
      }, 401)
    }

    try {
      const payload = await c.env.verifyJWT(token)

      return c.json({
        authenticated: true,
        user: {
          id: payload.id,
          email: payload.email,
          password_updated: payload.password_updated,
          login_time: payload.login_time
        },
        current_datetime: getCurrentUTCDateTime(),
        current_user_login: payload.email
      })
    } catch (err) {
      console.error('TnP Verify - JWT verification error:', err)
      if (err.name === 'JWTExpired') {
        return c.json({
          authenticated: false,
          error: '⏰ Session expired. Please login again.',
          current_datetime: getCurrentUTCDateTime(),
          current_user_login: 'unknown'
        }, 401)
      }
      return c.json({
        authenticated: false,
        error: '❌ Invalid authentication',
        current_datetime: getCurrentUTCDateTime(),
        current_user_login: 'unknown'
      }, 401)
    }
  } catch (err) {
    console.error('TnP Verify - Auth error:', err.message)
    return c.json({
      authenticated: false,
      error: err.message,
      current_datetime: getCurrentUTCDateTime(),
      current_user_login: 'unknown'
    }, 500)
  }
})

// LOGOUT ROUTE
tpoauth.post('/logout', (c) => {
  for (const [key, value] of Object.entries(securityHeaders)) {
    c.header(key, value)
  }

  setCookie(c, 'auth-token', '', {
    httpOnly: true,
    secure: true,
    sameSite: 'None',
    maxAge: 0,
    path: '/'
  })

  return c.json({
    message: '🚪 Logged out successfully',
    logout_time: getCurrentUTCDateTime()
  })
})

// AUTH MIDDLEWARE for /change-password
tpoauth.use('/change-password', async (c, next) => {
  try {
    const cookies = getCookie(c)
    const token =
      cookies['auth-token'] ||
      c.req.header('Authorization')?.replace('Bearer ', '')

    if (!token) {
      return c.json({ error: 'Authentication required' }, 401)
    }

    try {
      const payload = await c.env.verifyJWT(token)
      c.set('user', payload)
      await next()
    } catch (err) {
      console.error('TnP JWT verification error:', err)
      if (err.name === 'JWTExpired') {
        return c.json({ error: '⏰ Session expired. Please login again.' }, 401)
      }
      return c.json({ error: '❌ Invalid authentication' }, 401)
    }
  } catch (err) {
    console.error('TnP Auth middleware error:', err.message)
    return c.json({ error: err.message }, 500)
  }
})

// PASSWORD UPDATE
tpoauth.post('/change-password', async (c) => {
  try {
    const { old_password, new_password } = await c.req.json()
    const db = c.env.DB
    const user = c.get('user')

    if (!old_password || !new_password) {
      return c.json({ error: 'Both old and new password required' }, 400)
    }

    if (new_password.length < 8) {
      return c.json({ error: 'Password must be at least 8 characters long' }, 400)
    }

    const { results } = await db.prepare(
      'SELECT * FROM tpo_login WHERE email = ?'
    ).bind(user.email).all()

    if (!results.length) {
      return c.json({ error: 'User not found' }, 404)
    }

    const foundUser = results[0]
    const isOldCorrect = await bcrypt.compare(old_password, foundUser.password_hash)

    if (!isOldCorrect) {
      return c.json({ error: 'Current password is incorrect' }, 401)
    }

    const newHash = await bcrypt.hash(new_password, 8)

    // Get current UTC datetime for update timestamp
    const currentDateTime = getCurrentUTCDateTime();

    await db.prepare(
      `UPDATE tpo_login SET password_hash = ?, password_updated = 1 WHERE email = ?`
    ).bind(newHash, user.email).run()

    return c.json({
      message: '✅ Password changed successfully',
      user_id: user.email,
      updated_at: currentDateTime
    })
  } catch (err) {
    console.error('TnP Password change error:', err)
    return c.json({
      error: err.message,
      details: err.message
    }, 500)
  }
})

export default tpoauth;