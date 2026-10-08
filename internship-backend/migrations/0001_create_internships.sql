CREATE TABLE IF NOT EXISTS internships (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id TEXT NOT NULL,
  student_email TEXT,
  student_name TEXT,

  company_name TEXT NOT NULL,
  location TEXT NOT NULL,
  role TEXT NOT NULL,
  work_mode TEXT NOT NULL,

  has_incentives INTEGER DEFAULT 0,
  incentive_amount TEXT,

  start_date TEXT NOT NULL,
  duration TEXT NOT NULL,

  has_offer_letter INTEGER DEFAULT 0,
  offer_letter_key TEXT,

  is_completed INTEGER DEFAULT 0,
  completion_certificate_key TEXT,

  status TEXT DEFAULT 'pending',
  rejection_reason TEXT,

  verified_by TEXT,
  verified_at TEXT,

  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_internships_student_id ON internships(student_id);
CREATE INDEX IF NOT EXISTS idx_internships_status ON internships(status);
CREATE INDEX IF NOT EXISTS idx_internships_company_name ON internships(company_name);
CREATE INDEX IF NOT EXISTS idx_internships_created_at ON internships(created_at);
