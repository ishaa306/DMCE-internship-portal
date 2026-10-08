import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import CollegeHeader from "../../shared/CollegeHeader";
import {
  FaUsers,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaEdit,
  FaTrash,
  FaArrowLeft,
  FaBriefcase,
  FaGraduationCap,
  FaCode,
  FaDollarSign,
  FaCheckCircle,
  FaClipboardList,
  FaUserClock,
  FaBuilding,
  FaChartLine,
  FaClock,
  FaSuitcase,
  FaUniversity,
  FaPercent,
  FaCheck,
  FaTimes,
  FaRupeeSign
} from "react-icons/fa";
import "./ViewSinglePosting.css";

const API_BASE = "https://placement-portal-backend.ramshekade20.workers.dev/api/company";

const ViewSinglePosting = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Try to use job passed via navigation state for instant render,
  // otherwise fetch from API.
  useEffect(() => {
    if (location?.state?.job) {
      setJob(location.state.job);
      setLoading(false);
    } else {
      fetchJobDetails();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobId, location?.state]);

  const fetchJobDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const resp = await axios.get(`${API_BASE}/view-jobs/${jobId}`, { withCredentials: true });
      if (resp.data && resp.data.success) {
        setJob(resp.data.job);
      } else {
        throw new Error(resp.data?.message || "Failed to fetch job details");
      }
    } catch (err) {
      console.error("Error fetching job details:", err);
      setError(err.response?.data?.message || err.message || "Could not load job details.");
    } finally {
      setLoading(false);
    }
  };

  const updateJobStatus = async (newStatus) => {
    if (!job) return;
    try {
      setIsUpdatingStatus(true);
      const resp = await axios.post(
        `${API_BASE}/update-job-status`,
        { job_id: jobId, status: newStatus },
        { withCredentials: true }
      );
      if (resp.data && resp.data.success) {
        setJob((prev) => ({ ...prev, status: newStatus }));
        showNotification(`Job ${newStatus === "active" ? "activated" : "deactivated"} successfully`);
      } else {
        throw new Error(resp.data?.message || "Failed to update job status");
      }
    } catch (err) {
      console.error("Error updating job status:", err);
      showNotification("Failed to update job status", "error");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const confirmDeleteJob = async () => {
    try {
      setShowDeleteConfirm(false);
      setLoading(true);
      const resp = await axios.delete(`${API_BASE}/delete-job/${jobId}`, { withCredentials: true });
      if (resp.data && resp.data.success) {
        showNotification("Job deleted successfully");
        setTimeout(() => navigate("/company/view-job-listings"), 900);
      } else {
        throw new Error(resp.data?.message || "Failed to delete job");
      }
    } catch (err) {
      console.error("Error deleting job:", err);
      showNotification("Failed to delete job posting", "error");
      setLoading(false);
    }
  };

  const showNotification = (message, type = "success") => {
    const container = document.createElement("div");
    container.className = `job-notification ${type === "error" ? "job-notification-error" : ""}`;
    container.innerHTML = `<div class="job-notification-content">${escapeHtml(message)}</div>`;
    document.body.appendChild(container);
    // animate
    setTimeout(() => container.classList.add("job-notification-visible"), 10);
    // remove
    setTimeout(() => {
      container.classList.remove("job-notification-visible");
      setTimeout(() => document.body.removeChild(container), 300);
    }, 3000);
  };

  // small helper to avoid XSS in notifications
  const escapeHtml = (unsafe) =>
    String(unsafe)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const d = new Date(dateString);
      return new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" }).format(d);
    } catch {
      return dateString;
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="single-job-page">
        <CollegeHeader />
        <div className="job-container">
          <div className="job-loading">
            <div className="job-spinner" />
            <p>Loading job details...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="single-job-page">
        <CollegeHeader />
        <div className="job-container">
          <div className="job-error">
            <div className="job-error-icon">❌</div>
            <h3>Error Loading Job</h3>
            <p>{error}</p>
            <div className="job-error-actions">
              <button onClick={fetchJobDetails}>Try Again</button>
              <button onClick={() => navigate("/company/view-job-listings")} className="job-secondary-btn">
                Back to All Jobs
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Not found / no permission
  if (!job) {
    return (
      <div className="single-job-page">
        <CollegeHeader />
        <div className="job-container">
          <div className="job-not-found">
            <h2>Job Not Found</h2>
            <p>The job you're looking for doesn't exist or you don't have permission to view it.</p>
            <button onClick={() => navigate("/company/view-job-listings")} className="job-secondary-btn">
              <FaArrowLeft /> Back to All Jobs
            </button>
          </div>
        </div>
      </div>
    );
  }


  return (
    <div className="single-job-page">
      <CollegeHeader />
      <div className="job-container">
        <div className="job-header">
          <div className="job-title-section">
            <h1>{job.company_title || "Untitled Company"}</h1>
            <h2>{job.job_title || "Untitled Role"}</h2>

            <div className="job-subtitle">
              <div className="job-company">
                <FaBuilding /> {job.company || job.company_name || `Company ${job.company_id ?? ""}`}
              </div>

              <div className="job-location">
                <FaMapMarkerAlt /> {job.job_location || "Remote"}
              </div>

              <div className={`job-status ${job.status === "active" ? "job-status-active" : "job-status-inactive"}`}>
                {job.status === "active" ? "Active" : "Inactive"}
              </div>
            </div>
          </div>

        </div>

        <div className="job-details-content">
          {/* Info cards */}
          <div className="job-info-cards">
            <div className="job-info-card">
              <div className="job-info-icon">
                <FaUsers />
              </div>
              <div className="job-info-data">
                <div className="job-info-value">{job.openings ?? "N/A"}</div>
                <div className="job-info-label">Openings</div>
              </div>
            </div>

            <div className="job-info-card">
              <div className="job-info-icon">
                <FaCalendarAlt />
              </div>
              <div className="job-info-data">
                <div className="job-info-value">{formatDate(job.drive_date)}</div>
                <div className="job-info-label">Drive Date</div>
              </div>
            </div>

            <div className="job-info-card">
              <div className="job-info-icon">
                <FaRupeeSign />
              </div>
              <div className="job-info-data">
                <div className="job-info-value">
                  {job.ctc ? `${job.ctc} LPA` : job.stipend ? `₹${job.stipend}` : "N/A"}
                </div>
                <div className="job-info-label">{job.ctc ? "CTC" : job.stipend ? "Stipend" : "Compensation"}</div>
              </div>
            </div>

            <div className="job-info-card">
              <div className="job-info-icon">
                <FaGraduationCap />
              </div>
              <div className="job-info-data">
                <div className="job-info-value">{job.batch ?? "N/A"}</div>
                <div className="job-info-label">Batch</div>
              </div>
            </div>
          </div>

          {/* Job Description */}
          <section className="job-section">
            <h2 className="job-section-title">
              <FaClipboardList className="section-icon" /> Job Description
            </h2>
            <div className="job-description">
              {job.job_description ? <p>{job.job_description}</p> : <p className="job-no-data">No description provided.</p>}
            </div>
          </section>

          {/* Details & Eligibility */}
          <div className="job-columns">
            <section className="job-section">
              <h2 className="job-section-title">
                <FaBriefcase className="section-icon" /> Job Details
              </h2>

              <div className="job-details-grid">
                <div className="job-detail-item">
                  <div className="job-detail-label">Job Type</div>
                  <div className="job-detail-value">{job.job_type || "N/A"}</div>
                </div>

                <div className="job-detail-item">
                  <div className="job-detail-label">Interview Mode</div>
                  <div className="job-detail-value">{job.interview_mode || "N/A"}</div>
                </div>

                <div className="job-detail-item">
                  <div className="job-detail-label">Selection Rounds</div>
                  <div className="job-detail-value">{job.selection_rounds || "N/A"}</div>
                </div>

                <div className="job-detail-item">
                  <div className="job-detail-label">Perks</div>
                  <div className="job-detail-value">{job.perks || "N/A"}</div>
                </div>

                <div className="job-detail-item">
                  <div className="job-detail-label">Posted On</div>
                  <div className="job-detail-value">{formatDate(job.created_at)}</div>
                </div>
              </div>
            </section>

            <section className="job-section">
              <h2 className="job-section-title">
                <FaCheckCircle className="section-icon" /> Eligibility Criteria
              </h2>

              <div className="job-eligibility-grid">
                <div className="job-eligibility-item">
                  <div className="job-eligibility-label">Eligible Branches</div>
                  <div className="job-eligibility-value">
                    {job.eligible_branches && job.eligible_branches.length > 0
                      ? Array.isArray(job.eligible_branches)
                        ? job.eligible_branches.join(", ")
                        : job.eligible_branches
                      : "All branches"}
                  </div>
                </div>

                <div className="job-eligibility-item">
                  <div className="job-eligibility-label">Minimum CGPA</div>
                  <div className="job-eligibility-value">{job.min_cgpa ?? "N/A"}</div>
                </div>

                <div className="job-eligibility-item">
                  <div className="job-eligibility-label">Minimum 10th %</div>
                  <div className="job-eligibility-value">{job.min_tenth ? `${job.min_tenth}%` : "N/A"}</div>
                </div>

                <div className="job-eligibility-item">
                  <div className="job-eligibility-label">Minimum 12th %</div>
                  <div className="job-eligibility-value">{job.min_twelfth ? `${job.min_twelfth}%` : "N/A"}</div>
                </div>

                <div className="job-eligibility-item">
                  <div className="job-eligibility-label">Minimum Diploma %</div>
                  <div className="job-eligibility-value">{job.min_diploma ? `${job.min_diploma}%` : "N/A"}</div>
                </div>

                <div className="job-eligibility-item">
                  <div className="job-eligibility-label">Backlogs Allowed</div>
                  <div className="job-eligibility-value">
                    {String(job.kt_allowed).toLowerCase() === "yes" ? "Yes" : String(job.kt_allowed).toLowerCase() === "no" ? "No" : "N/A"}
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Important Dates */}
          <section className="job-section">
            <h2 className="job-section-title">
              <FaClock className="section-icon" /> Important Dates
            </h2>

            <div className="job-dates-grid">

              <div className="job-date-item">
                <div className="job-date-label">Drive Date</div>
                <div className="job-date-value">{formatDate(job.drive_date)}</div>
              </div>

            </div>
          </section>

          {/* Skills */}
          {job.skills_required && (
            <section className="job-section">
              <h2 className="job-section-title">
                <FaCode className="section-icon" /> Skills Required
              </h2>

              <div className="job-skills-list">
                {Array.isArray(job.skills_required)
                  ? job.skills_required.map((s, i) => (
                    <div key={i} className="job-skill-item">
                      {s}
                    </div>
                  ))
                  : String(job.skills_required)
                    .split(",")
                    .map((s, i) => s.trim())
                    .filter(Boolean)
                    .map((s, i) => (
                      <div key={i} className="job-skill-item">
                        {s}
                      </div>
                    ))}
              </div>
            </section>
          )}
        </div>


      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="job-modal-overlay">
          <div className="job-modal">
            <h3>Confirm Deletion</h3>
            <p>Are you sure you want to delete this job posting? This action cannot be undone.</p>
            <div className="job-modal-actions">
              <button className="job-modal-cancel" onClick={() => setShowDeleteConfirm(false)}>
                Cancel
              </button>
              <button className="job-modal-delete" onClick={confirmDeleteJob}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewSinglePosting;