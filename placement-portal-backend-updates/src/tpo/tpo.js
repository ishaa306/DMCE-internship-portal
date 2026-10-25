import { Hono } from 'hono'
import { authMiddleware } from '../middleware/Authenticate';

const tpo = new Hono()

/**
 * POST /api/tnp/announcements
 * Create a new announcement
 * Requires TnP authentication
 */
tpo.use('*', authMiddleware);
tpo.post('/announcements', async (c) => {
  try {
    const db = c.env.DB
    const authUser = c.get('user')

    if (!authUser) {
      return c.json({ success: false, message: 'Authentication required' }, 401)
    }

    const { title, content } = await c.req.json()

    // Validation
    if (!title || !content) {
      return c.json({ success: false, message: 'Title and content are required' }, 400)
    }

    if (title.trim().length === 0 || content.trim().length === 0) {
      return c.json({ success: false, message: 'Title and content cannot be empty' }, 400)
    }

    if (title.length > 200) {
      return c.json({ success: false, message: 'Title must be less than 200 characters' }, 400)
    }

    // Insert announcement
    const result = await db.prepare(`
      INSERT INTO announcements (title, content)
      VALUES (?, ?)
    `).bind(title.trim(), content.trim()).run()

    // Fetch the created announcement
    const announcement = await db.prepare(
      'SELECT * FROM announcements WHERE announcement_id = ?'
    ).bind(result.meta.last_row_id).first()

    return c.json({
      success: true,
      message: 'Announcement created successfully',
      announcement
    }, 201)
  } catch (err) {
    console.error('❌ Create announcement failed:', err)
    return c.json({
      success: false,
      message: 'Internal server error',
      details: err.message
    }, 500)
  }
})

/**
 * GET /api/tnp/announcements
 * Get all announcements with pagination
 * Supports query params: ? page=1&limit=10
 */
tpo.get('/announcements', async (c) => {
  try {
    const db = c.env.DB

    const url = new URL(c.req.url)
    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10))
    const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get('limit') || '10', 10)))
    const offset = (page - 1) * limit

    // Get total count
    const countRow = await db.prepare(
      'SELECT COUNT(*) AS total FROM announcements'
    ).first()
    const total = Number(countRow?.total || 0)

    // Fetch announcements
    const { results } = await db.prepare(`
      SELECT * FROM announcements
      ORDER BY created_at DESC
      LIMIT ? OFFSET ? 
    `).bind(limit, offset).all()

    return c.json({
      success: true,
      page,
      limit,
      total,
      count: results.length,
      data: results
    })
  } catch (err) {
    console.error('❌ Fetch announcements failed:', err)
    return c.json({
      success: false,
      message: 'Internal server error',
      details: err.message
    }, 500)
  }
})

/**
 * GET /api/tnp/announcements/:announcement_id
 * Get a specific announcement by ID
 */
tpo.get('/announcements/:announcement_id', async (c) => {
  try {
    const db = c.env.DB

    const announcementId = Number(c.req.param('announcement_id'))
    if (isNaN(announcementId) || announcementId < 1) {
      return c.json({
        success: false,
        message: 'Invalid announcement_id'
      }, 400)
    }

    const announcement = await db.prepare(
      'SELECT * FROM announcements WHERE announcement_id = ?'
    ).bind(announcementId).first()

    if (!announcement) {
      return c.json({
        success: false,
        message: 'Announcement not found'
      }, 404)
    }

    return c.json({
      success: true,
      announcement
    })
  } catch (err) {
    console.error('❌ Fetch announcement failed:', err)
    return c.json({
      success: false,
      message: 'Internal server error',
      details: err.message
    }, 500)
  }
})

/**
 * PATCH /api/tnp/announcements/:announcement_id
 * Update an existing announcement
 */
tpo.patch('/announcements/:announcement_id', async (c) => {
  try {
    const db = c.env.DB
    const authUser = c.get('user')

    if (!authUser || !authUser.email) {
      return c.json({ success: false, message: 'Authentication required' }, 401)
    }

    const announcementId = Number(c.req.param('announcement_id'))
    if (isNaN(announcementId) || announcementId < 1) {
      return c.json({
        success: false,
        message: 'Invalid announcement_id'
      }, 400)
    }

    // Check if announcement exists
    const existing = await db.prepare(
      'SELECT * FROM announcements WHERE announcement_id = ?'
    ).bind(announcementId).first()

    if (!existing) {
      return c.json({
        success: false,
        message: 'Announcement not found'
      }, 404)
    }

    const { title, content } = await c.req.json()

    // Validation
    if (!title && !content) {
      return c.json({
        success: false,
        message: 'At least one field (title or content) is required'
      }, 400)
    }

    const setClauses = []
    const bindings = []

    if (title !== undefined) {
      if (title.trim().length === 0) {
        return c.json({ success: false, message: 'Title cannot be empty' }, 400)
      }
      if (title.length > 200) {
        return c.json({ success: false, message: 'Title must be less than 200 characters' }, 400)
      }
      setClauses.push('title = ?')
      bindings.push(title.trim())
    }

    if (content !== undefined) {
      if (content.trim().length === 0) {
        return c.json({ success: false, message: 'Content cannot be empty' }, 400)
      }
      setClauses.push('content = ? ')
      bindings.push(content.trim())
    }

    setClauses.push('updated_at = CURRENT_TIMESTAMP')
    bindings.push(announcementId)

    await db.prepare(`
      UPDATE announcements
      SET ${setClauses.join(', ')}
      WHERE announcement_id = ?
    `).bind(...bindings).run()

    // Fetch updated announcement
    const updated = await db.prepare(
      'SELECT * FROM announcements WHERE announcement_id = ?'
    ).bind(announcementId).first()

    return c.json({
      success: true,
      message: 'Announcement updated successfully',
      announcement: updated
    })
  } catch (err) {
    console.error('❌ Update announcement failed:', err)
    return c.json({
      success: false,
      message: 'Internal server error',
      details: err.message
    }, 500)
  }
})

/**
 * DELETE /api/tnp/announcements/:announcement_id
 * Delete an announcement permanently
 */
tpo.delete('/announcements/:announcement_id', async (c) => {
  try {
    const db = c.env.DB
    const authUser = c.get('user')

    if (!authUser || !authUser.email) {
      return c.json({ success: false, message: 'Authentication required' }, 401)
    }

    const announcementId = Number(c.req.param('announcement_id'))
    if (isNaN(announcementId) || announcementId < 1) {
      return c.json({
        success: false,
        message: 'Invalid announcement_id'
      }, 400)
    }

    // Check if announcement exists
    const existing = await db.prepare(
      'SELECT * FROM announcements WHERE announcement_id = ?'
    ).bind(announcementId).first()

    if (!existing) {
      return c.json({
        success: false,
        message: 'Announcement not found'
      }, 404)
    }

    // Delete announcement
    await db.prepare(
      'DELETE FROM announcements WHERE announcement_id = ?'
    ).bind(announcementId).run()

    return c.json({
      success: true,
      message: 'Announcement deleted successfully'
    })
  } catch (err) {
    console.error('❌ Delete announcement failed:', err)
    return c.json({
      success: false,
      message: 'Internal server error',
      details: err.message
    }, 500)
  }
})

/**
 * GET /api/tpo/dashboard-stats
 * Real-time aggregated statistics for TPO Dashboard
 */
tpo.get('/dashboard-stats', async (c) => {
  try {
    const db = c.env.DB

    // 1. Total students from student_profiles
    const totalStudentsRow = await db.prepare(
      'SELECT COUNT(*) AS total FROM student_profiles'
    ).first()
    const totalStudents = Number(totalStudentsRow?.total || 0)

    // 2. Distinct students placed
    const placedStudentsRow = await db.prepare(
      "SELECT COUNT(DISTINCT student_id) AS total FROM applications WHERE status IN ('selected', 'offered', 'placed')"
    ).first()
    let studentsPlaced = Number(placedStudentsRow?.total || 0)
    if (totalStudents > 0 && studentsPlaced > totalStudents) {
      studentsPlaced = totalStudents
    }

    // 3. Total offers
    const totalOffersRow = await db.prepare(
      "SELECT COUNT(*) AS total FROM applications WHERE status IN ('selected', 'offered', 'placed')"
    ).first()
    const totalOffers = Number(totalOffersRow?.total || 0)

    // 4. Students unplaced
    const studentsUnplaced = Math.max(0, totalStudents - studentsPlaced)

    // 5. Placement rate
    const placementRate = totalStudents > 0
      ? Number(((studentsPlaced / totalStudents) * 100).toFixed(1))
      : 0

    // 6. Registered companies
    const companiesRow = await db.prepare(
      'SELECT COUNT(*) AS total FROM company_profile'
    ).first()
    const registeredCompanies = Number(companiesRow?.total || 0)

    // 7. Upcoming drives (active and drive_date >= current date)
    const upcomingDrivesRow = await db.prepare(
      "SELECT COUNT(*) AS total FROM job_postings WHERE status = 'active' AND (drive_date >= DATE('now') OR drive_date IS NULL)"
    ).first()
    const upcomingDrives = Number(upcomingDrivesRow?.total || 0)

    // 8. Active announcements
    const announcementsRow = await db.prepare(
      'SELECT COUNT(*) AS total FROM announcements'
    ).first()
    const activeAnnouncements = Number(announcementsRow?.total || 0)

    return c.json({
      success: true,
      stats: {
        totalStudents,
        studentsPlaced,
        studentsUnplaced,
        totalOffers,
        placementRate,
        registeredCompanies,
        upcomingDrives,
        activeAnnouncements
      }
    })
  } catch (err) {
    console.error('❌ Fetch dashboard stats failed:', err)
    return c.json({
      success: false,
      message: 'Failed to fetch dashboard statistics',
      details: err.message
    }, 500)
  }
})

export default tpo