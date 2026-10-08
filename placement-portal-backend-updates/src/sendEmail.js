export const sendCreds = async (apiKey, email, gr, password) => {

  try {
    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'api-key': apiKey,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        sender: {
          name: 'TnP Portal',
          email: 'placementportal@dmce.ac.in'
        },
        to: [{ email }],
        subject: 'Welcome to the TnP Portal - Your Login Credentials!',
        htmlContent: `
          <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #dedede; border-radius: 10px; background-color: #f9f9f9;">
            <div style="text-align: center; margin-bottom: 20px;">
              <h2 style="color: #007bff; margin-top: 10px;">Training & Placement Portal</h2>
            </div>
            <p style="font-size: 16px; color: #333;">Dear Student,</p>
            <p style="font-size: 16px; color: #333;">Welcome to the official <strong>TnP Portal</strong> of our institution. Below are your login credentials to access the portal and begin your placement journey:</p>

            <div style="background: #ffffff; border: 1px solid #ccc; border-radius: 8px; padding: 15px; margin: 20px 0;">
              <p style="margin: 5px 0;"><strong>GR Number:</strong> ${gr}</p>
              <p style="margin: 5px 0;"><strong>Temporary Password:</strong> ${password}</p>
            </div>

            <p style="font-size: 15px; color: #555;">Please ensure you change your password immediately after logging in for security reasons.</p>

            <a href="https://dmceplacement.com/" style="display: inline-block; margin-top: 20px; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">Access TnP Portal</a>

            <p style="margin-top: 30px; font-size: 14px; color: #999;">If you have any questions or issues logging in, feel free to reach out to the TnP cell.</p>
            <p style="font-size: 16px; font-weight: bold; color: #333;">Regards,<br/>TnP Team</p>
          </div>
        `
      }),
    });

    const result = await res.json();

    if (!res.ok) {
      console.error('❌ Email failed:', result);
      throw new Error(`Send error: ${res.status} - ${JSON.stringify(result)}`);
    }

    console.log(`✅ Email sent to ${email}: ${result.messageId || 'OK'}`);
    return result;
  } catch (err) {
    console.error(`❌ Failed to send email to ${email}`, err.message);
    throw err;
  }
};

// ✅ Send OTP via Email
export const sendOTPEmail = async (apiKey, email, otp) => {

  try {
    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'api-key': apiKey,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        sender: {
          name: 'OTP Placement Portal',
          email: 'plaementportalotp@dmce.ac.in'
        },
        to: [{ email }],
        subject: 'TnP Portal Password Reset OTP',
        htmlContent: `
          <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #dedede; border-radius: 10px; background-color: #f9f9f9;">
            <h2 style="color: #007bff;">Password Reset OTP</h2>
            <p style="font-size: 16px;">Dear User,</p>
            <p style="font-size: 16px;">You requested to reset your password. Please use the following One-Time Password (OTP) to proceed:</p>
            
            <div style="font-size: 24px; font-weight: bold; margin: 20px 0; text-align: center; color: #007bff;">${otp}</div>

            <p>This OTP will expire in <strong>10 minutes</strong>. Do not share it with anyone.</p>

            <p style="margin-top: 30px; font-size: 14px; color: #999;">If you didn’t request a password reset, please ignore this email or contact TnP support.</p>

            <p style="font-size: 16px; font-weight: bold; color: #333;">Regards,<br/>TnP Team</p>
          </div>
        `
      }),
    });

    const result = await res.json();

    if (!res.ok) {
      console.error('❌ OTP Email failed:', result);
      throw new Error(`Send error: ${res.status} - ${JSON.stringify(result)}`);
    }

    console.log(`✅ OTP email sent to ${email}: ${result.messageId || 'OK'}`);
    return result;
  } catch (err) {
    console.error(`❌ Failed to send OTP to ${email}`, err.message);
    throw err;
  }
};



export const sendCompanyCreds = async (apiKey, email, name, password) => {

  try {
    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'api-key': apiKey,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        sender: {
          name: 'TnP Portal',
          email: 'placementportal@dmce.ac.in'
        },
        to: [{ email }],
        subject: 'Welcome to the TnP Portal - Company Access Credentials!',
        htmlContent: `
  <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #dedede; border-radius: 10px; background-color: #f9f9f9;">
    <div style="text-align: center; margin-bottom: 20px;">
      <h2 style="color: #007bff; margin-top: 10px;">Training & Placement Portal</h2>
    </div>
    
    <p style="font-size: 16px; color: #333;">Dear Recruiter,</p>
    
    <p style="font-size: 16px; color: #333;">
      Thank you for choosing to collaborate with our institution through the <strong>TnP Portal</strong>. Below are your login credentials to access the portal and manage your recruitment process effectively:
    </p>

    <div style="background: #ffffff; border: 1px solid #ccc; border-radius: 8px; padding: 15px; margin: 20px 0;">
      <p style="margin: 5px 0;"><strong>Company Name:</strong> ${name}</p>
      <p style="margin: 5px 0;"><strong>Temporary Password:</strong> ${password}</p>
    </div>

    <p style="font-size: 15px; color: #555;">
      For security reasons, please change your password immediately after logging in.
    </p>

    <a href="https://dmceplacement.com/" style="display: inline-block; margin-top: 20px; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">
      Access TnP Portal
    </a>

    <p style="margin-top: 30px; font-size: 14px; color: #999;">
      If you encounter any issues or have questions, feel free to reach out to our Training & Placement team.
    </p>
    
    <p style="font-size: 16px; font-weight: bold; color: #333;">
      Regards,<br/>
      TnP Team
    </p>
  </div>
`

      }),
    });

    const result = await res.json();

    if (!res.ok) {
      console.error('❌ Email failed:', result);
      throw new Error(`Send error: ${res.status} - ${JSON.stringify(result)}`);
    }

    console.log(`✅ Email sent to ${email}: ${result.messageId || 'OK'}`);
    return result;
  } catch (err) {
    console.error(`❌ Failed to send email to ${email}`, err.message);
    throw err;
  }
};
//dfghuioplkb



export const sendTnpCreds = async (apiKey, email, department, password) => {

  try {
    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'api-key': apiKey,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        sender: {
          name: 'TnP Portal',
          email: 'placementportal@dmce.ac.in'
        },
        to: [{ email }],
        subject: '🛡️ TnP Portal - Admin Access Credentials',
        htmlContent: `
          <div style="font-family: 'Segoe UI', sans-serif; max-width: 640px; margin: auto; padding: 20px; border: 1px solid #dedede; border-radius: 10px; background-color: #f9f9f9;">
            <div style="text-align: center; margin-bottom: 20px;">
              <h2 style="color: #007bff; margin-top: 10px;">Training & Placement Portal - Admin Access</h2>
            </div>

            <p style="font-size: 16px; color: #333;">Dear TnP Admin,</p>

            <p style="font-size: 16px; color: #333;">
              Your administrative account for the <strong>TnP Portal</strong> has been created. Use the credentials below to sign in. Please change this temporary password immediately after first login.
            </p>

            <div style="background: #ffffff; border: 1px solid #ccc; border-radius: 8px; padding: 15px; margin: 20px 0;">
              <p style="margin: 5px 0;"><strong>Email:</strong> ${email}</p>
              <p style="margin: 5px 0;"><strong>Department / Role:</strong> ${department}</p>
              <p style="margin: 5px 0;"><strong>Temporary Password:</strong> ${password}</p>
            </div>

            <p style="font-size: 15px; color: #555;">For security, please update your password and enable any recommended account protections.</p>

            <a href="https://tnp-a3s.pages.dev" style="display: inline-block; margin-top: 20px; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">
              Go to TnP Portal
            </a>

            <p style="margin-top: 30px; font-size: 14px; color: #999;">If you did not request this account or believe this is an error, contact the TnP team immediately.</p>

            <p style="font-size: 16px; font-weight: bold; color: #333;">Regards,<br/>TnP Team</p>
          </div>
        `
      }),
    });

    const result = await res.json();

    if (!res.ok) {
      console.error('❌ TnP email failed:', result);
      throw new Error(`Send error: ${res.status} - ${JSON.stringify(result)}`);
    }

    console.log(`✅ TnP credentials email sent to ${email}: ${result.messageId || 'OK'}`);
    return result;
  } catch (err) {
    console.error(`❌ Failed to send TnP credentials to ${email}`, err.message);
    throw err;
  }
};


export const sendTpoCreds = async (apiKey, email, password) => {

  try {
    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'api-key': apiKey,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        sender: {
          name: 'TnP Portal',
          email: 'placementportal@dmce.ac.in'
        },
        to: [{ email }],
        subject: '🛡️ TnP Portal - Admin Access Credentials',
        htmlContent: `
          <div style="font-family: 'Segoe UI', sans-serif; max-width: 640px; margin: auto; padding: 20px; border: 1px solid #dedede; border-radius: 10px; background-color: #f9f9f9;">
            <div style="text-align: center; margin-bottom: 20px;">
              <h2 style="color: #007bff; margin-top: 10px;">Training & Placement Portal - Admin Access</h2>
            </div>

            <p style="font-size: 16px; color: #333;">Dear TnP Admin,</p>

            <p style="font-size: 16px; color: #333;">
              Your administrative account for the <strong>TnP Portal</strong> has been created. Use the credentials below to sign in. Please change this temporary password immediately after first login.
            </p>

            <div style="background: #ffffff; border: 1px solid #ccc; border-radius: 8px; padding: 15px; margin: 20px 0;">
              <p style="margin: 5px 0;"><strong>Email:</strong> ${email}</p>
              <p style="margin: 5px 0;"><strong>Temporary Password:</strong> ${password}</p>
            </div>

            <p style="font-size: 15px; color: #555;">For security, please update your password and enable any recommended account protections.</p>

            <a href="https://tnp-a3s.pages.dev" style="display: inline-block; margin-top: 20px; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">
              Go to TnP Portal
            </a>

            <p style="margin-top: 30px; font-size: 14px; color: #999;">If you did not request this account or believe this is an error, contact the TnP team immediately.</p>

            <p style="font-size: 16px; font-weight: bold; color: #333;">Regards,<br/>TnP Team</p>
          </div>
        `
      }),
    });

    const result = await res.json();

    if (!res.ok) {
      console.error('❌ Tpo email failed:', result);
      throw new Error(`Send error: ${res.status} - ${JSON.stringify(result)}`);
    }

    console.log(`✅ Tpo credentials email sent to ${email}: ${result.messageId || 'OK'}`);
    return result;
  } catch (err) {
    console.error(`❌ Failed to send Tpo credentials to ${email}`, err.message);
    throw err;
  }
};
