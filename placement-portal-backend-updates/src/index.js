import { Hono } from "hono";
import { cors } from "hono/cors";
import bcrypt from "bcryptjs";
import { sign, verify } from "hono/jwt";
import { sendCreds } from "./sendEmail"; // your mail utility
import { sendCompanyCreds } from "./sendEmail";
import { sendTnpCreds } from "./sendEmail";
import { sendTpoCreds } from "./sendEmail";
import auth from "./student/auth";
import student from "./student/student";
import forgot from "./student/forgot";
import company from "./company/company";
import companyAuth from "./company/comapnyAuth";
import TnP from "./TnP/tnp";
import tpoauth from "./tpo/auth";
import tnpauth from "./TnP/auth";
import adminauth from "./admin/auth";
import tpo from "./tpo/tpo";

const app = new Hono();

// ✅ CORS for both local + prod
app.use(
  "*",
  cors({
    origin: (origin) => {
      if (!origin) return ""; // handle server-to-server or curl
      const allowedOrigins = [
        "http://localhost:5173",
        "https://tnp-a3s.pages.dev",
        "https://dmce-tnp.pages.dev",
        "https://dmceplacement.com",
      ];
      return allowedOrigins.includes(origin) ? origin : ""; // allow only whitelisted
    },
    credentials: true, // ⚠️ Needed to allow cookies
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ✅ JWT Middleware
app.use("*", async (c, next) => {
  c.env.JWT_SECRET =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  c.env.signJWT = async (payload, expiresInSeconds = 7200) => {
    const exp = Math.floor(Date.now() / 1000) + expiresInSeconds;
    return await sign({ ...payload, exp }, c.env.JWT_SECRET);
  };

  c.env.verifyJWT = async (token) => await verify(token, c.env.JWT_SECRET);
  await next();
});

// ✅ Routes setup
app.route("/api/student", student);
app.route("/api/company", company);
app.route("api/company-auth", companyAuth);
app.route("/api/tnp", TnP);
app.route("/api/tnp-auth", tnpauth);
app.route("/api/tpo-auth", tpoauth);
app.route("/api/tpo", tpo);
app.route("/api/admin-auth", adminauth);
app.route("", auth);
app.route("", forgot);

//delete all table data

app.get("/logo/:type/:filename", async (c) => {
  const { type, filename } = c.req.param();
  const bucket = c.env.R2_BUCKET;

  const key = `${type}/${filename}`;
  const object = await bucket.get(key);

  if (!object || !object.body) {
    return c.json({ error: "File not found" }, 404);
  }

  const contentType =
    object.httpMetadata?.contentType || "application/octet-stream";

  return new Response(object.body, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=86400",
    },
  });
});

app.get("/file/:type/:filename", async (c) => {
  const { type, filename } = c.req.param();
  const bucket = c.env.R2_BUCKET;

  const key = `students/${type}/${filename}`;
  const object = await bucket.get(key);

  if (!object || !object.body) {
    return c.json({ error: "File not found" }, 404);
  }

  const contentType =
    object.httpMetadata?.contentType || "application/octet-stream";

  return new Response(object.body, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=86400",
    },
  });
});

// app.get("/api/delete",async(c)=>{
//   const db= c.env.DB;

//   await db.batch([
//     db.prepare(`
//       DELETE FROM student_profiles;
// `),
//     db.prepare(`
//       DELETE FROM students_login;
// `),

//   ])
//   return c.text('✅ Tables data deleted successfully')

// })

// ✅ Table creation route (run once)
app.get("/api/create-table", async (c) => {
  try {
    const db = c.env.DB;

    await db.batch([
      db.prepare(`
        CREATE TABLE IF NOT EXISTS students_login (
          gr_number TEXT UNIQUE NOT NULL PRIMARY KEY,
          email TEXT NOT NULL,
          password_hash TEXT NOT NULL,
          password_updated BOOLEAN DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `),

      db.prepare(`
        CREATE TABLE IF NOT EXISTS password_resets (
  email TEXT PRIMARY KEY,
  otp TEXT NOT NULL,
  expires_at DATETIME NOT NULL
);
      `),
      db.prepare(`
        CREATE TABLE IF NOT EXISTS temp_reset_tokens (
  email TEXT PRIMARY KEY,
  token TEXT NOT NULL,
  expires_at DATETIME NOT NULL
);

      `),

      db.prepare(`
      CREATE TABLE IF NOT EXISTS student_profiles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        prn TEXT UNIQUE,
        division TEXT,
        alternate_email TEXT UNIQUE,
        profile_url TEXT NOT NULL,
        first_name TEXT NOT NULL,
        middle_name TEXT,
        last_name TEXT NOT NULL,
        gender TEXT CHECK(gender IN ('Male', 'Female', 'Other')) NOT NULL,
        date_of_birth DATE NOT NULL,
        contact_number_primary TEXT NOT NULL,
        contact_number_alternate TEXT,
        email TEXT NOT NULL,
        aadhaar_number TEXT,
        pan_number TEXT,
        student_id TEXT UNIQUE NOT NULL,
        current_year TEXT NOT NULL,
        department TEXT NOT NULL,
        year_of_admission INTEGER NOT NULL,
        expected_graduation_year INTEGER NOT NULL,
        ssc_percentage REAL NOT NULL,
        ssc_year INTEGER NOT NULL,
        hsc_percentage REAL,
        hsc_year INTEGER,
        diploma_percentage TEXT,
        diploma_year INTEGER,
        live_kt TEXT CHECK(live_kt IN ('Yes', 'No')) NOT NULL,
        cgpa REAL CHECK(cgpa BETWEEN 4 AND 10),
        last_semester TEXT NOT NULL,
        programming_languages TEXT NOT NULL,
        skills TEXT NOT NULL,
        certifications TEXT,
        projects TEXT,
        resume_url TEXT NOT NULL,
        achievements TEXT,
        internships TEXT,
        social_links TEXT,
        status TEXT CHECK(status IN ('pending','active','debarred')) DEFAULT 'active',
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(student_id) REFERENCES students_login(gr_number)
        );
      `),

      db.prepare(`
        CREATE TABLE IF NOT EXISTS company_login (
          email TEXT NOT NULL PRIMARY KEY,
          company_name TEXT NOT NULL,
          password_hash TEXT NOT NULL,
          password_updated BOOLEAN DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `),

      db.prepare(`
        CREATE TABLE IF NOT EXISTS company_profile (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          company_name TEXT NOT NULL,
          email TEXT NOT NULL,
          company_logo TEXT,
          hr_person_name TEXT,
          hr_person_contact TEXT,
          company_website TEXT,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `),

      db.prepare(`
         CREATE TABLE IF NOT EXISTS applications (
          application_id INTEGER PRIMARY KEY AUTOINCREMENT,
          student_id TEXT NOT NULL,
          job_id INTEGER NOT NULL,  
          applied_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          status TEXT CHECK(status IN ('applied', 'withdrawn', 'selected', 'rejected', 'offered')) DEFAULT 'applied',
          UNIQUE(student_id, job_id), -- prevents duplicate applications
          FOREIGN KEY (student_id) REFERENCES student_profiles(student_id),
          FOREIGN KEY (job_id) REFERENCES job_postings(job_id)
        );
      `),

      db.prepare(`
  CREATE TABLE IF NOT EXISTS job_postings (
    job_id INTEGER PRIMARY KEY AUTOINCREMENT,
    company_id INTEGER NOT NULL,
    job_title TEXT NOT NULL,
    job_description TEXT NOT NULL,
    industry TEXT,
    job_location TEXT NOT NULL,
    job_type TEXT NOT NULL,
    role_type TEXT NOT NULL,
    openings INTEGER NOT NULL,
    skills_required TEXT NOT NULL,
    ctc TEXT,
    stipend TEXT,
    batch TEXT NOT NULL,
    drive_date DATE NOT NULL,
    interview_mode TEXT NOT NULL,
    kt_allowed TEXT DEFAULT 'No',
    min_cgpa DECIMAL(3,2),
    min_tenth DECIMAL(5,2),
    min_twelfth DECIMAL(5,2),
    min_diploma DECIMAL(5,2),
    eligible_branches TEXT NOT NULL,
    selection_rounds TEXT NOT NULL,
    perks TEXT,
    status TEXT DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`),
    ]);

    return c.text("✅ Tables created successfully");
  } catch (err) {
    console.error(err);
    return c.json(
      { error: "❌ Table creation failed", details: err.message },
      500
    );
  }
});

const generatePassword = (length = 16) => {
  const chars =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  return Array.from(
    { length },
    () => chars[Math.floor(Math.random() * chars.length)]
  ).join("");
};

function wait(ms) {
  return new Promise((res) => setTimeout(res, ms));
}

app.get("/api/tnps", async (c) => {
  try {
    const db = c.env.DB;
    const url = new URL(c.req.url);
    const page = Math.max(1, parseInt(url.searchParams.get("page") || "1", 10));
    const limit = Math.min(
      1000,
      Math.max(1, parseInt(url.searchParams.get("limit") || "100", 10))
    );
    const offset = (page - 1) * limit;

    const { results } = await db
      .prepare(
        `SELECT email, name, department, password_updated, created_at
         FROM tnp_login
         ORDER BY created_at DESC
         LIMIT ? OFFSET ?`
      )
      .bind(limit, offset)
      .all();

    return c.json({
      success: true,
      page,
      limit,
      count: results.length,
      data: results,
    });
  } catch (err) {
    console.error("Error fetching TnP logins:", err);
    return c.json(
      {
        success: false,
        error: "Failed to fetch TnP logins",
        details: err.message,
      },
      500
    );
  }
});

/**
 * GET /api/tpos
 * Query params:
 *  - page (default 1)
 *  - limit (default 100)
 *
 * Returns rows from tpo_login (omits password_hash).
 */
app.get("/api/tpos", async (c) => {
  try {
    const db = c.env.DB;
    const url = new URL(c.req.url);
    const page = Math.max(1, parseInt(url.searchParams.get("page") || "1", 10));
    const limit = Math.min(
      1000,
      Math.max(1, parseInt(url.searchParams.get("limit") || "100", 10))
    );
    const offset = (page - 1) * limit;

    const { results } = await db
      .prepare(
        `SELECT email, password_updated, created_at
         FROM tpo_login
         ORDER BY created_at DESC
         LIMIT ? OFFSET ?`
      )
      .bind(limit, offset)
      .all();

    return c.json({
      success: true,
      page,
      limit,
      count: results.length,
      data: results,
    });
  } catch (err) {
    console.error("Error fetching TPO logins:", err);
    return c.json(
      {
        success: false,
        error: "Failed to fetch TPO logins",
        details: err.message,
      },
      500
    );
  }
});

app.post("/api/list-tnp", async (c) => {
  try {
    const { name, email, department } = await c.req.json();
    const db = c.env.DB;

    if (!name || !email || !department) {
      return c.json({ error: "Name, email and department are required" }, 400);
    }

    // Normalize email
    const normalizedEmail = email.toString().trim().toLowerCase();

    // Check if already exists
    const { results } = await db
      .prepare("SELECT email FROM tnp_login WHERE email = ?")
      .bind(normalizedEmail)
      .all();

    if (results.length > 0) {
      return c.json(
        { error: "TnP admin already registered with this email" },
        409
      );
    }

    // Generate temporary password and hash it
    const plainPassword = generatePassword();
    const passwordHash = await bcrypt.hash(plainPassword, 8);

    // Insert into DB (assumes tnp_login has columns: email, name, department, password_hash, password_updated)
    await db
      .prepare(
        `
      INSERT INTO tnp_login (email, name, department, password_hash, password_updated, created_at)
      VALUES (?, ?, ?, ?, 0, CURRENT_TIMESTAMP)
    `
      )
      .bind(
        normalizedEmail,
        name.toString().trim(),
        department.toString().trim(),
        passwordHash
      )
      .run();

    // Attempt to send credentials email, but don't fail the request if email fails
    try {
      await sendTnpCreds(c.env.BREVO_API_KEY, normalizedEmail, department, plainPassword);
    } catch (err) {
      c.env.LOG &&
        c.env.LOG.warn?.(
          `⚠️ TnP email sending failed for ${normalizedEmail}: ${err.message}`
        );
    }

    return c.json({
      success: true,
      message: "✅ TnP admin registered successfully",
      email: normalizedEmail,
      name,
      department,
    });
  } catch (err) {
    c.env.LOG && c.env.LOG.error?.("❌ TnP registration failed:", err);
    return c.json(
      {
        success: false,
        error: "Internal server error",
        details: err.message,
      },
      500
    );
  }
});

app.post("/api/list-tpo", async (c) => {
  try {
    const { name, email } = await c.req.json();
    const db = c.env.DB;

    if (!name || !email) {
      return c.json({ error: "Name and email are required" }, 400);
    }

    // Normalize email
    const normalizedEmail = email.toString().trim().toLowerCase();

    // Check if already exists
    const { results } = await db
      .prepare("SELECT email FROM tpo_login WHERE email = ?")
      .bind(normalizedEmail)
      .all();

    if (results.length > 0) {
      return c.json(
        { error: "TPO admin already registered with this email" },
        409
      );
    }

    // Generate temporary password and hash it
    const plainPassword = generatePassword();
    const passwordHash = await bcrypt.hash(plainPassword, 8);

    // Insert into DB (assumes tpo_login has columns: email, name, department, password_hash, password_updated)
    await db
      .prepare(
        `
      INSERT INTO tpo_login (email, name, password_hash, password_updated, created_at)
      VALUES (?, ?, ?, 0, CURRENT_TIMESTAMP)
    `
      )
      .bind(normalizedEmail, name.toString().trim(), passwordHash)
      .run();

    // Attempt to send credentials email, but don't fail the request if email fails
    try {
      await sendTpoCreds(c.env.BREVO_API_KEY, normalizedEmail, plainPassword);
    } catch (err) {
      c.env.LOG &&
        c.env.LOG.warn?.(
          `⚠️ TPO email sending failed for ${normalizedEmail}: ${err.message}`
        );
    }

    return c.json({
      success: true,
      message: "✅ TPO admin registered successfully",
      email: normalizedEmail,
      name,
    });
  } catch (err) {
    c.env.LOG && c.env.LOG.error?.("❌ TPO registration failed:", err);
    return c.json(
      {
        success: false,
        error: "Internal server error",
        details: err.message,
      },
      500
    );
  }
});

app.post("/api/list-company", async (c) => {
  try {
    const { email, company_name } = await c.req.json();
    const db = c.env.DB;

    if (!email || !company_name) {
      return c.json({ error: "Email and company name are required" }, 400);
    }

    // Check if the company already exists
    const { results } = await db
      .prepare("SELECT email FROM company_login WHERE email = ?")
      .bind(email)
      .all();

    if (results.length > 0) {
      return c.json(
        { error: "Company already registered with this email" },
        409
      );
    }

    // Generate and hash password
    const plainPassword = generatePassword();
    const passwordHash = await bcrypt.hash(plainPassword, 8);

    // Insert into DB
    await db
      .prepare(
        `
      INSERT INTO company_login (email, company_name, password_hash, password_updated)
      VALUES (?, ?, ?, 0)
    `
      )
      .bind(email, company_name, passwordHash)
      .run();

    // Send credentials
    try {
      await sendCompanyCreds(c.env.BREVO_API_KEY, email, company_name, plainPassword);
    } catch (err) {
      console.warn(`⚠️ Email sending failed for ${email}: ${err.message}`);
    }

    return c.json({
      success: true,
      message: "✅ Company registered successfully",
      email,
      company_name,
      temp_password: plainPassword, // Optional: remove in production
    });
  } catch (err) {
    console.error("❌ Registration failed:", err.message);
    return c.json(
      {
        success: false,
        error: "Internal server error",
        details: err.message,
      },
      500
    );
  }
});
app.post("/api/dummydata", async (c) => {
  try {
    const students = await c.req.json();
    const db = c.env.DB;

    let inserted = 0;
    const skipped = [];
    const emailed = [];

    for (const row of students) {
      const gr_number = row["GR"]?.toString().trim();
      const email = row["Email"]?.toString().trim();

      if (!gr_number || !email) {
        skipped.push({ gr_number, reason: "Missing GR or Email" });
        continue;
      }

      try {
        const { results } = await db
          .prepare("SELECT gr_number FROM students_login WHERE gr_number = ?")
          .bind(gr_number)
          .all();

        if (results.length > 0) {
          skipped.push({ gr_number, reason: "Already exists" });
          continue;
        }

        const plainPassword = generatePassword();
        const passwordHash = await bcrypt.hash(plainPassword, 8);

        await db
          .prepare(
            `INSERT INTO students_login (gr_number, email, password_hash, password_updated) VALUES (?, ?, ?, 0)`
          )
          .bind(gr_number, email, passwordHash)
          .run();

        try {
          // Actually send the email using Brevo, handle errors
          await sendCreds(c.env.BREVO_API_KEY, email, gr_number, plainPassword);
          emailed.push(email);
        } catch (err) {
          c.env.LOG &&
            c.env.LOG.warn?.(`⚠️ Email not sent to ${email}: ${err.message}`);
          skipped.push({
            gr_number,
            email,
            error: "Email failed: " + err.message,
          });
          continue;
        }

        inserted++;
        await wait(300); // Slow down for Brevo and Worker limits (400ms per student)
      } catch (err) {
        c.env.LOG && c.env.LOG.warn?.(`❌ Skipping ${email}: ${err.message}`);
        skipped.push({ gr_number, email, error: err.message });
      }
    }

    return c.json({
      message: `✅ ${inserted} students added.`,
      emailed,
      skipped,
    });
  } catch (err) {
    return c.json(
      { error: "❌ Invalid JSON or internal error", details: err.message },
      400
    );
  }
});

app.get("/api/placement-data", async (c) => {
  try {
    const db = c.env.DB;

    const result = await db
      .prepare(
        `
    SELECT
      s.student_id,
      s.prn,
      s.first_name,
      s.middle_name,
      s.last_name,
      s.email,
      s.contact_number_primary,
      s.department,
      s.expected_graduation_year,
      s.cgpa,
      s.profile_url,
      s.resume_url,
      j.job_title,
      j.company_title AS company_name,
      j.ctc,
      j.stipend,
      a.status
    FROM applications a
    JOIN student_profiles s 
      ON a.student_id = s.student_id
    JOIN job_postings j 
      ON a.job_id = j.job_id
    WHERE a.status = 'selected'
    ORDER BY j.company_title;
    `
      )
      .all();

    return c.json({
      success: true,
      placed_students: result.results,
    });
  } catch (err) {
    console.error("❌ Fetch placed students failed:", err);
    return c.json(
      {
        success: false,
        message: "Failed to fetch placed students",
      },
      500
    );
  }
});

export default app;
