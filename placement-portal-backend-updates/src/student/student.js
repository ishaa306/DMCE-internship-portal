import { Hono } from 'hono'
import { authMiddleware } from '../middleware/Authenticate';
import app from '..';

const student = new Hono()

function uuidv4() {
  return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
  );
}




student.use('*', authMiddleware)

student.post('/profile/upload/:type', async (c) => {
  try {
    const type = c.req.param('type'); // 'profile', 'resume', 'ssc', 'hsc', 'diploma'
    const user = c.get('user');
    const user_id = user.gr_number;
    const bucket = c.env.R2_BUCKET;

    const binary = await c.req.arrayBuffer();
    const fileName = c.req.header('X-File-Name') || `${type}.jpg`;
    const fileType = c.req.header('X-File-Type') || 'application/octet-stream';

    const ext = fileName.split('.').pop();
    const key = `students/${type}/${user_id}_${crypto.randomUUID()}.${ext}`;
    await bucket.put(key, binary, {
      httpMetadata: { contentType: fileType },
    });

    const baseUrl = 'https://api.dmceplacement.com/file';
    const file_url = `${baseUrl}/${type}/${key.split('/').pop()}`;

    return c.json({ success: true, url: file_url });
  } catch (err) {
    return c.json({ error: `Failed to upload ${c.req.param('type')}`, details: err.message }, 500);
  }
});

student.post('/profile/create', async (c) => {
  try {
    const user = c.get('user');
    const user_id = user.gr_number;
    const db = c.env.DB;

    // Now expecting JSON, not formData
    const data = await c.req.parseBody();

    const parseJSONField = (field) => {
      if (!field) return '[]';
      if (typeof field === 'string') {
        try {
          return JSON.stringify(JSON.parse(field));
        } catch {
          return JSON.stringify(field);
        }
      }
      return JSON.stringify(field);
    };

    const stmt = db.prepare(`
      INSERT INTO student_profiles (
        prn, division, alternate_email, profile_url,
        first_name, middle_name, last_name, gender, date_of_birth,
        contact_number_primary, contact_number_alternate,
        email, aadhaar_number, pan_number, student_id,
        current_year, department, year_of_admission, expected_graduation_year,
        ssc_percentage, ssc_year,
        hsc_percentage, hsc_year,
        diploma_percentage, diploma_year,
        cgpa, last_semester,
        programming_languages, skills, certifications, projects,
        resume_url, achievements, internships, social_links, live_kt
      ) VALUES (
         ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
      )
    `);

    await stmt.bind(
      data.prn,
      data.division || null,
      data.alternate_email || null,
      data.profile_url || "", // URL from binary upload

      data.first_name,
      data.middle_name || null,
      data.last_name,
      data.gender,
      data.date_of_birth,

      data.contact_number_primary,
      data.contact_number_alternate || null,
      data.email,
      data.aadhaar_number,
      data.pan_number || null,
      data.student_id || data.student_id_number,

      data.current_year,
      data.department,
      Number(data.year_of_admission),
      Number(data.expected_graduation_year),

      data.ssc_percentage,
      Number(data.ssc_year),

      data.hsc_percentage || null,
      data.hsc_year ? Number(data.hsc_year) : null,

      data.diploma_percentage || null,
      data.diploma_year ? Number(data.diploma_year) : null,

      data.cgpa ? Number(data.cgpa) : null,
      data.last_semester,

      parseJSONField(data.programming_languages),
      parseJSONField(data.skills || data.soft_skills),
      parseJSONField(data.certifications),
      parseJSONField(data.projects),

      data.resume_url || "", // URL from binary upload
      parseJSONField(data.achievements),
      parseJSONField(data.internships),
      parseJSONField(data.social_links),
      data.liveKt || "No"
    ).run();

    return c.json({ success: true, message: '✅ Full profile created successfully!' });
  } catch (err) {
    console.error('❌ Profile creation failed:', err);
    return c.json({ error: '❌ Failed to create profile', details: err.message }, 500);
  }
});

// student.post('/profile/create', async (c) => {
//   try {
//     const user = c.get('user');
//     const user_id = user.gr_number;
//     const db = c.env.DB;
//     const bucket = c.env.R2_BUCKET;

//     const formData = await c.req.parseBody();

//     const parseJSONField = (field) => {
//       if (!field) return '[]';
//       if (typeof field === 'string') {
//         try {
//           return JSON.stringify(JSON.parse(field));
//         } catch {
//           return JSON.stringify(field);
//         }
//       }
//       return JSON.stringify(field);
//     };

//     const baseUrl = 'https://api.dmceplacement.com/file';
//     const uploadToR2 = async (file, type) => {
//       if (!file || !(file instanceof File)) return null;
//       const ext = file.name.split('.').pop();
//       const key = `students/${type}/${user_id}_${crypto.randomUUID()}.${ext}`;
//       await bucket.put(key, await file.arrayBuffer(), {
//         httpMetadata: { contentType: file.type },
//       });
//       return `${baseUrl}/${type}/${key.split('/').pop()}`;
//     };

//     const profile_url = await uploadToR2(formData['profile_photo'], 'profile');
//     const resume_url = await uploadToR2(formData['resume'], 'resume');
//     const ssc_url = await uploadToR2(formData['ssc_marksheet'], 'ssc');
//     const hsc_url = await uploadToR2(formData['hsc_marksheet'], 'hsc');
//     const diploma_url = await uploadToR2(formData['diploma_marksheet'], 'diploma');

//     const stmt = db.prepare(`
//       INSERT INTO student_profiles (
//         prn, division, alternate_email, profile_url,
//         first_name, middle_name, last_name, gender, date_of_birth,
//         contact_number_primary, contact_number_alternate,
//         email, aadhaar_number, pan_number, student_id,
//         current_year, department, year_of_admission, expected_graduation_year,
//         ssc_percentage, ssc_year,
//         hsc_percentage, hsc_year,
//         diploma_percentage, diploma_year,
//         cgpa, last_semester,
//         programming_languages, skills, certifications, projects,
//         resume_url, achievements, internships, social_links, live_kt
//       ) VALUES (
//          ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ? 
//       )
//     `);

//     await stmt.bind(
//       formData.prn,
//       formData.division || null,
//       formData.alternate_email || null,
//       profile_url || "",

//       formData.first_name,
//       formData.middle_name || null,
//       formData.last_name,
//       formData.gender,
//       formData.date_of_birth,

//       formData.contact_number_primary,
//       formData.contact_number_alternate || null,
//       formData.email,
//       formData.aadhaar_number,
//       formData.pan_number || null,
//       formData.student_id || formData.student_id_number,

//       formData.current_year,
//       formData.department,
//       Number(formData.year_of_admission),
//       Number(formData.expected_graduation_year),

//       formData.ssc_percentage,
//       Number(formData.ssc_year),


//       formData.hsc_percentage || null,
//       formData.hsc_year ? Number(formData.hsc_year) : null,


//       formData.diploma_percentage || null,
//       formData.diploma_year ? Number(formData.diploma_year) : null,


//       formData.cgpa ? Number(formData.cgpa) : null,
//       formData.last_semester,

//       parseJSONField(formData.programming_languages),
//       parseJSONField(formData.skills || formData.soft_skills), // use either depending on frontend key
//       parseJSONField(formData.certifications),
//       parseJSONField(formData.projects),

//       resume_url || "",
//       parseJSONField(formData.achievements),
//       parseJSONField(formData.internships),
//       parseJSONField(formData.social_links),
//       formData.liveKt || "No"
//     ).run();

//     return c.json({ success: true, message: '✅ Full profile created successfully!' });
//   } catch (err) {
//     console.error('❌ Profile creation failed:', err);
//     return c.json({ error: '❌ Failed to create profile', details: err.message }, 500);
//   }
// });

student.post('/profile/update/personal', async (c) => {
  try {
    const user = c.get('user');
    const db = c.env.DB;
    const formData = await c.req.parseBody();

    const stmt = db.prepare(`
      UPDATE student_profiles
      SET date_of_birth = ?, contact_number_primary = ?, contact_number_alternate = ?, aadhaar_number = ?, pan_number = ?, alternate_email = ?
      WHERE student_id = ?
    `);

    await stmt.bind(
      formData.date_of_birth,
      formData.contact_number_primary,
      formData.contact_number_alternate || null,
      formData.aadhaar_number,
      formData.pan_number || null,
      formData.alternate_email || null,
      user.gr_number // assuming student_id references gr_number
    ).run();

    return c.json({ success: true, message: 'Personal info updated!' });
  } catch (err) {
    return c.json({ error: err.message, details: err.message }, 500);
  }
});

student.post('/profile/update/academic', async (c) => {
  try {
    const user = c.get('user');
    const db = c.env.DB;
    const formData = await c.req.parseBody();

    const stmt = db.prepare(`
      UPDATE student_profiles
      SET current_year = ?, expected_graduation_year = ?, cgpa = ?, last_semester = ? 
      WHERE student_id = ?
    `);// live_kt = ?

    await stmt.bind(
      formData.current_year,
      Number(formData.expected_graduation_year),
      formData.cgpa ? Number(formData.cgpa) : null,
      formData.last_semester,
      // formData.live_kt || "No",
      user.gr_number
    ).run();

    return c.json({ success: true, message: 'Academic info updated!' });
  } catch (err) {
    return c.json({ error: 'Failed to update academic info', details: err.message }, 500);
  }
});

student.post('/profile/update/skills', async (c) => {
  try {
    const user = c.get('user');
    const db = c.env.DB;
    const formData = await c.req.parseBody();

    const parseJSONField = (field) => {
      if (!field) return '[]';
      try { return JSON.stringify(JSON.parse(field)); } catch { return JSON.stringify(field); }
    };

    const stmt = db.prepare(`
      UPDATE student_profiles
      SET programming_languages = ?, skills = ? WHERE student_id = ?
    `);

    await stmt.bind(
      parseJSONField(formData.programming_languages),
      parseJSONField(formData.skills || formData.soft_skills),
      user.gr_number
    ).run();

    return c.json({ success: true, message: 'Skills updated!' });
  } catch (err) {
    return c.json({ error: 'Failed to update skills', details: err.message }, 500);
  }
});

student.post('/profile/update/project', async (c) => {
  try {
    const user = c.get('user');
    const db = c.env.DB;
    const formData = await c.req.parseBody();

    const parseJSONField = (field) => {
      if (!field) return '[]';
      try { return JSON.stringify(JSON.parse(field)); } catch { return JSON.stringify(field); }
    };

    const stmt = db.prepare(`
      UPDATE student_profiles
      SET projects = ?
      WHERE student_id = ?
    `);

    await stmt.bind(
      parseJSONField(formData.projects),
      user.gr_number
    ).run();

    return c.json({ success: true, message: 'Projects updated!' });
  } catch (err) {
    return c.json({ error: 'Failed to update Projects', details: err.message }, 500);
  }
});

student.post('/profile/update/experience', async (c) => {
  try {
    const user = c.get('user');
    const db = c.env.DB;
    const formData = await c.req.parseBody();

    const parseJSONField = (field) => {
      if (!field) return '[]';
      try { return JSON.stringify(JSON.parse(field)); } catch { return JSON.stringify(field); }
    };

    const stmt = db.prepare(`
      UPDATE student_profiles
      SET internships = ?
      WHERE student_id = ?
    `);

    await stmt.bind(
      parseJSONField(formData.internships),
      user.gr_number
    ).run();

    return c.json({ success: true, message: 'Work Experience updated!' });
  } catch (err) {
    return c.json({ error: 'Failed to update Work Experience', details: err.message }, 500);
  }
});

student.post('/profile/update/achievement', async (c) => {
  try {
    const user = c.get('user');
    const db = c.env.DB;
    const formData = await c.req.parseBody();

    const parseJSONField = (field) => {
      if (!field) return '[]';
      try { return JSON.stringify(JSON.parse(field)); } catch { return JSON.stringify(field); }
    };

    const stmt = db.prepare(`
      UPDATE student_profiles
      SET achievements = ?
      WHERE student_id = ?
    `);

    await stmt.bind(
      parseJSONField(formData.achievements),
      user.gr_number
    ).run();

    return c.json({ success: true, message: 'Achievements updated!' });
  } catch (err) {
    return c.json({ error: 'Failed to update achievements', details: err.message }, 500);
  }
});


student.post('/profile/update/profile-pic', async (c) => {
  try {
    const user = c.get('user');
    const db = c.env.DB;
    const bucket = c.env.R2_BUCKET;

    // Read binary data from request (arrayBuffer, same as resume)
    const binary = await c.req.arrayBuffer();

    // Get metadata from headers
    const fileName = c.req.header('X-File-Name') || 'profile.jpg';
    const fileType = c.req.header('X-File-Type') || 'image/jpeg';

    // Generate key for R2
    const ext = fileName.split('.').pop();
    const gr_number = user.gr_number;
    const prefix = `students/profile/${gr_number}_`;
    const key = `${prefix}${crypto.randomUUID()}.${ext}`;

    // Delete previous profile photos for this student
    const listResult = await bucket.list({ prefix: prefix });
    for (const obj of listResult.objects) {
      await bucket.delete(obj.key);
    }

    // Upload new profile photo
    await bucket.put(key, binary, {
      httpMetadata: { contentType: fileType },
    });

    // Construct URL to access file
    const baseUrl = 'https://api.dmceplacement.com/file';
    const profile_url = `${baseUrl}/profile/${key.split('/').pop()}`;

    // Update DB
    const stmt = db.prepare(`
      UPDATE student_profiles
      SET profile_url = ?
      WHERE student_id = ?
    `);
    await stmt.bind(
      profile_url || null,
      gr_number
    ).run();

    return c.json({ success: true, message: 'Profile photo updated!', profile_url });
  } catch (err) {
    return c.json({ error: 'Failed to update profile photo', details: err.message }, 500);
  }
});


student.post('/profile/update/resume', async (c) => {
  try {
    const user = c.get('user');
    const db = c.env.DB;
    const bucket = c.env.R2_BUCKET;

    // Read binary data from request
    const binary = await c.req.arrayBuffer();

    // Get metadata from headers
    const fileName = c.req.header('X-File-Name') || 'resume.pdf';
    const fileType = c.req.header('X-File-Type') || 'application/pdf';

    // Generate key for R2
    const ext = fileName.split('.').pop();
    const gr_number = user.gr_number;
    const prefix = `students/resume/${gr_number}_`;
    const key = `${prefix}${crypto.randomUUID()}.${ext}`;

    // Delete previous resumes for this student
    const listResult = await bucket.list({ prefix: prefix });
    for (const obj of listResult.objects) {
      await bucket.delete(obj.key);
    }

    // Upload to R2 bucket
    await bucket.put(key, binary, {
      httpMetadata: { contentType: fileType },
    });

    // Construct URL to access file
    const baseUrl = 'https://api.dmceplacement.com/file';
    const resume_url = `${baseUrl}/resume/${key.split('/').pop()}`;

    // Update DB
    const stmt = db.prepare(`
      UPDATE student_profiles
      SET resume_url = ?
      WHERE student_id = ?
    `);

    await stmt.bind(
      resume_url || null,
      gr_number
    ).run();

    return c.json({ success: true, message: 'Resume updated!', resume_url });
  } catch (err) {
    return c.json({ error: 'Failed to update resume', details: err.message }, 500);
  }
});



// update social links and certifications
student.post('/profile/update/social', async (c) => {
  try {
    const user = c.get('user');
    const db = c.env.DB;
    const formData = await c.req.parseBody();

    const parseJSONField = (field) => {
      if (!field) return '[]';
      try { return JSON.stringify(JSON.parse(field)); } catch { return JSON.stringify(field); }
    };

    const stmt = db.prepare(`
      UPDATE student_profiles
      SET certifications = ?,social_links = ?
      WHERE student_id = ?
    `);

    await stmt.bind(
      parseJSONField(formData.certifications),
      parseJSONField(formData.social_links),
      user.gr_number
    ).run();

    return c.json({ success: true, message: 'Social links & Certifications updated!' });
  } catch (err) {
    return c.json({ error: 'Failed to update social links & Certifications', details: err.message }, 500);
  }
});


student.get('/profile/view', async (c) => {
  try {
    const user = c.get('user');
    const user_id = user.gr_number;
    const db = c.env.DB;

    const stmt = db.prepare(`SELECT * FROM student_profiles WHERE student_id = ?`);
    const result = await stmt.bind(user_id).first();

    if (!result) {
      return c.json({ success: false, message: 'Profile not found' }, 404);
    }

    const parseJSON = (field) => {
      try {
        return JSON.parse(field);
      } catch {
        return field;
      }
    };



    const profile = {
      student_id: result.student_id,
      first_name: result.first_name,
      middle_name: result.middle_name,
      last_name: result.last_name,
      gender: result.gender,
      date_of_birth: result.date_of_birth,
      contact_number_primary: result.contact_number_primary,
      contact_number_alternate: result.contact_number_alternate,
      email: result.email,
      alternate_email: result.alternate_email,
      aadhaar_number: result.aadhaar_number,
      pan_number: result.pan_number,
      backlogs: result.live_kt,

      current_year: result.current_year,
      department: result.department,
      prn: result.prn,
      division: result.division,
      year_of_admission: result.year_of_admission,
      expected_graduation_year: result.expected_graduation_year,
      cgpa: result.cgpa,
      last_semester: result.last_semester,

      ssc_percentage: result.ssc_percentage,
      ssc_year: result.ssc_year,
      ssc_marksheet_url: result.ssc_marksheet_url,

      hsc_percentage: result.hsc_percentage,
      hsc_year: result.hsc_year,
      hsc_marksheet_url: result.hsc_marksheet_url,

      diploma_percentage: result.diploma_percentage,
      diploma_year: result.diploma_year,
      diploma_marksheet_url: result.diploma_marksheet_url,

      programming_languages: parseJSON(result.programming_languages),
      skills: parseJSON(result.skills),
      certifications: parseJSON(result.certifications),
      projects: parseJSON(result.projects),
      achievements: parseJSON(result.achievements),
      internships: parseJSON(result.internships),
      social_links: parseJSON(result.social_links),


      profile_url: result.profile_url,
      resume_url: result.resume_url,
    };

    return c.json({ success: true, profile });
  } catch (err) {
    console.error('❌ Failed to fetch profile:', err);
    return c.json({ error: '❌ Failed to retrieve profile', details: err.message }, 500);
  }
});



// profile basic data 
student.get('/profile/data', async (c) => {
  try {
    const user = c.get('user');
    const gr_number = user.gr_number;
    const db = c.env.DB;

    const profileCheck = await db.prepare(
      'SELECT profile_url, first_name, middle_name, last_name FROM student_profiles WHERE student_id = ?'
    ).bind(gr_number).first();
    // Returns one row or undefined

    const fullName = profileCheck
      ? [profileCheck.first_name, profileCheck.middle_name || "", profileCheck.last_name]
        .filter(Boolean)
        .join(' ')
      : null;
    const profileCreated = !!profileCheck;


    return c.json({
      success: true,
      password_updated: user.password_updated,
      email: user.email,
      user_id: user.gr_number,
      profile_created: profileCreated,
      full_name: fullName,
      profile_url: profileCheck?.profile_url || ""
    });
  } catch (err) {
    console.error('❌ Failed to fetch profile:', err);
    return c.json({ error: '❌ Failed to retrieve profile', details: err.message }, 500);
  }
});


// Upload profile picture route
student.post('/upload', async (c) => {
  try {
    const user = c.get('user');
    const gr_number = user.gr_number;
    const db = c.env.DB;
    const bucket = c.env.R2_BUCKET;

    const body = await c.req.parseBody();
    const file = body['profile'];

    if (!file || !(file instanceof File)) {
      return c.json({ error: 'No file uploaded or invalid format' }, 400);
    }

    const fileExt = file.name.split('.').pop();
    const key = `profile/${gr_number}_${uuidv4()}.${fileExt}`;

    await bucket.put(key, await file.arrayBuffer(), {
      httpMetadata: { contentType: file.type },
    });

    const imageUrl = `https://${c.env.R2_BUCKET}.r2.cloudflarestorage.com/${key}`;

    await db
      .prepare('UPDATE students_login SET profile_pic = ? WHERE gr_number = ?')
      .bind(imageUrl, gr_number)
      .run();

    return c.json({ message: '✅ Profile picture uploaded successfully!', imageUrl });
  } catch (err) {
    console.error('Upload failed:', err);
    return c.json({ error: 'Internal Server Error', details: err.message }, 500);
  }
});


// Sample Worker route to serve R2 objects publicly
student.get('/profile/:filename', async (c) => {
  const bucket = c.env.R2_BUCKET;
  const filename = c.req.param('filename'); // or however you get route param

  try {
    const object = await bucket.get(`profile/${filename}`);
    if (!object) {
      return c.json({ error: "File not found" }, 404);
    }

    const body = object.body; // ReadableStream
    const contentType = object.httpMetadata?.contentType || 'application/octet-stream';

    return new Response(body, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000', // optional cache
      }
    });
  } catch (err) {
    return c.json({ error: "Error fetching file", details: err.message }, 500);
  }
});



student.get('/view-jobs', async (c) => {
  try {
    const db = c.env.DB;

    // 1. Get all job postings
    const jobsResult = await db.prepare(`
      SELECT * FROM job_postings WHERE status = 'active' ORDER BY drive_date ASC
    `).all();

    // 2. For each job, get company logo separately
    const jobsWithCompany = [];

    for (const job of jobsResult.results) {

      // Parse JSON columns
      if (job.skills_required) {
        try { job.skills_required = JSON.parse(job.skills_required); } catch { }
      }

      if (job.eligible_branches) {
        try { job.eligible_branches = JSON.parse(job.eligible_branches); } catch { }
      }

      // Get company logo using company_id
      let company = null;
      if (job.company_id) {
        company = await db.prepare(
          `SELECT company_logo FROM company_profile WHERE id = ?`
        ).bind(job.company_id).first();
      }

      jobsWithCompany.push({
        ...job,
        company: job.company_title || null,
        company_logo: company?.company_logo || null
      });
    }

    return c.json({
      success: true,
      jobs: jobsWithCompany
    });

  } catch (err) {
    console.error('❌ Fetch jobs failed:', err);
    return c.json({
      success: false,
      message: err.message,
      details: err.message
    }, 500);
  }
});


// apply to listed jobs

student.post('/apply', async (c) => {
  const db = c.env.DB;
  const user = c.get('user');
  const student_id = user?.gr_number;
  const { job_id } = await c.req.json();

  if (!student_id || !job_id) {
    return c.json({ success: false, message: "Missing student_id or job_id" }, 400);
  }

  try {
    // Use D1 database API, not sqlite3
    await db.prepare(
      "INSERT INTO applications (student_id, job_id) VALUES (?, ?)"
    ).bind(student_id, job_id).run();

    return c.json({ success: true, message: "Application submitted successfully." }, 201);
  } catch (err) {
    console.error("Application error:", err);
    if (err.message && err.message.includes("UNIQUE constraint failed")) {
      return c.json({ success: false, message: "You have already applied to this job." }, 409);
    }
    return c.json({ success: false, message: err.message || String(err) }, 500);
  }
});


student.get('/application-status', async (c) => {
  const db = c.env.DB;
  const user = c.get("user");
  const student_id = user.gr_number;

  try {
    const { results } = await db.prepare(
      `SELECT 
         a.application_id,
         a.job_id,
         jp.role_type,
         a.status AS application_status,
         jp.job_title,
         jp.company_title,
         a.applied_at
       FROM applications a
       JOIN job_postings jp ON a.job_id = jp.job_id
       JOIN company_profile cp ON jp.company_id = cp.id
       WHERE a.student_id = ?
       ORDER BY a.application_id DESC`
    ).bind(student_id).all();

    // Parse JSON columns if needed


    return c.json({ success: true, result: results });
  } catch (err) {
    console.error("Error retrieving applications:", err);
    return c.json({ success: false, message: "Server error." }, 500);
  }
});


// announcements

student.get('/announcements', async (c) => {
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

student.get('/announcements/:announcement_id', async (c) => {
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


export default student
