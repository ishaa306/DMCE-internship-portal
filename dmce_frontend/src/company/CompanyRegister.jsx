import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CollegeHeader from '../shared/CollegeHeader';

const CompanyRegister = () => {
  const navigate = useNavigate();
  const [data, setData] = useState({
    companyName: '',
    companyEmail: '',
    companyLogo: null,
    hrName: '',
    hrPhone: '',
    website: '',
  });

  const [isRegistering, setIsRegistering] = useState(false);
  const [logoError, setLogoError] = useState('');
  const [submitError, setSubmitError] = useState('');

  // Load company name and email from localStorage
  useEffect(() => {
    const storedName = localStorage.getItem('company_name') || '';
    const storedEmail = localStorage.getItem('email') || '';

    console.log('📋 Loaded from localStorage:', { storedName, storedEmail });

    setData((prev) => ({
      ...prev,
      companyName: storedName,
      companyEmail: storedEmail,
    }));
  }, []);

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;

    if (type === 'file') {
      const file = files[0];
      setLogoError('');

      if (file) {
        console.log('📤 Logo file selected:', file.name, file.size, 'bytes');

        // Check file size - 512KB max
        if (file.size > 512 * 1024) {
          setLogoError('Logo must be less than 512KB in size');
          console.warn('❌ File too large:', file.size);
          return;
        }

        // Check file type
        if (!['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
          setLogoError('Logo must be JPG or PNG format');
          console.warn('❌ Invalid file type:', file.type);
          return;
        }

        console.log('✅ Logo file validated');
        setData({
          ...data,
          [name]: file
        });
      }
    } else {
      setData({
        ...data,
        [name]: value,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    setIsRegistering(true);

    console.log('🔵 Starting company profile creation...');

    const formDataToSend = new FormData();
    formDataToSend.append('company_name', data.companyName);
    formDataToSend.append('company_email', data.companyEmail);

    if (data.companyLogo) {
      formDataToSend.append('company_logo', data.companyLogo);
    }

    formDataToSend.append('hr_person_name', data.hrName);
    formDataToSend.append('hr_phone', data.hrPhone); // ✅ FIXED: Changed from hr_person_contact
    formDataToSend.append('website', data.website); // ✅ FIXED: Changed from company_website

    console.log('📤 Request data:', {
      company_name: data.companyName,
      company_email: data.companyEmail,
      hr_person_name: data.hrName,
      hr_phone: data.hrPhone,
      website: data.website,
      has_logo: !!data.companyLogo,
    });

    try {
      const response = await fetch(
        'https://placement-portal-backend.ramshekade20.workers.dev/api/company/profile/create',
        {
          method: 'POST',
          body: formDataToSend,
          credentials: 'include',
        }
      );

      console.log('📥 Response status:', response.status);
      console.log('📥 Response OK:', response.ok);

      let result;
      const contentType = response.headers.get('content-type');

      if (contentType && contentType.includes('application/json')) {
        result = await response.json();
      } else {
        const text = await response.text();
        console.log('📥 Response text:', text);
        result = { error: text };
      }

      console.log('📥 Response data:', result);

      if (response.ok && result.success) {
        console.log('✅ Profile created successfully!');

        // Update localStorage with new profile data
        if (result.company_name) {
          localStorage.setItem('company_name', result.company_name);
        }
        if (result.company_logo || result.logo_url) {
          localStorage.setItem('company_logo', result.company_logo || result.logo_url);
        }

        alert('✅ Company profile created successfully!');

        // Redirect using navigate (better than window.location)
        setTimeout(() => {
          navigate('/company-dashboard');
        }, 500);
      } else {
        const errorMsg = result.error || result.message || 'Unknown error';
        console.error('❌ Registration failed:', errorMsg);
        setSubmitError(errorMsg);
        alert('❌ Registration failed: ' + errorMsg);
        setIsRegistering(false);
      }
    } catch (error) {
      console.error('❌ Error submitting form:', error);
      setSubmitError('Network error. Please try again.');
      alert('❌ An error occurred during submission: ' + error.message);
      setIsRegistering(false);
    }
  };

  return (
    <>
      <CollegeHeader />

      <div style={styles.container}>
        <div style={styles.header}>🏢 Company Profile Setup</div>

        {submitError && (
          <div style={styles.errorBox}>
            <strong>Error:</strong> {submitError}
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>Company Name *</label>
            <input
              name="companyName"
              placeholder="e.g.  Infosys Ltd"
              value={data.companyName}
              disabled
              onChange={handleChange}
              required
              style={{ ...styles.input, ...styles.disabledInput }}
            />
            <div style={styles.helperText}>Loaded from your login session</div>
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Company Email *</label>
            <input
              type="email"
              name="companyEmail"
              placeholder="e.g. hr@company.com"
              value={data.companyEmail}
              disabled
              onChange={handleChange}
              required
              style={{ ...styles.input, ...styles.disabledInput }}
            />
            <div style={styles.helperText}>Loaded from your login session</div>
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Company Logo</label>
            <input
              type="file"
              accept=". jpg,.jpeg,.png"
              name="companyLogo"
              onChange={handleChange}
              disabled={isRegistering}
              style={styles.input}
            />
            {logoError && <div style={styles.errorText}>{logoError}</div>}
            {!logoError && data.companyLogo && (
              <div style={styles.successText}>
                ✅ {data.companyLogo.name} ({(data.companyLogo.size / 1024).toFixed(2)} KB)
              </div>
            )}
            <div style={styles.helperText}>Maximum size: 512KB (JPG, PNG)</div>
          </div>

          <div style={styles.field}>
            <label style={styles.label}>HR Contact Person *</label>
            <input
              name="hrName"
              placeholder="e.g. Anjali Mehta"
              value={data.hrName}
              onChange={handleChange}
              required
              disabled={isRegistering}
              style={styles.input}
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>HR Phone Number *</label>
            <input
              name="hrPhone"
              type="tel"
              placeholder="e.g. 9876543210"
              value={data.hrPhone}
              onChange={handleChange}
              required
              disabled={isRegistering}
              pattern="[0-9]{10}"
              maxLength={10}
              style={styles.input}
            />
            <div style={styles.helperText}>10-digit number without spaces or hyphens</div>
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Company Website</label>
            <input
              name="website"
              type="url"
              placeholder="e.g. https://www. company.com"
              value={data.website}
              onChange={handleChange}
              disabled={isRegistering}
              style={styles.input}
            />
          </div>

          <div style={{ gridColumn: '1 / -1', textAlign: 'center', marginTop: '10px' }}>
            <button
              type="submit"
              style={isRegistering || logoError ? { ...styles.button, ...styles.buttonDisabled } : styles.button}
              disabled={isRegistering || logoError}
            >
              {isRegistering ? 'Creating Profile...' : 'Complete Registration'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

const styles = {
  container: {
    maxWidth: '800px',
    margin: '40px auto',
    padding: '30px',
    background: '#fff',
    borderRadius: '12px',
    boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
    border: '1px solid #ccc',
  },
  header: {
    backgroundColor: '#1e1e3f',
    color: '#fff',
    padding: '14px 20px',
    borderRadius: '8px',
    fontSize: '20px',
    marginBottom: '25px',
    textAlign: 'center',
    fontWeight: '600',
  },
  form: {
    display: 'grid',
    gap: '20px',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
  },
  label: {
    fontWeight: '600',
    fontSize: '14px',
    marginBottom: '6px',
    color: '#1e1e3f',
  },
  input: {
    padding: '11px',
    borderRadius: '6px',
    border: '1px solid #ccc',
    backgroundColor: '#fff',
    fontSize: '14px',
    color: '#000',
    transition: 'border-color 0.2s',
  },
  disabledInput: {
    backgroundColor: '#f5f5f5',
    color: '#666',
    cursor: 'not-allowed',
  },
  button: {
    padding: '13px 35px',
    backgroundColor: '#1e1e3f',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    fontWeight: 'bold',
    fontSize: '15px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  buttonDisabled: {
    backgroundColor: '#9ca3af',
    cursor: 'not-allowed',
    opacity: 0.6,
  },
  errorText: {
    color: '#dc2626',
    fontSize: '12px',
    marginTop: '4px',
    fontWeight: '500',
  },
  successText: {
    color: '#059669',
    fontSize: '12px',
    marginTop: '4px',
    fontWeight: '500',
  },
  helperText: {
    color: '#6b7280',
    fontSize: '12px',
    marginTop: '4px',
  },
  errorBox: {
    backgroundColor: '#fee',
    color: '#c00',
    padding: '12px',
    borderRadius: '6px',
    marginBottom: '20px',
    border: '1px solid #fcc',
    fontWeight: '600',
  },
};

export default CompanyRegister;