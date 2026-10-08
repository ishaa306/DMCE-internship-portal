import { Hono } from 'hono';
import { jwt } from 'hono/jwt';
import bcrypt from 'bcryptjs';
import { setCookie, getCookie } from 'hono/cookie';
import { rateLimiter } from '../controllers/rateLimiter';


const companyAuth = new Hono()

const securityHeaders = {
  'Content-Security-Policy': "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline';",
  'X-XSS-Protection': '1; mode=block',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'no-referrer-when-downgrade',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
};

const getCurrentUTCDateTime = () => {
  const now = new Date();
  return now.toISOString().replace('T', ' ').slice(0, 19);
};

// 🔐 LOGIN
companyAuth.post('/login', rateLimiter(5, 60 * 1000), async (c) => {
  try {
    const { email, password } = await c.req.json();
    const db = c.env.DB;

    if (!email || !password) {
      return c.json({ error: 'Email and password are required.' }, 400);
    }

    const { results } = await db.prepare(
      'SELECT * FROM company_login WHERE email = ?'
    ).bind(email).all();

    if (!results.length) {
      return c.json({ error: 'Invalid credentials' }, 401);
    }

    const user = results[0];
    const isValid = await bcrypt.compare(password, user.password_hash);

    if (!isValid) {
      return c.json({ error: 'Invalid credentials' }, 401);
    }

    const expiresIn = 60 * 60 * 24;
    const currentDateTime = getCurrentUTCDateTime();

    const token = await c.env.signJWT({
      email: user.email,
      password_updated: user.password_updated,
      login_time: currentDateTime,
      exp: Math.floor(Date.now() / 1000) + expiresIn
    });

    const profileCheck = await db.prepare(
      'SELECT company_name, company_logo FROM company_profile WHERE email = ?'
    ).bind(user.email).first();

    const profileCreated = !!profileCheck;

    // Security headers
    for (const [key, value] of Object.entries(securityHeaders)) {
      c.header(key, value);
    }

    setCookie(c, 'auth-token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'None',  // Required for cross-origin withCredentials: true
      path: '/',
      maxAge: expiresIn
    });

    return c.json({
      message: '✅ Login successful',
      password_updated: user.password_updated,
      login_time: currentDateTime,
      email: user.email,
      profile_created: profileCreated,
      company_name: user?.company_name || null,
      company_logo: profileCheck?.company_logo || null
    });

  } catch (err) {
    console.error('Login error:', err);
    return c.json({ error: err.message || 'Login failed' }, 500);
  }
});

// 🔍 VERIFY
companyAuth.get('/verify', async (c) => {
  try {
    const cookies = getCookie(c);
    const token = cookies['auth-token'] || c.req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return c.json({ authenticated: false, error: 'Authentication required' }, 401);
    }

    try {
      const payload = await c.env.verifyJWT(token);
      return c.json({
        authenticated: true,
        user: {
          email: payload.email,
          password_updated: payload.password_updated,
          login_time: payload.login_time
        },
        current_datetime: getCurrentUTCDateTime()
      });
    } catch (err) {
      if (err.name === 'JWTExpired') {
        return c.json({ authenticated: false, error: '⏰ Session expired. Please login again.' }, 401);
      }
      return c.json({ authenticated: false, error: '❌ Invalid authentication' }, 401);
    }

  } catch (err) {
    return c.json({ authenticated: false, error: err.message }, 500);
  }
});

// 🚪 LOGOUT
companyAuth.post('/logout', (c) => {
  for (const [key, value] of Object.entries(securityHeaders)) {
    c.header(key, value);
  }

  setCookie(c, 'auth-token', '', {
    httpOnly: true,
    secure: true,
    sameSite: 'None',
    maxAge: 0,
    path: '/'
  });

  return c.json({
    message: '🚪 Logged out successfully',
    logout_time: getCurrentUTCDateTime()
  });
});

// 🔒 AUTH MIDDLEWARE FOR PASSWORD CHANGE
companyAuth.use('/change-password', async (c, next) => {
  const cookies = getCookie(c);
  const token = cookies['auth-token'] || c.req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return c.json({ error: 'Authentication required' }, 401);
  }

  try {
    const payload = await c.env.verifyJWT(token);
    c.set('user', payload);
    await next();
  } catch (err) {
    if (err.name === 'JWTExpired') {
      return c.json({ error: '⏰ Session expired. Please login again.' }, 401);
    }
    return c.json({ error: '❌ Invalid authentication' }, 401);
  }
});

// 🔁 PASSWORD CHANGE
companyAuth.post('/change-password', async (c) => {
  try {
    const { old_password, new_password } = await c.req.json();
    const db = c.env.DB;
    const user = c.get('user');

    if (!old_password || !new_password) {
      return c.json({ error: 'Both old and new password required' }, 400);
    }

    if (new_password.length < 8) {
      return c.json({ error: 'Password must be at least 8 characters' }, 400);
    }

    const { results } = await db.prepare(
      'SELECT * FROM company_login WHERE email = ?'
    ).bind(user.email).all();

    if (!results.length) {
      return c.json({ error: 'User not found' }, 404);
    }

    const foundUser = results[0];
    const isOldCorrect = await bcrypt.compare(old_password, foundUser.password_hash);

    if (!isOldCorrect) {
      return c.json({ error: 'Current password is incorrect' }, 401);
    }

    const newHash = await bcrypt.hash(new_password, 8);
    const currentDateTime = getCurrentUTCDateTime();

    await db.prepare(
      `UPDATE company_login SET password_hash = ?, password_updated = 1 WHERE email = ?`
    ).bind(newHash, user.email).run();

    return c.json({
      message: '✅ Password changed successfully',
      email: user.email,
      updated_at: currentDateTime
    });

  } catch (err) {
    console.error('Password change error:', err);
    return c.json({ error: err.message }, 500);
  }
});





companyAuth.post('/forgot-password', async (c) => {
  try {
    const { email } = await c.req.json()
    const db = c.env.DB

    const { results } = await db
      .prepare('SELECT * FROM company_login WHERE email = ?')
      .bind(email)
      .all()

    if (!results.length) {
      return c.json({ error: 'Email not registered' }, 404)
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString()

    await db.prepare(`
      INSERT OR REPLACE INTO password_resets (email, otp, expires_at)
      VALUES (?, ?, ?)
    `).bind(email, otp, expiresAt).run()

    // ✅ Send OTP via Brevo
    await sendOTPEmail(c.env.BREVO_API_KEY, email, otp)

    return c.json({ message: '📧 OTP sent to registered email' })
  } catch (err) {
    console.error('❌ Forgot-password error:', err)
    return c.json({ error: err.message }, 500)
  }
})


companyAuth.post('/verify-otp', async (c) => {
  const { email, otp } = await c.req.json()
  const db = c.env.DB

  const { results } = await db.prepare(
    'SELECT * FROM password_resets WHERE email = ?'
  ).bind(email).all()

  if (!results.length) return c.json({ error: 'OTP not requested' }, 400)

  const record = results[0]

  if (record.otp !== otp)
    return c.json({ error: '❌ Invalid OTP' }, 401)

  if (new Date(record.expires_at) < new Date())
    return c.json({ error: '⏰ OTP expired' }, 401)

  const resetToken = crypto.randomUUID()
  const tokenExpiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString()

  await db.prepare(`
    INSERT OR REPLACE INTO temp_reset_tokens (email, token, expires_at)
    VALUES (?, ?, ?)
  `).bind(email, resetToken, tokenExpiresAt).run()

  return c.json({
    message: '✅ OTP verified. Use token to reset password.',
    reset_token: resetToken
  })
})


companyAuth.post('/reset-password', async (c) => {
  try {
    const { email, reset_token, new_password } = await c.req.json()
    const db = c.env.DB

    if (!new_password || new_password.length < 8) {
      return c.json({ error: 'Password must be at least 8 characters' }, 400)
    }

    const { results } = await db.prepare(
      'SELECT * FROM temp_reset_tokens WHERE email = ?'
    ).bind(email).all()

    if (!results.length) return c.json({ error: 'No reset token found' }, 400)

    const record = results[0]
    if (record.token !== reset_token)
      return c.json({ error: 'Invalid reset token' }, 401)

    if (new Date(record.expires_at) < new Date())
      return c.json({ error: 'Reset token expired' }, 401)

    const hash = await bcrypt.hash(new_password, 8)

    await db.prepare(
      `UPDATE company_login SET password_hash = ?, password_updated = 1 WHERE email = ?`
    ).bind(hash, email).run()

    await db.prepare('DELETE FROM temp_reset_tokens WHERE email = ?').bind(email).run()
    await db.prepare('DELETE FROM password_resets WHERE email = ?').bind(email).run()

    return c.json({ message: '🔐 Password successfully reset' })
  } catch (err) {
    console.error('❌ Reset password error:', err)
    return c.json({
      error: err.message,
      details: err.message
    }, 500)
  }
})




export default companyAuth;
