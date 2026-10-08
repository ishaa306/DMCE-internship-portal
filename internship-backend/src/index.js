import { Hono } from 'hono';
import { cors } from 'hono/cors';
import studentRoutes from './routes/student.js';
import tpoRoutes from './routes/tpo.js';

const app = new Hono();

// Middleware: CORS
app.use('*', async (c, next) => {
  const corsMiddleware = cors({
    origin: c.env.FRONTEND_ORIGIN || 'http://localhost:5173',
    credentials: true,
    allowMethods: ['GET', 'POST', 'PATCH', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
  });
  return corsMiddleware(c, next);
});

// Global error handler
app.onError((err, c) => {
  console.error('Unhandled Exception:', err);
  return c.json({ success: false, message: 'Internal Server Error' }, 500);
});

// Basic Health Check Route
app.get('/health', (c) => {
  return c.json({ success: true, status: 'ok', message: 'Internship Backend is running.' });
});

// Register grouped routes
app.route('/api/internships', studentRoutes);
app.route('/api/tpo/internships', tpoRoutes);

export default app;
