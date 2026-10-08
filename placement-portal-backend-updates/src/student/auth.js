
import { Hono } from 'hono'
import { jwt } from 'hono/jwt'
import bcrypt from 'bcryptjs'
import { setCookie } from 'hono/cookie'
import { getCookie } from 'hono/cookie'
import { rateLimiter } from '../controllers/rateLimiter'

const auth = new Hono().basePath('/api/auth')

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


auth.post('/login', rateLimiter(5, 60 * 1000), async (c) => {
  try {
    const { gr_number, password } = await c.req.json();
    const db = c.env.DB;

    if (!gr_number || !password) {
      return c.json({ error: 'GR Number and password are required.' }, 400);
    }

    const { results } = await db.prepare(
      'SELECT * FROM students_login WHERE gr_number = ?'
    ).bind(gr_number).all();

    if (!results.length) {
      return c.json({ error: 'Invalid credentials' }, 401);
    }

    const user = results[0];
    const isValid = await bcrypt.compare(password, user.password_hash);

    if (!isValid) {
      return c.json({ error: 'Invalid credentials' }, 401);
    }

    const expiresIn = 60 * 60 * 24;

    // Get current UTC datetime
    const currentDateTime = getCurrentUTCDateTime();

    // Generate JWT
    const token = await c.env.signJWT({
      id: user.id,
      gr_number: user.gr_number,
      password_updated: user.password_updated,
      login_time: currentDateTime,
      exp: Math.floor(Date.now() / 1000) + expiresIn
    });

    // Check if profile exists in student_profiles table
    const profileCheck = await db.prepare(
      'SELECT profile_url, first_name, middle_name, last_name FROM student_profiles WHERE student_id = ?'
    ).bind(gr_number).first();
    // Returns one row or undefined

    const fullName = profileCheck
      ? [profileCheck.first_name, profileCheck.middle_name || "", profileCheck.last_name]
        .filter(Boolean)
        .join(' ')
      : null;
    const profileCreated = !!profileCheck;

    // Set security headers
    for (const [key, value] of Object.entries(securityHeaders)) {
      c.header(key, value);
    }

    // Set JWT cookie
    setCookie(c, 'auth-token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'None',  // Required for cross-origin withCredentials: true
      path: '/',
      maxAge: expiresIn
    });

    // Final response
    return c.json({
      message: '✅ Login successful',
      password_updated: user.password_updated,
      login_time: currentDateTime,
      email: user.email,
      user_id: user.gr_number,
      profile_created: profileCreated,
      full_name: fullName,
      profile_url: profileCheck?.profile_url || ""
    });

  } catch (err) {
    console.error('Login error:', err);
    return c.json({
      error: err.message || 'Login failed',
      details: err.stack || ''
    }, 500);
  }
});




auth.get('/verify', async (c) => {
  try {
    const cookies = getCookie(c)
    const token = cookies['auth-token'] || c.req.header('Authorization')?.replace('Bearer ', '')

    console.log('Verify - Received token:', token ? 'present' : 'missing')

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
      console.log('Verify - JWT payload:', payload)

      // Return the user data directly from JWT payload (no DB query needed)
      return c.json({
        authenticated: true,
        user: {
          id: payload.id,
          gr_number: payload.gr_number,
          password_updated: payload.password_updated,
          login_time: payload.login_time
        },
        current_datetime: getCurrentUTCDateTime(),
        current_user_login: payload.gr_number
      })
    } catch (err) {
      console.error('Verify - JWT verification error:', err)
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
    console.error('Verify - Auth error:', err.message)
    return c.json({
      authenticated: false,
      error: err.message,
      current_datetime: getCurrentUTCDateTime(),
      current_user_login: 'unknown'
    }, 500)
  }
})

// 🚪 LOGOUT ROUTE
auth.post('/logout', (c) => {
  // Set security headers if needed
  for (const [key, value] of Object.entries(securityHeaders)) {
    c.header(key, value)
  }

  // Set the cookie to empty string with zero max-age to delete it
  setCookie(c, 'auth-token', '', {
    httpOnly: true,
    secure: true,
    sameSite: 'None',
    maxAge: 0,
    path: '/'
  })

  // Return JSON response using Hono's context
  return c.json({
    message: '🚪 Logged out successfully',
    logout_time: getCurrentUTCDateTime()
  })
})

// 🛡️ AUTH MIDDLEWARE for /change-password


auth.use('/change-password', async (c, next) => {
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
})

// 🔁 PASSWORD UPDATE
auth.post('/change-password', async (c) => {
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
      'SELECT * FROM students_login WHERE gr_number = ?'
    ).bind(user.gr_number).all()

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

    // Update password and set password_updated to 1
    await db.prepare(
      `UPDATE students_login SET password_hash = ?, password_updated = 1 WHERE gr_number = ?`
    ).bind(newHash, user.gr_number).run()

    return c.json({
      message: '✅ Password changed successfully',
      user_id: user.gr_number,
      updated_at: currentDateTime
    })
  } catch (err) {
    console.error('Password change error:', err)
    return c.json({
      error: err.message,
      details: err.message
    }, 500)
  }
})

export default auth



