import React, { useState } from 'react';
import './AdminLogin.css';
import dmceLogo from '../../assets/images/dmce.png';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';

const AdminLogin = () => {
  const navigate = useNavigate(); // 2. Initialize hook
  const [email, setEmail] = useState(''); // changed from adminId to email
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const apiUrl = 'https://placement-portal-backend.ramshekade20.workers.dev/api/admin-auth/login'; // provided API

  const validateEmail = (value) => {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(String(value).toLowerCase());
  };

  const getCurrentDateTime = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('❌ Both fields are required.');
      return;
    }

    if (!validateEmail(email)) {
      setError('❌ Please enter a valid email address.');
      return;
    }

    if (password.length < 4) {
      setError('❌ Password must be at least 4 characters.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // credentials: 'include',
        body: JSON.stringify({
          email, // send email as requested
          password,
        }),
      });

      let data;
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await res.json();
      } else {
        const text = await res.text();
        throw new Error(text || 'Unexpected server response');
      }

      if (!res.ok) {
        setError(data?.error || data?.message || '❌ Login failed');
        return;
      }

      // Persist authentication details
      localStorage.setItem('adminAuthenticated', 'true');
      localStorage.setItem('admin_email', data.email ?? email);
      localStorage.setItem('admin_id', data.admin_id ?? data.id ?? '');
      localStorage.setItem('admin_name', data.full_name ?? data.name ?? 'Administrator');
      localStorage.setItem('loginTime', getCurrentDateTime());

      // Redirect to admin dashboard
      navigate('/admin/dashboard');

    } catch (err) {
      console.error('Login error:', err);
      setError(`❌ ${err.message || 'Server error. Please try again later.'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-wrapper">
      <div className="admin-left-panel">
        <img src={dmceLogo} alt="DMCE Logo" className="admin-logo" />
        <h2>DMCE - Training & Placement Portal</h2>
      </div>

      <div className="admin-right-panel">
        <form className="admin-login-form" onSubmit={handleSubmit} autoComplete="off">
          <h2>ADMIN LOGIN</h2>

          <input
            type="email"
            placeholder="Admin Email ID"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            maxLength={254}
            className="admin-input"
            autoFocus
          />

          <div className="admin-password-field">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="admin-input"
            />
            <button
              type="button"
              className="admin-password-toggle-btn"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          <div className="admin-forgot-password-link">
            <Link to="/admin-forgot-password">Forgot Password?</Link>
          </div>
          <br />

          {error && <p className="admin-error">{error}</p>}

          <button type="submit" disabled={loading} className="admin-login-btn">
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;