import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FaClock, FaUser, FaEnvelope, FaUniversity, FaPhone } from "react-icons/fa";
import CollegeHeader from "../../shared/CollegeHeader";
import "./TnpCoordinatorRegister.css";

const API_URL =
  "https://placement-portal-backend.ramshekade20.workers.dev/api/tnp/profile/create";


const isValidEmail = (v) =>
  typeof v === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim().toLowerCase());

const isValid10DigitPhone = (v) => {
  if (!v) return true; // optional
  // remove spaces, dashes, parentheses
  const cleaned = String(v).replace(/[\s()-]/g, "");
  return /^\d{10}$/.test(cleaned);
};

export default function TnpCoordinatorRegister() {
  const navigate = useNavigate();
  const firstErrorRef = useRef(null);

  const [form, setForm] = useState({
    name: localStorage.getItem("tnpco_name") || "",
    email: localStorage.getItem("tnpco_email") || "",
    department: localStorage.getItem("tnpco_department") || "",
    contact_primary: "",
    contact_alternate: "",
    alternate_email: "",
  });

  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState({ loading: false, success: "", error: "" });


  // Keep prefilled fields read-only
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (["name", "email", "department"].includes(name)) return;
    setForm((p) => ({ ...p, [name]: value }));
    setErrors((p) => ({ ...p, [name]: "" }));
    setStatus({ loading: false, success: "", error: "" });
  };

  const validate = () => {
    const errs = {};

    // email (prefilled) must be present and valid
    if (!form.email || !isValidEmail(form.email)) {
      errs.email = "Prefilled email is missing or invalid.";
    }

    if (!form.name || String(form.name).trim().length < 2) {
      errs.name = "Prefilled name is missing or invalid.";
    }

    if (!form.department || String(form.department).trim().length < 1) {
      errs.department = "Department is missing.";
    }

    if (form.contact_primary && !isValid10DigitPhone(form.contact_primary)) {
      errs.contact_primary = "Primary contact must be exactly 10 digits (numbers only).";
    }

    if (form.contact_alternate && !isValid10DigitPhone(form.contact_alternate)) {
      errs.contact_alternate = "Alternate contact must be exactly 10 digits (numbers only).";
    }

    if (form.alternate_email && !isValidEmail(form.alternate_email)) {
      errs.alternate_email = "Alternate email must be a valid email address.";
    }

    return errs;
  };

  const focusFirstError = () => {
    // focus first input with input-error
    const el = document.querySelector(".input-error, .tnpco-error");
    if (el && typeof el.scrollIntoView === "function") {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    if (firstErrorRef.current) {
      try { firstErrorRef.current.focus(); } catch (err) { /* ignore */ }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: false, success: "", error: "" });
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      focusFirstError();
      return;
    }

    try {
      setStatus({ loading: true, success: "", error: "" });

      const payload = {
        name: form.name,
        email: form.email,
        department: form.department,
        contact_primary: form.contact_primary.trim() || null,
        contact_alternate: form.contact_alternate.trim() || null,
        alternate_email: form.alternate_email.trim() || null,
      };

      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const contentType = response.headers.get("content-type") || "";
      const data = contentType.includes("application/json")
        ? await response.json()
        : { message: await response.text() };

      if (!response.ok) {
        if (data?.errors && typeof data.errors === "object") {
          setErrors(data.errors);
        }
        const msg = data?.message || data?.error || `Request failed (${response.status})`;
        throw new Error(msg);
      }

      localStorage.setItem("profile_created", "true");
      setStatus({ loading: false, success: "Profile created. Redirecting to dashboard...", error: "" });

      setTimeout(() => navigate("/tnpco/dashboard"), 900);
    } catch (err) {
      console.error("Profile creation error:", err);
      setStatus({ loading: false, success: "", error: err.message || "Server error" });
      focusFirstError();
    }
  };

  return (
    <div className="tnpco-register-page">
      <CollegeHeader />



      <div className="tnpco-register-container">
        <div className="tnpco-register-card" role="region" aria-labelledby="tnpco-register-title">
          <header className="tnpco-register-header">
            <div>
              <h1 id="tnpco-register-title" className="tnpco-register-title">Complete Your Coordinator Profile</h1>

            </div>
          </header>

          <section className="tnpco-user-summary" aria-label="Prefilled information">
            <div className={`summary-item ${errors.name ? "has-error" : ""}`}>
              <div className="summary-icon"><FaUser /></div>
              <div className="summary-body">
                <div className="summary-label">Name</div>
                <div className="summary-value">{form.name || <em>Not provided</em>}</div>
                {errors.name && <div className="tnpco-error">{errors.name}</div>}
              </div>
            </div>

            <div className={`summary-item ${errors.email ? "has-error" : ""}`}>
              <div className="summary-icon"><FaEnvelope /></div>
              <div className="summary-body">
                <div className="summary-label">Email</div>
                <div className="summary-value">{form.email || <em>Not provided</em>}</div>
                {errors.email && <div className="tnpco-error">{errors.email}</div>}
              </div>
            </div>

            <div className={`summary-item ${errors.department ? "has-error" : ""}`}>
              <div className="summary-icon"><FaUniversity /></div>
              <div className="summary-body">
                <div className="summary-label">Department</div>
                <div className="summary-value">{form.department || <em>Not provided</em>}</div>
                {errors.department && <div className="tnpco-error">{errors.department}</div>}
              </div>
            </div>
          </section>

          <form className="tnpco-form" onSubmit={handleSubmit} noValidate>
            <div className="form-grid">
              <div className="form-row">
                <label htmlFor="contact_primary">Primary Contact</label>
                <input
                  ref={errors.contact_primary ? firstErrorRef : null}
                  id="contact_primary"
                  name="contact_primary"
                  type="tel"
                  inputMode="numeric"
                  pattern="\d{10}"
                  maxLength={10}
                  className={`tnpco-input ${errors.contact_primary ? "input-error" : ""}`}
                  placeholder="E.g :- 9876543211"
                  value={form.contact_primary}
                  onChange={handleChange}
                  aria-invalid={!!errors.contact_primary}
                />
                {errors.contact_primary && <div className="tnpco-error">{errors.contact_primary}</div>}
              </div>

              <div className="form-row">
                <label htmlFor="contact_alternate">Alternate Contact</label>
                <input
                  id="contact_alternate"
                  name="contact_alternate"
                  type="tel"
                  inputMode="numeric"
                  pattern="\d{10}"
                  maxLength={10}
                  className={`tnpco-input ${errors.contact_alternate ? "input-error" : ""}`}
                  placeholder="E.g :- 9876543211"
                  value={form.contact_alternate}
                  onChange={handleChange}
                  aria-invalid={!!errors.contact_alternate}
                />
                {errors.contact_alternate && <div className="tnpco-error">{errors.contact_alternate}</div>}
              </div>

              <div className="form-row" style={{ gridColumn: "1 / -1" }}>
                <label htmlFor="alternate_email">Alternate Email</label>
                <input
                  id="alternate_email"
                  name="alternate_email"
                  type="email"
                  className={`tnpco-input ${errors.alternate_email ? "input-error" : ""}`}
                  placeholder="alternate@example.com"
                  value={form.alternate_email}
                  onChange={handleChange}
                  aria-invalid={!!errors.alternate_email}
                />
                {errors.alternate_email && <div className="tnpco-error">{errors.alternate_email}</div>}
              </div>
            </div>

            <div className="form-actions" aria-hidden={status.loading}>
              <button type="submit" className="tnpco-submit-btn" disabled={status.loading}>
                {status.loading ? "Creating profile..." : "Complete Profile"}
              </button>
            </div>

            {status.error && <div className="tnpco-status tnpco-status-error" role="alert">{status.error}</div>}
            {status.success && <div className="tnpco-status tnpco-status-success" role="status">{status.success}</div>}
          </form>
        </div>
      </div>
    </div>
  );
}