import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaPowerOff, FaSync, FaFilter, FaRegCalendarAlt } from "react-icons/fa";
import CollegeHeader from "../../shared/CollegeHeader";
import "./ViewJobListings.css";

// Deactivate endpoint helper
const DEACTIVATE_URL = (id) =>
  `https://placement-portal-backend.ramshekade20.workers.dev/api/company/job/${id}/deactivate`;

const ViewJobListings = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all"); // 'all', 'active', 'inactive'

  // Fetch jobs
  const fetchJobs = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(
        "https://placement-portal-backend.ramshekade20.workers.dev/api/company/view-jobs",
        { withCredentials: true }
      );

      if (response.data && response.data.success) {
        setJobs(response.data.jobs || []);
      } else {
        throw new Error(response.data?.message || "Failed to fetch jobs");
      }
    } catch (err) {
      console.error("Error fetching jobs:", err);
      setError(err.response?.data?.message || "Unable to load jobs. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Poll for external changes (e.g., deactivations done elsewhere)
  useEffect(() => {
    // initial fetch
    fetchJobs();

    // Polling: every 30s when page is visible
    const POLL_INTERVAL = 30000;
    const intervalId = setInterval(() => {
      if (document.visibilityState === "visible") {
        fetchJobs();
      }
    }, POLL_INTERVAL);

    return () => clearInterval(intervalId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Show small floating notification
  const showNotification = (message) => {
    const notification = document.createElement("div");
    notification.className = "job-notification";
    notification.innerHTML = `<div class="job-notification-content">${message}</div>`;
    document.body.appendChild(notification);

    // animate in
    setTimeout(() => {
      notification.classList.add("job-notification-visible");
    }, 10);

    // hide and remove
    setTimeout(() => {
      notification.classList.remove("job-notification-visible");
      setTimeout(() => {
        if (document.body.contains(notification)) document.body.removeChild(notification);
      }, 300);
    }, 3000);
  };

  // Deactivate a job (no activation endpoint available)
  const deactivateJob = async (jobId) => {
    try {
      const confirmUpdate = window.confirm(
        "Are you sure you want to deactivate this job posting? Students will no longer be able to apply."
      );
      if (!confirmUpdate) return;

      // Optimistic UI update: mark as inactive immediately
      setJobs((prev) => prev.map((job) => (job.job_id === jobId ? { ...job, status: "inactive" } : job)));

      // Call deactivate endpoint
      const url = DEACTIVATE_URL(jobId);
      const response = await axios.post(url, {}, { withCredentials: true });

      if (!response.data || !response.data.success) {
        throw new Error(response.data?.message || "Failed to deactivate job");
      }

      showNotification("Job deactivated successfully");
    } catch (err) {
      console.error("Error deactivating job:", err);
      // revert by re-fetching latest from server
      fetchJobs();
      alert("Failed to deactivate job. Please try again.");
    }
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      const day = date.getDate().toString().padStart(2, "0");
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      const year = date.getFullYear();
      return `${day}-${month}-${year}`;
    } catch (error) {
      return dateString;
    }
  };

  const getFilteredJobs = () => {
    if (filter === "all") return jobs;
    return jobs.filter((job) => job.status === filter);
  };

  // Loading state
  if (loading) {
    return (
      <div className="job-listings-page">
        <CollegeHeader />
        <div className="job-listings-loading">
          <div className="job-listings-spinner"></div>
          <p>Loading job listings...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="job-listings-page">
        <CollegeHeader />
        <div className="job-listings-error">
          <div className="job-listings-error-icon">❌</div>
          <h3>Error Loading Jobs</h3>
          <p>{error}</p>
          <button onClick={fetchJobs}>Try Again</button>
        </div>
      </div>
    );
  }

  // Empty state
  if (jobs.length === 0) {
    return (
      <div className="job-listings-page">
        <CollegeHeader />
        <div className="job-listings-empty">
          <div className="job-listings-empty-icon">📋</div>
          <h3>No Job Listings Found</h3>
          <p>You haven't posted any jobs yet.</p>
          <button onClick={() => (window.location.href = "/company/post-job")} className="job-listings-cta">
            Post Your First Job
          </button>
        </div>
      </div>
    );
  }

  const filteredJobs = getFilteredJobs();

  return (
    <div className="job-listings-page">
      <CollegeHeader />

      <div className="job-listings-header">
        <h2 className="job-listings-title">📢 Your Job Listings</h2>

        <div className="job-listings-controls">
          <div className="job-listings-filter">
            <FaFilter className="job-listings-filter-icon" />
            <select value={filter} onChange={(e) => setFilter(e.target.value)} className="job-listings-filter-select">
              <option value="all">All Jobs</option>
              <option value="active">Active Jobs</option>
              <option value="inactive">Inactive Jobs</option>
            </select>
          </div>

          <button className="job-listings-refresh" onClick={fetchJobs}>
            <FaSync /> Refresh
          </button>
        </div>
      </div>

      <div className="job-listings-stats">
        <div className="job-listings-stat">
          <span className="job-listings-stat-number">{jobs.length}</span>
          <span className="job-listings-stat-label">Total Jobs</span>
        </div>
        <div className="job-listings-stat">
          <span className="job-listings-stat-number">{jobs.filter((job) => job.status === "active").length}</span>
          <span className="job-listings-stat-label">Active</span>
        </div>
        <div className="job-listings-stat">
          <span className="job-listings-stat-number">{jobs.filter((job) => job.status === "inactive").length}</span>
          <span className="job-listings-stat-label">Inactive</span>
        </div>
      </div>

      {filteredJobs.length === 0 ? (
        <div className="job-listings-filtered-empty">
          <p>No jobs match your current filter.</p>
          <button onClick={() => setFilter("all")} className="job-listings-reset-filter">
            Show All Jobs
          </button>
        </div>
      ) : (
        <div className="job-listings-container">
          {filteredJobs.map((job) => (
            <div key={job.job_id} className={`job-card ${job.status === "inactive" ? "job-card-inactive" : ""}`}>
              {job.status === "inactive" && <div className="job-card-inactive-badge">INACTIVE</div>}

              <h3>{job.company_title || "Untitled Company"}</h3>
              <h4>{job.job_title || "Untitled Role"}</h4>

              <div className="job-card-details">
                <p>
                  <strong>Location:</strong> {job.job_location || "Not specified"}
                </p>
                <p>
                  <strong>Type:</strong> {job.job_type || "Not specified"}
                </p>
                <p>
                  <strong>Batch:</strong> {job.batch || "Not specified"}
                </p>
                <p>
                  <strong>Openings:</strong> {job.openings || "Not specified"}
                </p>
                <p>
                  <strong>Applied:</strong> {job.applied_count ?? job.applied ?? job.openings ?? "N/A"}
                </p>
                <p>
                  <strong>Selected:</strong> {job.selected_count ?? job.selected ?? job.selected_count === 0 ? 0 : "N/A"}
                </p>
                <p>
                  <FaRegCalendarAlt className="job-date-icon" />
                  <span className="job-date">Posted on {formatDate(job.created_at)}</span>
                </p>
                <p className={`job-status ${job.status}`}>{job.status === "active" ? "🟢 Active" : "🔴 Inactive"}</p>
              </div>

              <div className="job-card-actions">
                {job.status === "active" ? (
                  <button
                    className="job-card-toggle-btn deactivate"
                    onClick={() => deactivateJob(job.job_id)}
                    title="Deactivate this job"
                  >
                    <FaPowerOff />
                    Deactivate
                  </button>
                ) : (
                  <div className="job-card-no-action">This job is inactive</div>
                )}

                <button
                  className="job-card-view-btn"
                  onClick={() => navigate(`/company/job/${job.job_id}`, { state: { job } })}
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ViewJobListings;