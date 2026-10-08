import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaUserGraduate,
  FaBuilding,
  FaBullhorn,
  FaChartLine,
  FaRegCalendarAlt,
  FaEye,
  FaPlus
} from "react-icons/fa";
import CollegeHeader from "../../shared/CollegeHeader";
import "./TpoDashboard.css";

const TpoDashboard = ({
  totalPlaced = 754,
  totalCompanies = 86,
  upcomingDrives = 12,
  placementRate = 78.4,
  announcements = 5
}) => {
  const navigate = useNavigate();

  // Pull display name and login time from localStorage (safe lookup)
  const tpoName = localStorage.getItem("tpo_name") || localStorage.getItem("tpo_email") || "T&P Officer";
  const loginTime = localStorage.getItem("login_time") || "";

  const handleLogout = () => {
    // Clear only auth-related keys to avoid clearing other app state unexpectedly
    try {
      localStorage.removeItem("tpoAuthenticated");
      localStorage.removeItem("tpo_email");
      localStorage.removeItem("tpo_name");
      localStorage.removeItem("tpo_token");
      localStorage.removeItem("login_time");
    } catch (err) {
      // ignore storage errors
    }
    navigate("/");
  };


  const summary = useMemo(() => ({
    totalStudentsCount: 2025,
    placedStudents: 1200,
    companiesVisited: 320
  }), []);

  return (
    // NOTE: wrap the page in .tpo-theme so CSS variables are scoped and not declared in :root
    <div className="tpo-theme">
      <div className="tpo-dashboard-wrapper">
        <CollegeHeader />

        <div className="banner-container" role="img" aria-label="Recruiters banner">
          <img src="/banner.jpg" alt="Recruiters Banner" className="banner-image" />
        </div>

        <div className="tpo-dashboard-status-bar" role="region" aria-label="Status bar">
          <div className="tpo-dashboard-welcome">
            <h2>Welcome, <span className="tpo-welcome-name">{tpoName}</span></h2>
            {loginTime && <div className="tpo-login-time">Last login: {loginTime}</div>}
          </div>

          <div className="tpo-status-actions" role="toolbar" aria-label="Actions">
         
            <button
              className="status-btn logout"
              onClick={handleLogout}
              aria-label="Logout"
              title="Logout"
            >
              Logout
            </button>
          </div>
        </div>

        <main className="tpo-dashboard-main">
          <div className="tpo-dashboard-cards">
            <div className="tpo-dashboard-card tpo-card-placement">
              <div className="tpo-card-header">
                <div className="tpo-card-icon-container">
                  <FaUserGraduate className="tpo-card-icon" />
                </div>
                <h2>Placement Records</h2>
              </div>

              <div className="tpo-card-content">
                <div className="tpo-card-stats">
                  <div className="tpo-card-stat-item">
                    <div className="tpo-card-stat-value">{totalPlaced}</div>
                    <div className="tpo-card-stat-label">Students Placed</div>
                  </div>
                  <div className="tpo-card-stat-item">
                    <div className="tpo-card-stat-value">{placementRate}%</div>
                    <div className="tpo-card-stat-label">Placement Rate</div>
                  </div>
                </div>
                <p className="tpo-card-description">
                  Track student placement records, manage offers, and generate placement reports.
                </p>
              </div>

              <div className="tpo-card-actions">
                <button
                  className="tpo-card-button primary"
                  onClick={() => navigate("/tpo/student-placement-records")}
                >
                  <FaEye /> View Records
                </button>
                <button
                  className="tpo-card-button secondary"
                  onClick={() => navigate("/tpo/view-analytics")}
                >
                  <FaChartLine /> Analytics
                </button>
              </div>
            </div>

            <div className="tpo-dashboard-card tpo-card-company">
              <div className="tpo-card-header">
                <div className="tpo-card-icon-container">
                  <FaBuilding className="tpo-card-icon" />
                </div>
                <h2>Company Records</h2>
              </div>

              <div className="tpo-card-content">
                <div className="tpo-card-stats">
                  <div className="tpo-card-stat-item">
                    <div className="tpo-card-stat-value">{totalCompanies}</div>
                    <div className="tpo-card-stat-label">Registered Companies</div>
                  </div>
                  <div className="tpo-card-stat-item">
                    <div className="tpo-card-stat-value">{upcomingDrives}</div>
                    <div className="tpo-card-stat-label">Upcoming Drives</div>
                  </div>
                </div>
                <p className="tpo-card-description">
                  Manage company profiles, view recruitment drives, and track company activities.
                </p>
              </div>

              <div className="tpo-card-actions">
                <button
                  className="tpo-card-button primary"
                  onClick={() => navigate("/tpo/companies")}
                >
                  <FaBuilding /> View Company
                </button>
                <button
                  className="tpo-card-button secondary"
                  onClick={() => navigate("/tpo/company-invite")}
                >
                  <FaRegCalendarAlt /> Invite Company
                </button>
              </div>
            </div>

            <div className="tpo-dashboard-card tpo-card-announcement">
              <div className="tpo-card-header">
                <div className="tpo-card-icon-container">
                  <FaBullhorn className="tpo-card-icon" />
                </div>
                <h2>Announcements</h2>
              </div>

              <div className="tpo-card-content">
                <div className="tpo-card-stats">
                  <div className="tpo-card-stat-item">
                    <div className="tpo-card-stat-value">{announcements}</div>
                    <div className="tpo-card-stat-label">Active Announcements</div>
                  </div>
                </div>
                <p className="tpo-card-description">
                  Create and manage announcements for students about placement activities and opportunities.
                </p>
              </div>

              <div className="tpo-card-actions">
                <button
                  className="tpo-card-button primary"
                  onClick={() => navigate("/tpo/create-announcement")}
                >
                  <FaPlus /> Create New
                </button>
                <button
                  className="tpo-card-button secondary"
                  onClick={() => navigate("/tpo/view-announcements")}
                >
                  <FaEye /> View All
                </button>
              </div>
            </div>
          </div>

          <section className="tpo-summary-section">
            <div className="tpo-summary-grid">
              <div className="tpo-rect-card">
                <div className="rect-card-body">
                  <div className="rect-card-title">Total Students</div>
                  <div className="rect-card-number">{summary.totalStudentsCount}</div>
                  <div className="rect-card-desc">Total registered students</div>
                </div>
              </div>

              <div className="tpo-rect-card">
                <div className="rect-card-body">
                  <div className="rect-card-title">Placed Students</div>
                  <div className="rect-card-number">{summary.placedStudents}</div>
                  <div className="rect-card-desc">Students placed till date</div>
                </div>
              </div>

              <div className="tpo-rect-card">
                <div className="rect-card-body">
                  <div className="rect-card-title">Companies Visited</div>
                  <div className="rect-card-number">{summary.companiesVisited}</div>
                  <div className="rect-card-desc">Companies that visited campus</div>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default TpoDashboard;