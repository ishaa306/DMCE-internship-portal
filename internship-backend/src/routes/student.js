import { Hono } from 'hono';
import { requireAuth } from '../middleware/auth.js';
import { validateInternshipData } from '../utils/validation.js';

const studentRoutes = new Hono();

// All student routes require authentication
studentRoutes.use('*', requireAuth);

// Helper middleware to ensure the authenticated user is a valid student
studentRoutes.use('*', async (c, next) => {
  const user = c.get('user');
  const studentId = user.gr_number;
  if (!studentId) {
    return c.json({ success: false, message: 'Invalid token: missing gr_number' }, 403);
  }
  c.set('studentId', studentId);
  await next();
});

/**
 * Get all internships for the authenticated student
 */
studentRoutes.get('/', async (c) => {
  const db = c.env.DB;
  const user = c.get('user');
  const studentId = c.get('studentId');

  try {
    const { results } = await db.prepare(
      'SELECT * FROM internships WHERE student_id = ? ORDER BY created_at DESC'
    ).bind(studentId).all();

    return c.json({
      success: true,
      message: 'Internships retrieved successfully.',
      data: results
    });
  } catch (error) {
    console.error('Error fetching internships:', error);
    return c.json({ success: false, message: 'Unable to retrieve internships.' }, 500);
  }
});

/**
 * Get a specific internship belonging to the authenticated student
 */
studentRoutes.get('/:id', async (c) => {
  const db = c.env.DB;
  const user = c.get('user');
  const studentId = c.get('studentId');
  const internshipId = c.req.param('id');

  try {
    const internship = await db.prepare(
      'SELECT * FROM internships WHERE id = ? AND student_id = ?'
    ).bind(internshipId, studentId).first();

    if (!internship) {
      return c.json({ success: false, message: 'Internship not found or unauthorized.' }, 404);
    }

    return c.json({
      success: true,
      message: 'Internship retrieved successfully.',
      data: internship
    });
  } catch (error) {
    console.error('Error fetching internship:', error);
    return c.json({ success: false, message: 'Unable to retrieve internship.' }, 500);
  }
});

/**
 * Create a new internship
 */
studentRoutes.post('/', async (c) => {
  const db = c.env.DB;
  const user = c.get('user');
  const studentId = c.get('studentId');
  // Default values from token payload if available
  const studentName = user.full_name || user.name || null;
  const studentEmail = user.email || null;

  try {
    const data = await c.req.json();
    
    // Backend validation
    const validation = validateInternshipData(data);
    if (!validation.isValid) {
      return c.json({ success: false, message: validation.errors.join(' ') }, 400);
    }

    const {
      company_name,
      location,
      role,
      work_mode,
      has_incentives,
      incentive_amount,
      start_date,
      duration,
      has_offer_letter,
      is_completed
    } = data;

    const hasIncentivesInt = (has_incentives === true || has_incentives === 'Yes') ? 1 : 0;
    const hasOfferLetterInt = (has_offer_letter === true || has_offer_letter === 'Yes') ? 1 : 0;
    const isCompletedInt = (is_completed === true || is_completed === 'Yes') ? 1 : 0;

    const result = await db.prepare(
      `INSERT INTO internships (
        student_id, student_email, student_name, 
        company_name, location, role, work_mode, 
        has_incentives, incentive_amount, start_date, duration,
        has_offer_letter, is_completed
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING id`
    ).bind(
      String(studentId), studentEmail, studentName,
      company_name, location, role, work_mode,
      hasIncentivesInt, incentive_amount || null, start_date, duration,
      hasOfferLetterInt, isCompletedInt
    ).first();

    if (!result || !result.id) {
      return c.json({ success: false, message: 'Database insert failed.' }, 500);
    }

    return c.json({
      success: true,
      message: 'Internship created successfully.',
      data: { id: result.id }
    }, 201);
  } catch (error) {
    console.error('Error creating internship:', error);
    return c.json({ success: false, message: 'Unable to create internship.' }, 500);
  }
});

/**
 * Update an internship (only if pending)
 */
studentRoutes.patch('/:id', async (c) => {
  const db = c.env.DB;
  const user = c.get('user');
  const studentId = c.get('studentId');
  const internshipId = c.req.param('id');

  try {
    // 1. Verify ownership and status
    const existing = await db.prepare(
      'SELECT status FROM internships WHERE id = ? AND student_id = ?'
    ).bind(internshipId, studentId).first();

    if (!existing) {
      return c.json({ success: false, message: 'Internship not found or unauthorized.' }, 404);
    }

    if (existing.status !== 'pending') {
      return c.json({ success: false, message: 'Cannot edit an internship that is already verified or rejected.' }, 403);
    }

    const data = await c.req.json();
    
    // For simplicity, we only allow updating specific fields. (A more robust query builder could be used)
    const allowedFields = ['company_name', 'location', 'role', 'work_mode', 'has_incentives', 'incentive_amount', 'start_date', 'duration', 'has_offer_letter', 'is_completed'];
    
    let updates = [];
    let values = [];
    
    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        updates.push(`${field} = ?`);
        if (field === 'has_incentives' || field === 'has_offer_letter' || field === 'is_completed') {
           values.push((data[field] === true || data[field] === 'Yes') ? 1 : 0);
        } else {
           values.push(data[field]);
        }
      }
    }

    if (updates.length === 0) {
      return c.json({ success: false, message: 'No valid fields provided for update.' }, 400);
    }

    updates.push("updated_at = CURRENT_TIMESTAMP");
    values.push(internshipId, studentId);

    const query = `UPDATE internships SET ${updates.join(', ')} WHERE id = ? AND student_id = ? AND status = 'pending'`;

    const { success } = await db.prepare(query).bind(...values).run();

    if (!success) {
      return c.json({ success: false, message: 'Update failed.' }, 500);
    }

    return c.json({
      success: true,
      message: 'Internship updated successfully.',
      data: {}
    });

  } catch (error) {
    console.error('Error updating internship:', error);
    return c.json({ success: false, message: 'Unable to update internship.' }, 500);
  }
});

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_OFFER_LETTER_TYPES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
const ALLOWED_CERTIFICATE_TYPES = [...ALLOWED_OFFER_LETTER_TYPES, 'image/jpeg', 'image/png', 'image/jpg'];

const getExtension = (type) => {
  if (type === 'application/pdf') return 'pdf';
  if (type === 'application/msword') return 'doc';
  if (type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') return 'docx';
  if (type === 'image/jpeg' || type === 'image/jpg') return 'jpg';
  if (type === 'image/png') return 'png';
  return 'bin';
};

const handleDocumentUpload = async (c, docType) => {
  const db = c.env.DB;
  const storage = c.env.STORAGE;
  const user = c.get('user');
  const studentId = c.get('studentId');
  const internshipId = c.req.param('id');

  try {
    // Verify internship exists and belongs to student
    const existing = await db.prepare(
      'SELECT status FROM internships WHERE id = ? AND student_id = ?'
    ).bind(internshipId, studentId).first();

    if (!existing) {
      return c.json({ success: false, message: 'Internship not found or unauthorized.' }, 404);
    }

    const body = await c.req.parseBody();
    const file = body['file'];

    if (!file || !(file instanceof File)) {
      return c.json({ success: false, message: 'No file uploaded.' }, 400);
    }

    if (file.size > MAX_FILE_SIZE) {
      return c.json({ success: false, message: 'File size exceeds 5MB limit.' }, 413);
    }

    const allowedTypes = docType === 'offer_letter' ? ALLOWED_OFFER_LETTER_TYPES : ALLOWED_CERTIFICATE_TYPES;
    if (!allowedTypes.includes(file.type)) {
      return c.json({ success: false, message: 'Invalid file type.' }, 415);
    }

    const ext = getExtension(file.type);
    const uniqueId = crypto.randomUUID();
    const key = `internships/${studentId}/${internshipId}/${docType.replace('_', '-')}/${uniqueId}.${ext}`;

    await storage.put(key, file.stream ? file.stream() : file, {
      httpMetadata: { contentType: file.type }
    });

    const updateField = docType === 'offer_letter' ? 'offer_letter_key' : 'completion_certificate_key';
    
    let query = `UPDATE internships SET ${updateField} = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND student_id = ?`;
    if (docType === 'completion_certificate') {
      query = `UPDATE internships SET ${updateField} = ?, is_completed = 1, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND student_id = ?`;
    }
    
    const { success } = await db.prepare(query).bind(key, internshipId, studentId).run();

    if (!success) {
      // Best effort cleanup could be done here
      return c.json({ success: false, message: 'Failed to link document to internship.' }, 500);
    }

    return c.json({ success: true, message: 'Document uploaded successfully.', data: { key } });
  } catch (error) {
    console.error(`Error uploading ${docType}:`, error);
    return c.json({ success: false, message: 'Unable to upload document.' }, 500);
  }
};

studentRoutes.post('/:id/offer-letter', (c) => handleDocumentUpload(c, 'offer_letter'));
studentRoutes.post('/:id/completion-certificate', (c) => handleDocumentUpload(c, 'completion_certificate'));

const handleDocumentDownload = async (c, docType) => {
  const db = c.env.DB;
  const storage = c.env.STORAGE;
  const user = c.get('user');
  const studentId = c.get('studentId');
  const internshipId = c.req.param('id');

  try {
    const field = docType === 'offer_letter' ? 'offer_letter_key' : 'completion_certificate_key';
    const internship = await db.prepare(
      `SELECT ${field} as key FROM internships WHERE id = ? AND student_id = ?`
    ).bind(internshipId, studentId).first();

    if (!internship) {
      return c.json({ success: false, message: 'Internship not found or unauthorized.' }, 404);
    }

    if (!internship.key) {
      return c.json({ success: false, message: 'Document not found.' }, 404);
    }

    const object = await storage.get(internship.key);
    if (!object) {
      return c.json({ success: false, message: 'Document file not found in storage.' }, 404);
    }

    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set('etag', object.httpEtag);
    
    if (!headers.has('Content-Type') || headers.get('Content-Type') === 'application/octet-stream') {
      const ext = internship.key.split('.').pop().toLowerCase();
      let contentType = 'application/octet-stream';
      if (ext === 'pdf') contentType = 'application/pdf';
      else if (ext === 'png') contentType = 'image/png';
      else if (ext === 'jpg' || ext === 'jpeg') contentType = 'image/jpeg';
      headers.set('Content-Type', contentType);
    }
    
    // Provide a generic filename with correct extension
    const ext = internship.key.split('.').pop();
    headers.set('Content-Disposition', `inline; filename="internship-${docType}.${ext}"`);

    return new Response(object.body, { headers });
  } catch (error) {
    console.error(`Error downloading ${docType}:`, error);
    return c.json({ success: false, message: 'Unable to download document.' }, 500);
  }
};

studentRoutes.get('/:id/offer-letter', (c) => handleDocumentDownload(c, 'offer_letter'));
studentRoutes.get('/:id/completion-certificate', (c) => handleDocumentDownload(c, 'completion_certificate'));

export default studentRoutes;
