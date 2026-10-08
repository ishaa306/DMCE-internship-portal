import React, { useState } from "react";
import "./TpOUpdatePassword.css";
import dmceLogo from "../../assets/images/dmce.png";
import { FaClock, FaUser } from "react-icons/fa";

const TpOUpdatePassword = () => {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
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
    setMessage("");

    if (!validatePassword(newPassword)) {
      setMessage(
        "❌ Password must be at least 8 characters, include uppercase, lowercase & special character."
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage("❌ New Password and Confirm Password do not match.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        "https://placement-portal-backend.ramshekade20.workers.dev/api/tpo-auth/change-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include", // ✅ Important: Send auth cookie
          body: JSON.stringify({
            old_password: oldPassword,
            new_password: newPassword,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(`❌ ${data?.error || "Failed to update password."}`);
        return;
      }

      setMessage("✅ Password updated successfully!");

      // Redirect to dashboard after 1s
      setTimeout(() => {
        window.location.href = "/tpo-login";
      }, 1000);
    } catch (err) {
      console.error("Error:", err);
      setMessage("❌ Server error. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="tnp-change-wrapper">
      <div className="tnp-left-panel">
        <img src={dmceLogo} alt="DMCE Logo" className="tnp-logo" />
        <h2>DMCE - Training & Placement Portal</h2>
      </div>

      <div className="tnp-right-panel">
        <form className="tnp-change-form" onSubmit={handleSubmit}>
          <h2>TpO CHANGE PASSWORD</h2>

          {message && (
            <p className={message.includes("✅") ? "tnp-success" : "tnp-error"}>
              {message}
            </p>
          )}

          <input
            type={showPassword ? "text" : "password"}
            placeholder="Old Password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            className="tnp-input"
            required
          />

          <input
            type={showPassword ? "text" : "password"}
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="tnp-input"
            required
          />

          <input
            type={showPassword ? "text" : "password"}
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="tnp-input"
            required
          />

          <ul className="tnp-validation-list">
            <li style={{ color: validations.length ? "green" : "red" }}>
              {validations.length ? "✅" : "❌"} Min 8 characters
            </li>
            <li style={{ color: validations.uppercase ? "green" : "red" }}>
              {validations.uppercase ? "✅" : "❌"} 1 uppercase letter
            </li>
            <li style={{ color: validations.lowercase ? "green" : "red" }}>
              {validations.lowercase ? "✅" : "❌"} 1 lowercase letter
            </li>
            <li style={{ color: validations.specialChar ? "green" : "red" }}>
              {validations.specialChar ? "✅" : "❌"} 1 special character
            </li>
          </ul>

          <button
            type="button"
            className="tnp-toggle-btn"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? "🙈  Hide Password" : "👁️  Show Password"}
          </button>

          <button type="submit" className="tnp-submit-btn" disabled={loading}>
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default TpOUpdatePassword;
