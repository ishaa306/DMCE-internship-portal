import React, { useState } from 'react';
import './CompanyLogin.css';
import dmceLogo from '../../assets/images/dmce.png';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const CompanyLogin = () => {
  const [companyEmail, setCompanyEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState(''); // email validation error

  // Email validation
  const validateEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  // Handle email input changes + validation
  const handleEmailChange = (e) => {
    const value = e.target.value;
    setCompanyEmail(value);
    if (value && !validateEmail(value)) {
      setEmailError('Please enter a valid email address');
    } else {
      setEmailError('');
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!companyEmail.trim() || !password.trim()) {
      setError('❌ Both fields are required.');
      return;
    }

    if (!validateEmail(companyEmail)) {
      setEmailError('Please enter a valid email address');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const res = await fetch('https://placement-portal-backend.ramshekade20.workers.dev/api/company-auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: companyEmail, password }),
      });

      let data;
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await res.json();
      } else {
        const text = await res.text();
        throw new Error(text);
      }

      if (!res.ok) {
        setError(data?.error || '❌ Login failed');
        return;
      }

      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('company_name', data.company_name);
      localStorage.setItem('email', data.email);
      localStorage.setItem('company_logo', data.company_logo);
      localStorage.setItem('loginTime', data.login_time || new Date().toISOString());

      if (data.password_updated === 0) {
        window.location.href = '/company/update-pass';
      } else if (data.profile_created === false) {
        window.location.href = '/company-register'; // ✅ Changed from /companyRegi
      } else {
        window.location.href = '/company-dashboard';
      }

    } catch (err) {
      console.error('Login error:', err);
      setError(`❌ ${err.message || 'Server error. Please try again later.'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="comp-announcement-bar">
        <marquee scrollamount="6" behavior="scroll" direction="left">
          📣 We are proud to announce the NAAC accreditation (Cycle-2) of our institute with Grade 'A'! &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          🏆 NBA accreditation of Civil and Chemical Engineering achieved! &nbsp;&nbsp;
          🎓 Your involvement in our placement process inspires us to continuously strive for excellence. 🎓 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
        </marquee>
      </div>

      <div className="comp-login-wrapper">
        <div className="comp-left-panel">
          <img src={dmceLogo} alt="DMCE Logo" className="comp-logo" />
          <h2>DMCE - Training & Placement Portal</h2>
        </div>

        <div className="comp-right-panel">
          <form className="comp-login-form" onSubmit={handleLogin}>
            <h2>COMPANY LOGIN</h2>

            <input
              type="text"
              placeholder="Registered Email ID"
              value={companyEmail}
              onChange={handleEmailChange}
              className={emailError ? 'comp-input-error' : ''}
            />
            {emailError && <p className="comp-field-error">{emailError}</p>}

            <div className="comp-password-field">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="comp-password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>

            <div className="comp-forgot-password-link">
              <Link to="/company/forgot-pass">Forgot Password?</Link>
            </div>

            {error && <p className="comp-error">{error}</p>}

            <button type="submit" disabled={loading} className="comp-login-btn">
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default CompanyLogin;