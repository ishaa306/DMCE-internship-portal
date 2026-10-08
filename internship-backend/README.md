# Internship Updates Backend

This is an independent backend service designed for the DMCE Placement Portal Internship Updates feature. It is built using Cloudflare Workers, Hono, D1, and R2.

## Technology Stack
- **Cloudflare Workers**: Serverless execution
- **Hono**: Ultrafast web framework
- **Cloudflare D1**: Serverless SQL database (internships table)
- **Cloudflare R2**: Object storage (offer letters, completion certificates)

## Folder Structure
```text
internship-backend/
├── src/
│   ├── index.js          # Entry point and route registration
│   ├── routes/
│   │   ├── student.js    # Student-facing API routes
│   │   └── tpo.js        # Coordinator-facing API routes
│   ├── middleware/
│   │   └── auth.js       # JWT validation referencing portal auth
│   └── utils/
│       └── validation.js # Input validation helpers
├── migrations/
│   └── 0001_create_internships.sql # Database schema
├── wrangler.toml         # Cloudflare configuration
└── package.json
```

## Setup & Local Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Database Setup (D1):**
   Run the migration locally to create the SQLite table:
   ```bash
   npx wrangler d1 migrations apply DB --local
   ```

3. **Environment Variables (.dev.vars):**
   Create a `.dev.vars` file in this directory to hold secrets (it is git-ignored).
   ```text
   PORTAL_AUTH_SECRET="your_existing_placement_portal_jwt_secret_here"
   ```

4. **Run Local Server:**
   ```bash
   npm run dev
   ```

## Deployment

1. Create the D1 database in your Cloudflare dashboard (or CLI):
   ```bash
   npx wrangler d1 create internships-db
   ```
   *Update the `database_id` in `wrangler.toml`.*

2. Create the R2 bucket:
   ```bash
   npx wrangler r2 bucket create internship-documents
   ```

3. Set secrets in production:
   ```bash
   npx wrangler secret put PORTAL_AUTH_SECRET
   ```

4. Deploy the worker:
   ```bash
   npm run deploy
   ```

## Authentication Integration
This service uses the **same JWT secret** as the existing Placement Portal backend, enabling seamless Single Sign-On (SSO) without requiring a second login. The `auth.js` middleware verifies incoming cookies or Authorization headers using the `PORTAL_AUTH_SECRET` environment variable.

## Endpoints

**Student:**
- `GET /api/internships` - List own internships
- `GET /api/internships/:id` - Get specific internship
- `POST /api/internships` - Submit new internship
- `PATCH /api/internships/:id` - Update pending internship

**TPO:**
- `GET /api/tpo/internships` - List all internships
- `GET /api/tpo/internships/:id` - Get specific internship
- `PATCH /api/tpo/internships/:id/verify` - Verify an internship
- `PATCH /api/tpo/internships/:id/reject` - Reject an internship (requires `rejection_reason`)
