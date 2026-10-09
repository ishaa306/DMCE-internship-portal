import { Hono } from 'hono';
import { requireAuth, requireRole } from '../middleware/auth.js';

const tpoRoutes = new Hono();

// All TPO routes require authentication and specific roles
// We assume the roles in the portal are 'tpo' or 'tnpco'. Adjust as needed.
tpoRoutes.use('*', requireAuth, requireRole(['tpo', 'tnpco']));

// Helper to get coordinator identity
const getCoordinatorIdentity = (user) => {
  return user.email || user.username || user.id || 'coordinator';
};

/**
 * Get all internships (with basic filtering eventually)
 */
tpoRoutes.get('/', async (c) => {
  const db = c.env.DB;
  
  try {
    const { results } = await db.prepare(
      'SELECT * FROM internships ORDER BY created_at DESC'
    ).all();

    return c.json({
      success: true,
      message: 'Internships retrieved successfully.',
      data: results
    });
  } catch (error) {
    console.error('Error fetching all internships:', error);
    return c.json({ success: false, message: 'Unable to retrieve internships.' }, 500);
  }
});

/**
 * Get a specific internship by ID
 */
tpoRoutes.get('/:id', async (c) => {
  const db = c.env.DB;
  const internshipId = c.req.param('id');

  try {
    const internship = await db.prepare(
      'SELECT * FROM internships WHERE id = ?'
    ).bind(internshipId).first();

    if (!internship) {
      return c.json({ success: false, message: 'Internship not found.' }, 404);
    }

    return c.json({
      success: true,
      message: 'Internship retrieved successfully.',
      data: internship
    });
  } catch (error) {
    console.error('Error fetching internship details:', error);
    return c.json({ success: false, message: 'Unable to retrieve internship.' }, 500);
  }
});

/**
 * Verify an internship
 */
tpoRoutes.patch('/:id/verify', async (c) => {
  const db = c.env.DB;
  const internshipId = c.req.param('id');
  const user = c.get('user');
  const verifiedBy = getCoordinatorIdentity(user);

  try {
    const { success } = await db.prepare(
      `UPDATE internships 
       SET status = 'verified', verified_by = ?, verified_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
       WHERE id = ? AND status = 'pending'`
    ).bind(String(verifiedBy), internshipId).run();

    if (!success) {
      return c.json({ success: false, message: 'Internship not found, or it is not pending.' }, 404);
    }

    return c.json({
      success: true,
      message: 'Internship verified successfully.',
      data: {}
    });
  } catch (error) {
    console.error('Error verifying internship:', error);
    return c.json({ success: false, message: 'Unable to verify internship.' }, 500);
  }
});

/**
 * Reject an internship
 */
tpoRoutes.patch('/:id/reject', async (c) => {
  const db = c.env.DB;
  const internshipId = c.req.param('id');
  const user = c.get('user');
  const verifiedBy = getCoordinatorIdentity(user);

  try {
    const body = await c.req.json();
    const rejectionReason = body.rejection_reason;

    if (!rejectionReason || !rejectionReason.trim()) {
      return c.json({ success: false, message: 'rejection_reason is required.' }, 400);
    }

    const { success } = await db.prepare(
      `UPDATE internships 
       SET status = 'rejected', rejection_reason = ?, verified_by = ?, verified_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
       WHERE id = ? AND status = 'pending'`
    ).bind(rejectionReason, String(verifiedBy), internshipId).run();

    if (!success) {
      return c.json({ success: false, message: 'Internship not found, or it is not pending.' }, 404);
    }

    return c.json({
      success: true,
      message: 'Internship rejected successfully.',
      data: {}
    });
  } catch (error) {
    console.error('Error rejecting internship:', error);
    return c.json({ success: false, message: 'Unable to reject internship.' }, 500);
  }
});

const handleDocumentDownload = async (c, docType) => {
  const db = c.env.DB;
  const storage = c.env.STORAGE;
  const internshipId = c.req.param('id');

  try {
    const field = docType === 'offer_letter' ? 'offer_letter_key' : 'completion_certificate_key';
    const internship = await db.prepare(
      `SELECT ${field} as key FROM internships WHERE id = ?`
    ).bind(internshipId).first();

    if (!internship) {
      return c.json({ success: false, message: 'Internship not found.' }, 404);
    }

    if (!internship.key) {
      return c.json({ success: false, message: 'Document not found.' }, 404);
    }

    const object = await storage.get(internship.key);
    if (!object) {
      return c.json({ success: false, message: 'Document not found in storage.' }, 404);
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
    
    // Add CORS headers for the blob download if needed, but hono/cors middleware handles it
    return new Response(object.body, { headers });
  } catch (error) {
    console.error(`Error downloading ${docType}:`, error);
    return c.json({ success: false, message: 'Unable to retrieve document.' }, 500);
  }
};

tpoRoutes.get('/:id/offer-letter', (c) => handleDocumentDownload(c, 'offer_letter'));
tpoRoutes.get('/:id/completion-certificate', (c) => handleDocumentDownload(c, 'completion_certificate'));

export default tpoRoutes;
