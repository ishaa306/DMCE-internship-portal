import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaSave } from "react-icons/fa";
import CollegeHeader from "../../shared/CollegeHeader";
import "../Register/TnpCoordinatorRegister.css";
import "./EditProfile.css";

const VIEW_API = "https://placement-portal-backend.ramshekade20.workers.dev/api/tnp/profile/view";
const UPDATE_API = "https://placement-portal-backend.ramshekade20.workers.dev/api/tnp/profile/update";

const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v || "").trim());
const isValidPhone10 = (v) => {
  if (!v) return true;
  const cleaned = String(v).replace(/[\s()\s-]/g, "");
  return /^\d{10}$/.test(cleaned);
};

export default function TnpCoordinatorEditV2() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    department: "",
    contact_primary: "",
    contact_alternate: "",
    alternate_email: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [statusMsg, setStatusMsg] = useState("");

  useEffect(() => {
    let mounted = true;
    const token =
      localStorage.getItem("tnpco_token") ||
      localStorage.getItem("token") ||
      localStorage.getItem("accessToken") ||
      null;

    const headers = { Accept: "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const load = async () => {
      setLoading(true);
      try {
        const resp = await fetch(VIEW_API, {
          method: "GET",
          credentials: "include",
          headers,
        });

        if (resp.status === 401) {
          localStorage.removeItem("tnpcoAuthenticated");
          navigate("/tnpco-login");
          return;
        }

        if (!resp.ok) {
          // fallback to localStorage
          const fallback = {
            name: localStorage.getItem("tnpco_name") || "",
            email: localStorage.getItem("tnpco_email") || "",
            department: localStorage.getItem("tnpco_department") || "",
            contact_primary: localStorage.getItem("tnpco_contact_primary") || "",
            contact_alternate: localStorage.getItem("tnpco_contact_alternate") || "",
            alternate_email: localStorage.getItem("tnpco_alternate_email") || "",
          };
          if (mounted) setForm(fallback);
          return;
        }

        const contentType = resp.headers.get("content-type") || "";
        let data = null;
        if (contentType.includes("application/json")) data = await resp.json();
        else {
          const txt = await resp.text();
          try { data = JSON.parse(txt); } catch { data = null; }
        }

        let profile = null;
        if (data) {
          if (data.profile && typeof data.profile === "object") profile = data.profile;
          else if (data.data && typeof data.data === "object") profile = data.data;
          else if (typeof data === "object" && (data.name || data.email)) profile = data;
        }

        const mapped = {
          name: profile?.name ?? localStorage.getItem("tnpco_name") ?? "",
          email: profile?.email ?? localStorage.getItem("tnpco_email") ?? "",
          department: profile?.department ?? localStorage.getItem("tnpco_department") ?? "",
          contact_primary: profile?.contact_primary ?? localStorage.getItem("tnpco_contact_primary") ?? "",
          contact_alternate: profile?.contact_alternate ?? localStorage.getItem("tnpco_contact_alternate") ?? "",
          alternate_email: profile?.alternate_email ?? localStorage.getItem("tnpco_alternate_email") ?? "",
        };

        if (mounted) setForm(mapped);
      } catch (err) {
        const fallback = {
          name: localStorage.getItem("tnpco_name") || "",
          email: localStorage.getItem("tnpco_email") || "",
          department: localStorage.getItem("tnpco_department") || "",
          contact_primary: localStorage.getItem("tnpco_contact_primary") || "",
          contact_alternate: localStorage.getItem("tnpco_contact_alternate") || "",
          alternate_email: localStorage.getItem("tnpco_alternate_email") || "",
        };
        if (mounted) setForm(fallback);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => { mounted = false; };
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
    setStatusMsg("");
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = "Name is required.";
    if (!form.email.trim()) errs.email = "Email is required.";
    else if (!isValidEmail(form.email)) errs.email = "Invalid email format.";
    if (form.contact_primary && !isValidPhone10(form.contact_primary))
      errs.contact_primary = "Primary contact must be exactly 10 digits.";
    if (form.contact_alternate && !isValidPhone10(form.contact_alternate))
      errs.contact_alternate = "Alternate contact must be exactly 10 digits.";
    if (form.alternate_email && !isValidEmail(form.alternate_email))
      errs.alternate_email = "Alternate email is invalid.";
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatusMsg("");
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        department: form.department.trim() || null,
        contact_primary: form.contact_primary.trim() || null,
        contact_alternate: form.contact_alternate.trim() || null,
        alternate_email: form.alternate_email.trim() || null,
      };

      const token =
        localStorage.getItem("tnpco_token") ||
        localStorage.getItem("token") ||
        localStorage.getItem("accessToken") ||
        null;
      const headers = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const resp = await fetch(UPDATE_API, {
        method: "PUT",
        credentials: "include",
        headers,
        body: JSON.stringify(payload),
      });

      const contentType = resp.headers.get("content-type") || "";
      let data = null;
      if (contentType.includes("application/json")) data = await resp.json();
      else {
        const txt = await resp.text();
        try { data = JSON.parse(txt); } catch { data = { message: txt }; }
      }

      if (!resp.ok) {
        const message = data?.message || data?.error || `Failed to update (${resp.status})`;
        setStatusMsg(message);
        setSaving(false);
        return;
      }

      try {
        localStorage.setItem("tnpco_name", payload.name || "");
        localStorage.setItem("tnpco_email", payload.email || "");
        if (payload.department) localStorage.setItem("tnpco_department", payload.department);
        if (payload.contact_primary) localStorage.setItem("tnpco_contact_primary", payload.contact_primary);
        if (payload.contact_alternate) localStorage.setItem("tnpco_contact_alternate", payload.contact_alternate);
        if (payload.alternate_email) localStorage.setItem("tnpco_alternate_email", payload.alternate_email);
      } catch { }

      setStatusMsg("Profile updated successfully.");
      setTimeout(() => navigate("/tnpco/profile"), 700);
    } catch (err) {
      setStatusMsg("Failed to update profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="tnpco-v2-edit-page">
      <CollegeHeader />

      <div className="tnpco-v2-edit-container">
        <div className="tnpco-v2-edit-card">
          <div className="tnpco-v2-edit-header">
            <div>
              <h1 className="tnpco-v2-edit-title">Edit Coordinator Profile</h1>
              <p className="tnpco-v2-edit-sub">Update your details below and save.</p>
            </div>
            <div className="tnpco-v2-edit-actions" />
          </div>

          <form className="tnpco-v2-form" onSubmit={handleSubmit} noValidate>
            <div className="tnpco-v2-form-grid">
              <div className="tnpco-v2-row">
                <label htmlFor="name">Full Name</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  className={`tnpco-v2-input ${errors.name ? "tnpco-v2-input-error" : ""}`}
                  value={form.name}
                  onChange={handleChange}
                  disabled={loading || saving}
                />
                {errors.name && <div className="tnpco-v2-error-text">{errors.name}</div>}
              </div>

              <div className="tnpco-v2-row">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  className={`tnpco-v2-input ${errors.email ? "tnpco-v2-input-error" : ""}`}
                  value={form.email}
                  onChange={handleChange}
                  disabled={loading || saving}
                />
                {errors.email && <div className="tnpco-v2-error-text">{errors.email}</div>}
              </div>

              <div className="tnpco-v2-row">
                <label htmlFor="department">Department</label>
                <input
                  id="department"
                  name="department"
                  type="text"
                  className="tnpco-v2-input"
                  value={form.department}
                  onChange={handleChange}
                  disabled={loading || saving}
                />
              </div>

              <div className="tnpco-v2-row">
                <label htmlFor="contact_primary">Primary Contact</label>
                <input
                  id="contact_primary"
                  name="contact_primary"
                  type="tel"
                  inputMode="numeric"
                  className={`tnpco-v2-input ${errors.contact_primary ? "tnpco-v2-input-error" : ""}`}
                  value={form.contact_primary}
                  onChange={handleChange}
                  maxLength={10}
                  disabled={loading || saving}
                  placeholder="10 digits"
                />
                {errors.contact_primary && <div className="tnpco-v2-error-text">{errors.contact_primary}</div>}
              </div>

              <div className="tnpco-v2-row">
                <label htmlFor="contact_alternate">Alternate Contact</label>
                <input
                  id="contact_alternate"
                  name="contact_alternate"
                  type="tel"
                  inputMode="numeric"
                  className={`tnpco-v2-input ${errors.contact_alternate ? "tnpco-v2-input-error" : ""}`}
                  value={form.contact_alternate}
                  onChange={handleChange}
                  maxLength={10}
                  disabled={loading || saving}
                  placeholder="10 digits"
                />
                {errors.contact_alternate && <div className="tnpco-v2-error-text">{errors.contact_alternate}</div>}
              </div>

              <div className="tnpco-v2-row">
                <label htmlFor="alternate_email">Alternate Email</label>
                <input
                  id="alternate_email"
                  name="alternate_email"
                  type="email"
                  className={`tnpco-v2-input ${errors.alternate_email ? "tnpco-v2-input-error" : ""}`}
                  value={form.alternate_email}
                  onChange={handleChange}
                  disabled={loading || saving}
                />
                {errors.alternate_email && <div className="tnpco-v2-error-text">{errors.alternate_email}</div>}
              </div>

              <div className="tnpco-v2-row tnpco-v2-row--actions">
                <div className="tnpco-v2-actions-wrap">
                  <button type="button" className="tnpco-v2-cancel-btn" onClick={() => navigate("/tnpco/profile")}>
                    <FaArrowLeft style={{ marginRight: 8 }} /> Cancel
                  </button>

                  <button type="submit" className="tnpco-v2-save-btn" disabled={saving}>
                    {saving ? "Saving..." : (<><FaSave style={{ marginRight: 8 }} /> Save changes</>)}
                  </button>
                </div>
              </div>

              {statusMsg && (
                <div className={`tnpco-v2-status ${/success/i.test(statusMsg) ? "tnpco-v2-status-success" : "tnpco-v2-status-error"}`}>
                  {statusMsg}
                </div>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}