import React, { useState, useEffect } from "react";
import {
  FaUserCircle,
  FaTrash,
  FaSpinner,
  FaCheckCircle,
  FaExclamationCircle
} from "react-icons/fa";
import CollegeHeader from "../../../shared/CollegeHeader";
import "./TpoCoordinatorInvite.css";


const INVITE_API_URL = "https://placement-portal-backend.ramshekade20.workers.dev/api/list-tnp";
const FALLBACK_API_URL = "https://placement-portal-backend.ramshekade20.workers.dev/api/tnps";

const allBranches = [
  "Information Technology",
  "Civil Engineering",
  "Civil & Infrastructure Engineering",
  "Mechanical Engineering",
  "Computer Engineering",
  "Artificial Intelligence and Data Science Engineering",
  "Electronics and Telecommunication Engineering",
  "Electronics Engineering",
  "Chemical Engineering",
];

const TpoCoordinator = () => {
  const [form, setForm] = useState({ name: "", email: "", branch: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const [coordinators, setCoordinators] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [fetchError, setFetchError] = useState("");

  const validateEmail = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).toLowerCase());

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    setError("");
    setSuccess("");
  };

  // Normalize an API item into our coordinator shape
  const normalizeItem = (it, idx) => {
    const email =
      it.email ||
      it.tnp_email ||
      it.invitee_email ||
      it.invited_email ||
      it.contact_email ||
      it.mail ||
      "";

    const name =
      it.name ||
      it.full_name ||
      it.tnp_name ||
      it.invitee_name ||
      it.invited_name ||
      (email ? email.split("@")[0] : `Coordinator ${idx + 1}`);

    const branch =
      it.department ||
      it.branch ||
      it.dept ||
      it.tnp_branch ||
      it.department_name ||
      it.departmentName ||
      it.stream ||
      "";

    const id = it.id ?? it.tnp_id ?? it.invite_id ?? it.email ?? `local-${idx + 1}`;

    const avatar =
      it.avatar_url ||
      it.profile_url ||
      it.profile_url_thumb ||
      it.logo ||
      null;

    return {
      __raw: it,
      id,
      name,
      email,
      branch,
      avatar,
    };
  };

  // Fetch invites from primary endpoint, fallback to secondary
  useEffect(() => {
    let mounted = true;
    const fetchList = async () => {
      setFetching(true);
      setFetchError("");
      try {
        // Try primary
        const res = await fetch(INVITE_API_URL, { credentials: "include" });
        if (!res.ok) {
          // try fallback
          throw new Error(`primary returned ${res.status}`);
        }
        const contentType = res.headers.get("content-type") || "";
        const data = contentType.includes("application/json") ? await res.json() : {};

        // Try to find array in response
        let items = [];
        if (Array.isArray(data)) items = data;
        else if (Array.isArray(data?.data)) items = data.data;
        else if (Array.isArray(data?.invites)) items = data.invites;
        else {
          // search for first array property
          const arr = Object.values(data).find((v) => Array.isArray(v));
          if (arr) items = arr;
        }

        const normalized = (items || []).map(normalizeItem);
        if (!mounted) return;
        setCoordinators(normalized);
      } catch (errPrimary) {
        // try fallback url
        try {
          const res2 = await fetch(FALLBACK_API_URL, { credentials: "include" });
          if (!res2.ok) throw new Error(`fallback returned ${res2.status}`);
          const ct2 = res2.headers.get("content-type") || "";
          const data2 = ct2.includes("application/json") ? await res2.json() : {};
          let items2 = [];
          if (Array.isArray(data2)) items2 = data2;
          else if (Array.isArray(data2?.data)) items2 = data2.data;
          else {
            const arr = Object.values(data2).find((v) => Array.isArray(v));
            if (arr) items2 = arr;
          }
          const normalized2 = (items2 || []).map(normalizeItem);
          if (!mounted) return;
          setCoordinators(normalized2);
        } catch (errFallback) {
          console.error("Both invite endpoints failed:", errPrimary, errFallback);
          if (!mounted) return;
          setFetchError("Failed to load coordinator invites. Showing local sample data.");
          // as a last resort show generated sample from branches (non-API)
          const sample = allBranches.map((branch, idx) => ({
            id: `sample-${idx + 1}`,
            name: `Dr. ${branch.split(" ")[0]} Coordinator`,
            email: `${branch.split(" ")[0].toLowerCase().replace(/[^a-z]/g, "")}.tpo@example.com`,
            branch,
            avatar: null,
          }));
          setCoordinators(sample);
        }
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
    const department = form.branch;

    if (!name) {
      setError("Coordinator name is required.");
      return;
    }
    if (!email) {
      setError("Coordinator email is required.");
      return;
    }
    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!department) {
      setError("Please select a department.");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        name,
        email,
        department,
      };

      const response = await fetch(INVITE_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const contentType = response.headers.get("content-type") || "";
      const data = contentType.includes("application/json") ? await response.json() : { message: await response.text() };

      if (!response.ok) {
        throw new Error(data?.error || data?.message || `Failed to send invite (${response.status})`);
      }

      // prepend new item (use returned item if present)
      const returned = Array.isArray(data) ? data[0] : (data?.data || data?.invite || data);
      const newItem = returned ? normalizeItem(returned, coordinators.length) : {
        id: `local-${coordinators.length + 1}`,
        name,
        email,
        branch: department,
        avatar: null,
      };

      setCoordinators((p) => [newItem, ...p]);
      setSuccess(`Invitation sent successfully to ${email}`);
      setForm({ name: "", email: "", branch: "" });
    } catch (err) {
      console.error("Invite error:", err);
      setError(err?.message || "Failed to send invitation. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id) => {
    if (!window.confirm("Are you sure you want to remove this coordinator?")) return;
    setCoordinators((p) => p.filter((c) => c.id !== id));
  };

  return (
    <div className="tpc-page">
      <CollegeHeader />

      <div className="tpc-announcement">📢 Manage TPO Coordinators — add or remove coordinators</div>

      <div className="tpc-header">
        <div className="tpc-profile">
          <div>
            <h2 className="tpc-title">TPO Coordinators</h2>
            <p className="tpc-sub">Create coordinators and assign them to branches.</p>
          </div>
        </div>
      </div>

      <main className="tpc-main" role="main">
        <section className="tpc-card" aria-labelledby="tpc-form-heading">
          <h3 id="tpc-form-heading" className="tpc-card-title">Add Coordinator</h3>

          <form className="tpc-form" onSubmit={handleAdd} noValidate>
            <label className="tpc-label" htmlFor="name">Name <span className="tpc-required">*</span></label>
            <input
              id="name"
              name="name"
              type="text"
              className="tpc-input"
              placeholder="e.g. ABC"
              value={form.name}
              onChange={handleChange}
              disabled={loading}
              aria-required="true"
            />

            <label className="tpc-label" htmlFor="email">Email <span className="tpc-required">*</span></label>
            <input
              id="email"
              name="email"
              type="email"
              className="tpc-input"
              placeholder="coordinator@example.com"
              value={form.email}
              onChange={handleChange}
              disabled={loading}
              aria-required="true"
            />

            <label className="tpc-label" htmlFor="branch">Branch <span className="tpc-required">*</span></label>
            <select
              id="branch"
              name="branch"
              className="tpc-select"
              value={form.branch}
              onChange={handleChange}
              disabled={loading}
              aria-required="true"
            >
              <option value="">Select Branch</option>
              {allBranches.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>

            {error && (
              <div className="tpc-alert tpc-alert-error" role="alert">
                <FaExclamationCircle style={{ marginRight: 8 }} />
                {error}
              </div>
            )}
            {success && (
              <div className="tpc-alert tpc-alert-success" role="status">
                <FaCheckCircle style={{ marginRight: 8 }} />
                {success}
              </div>
            )}

            <div className="tpc-form-actions">
              <button
                type="submit"
                className={`tpc-btn tpc-btn-primary ${loading ? "tpc-loading" : ""}`}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <FaSpinner className="tpc-spinner" /> Adding...
                  </>
                ) : (
                  "Add Coordinator"
                )}
              </button>

              <button
                type="button"
                className="tpc-btn tpc-btn-secondary"
                onClick={() => setForm({ name: "", email: "", branch: "" })}
                disabled={loading}
              >
                Reset
              </button>
            </div>
          </form>
        </section>

        <section className="tpc-card tpc-list-card" aria-labelledby="tpc-list-heading" style={{ marginTop: 20 }}>
          <h3 id="tpc-list-heading" className="tpc-card-title">Coordinators by Branch</h3>

          {fetching ? (
            <div className="tpc-list-loading">
              <FaSpinner className="tpc-spinner" /> Loading coordinators...
            </div>
          ) : (
            <>
              {fetchError && (
                <div className="tpc-fetch-error" role="alert" style={{ marginBottom: 12 }}>
                  {fetchError}
                </div>
              )}

              <div className="tpc-list" role="list">
                {coordinators.map((c) => (
                  <div key={c.id} className="tpc-list-item" role="listitem">
                    <div className="tpc-list-left">
                      <div className="tpc-list-avatar">
                        {c.avatar ? <img src={c.avatar} alt={`${c.name} avatar`} /> : <FaUserCircle className="tpc-list-avatar-icon" />}
                      </div>
                      <div className="tpc-list-info">
                        <div className="tpc-list-name">{c.name}</div>
                        <div className="tpc-list-branch">{c.branch}</div>
                        <div className="tpc-list-email">{c.email}</div>
                      </div>
                    </div>

                    <div className="tpc-list-actions">
                      <button className="tpc-btn-delete" onClick={() => handleDelete(c.id)} aria-label={`Delete ${c.name}`}>
                        <FaTrash /> Delete
                      </button>
                    </div>
                  </div>
                ))}

                {coordinators.length === 0 && (
                  <div className="tpc-empty">No coordinators found.</div>
                )}
              </div>
            </>
          )}
        </section>
      </main>
    </div>
  );
};

export default TpoCoordinator;