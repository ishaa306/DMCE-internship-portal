import React, { useState } from 'react';
import './TnPCOUpdatepassword.css';
import dmceLogo from '../../assets/images/dmce.png';

// Correct API endpoint
const API_URL = 'https://placement-portal-backend.ramshekade20.workers.dev/api/tnp-auth/change-password';

const TnPCOUpdatepassword = () => {
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
      /[!@#$%^&*(),.?":{}|<>]/.test(password)
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    // Validate inputs
    if (!oldPassword.trim()) {
      setMessage('❌ Current password is required.');
      return;
    }

    if (!newPassword.trim()) {
      setMessage('❌ New password is required.');
      return;
    }

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

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          old_password: oldPassword,
          new_password: newPassword
        }),
      });

      const responseText = await response.text();
      let data;

      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.error('Response:', responseText);
        throw new Error(responseText || 'Invalid server response');
      }

      if (!response.ok) {
        throw new Error(data?.error || data?.message || 'Failed to update password');
      }

      setMessage('✅ Password updated successfully!');

      // Clear form
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');

      // Store password updated status
      localStorage.setItem('password_updated', '1');

      // Redirect to login after 1.5s
      setTimeout(() => {
        window.location.href = '/tnpco-login';
      }, 1500);

    } catch (err) {
      console.error('Error:', err);
      setMessage(`❌ ${err.message || 'Server error. Please try again later.'}`);
    } finally {
      setLoading(false);
    }
  };

  // Rest of your JSX remains exactly the same
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
          />

          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />

          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
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
            {showPassword ? '🙈  Hide Password' : '👁️  Show Password'}
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

export default TnPCOUpdatepassword;