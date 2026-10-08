import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  FaEye,
  FaEyeSlash,
  FaExclamationCircle,
  FaSpinner
} from "react-icons/fa";
import dmceLogo from "../../assets/images/dmce.png";



const API_URL = "https://placement-portal-backend.ramshekade20.workers.dev/api/tnp-auth/login";

const TnPCOLogin = () => {
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials((p) => ({ ...p, [name]: value }));
    setError("");
  };

  const validateForm = () => {
    if (!credentials.email.trim()) {
      setError("❌ Email is required.");
      return false;
    }
    if (!credentials.password.trim()) {
      setError("❌ Password is required.");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(credentials.email)) {
      setError("❌ Please enter a valid email address.");
      return false;
    }
    return true;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setError("");

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email: credentials.email,
          password: credentials.password
        })
      });

      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (err) {
        // server returned non-json; surface text
        throw new Error(text || "Invalid server response");
      }

      if (!response.ok) {
        throw new Error(data?.error || data?.message || "Login failed");
      }


      // Persist useful session info
      // Store all authentication data from response
      localStorage.setItem("tnpcoAuthenticated", "true");
      localStorage.setItem("tnpco_email", data.email || credentials.email);
      localStorage.setItem("tnpco_name", data.name || 'TnP Coordinator');
      localStorage.setItem("tnpco_department", data.department || '');
      localStorage.setItem("login_time", data.login_time || new Date().toISOString());

      if (data.name) localStorage.setItem("tnpco_name", data.name);

      // Redirect flow same as earlier TnPCO logic
      if (data.password_updated === 0) {
        window.location.href = "/tnpco/update-password";
      } else if (data.profile_created === false) {
        window.location.href = "/tnpco/create-profile";
      } else {
        window.location.href = "/tnpco/dashboard";
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(`❌ ${err.message || "Server error. Please try again."}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      {/* Left panel visually matches your student login CSS */}
      <div className="left-panel">
        <img src={dmceLogo} alt="DMCE Logo" className="logo" />
        <h2>DMCE - Training & Placement Portal</h2>
      </div>

      {/* Right panel uses the same card structure and class names as original */}
      <div className="right-panel">
        <form className="login-form" onSubmit={handleLogin} noValidate>
          <h2>TnP Co-Ordinator Login</h2>

          <label style={{ display: "none" }} htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="Email address"
            value={credentials.email}
            onChange={handleChange}
            disabled={loading}
            autoComplete="username"
          />

          <div className="password-field">
            <label style={{ display: "none" }} htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={credentials.password}
              onChange={handleChange}
              disabled={loading}
              autoComplete="current-password"
            />
            <button
              type="button"
              className="password-toggle-btn"
              onClick={() => setShowPassword((s) => !s)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          <div className="forgot-password-link" style={{ width: "100%", textAlign: "right", marginBottom: 8 }}>
            <Link to="/tnpco/forgot-password">Forgot Password?</Link>
          </div>

          {error && (
            <p className="error" role="alert" style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <FaExclamationCircle /> {error}
            </p>
          )}

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? (
              <>
                <FaSpinner style={{ marginRight: 8 }} className="spin" />
                Logging in...
              </>
            ) : (
              "Login"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default TnPCOLogin;