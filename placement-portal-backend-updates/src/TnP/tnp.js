import { Hono } from 'hono'
import { authMiddleware } from '../middleware/Authenticate.js';
const TnP = new Hono()

TnP.use('*', authMiddleware);
TnP.get('/profile/view', async (c) => {
  try {
    const user = c.get('user')
    if (!user) return c.json({ error: 'Authentication required' }, 401)

    const email = (user.email || user.id || '').toString().trim().toLowerCase()
    if (!email) return c.json({ error: 'Invalid user payload' }, 400)

    const db = c.env.DB
    const stmt = db.prepare(`SELECT * FROM tnp_profiles WHERE email = ?`)
    const result = await stmt.bind(email).first()

    if (!result) {
      return c.json({ success: false, message: 'Profile not found' }, 404)
    }

    const profile = {
      email: result.email,
      name: result.name,
      department: result.department,
      contact_primary: result.contact_primary,
      contact_alternate: result.contact_alternate,
      alternate_email: result.alternate_email,
      avatar_url: result.avatar_url || '',
      is_active: !!result.is_active,
      created_at: result.created_at,
      updated_at: result.updated_at
    }

    return c.json({ success: true, profile })
  } catch (err) {
    console.error('❌ Failed to fetch TnP profile:', err)
    return c.json({ error: '❌ Failed to retrieve profile', details: err.message }, 500)
  }
})


TnP.get('/students', async (c) => {
  const db = c.env.DB
  try {
    const url = new URL(c.req.url)
    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10))
    const limit = Math.min(1000, Math.max(1, parseInt(url.searchParams.get('limit') || '100', 10)))
    const offset = (page - 1) * limit

    // Use ORDER BY so results are deterministic; change column as needed.
    const { results } = await db
      .prepare('SELECT * FROM student_profiles')
      .all()

    return c.json({
      success: true,
      page,
      limit,
      count: results.length,
      data: results,
    })
  } catch (err) {
    console.error('Error fetching students:', err)
    return c.json({ success: false, error: 'Failed to fetch students', details: err.message }, 500)
  }
})




TnP.get('/placed-students', async (c) => {
  try {
    const db = c.env.DB

    const url = new URL(c.req.url)
    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10))
    const limit = Math.min(1000, Math.max(1, parseInt(url.searchParams.get('limit') || '100', 10)))
    const offset = (page - 1) * limit

    // Optional filters
    const roleTypeFilter = url.searchParams.get('role_type') // 'Tech' or 'Non-Tech'
    const companyNameFilter = url.searchParams.get('company_name')
    const batchFilter = url.searchParams.get('batch')

    // Build WHERE clause dynamically
    let whereConditions = `a.status IN ('selected', 'offered', 'placed')`
    const bindings = []

    if (roleTypeFilter) {
      whereConditions += ` AND jp.role_type = ? `
      bindings.push(roleTypeFilter)
    }
    if (companyNameFilter) {
      whereConditions += ` AND cp.company_name LIKE ?`
      bindings.push(`%${companyNameFilter}%`)
    }
    if (batchFilter) {
      whereConditions += ` AND jp.batch = ?`
      bindings.push(batchFilter)
    }

    // Get total count for pagination
    const countQuery = `
      SELECT COUNT(*) AS total
      FROM applications a
      JOIN job_postings jp ON a.job_id = jp.job_id
      JOIN company_profile cp ON jp.company_id = cp.id
      WHERE ${whereConditions}
    `
    const totalRow = await db.prepare(countQuery).bind(...bindings).first()
    const total = Number(totalRow?.total || 0)

    // Fetch placed students with job and company details
    const query = `
      SELECT
        a.application_id,
        a.student_id,
        a.job_id,
        a.applied_at,
        a.status AS application_status,
        
        sp.first_name,
        sp.middle_name,
        sp.last_name,
        sp.email AS student_email,
        sp.contact_number_primary,
        sp.department,
        
        jp.job_title,
        jp.role_type,
        jp.ctc,
        jp.stipend,
        jp.job_location,
        jp.job_type,
        jp.batch,
        
        jp.company_title,
        cp.company_logo,
        cp.company_website
        
      FROM applications a
      JOIN student_profiles sp ON a.student_id = sp.student_id
      JOIN job_postings jp ON a.job_id = jp.job_id
      JOIN company_profile cp ON jp.company_id = cp.id
      WHERE ${whereConditions}
      ORDER BY a.applied_at DESC
      LIMIT ? OFFSET ? 
    `

    bindings.push(limit, offset)
    const { results } = await db.prepare(query).bind(...bindings).all()

    // Format results
    const placedStudents = results.map((row) => {
      const full_name = [row.first_name, row.middle_name || '', row.last_name]
        .filter(Boolean)
        .join(' ')

      return {
        application_id: row.application_id,
        application_status: row.application_status,
        student: {
          student_id: row.student_id,
          full_name,
          email: row.student_email,
          phone: row.contact_number_primary,
          department: row.department
        },
        job: {
          job_id: row.job_id,
          job_title: row.job_title,
          role_type: row.role_type,
          ctc: row.ctc,
          stipend: row.stipend,
          job_location: row.job_location,
          job_type: row.job_type,
          batch: row.batch
        },
        company: {
          company_name: row.company_title,
          company_logo: row.company_logo,
          company_website: row.company_website
        },
        applied_at: row.applied_at
      }
    })

    return c.json({
      success: true,
      page,
      limit,
      total,
      count: placedStudents.length,
      data: placedStudents
    })
  } catch (err) {
    console.error('❌ Fetch placed students failed:', err)
    return c.json({
      success: false,
      message: 'Failed to fetch placed students',
      details: err.message
    }, 500)
  }
})



/**
 * GET /companies
 *
 * Returns all rows from company_profile.
 */

TnP.get('/jobs', async (c) => {
  try {
    const db = c.env.DB

    const url = new URL(c.req.url)
    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10))
    const limit = Math.min(1000, Math.max(1, parseInt(url.searchParams.get('limit') || '100', 10)))
    const offset = (page - 1) * limit

    // Get total count for pagination
    const totalRow = await db.prepare(`SELECT COUNT(*) AS total FROM job_postings`).first()
    const total = Number(totalRow?.total || 0)

    // Query job_postings joined with company_profile and subqueries that count selected and applied students per job
    const { results } = await db.prepare(
      `SELECT
         jp.*,
         cp.email AS company_email,
         COALESCE(sel.selected_count, 0) AS selected_count,
         COALESCE(app.applied_count, 0) AS applied_count
       FROM job_postings jp
       LEFT JOIN company_profile cp ON cp.id = jp.company_id
       LEFT JOIN (
         SELECT job_id, COUNT(*) AS selected_count
         FROM applications
         WHERE status = 'selected'
         GROUP BY job_id
       ) sel ON sel.job_id = jp.job_id
       LEFT JOIN (
         SELECT job_id, COUNT(*) AS applied_count
         FROM applications
         GROUP BY job_id
       ) app ON app.job_id = jp.job_id
       ORDER BY jp.created_at DESC
       LIMIT ? OFFSET ?`
    ).bind(limit, offset).all()

    const safeParse = (value) => {
      if (value === null || value === undefined) return value
      if (typeof value !== 'string') return value
      try { return JSON.parse(value) } catch { return value }
    }

    const jobs = results.map((jobRow) => ({
      job_id: jobRow.job_id,
      company_id: jobRow.company_id,
      company_name: jobRow.company_title || null,
      company_email: jobRow.company_email || null,
      job_title: jobRow.job_title,
      job_description: jobRow.job_description,
      industry: jobRow.industry,
      job_location: jobRow.job_location,
      job_type: jobRow.job_type,
      role_type: jobRow.role_type,
      openings: jobRow.openings,
      skills_required: safeParse(jobRow.skills_required),
      ctc: jobRow.ctc,
      stipend: jobRow.stipend,
      batch: jobRow.batch,
      drive_date: jobRow.drive_date,
      interview_mode: jobRow.interview_mode,
      kt_allowed: jobRow.kt_allowed,
      min_cgpa: jobRow.min_cgpa,
      min_tenth: jobRow.min_tenth,
      min_twelfth: jobRow.min_twelfth,
      min_diploma: jobRow.min_diploma,
      eligible_branches: safeParse(jobRow.eligible_branches),
      selection_rounds: safeParse(jobRow.selection_rounds),
      perks: jobRow.perks,
      status: jobRow.status,
      selected_count: Number(jobRow.selected_count || 0),
      applied_count: Number(jobRow.applied_count || 0),
      created_at: jobRow.created_at,
      updated_at: jobRow.updated_at
    }))

    return c.json({
      success: true,
      page,
      limit,
      total,
      count: jobs.length,
      jobs
    })
  } catch (err) {
    console.error('❌ Fetch TnP jobs failed:', err)
    return c.json({ success: false, message: 'Internal server error', details: err.message }, 500)
  }
})


TnP.get('/companies', async (c) => {
  const db = c.env.DB
  try {
    const { results } = await db
      .prepare('SELECT * FROM company_profile ORDER BY updated_at DESC')
      .all()

    return c.json({
      success: true,
      count: results.length,
      data: results,
    })
  } catch (err) {
    console.error('Error fetching companies:', err)
    return c.json({ success: false, error: 'Failed to fetch companies', details: err.message }, 500)
  }
})

TnP.post('/profile/create', async (c) => {
  try {
    const body = await c.req.json()
    const {
      name,
      email,
      department,
      contact_primary,
      contact_alternate = null,
      alternate_email = null,
    } = body || {}

    const db = c.env.DB

    // Basic validation
    if (!name || !email || !department || !contact_primary) {
      return c.json({ error: 'name, email, department and contact_primary are required' }, 400)
    }

    const normalizedEmail = email.toString().trim().toLowerCase()
    const trimmedName = name.toString().trim()
    const trimmedDepartment = department.toString().trim()
    const trimmedPrimary = contact_primary.toString().trim()
    const trimmedAlternate = contact_alternate ? contact_alternate.toString().trim() : null
    const trimmedAltEmail = alternate_email ? alternate_email.toString().trim().toLowerCase() : null

    // Ensure corresponding tnp_login exists (encourage creating account first)
    const { results: loginRows } = await db
      .prepare('SELECT email FROM tnp_login WHERE email = ?')
      .bind(normalizedEmail)
      .all()

    if (loginRows.length === 0) {
      return c.json({
        error: 'TnP login not found for this email. Please create tnp_login first.'
      }, 400)
    }

    // Prevent duplicate profile
    const { results: profileRows } = await db
      .prepare('SELECT email FROM tnp_profiles WHERE email = ?')
      .bind(normalizedEmail)
      .all()

    if (profileRows.length > 0) {
      return c.json({ error: 'Profile already exists for this email' }, 409)
    }

    // Insert profile
    await db.prepare(
      `INSERT INTO tnp_profiles
        (email, name, department, contact_primary, contact_alternate, alternate_email, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`
    ).bind(
      normalizedEmail,
      trimmedName,
      trimmedDepartment,
      trimmedPrimary,
      trimmedAlternate,
      trimmedAltEmail
    ).run()

    const createdProfile = {
      email: normalizedEmail,
      name: trimmedName,
      department: trimmedDepartment,
      contact_primary: trimmedPrimary,
      contact_alternate: trimmedAlternate,
      alternate_email: trimmedAltEmail,
    }

    return c.json({
      success: true,
      message: '✅ TnP profile created successfully',
      profile: createdProfile
    }, 201)

  } catch (err) {
    console.error('TnP profile creation error:', err)
    return c.json({
      success: false,
      error: 'Internal server error',
      details: err.message
    }, 500)
  }
})


export default TnP
