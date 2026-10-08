import React, { useState, useEffect } from "react";
import {
  FaUserCircle,
  FaTrash,
  FaClock,
  FaUser,
  FaSpinner,
  FaCheckCircle,
  FaExclamationCircle
} from "react-icons/fa";
import CollegeHeader from "../../../shared/CollegeHeader";
import "./TpOInvite.css";

const LIST_TPO_POST = "https://placement-portal-backend.ramshekade20.workers.dev/api/list-tpo";
const TPOS_GET = "https://placement-portal-backend.ramshekade20.workers.dev/api/tpos";

const TpoInvite = () => {

  const [form, setForm] = useState({ name: "", email: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loadingAdd, setLoadingAdd] = useState(false);

  const [tpos, setTpos] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [fetchError, setFetchError] = useState("");

  const validateEmail = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).toLowerCase());

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setError("");
    setSuccess("");
  };

  const normalizeItem = (it, idx) => {
    const email =
      it?.email ||
      it?.tpo_email ||
      it?.contact_email ||
      it?.mail ||
      it?.invite_email ||
      it?.invitee_email ||
      "";

    const name =
      it?.name ||
      it?.full_name ||
      it?.tpo_name ||
      it?.invite_name ||
      (email ? String(email).split("@")[0] : `TPO ${idx + 1}`);

    // use parentheses to avoid mixing ?? and || without grouping
    const maybeId = (it?.id ?? it?.tpo_id ?? it?.invite_id ?? null);
    const id = maybeId || email || `local-${idx + 1}`;

    const avatar =
      it?.avatar_url ||
      it?.profile_url ||
      it?.logo ||
      null;

    return {
      __raw: it,
      id,
      name,
      email,
      avatar,
    };
  };

  // Fetch TPOs on mount
  useEffect(() => {
    let mounted = true;
    const fetchList = async () => {
      setFetching(true);
      setFetchError("");
      try {
        const res = await fetch(TPOS_GET, { credentials: "include" });
        if (!res.ok) {
          throw new Error(`API returned ${res.status}`);
        }
        const contentType = res.headers.get("content-type") || "";
        const data = contentType.includes("application/json") ? await res.json() : null;

        let items = [];
        if (Array.isArray(data)) items = data;
        else if (Array.isArray(data?.data)) items = data.data;
        else if (Array.isArray(data?.tpos)) items = data.tpos;
        else {
          // find first array property
          const arr = data && Object.values(data).find((v) => Array.isArray(v));
          if (arr) items = arr;
        }

        const normalized = (items || []).map(normalizeItem);
        if (!mounted) return;
        setTpos(normalized);
      } catch (err) {
        console.error("Failed to fetch TPOs:", err);
        if (!mounted) return;
        setFetchError("Failed to load TPOs. Showing sample data.");
        // fallback single sample
        setTpos([
          {
            id: 1,
            name: "Dr. Atulya Patil",
            email: "tpo@dmce.ac.in",
            avatar: null,
          },
        ]);
      } finally {
        if (mounted) setFetching(false);
      }
    };

    fetchList();
    return () => {
      mounted = false;
    };
  }, []);

  const handleAdd = async (e) => {
    e?.preventDefault();
    setError("");
    setSuccess("");

    const name = form.name.trim();
    const email = form.email.trim();

    // Validation
    if (!name) {
      setError("TPO name is required.");
      return;
    }
    if (!email) {
      setError("TPO email is required.");
      return;
    }
    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    try {
      setLoadingAdd(true);

      // POST to list-tpo endpoint which triggers the invite email server-side
      const response = await fetch(LIST_TPO_POST, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ name, email }),
      });

      const contentType = response.headers.get("content-type") || "";
      const data = contentType.includes("application/json") ? await response.json() : { message: await response.text() };

      if (!response.ok) {
        throw new Error(data?.error || data?.message || `Failed to send invite (${response.status})`);
      }

      // Prefer the server-returned item when available
      const returned = Array.isArray(data) ? data[0] : (data?.data || data?.tpo || data?.invite || data);
      const newItem = returned ? normalizeItem(returned, tpos.length) : {
        id: tpos.length ? Math.max(...tpos.map(t => (typeof t.id === "number" ? t.id : 0))) + 1 : 1,
        name,
        email,
        avatar: null,
      };

      setTpos(prev => [newItem, ...prev]);
      setSuccess(`Invitation sent successfully to ${email}`);
      setForm({ name: "", email: "" });
    } catch (err) {
      console.error("Invite error:", err);
      setError(err?.message || "Failed to send invitation. Please try again.");
    } finally {
      setLoadingAdd(false);
    }
  };

  const handleDelete = (id) => {
    if (!window.confirm("Are you sure you want to remove this TPO?")) return;
    setTpos(prev => prev.filter(t => t.id !== id));
  };

  return (
    <div className="tpo-page">
      <CollegeHeader />

      <div className="tpo-announcement">
        📢 Manage TPO — Add or Remove Training & Placement Officer
      </div>

      <main className="tpo-main" role="main">
        <section className="tpo-card" aria-labelledby="tpo-form-heading">
          <h3 id="tpo-form-heading" className="tpo-card-title">Add TPO</h3>

          <form className="tpo-form" onSubmit={handleAdd} noValidate>
            <label className="tpo-label" htmlFor="name">
              Name <span className="tpo-required">*</span>
            </label>
            <input
              id="name"
              name="name"
              type="text"
              className="tpo-input"
              placeholder="e.g. Dr. John Doe"
              value={form.name}
              onChange={handleChange}
              disabled={loadingAdd}
              aria-required="true"
            />

            <label className="tpo-label" htmlFor="email">
              Email <span className="tpo-required">*</span>
            </label>
            <input
              id="email"
              name="email"
              type="email"
              className="tpo-input"
              placeholder="tpo@example.com"
              value={form.email}
              onChange={handleChange}
              disabled={loadingAdd}
              aria-required="true"
            />

            {error && (
              <div className="tpo-alert tpo-alert-error" role="alert">
                <FaExclamationCircle style={{ marginRight: 8 }} />
                {error}
              </div>
            )}
            {success && (
              <div className="tpo-alert tpo-alert-success" role="status">
                <FaCheckCircle style={{ marginRight: 8 }} />
                {success}
              </div>
            )}

            <div className="tpo-form-actions">
              <button
                type="submit"
                className={`tpo-btn tpo-btn-primary ${loadingAdd ? "tpo-loading" : ""}`}
                disabled={loadingAdd}
              >
                {loadingAdd ? (
                  <>
                    <FaSpinner className="tpo-spinner" /> Adding...
                  </>
                ) : (
                  "Add TPO"
                )}
              </button>

              <button
                type="button"
                className="tpo-btn tpo-btn-secondary"
                onClick={() => setForm({ name: "", email: "" })}
                disabled={loadingAdd}
              >
                Reset
              </button>
            </div>
          </form>
        </section>

        <section
          className="tpo-card tpo-list-card"
          aria-labelledby="tpo-list-heading"
          style={{ marginTop: 20 }}
        >
          <h3 id="tpo-list-heading" className="tpo-card-title">Training & Placement Officers</h3>

          {fetching ? (
            <div className="tpo-list-loading">
              <FaSpinner className="tpo-spinner" /> Loading TPOs...
            </div>
          ) : (
            <>
              {fetchError && (
                <div className="tpo-fetch-error" role="alert" style={{ marginBottom: 12 }}>
                  {fetchError}
                </div>
              )}

              <div className="tpo-list" role="list">
                {tpos.map((t) => (
                  <div key={t.id} className="tpo-list-item" role="listitem">
                    <div className="tpo-list-left">
                      <div className="tpo-list-avatar">
                        {t.avatar ? (
                          <img src={t.avatar} alt={`${t.name} avatar`} />
                        ) : (
                          <FaUserCircle className="tpo-list-avatar-icon" />
                        )}
                      </div>
                      <div className="tpo-list-info">
                        <div className="tpo-list-name">{t.name}</div>
                        <div className="tpo-list-email">{t.email}</div>
                      </div>
                    </div>

                    <div className="tpo-list-actions">
                      <button
                        className="tpo-btn-delete"
                        onClick={() => handleDelete(t.id)}
                        aria-label={`Delete ${t.name}`}
                      >
                        <FaTrash /> Delete
                      </button>
                    </div>
                  </div>
                ))}

                {tpos.length === 0 && (
                  <div className="tpo-empty">No TPOs found.</div>
                )}
              </div>
            </>
          )}
        </section>
      </main>
    </div>
  );
};

export default TpoInvite;