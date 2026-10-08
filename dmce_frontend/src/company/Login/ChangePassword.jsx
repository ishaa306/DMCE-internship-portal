import React, { useState } from 'react';
import './ChangePassword.css';
import dmceLogo from '../../assets/images/dmce.png';

const CompanyChangePassword = () => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const validations = {
    length: newPassword.length >= 8,
    uppercase: /[A-Z]/.test(newPassword),
    lowercase: /[a-z]/.test(newPassword),
    specialChar: /[!@#$%^&*(),.?":{}|<>]/.test(newPassword),
  };

  const validatePassword = (password) => {
    return (
      password.length >= 8 &&
      /[A-Z]/.test(password) &&
      /[a-z]/.test(password) &&
      /[!@#$%^&*(),. ?":{}|<>]/.test(password)
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    if (!validatePassword(newPassword)) {
      setMessage(
        '❌ Password must be at least 8 characters, include uppercase, lowercase & special character.'
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage('❌ New Password and Confirm Password do not match.');
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        'https://placement-portal-backend.ramshekade20.workers.dev/api/company-auth/change-password',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include', // ✅ Send auth cookie
          body: JSON.stringify({
            old_password: oldPassword,
            new_password: newPassword,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(`❌ ${data?.error || data?.message || 'Failed to update password.'}`);
        return;
      }

      // ✅ SUCCESS: Password updated
      setMessage('✅ Password updated successfully!  Redirecting to login...');

      // ✅ CRITICAL FIX: Clear localStorage (backend destroyed session)
      localStorage.clear();

      // ✅ Redirect to login after showing success message
      setTimeout(() => {
        window.location.href = '/company-login';
      }, 1500);
    } catch (err) {
      console.error('Error:', err);
      setMessage('❌ Server error. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="change-wrapper">
      <div className="left-panel">
        <img src={dmceLogo} alt="DMCE Logo" className="logo" />
        <h2>DMCE - Training & Placement Portal</h2>
      </div>

      <div className="right-panel">
        <form className="change-form" onSubmit={handleSubmit}>
          <h2>CHANGE PASSWORD</h2>

          {message && (
            <p className={message.includes('✅') ? 'success' : 'error'}>
              {message}
            </p>
          )}

          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Old Password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            required
            autoComplete="current-password"
          />

          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            autoComplete="new-password"
          />

          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            autoComplete="new-password"
          />

          <ul className="validation-list">
            <li style={{ color: validations.length ? 'green' : 'red' }}>
              {validations.length ? '✅' : '❌'} Min 8 characters
            </li>
            <li style={{ color: validations.uppercase ? 'green' : 'red' }}>
              {validations.uppercase ? '✅' : '❌'} 1 uppercase letter
            </li>
            <li style={{ color: validations.lowercase ? 'green' : 'red' }}>
              {validations.lowercase ? '✅' : '❌'} 1 lowercase letter
            </li>
            <li style={{ color: validations.specialChar ? 'green' : 'red' }}>
              {validations.specialChar ? '✅' : '❌'} 1 special character
            </li>
          </ul>

          <button
            type="button"
            className="toggle-btn"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? '🙈 Hide Password' : '👁️ Show Password'}
          </button>

          <button
            type="submit"
            className="submit-btn"
            disabled={loading}
          >
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CompanyChangePassword;