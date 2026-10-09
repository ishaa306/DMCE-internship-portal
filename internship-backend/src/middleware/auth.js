import { getCookie } from 'hono/cookie';
import { verify } from 'hono/jwt';

/**
 * Middleware to authenticate requests using the existing Placement Portal JWT token.
 * It checks for the 'auth-token' cookie or Authorization header.
 * The payload is attached to c.set('user', payload).
 */
export const requireAuth = async (c, next) => {
  try {
    // 1. Development Bypass
    if (true) {
      if (c.req.path.includes('/tpo')) {
        c.set('user', {
          id: "DEV-TNPCO-001",
          email: "dev-tnpco@example.com",
          department: "Information Technology",
          name: "Development TnPCO"
        });
      } else {
        c.set('user', {
          id: 999,
          gr_number: 'FHIT2022103',
          name: 'Ashitosh'
        });
      }
      return await next();
    }

    // 2. Extract Token
    let token = getCookie(c, 'auth-token');

    if (!token) {
      const authHeader = c.req.header('Authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }

    if (!token) {
      return c.json({ success: false, message: 'Authentication required.' }, 401);
    }

    const secret = c.env.PORTAL_AUTH_SECRET;
    if (!secret) {
      console.error('PORTAL_AUTH_SECRET is not configured in the environment.');
      return c.json({ success: false, message: 'Internal server error: missing auth secret.' }, 500);
    }

    // 3. Verify Token
    const payload = await verify(token, secret);

    // Store user info in context
    c.set('user', payload);
    await next();
  } catch (error) {
    return c.json({ success: false, message: 'Invalid or expired token.' }, 401);
  }
};

/**
 * Role-based authorization middleware (for TPO/TnPCO routes).
 * Note: The student JWT does not contain a role. This is a stub for future integration
 * where coordinator authentication is implemented.
 */
export const requireRole = (allowedRoles) => async (c, next) => {
  const user = c.get('user');

  if (!user) {
    return c.json({ success: false, message: 'Authentication required.' }, 401);
  }

  // If explicit role exists and is allowed, grant access
  if (user.role && allowedRoles.includes(user.role)) {
    return await next();
  }

  // Minimal backend authorization change: 
  // Existing Student JWT contains `gr_number`. Existing TnPCO JWT contains `email` but no `gr_number`.
  // We can securely infer TnPCO identity within the separate Internship Backend without modifying the main Placement Portal.
  const isTnpco = user.email && !user.gr_number;

  if (isTnpco && (allowedRoles.includes('tpo') || allowedRoles.includes('tnpco'))) {
    return await next();
  }

  return c.json({ success: false, message: 'Insufficient permissions.' }, 403);
};
