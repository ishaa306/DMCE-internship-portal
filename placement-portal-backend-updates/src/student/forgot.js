import { Hono } from 'hono'
import { sendOTPEmail } from '../sendEmail' // adjust path as needed

import bcrypt from 'bcryptjs'

const forgot = new Hono().basePath('/api/forgot-password')

forgot.post('/', async (c) => {
  try {
    const { email } = await c.req.json()
    const db = c.env.DB

    const { results } = await db
      .prepare('SELECT * FROM students_login WHERE email = ?')
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


forgot.post('/verify-otp', async (c) => {
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


forgot.post('/reset-password', async (c) => {
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
      `UPDATE students_login SET password_hash = ?, password_updated = 1 WHERE email = ?`
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


export default forgot;