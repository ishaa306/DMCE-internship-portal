import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  FaEye,
  FaEyeSlash,
  FaExclamationCircle,
  FaSpinner
} from "react-icons/fa";
import dmceLogo from "../../assets/images/dmce.png";
import "./TpOLogin.css";

const API_URL = "https://placement-portal-backend.ramshekade20.workers.dev/api/tpo-auth/login";

const TpoLogin = () => {
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  // Replace the current nowIso line with this:
  const now = new Date();
  // Add 5 hours and 30 minutes for IST
  now.setHours(now.getHours() + 5);
  now.setMinutes(now.getMinutes() + 30);
  const nowIso = now.toISOString().replace('T', ' ').split('.')[0]; // YYYY-MM-DD HH:MM:SS in IST

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({ ...prev, [name]: value }));
    setError("");
  };

  const isValidEmail = (v) => {
    if (!v) return false;
    // stricter email regex (reasonable)
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v).trim());
  };

  const validateForm = () => {
    const email = String(credentials.email || "").trim();
    const password = String(credentials.password || "");

    if (!email) {
      setError("❌ Email is required.");
      return false;
    }
    if (!isValidEmail(email)) {
      setError("❌ Please enter a valid email address.");
      return false;
    }
    if (!password) {
      setError("❌ Password is required.");
      return false;
    }
    return true;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (loading) return; // guard double submit
    if (!validateForm()) return;

    setLoading(true);
    setError("");

    const email = String(credentials.email || "").trim();
    // Trim surrounding whitespace from password but keep internal spaces
    const password = String(credentials.password || "").trim();

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({ email, password })
      });

      // Try to parse response safely
      const contentType = response.headers.get("content-type") || "";
      let data = null;
      if (contentType.includes("application/json")) {
        // parse json
        try {
          data = await response.json();
        } catch (err) {
          data = null;
        }
      } else {
        // try text -> attempt JSON parse, else use text
        const txt = await response.text();
        try {
          data = JSON.parse(txt);
        } catch {
          data = { message: txt };
        }
      }

      // Handle common status codes explicitly
      if (response.status === 401) {
        // Wrong credentials
        setError("❌ Wrong email or password. Please try again.");
        return;
      }

      if (!response.ok) {
        // If server returned a message, show it
        const serverMsg = (data && (data.message || data.error)) || `Login failed (${response.status})`;
        setError(`❌ ${serverMsg}`);
        return;
      }

      // Success: data expected to contain useful fields, token etc.
      // Save useful info
      try {
        localStorage.setItem("tpoAuthenticated", "true");
        localStorage.setItem("tpo_email", data?.email || email);
        if (data?.name) localStorage.setItem("tpo_name", data.name);
        if (data?.token) localStorage.setItem("tpo_token", data.token);
        localStorage.setItem("login_time", nowIso);
      } catch (err) {
        console.warn("localStorage write failed:", err);
      }

      // Redirect based on server signal if present
      if (data && (data.password_updated === 0 || data.password_updated === "0")) {
        window.location.href = "/tpo/update-password";
      } else {
        window.location.href = "/tpo/dashboard";
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("❌ Unable to reach server. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="left-panel">
        <img src={dmceLogo} alt="DMCE Logo" className="logo" />
        <h2>DMCE - Training & Placement Portal</h2>
      </div>

      <div className="right-panel">
        <form className="login-form" onSubmit={handleLogin} noValidate>
          <h2>TPO Login</h2>

          <label htmlFor="email" style={{ display: "none" }}>Email</label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="Email address"
            value={credentials.email}
            onChange={handleChange}
            disabled={loading}
            autoComplete="username"
            inputMode="email"
          />

          <div className="password-field">
            <label htmlFor="password" style={{ display: "none" }}>Password</label>
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
              onClick={() => setShowPassword(prev => !prev)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          <div className="forgot-password-link" style={{ width: "100%", textAlign: "right", marginBottom: 8 }}>
            <Link to="/tpo/forgot-password">Forgot Password?</Link>
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

export default TpoLogin;