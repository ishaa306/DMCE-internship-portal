import React, { useState, useEffect } from "react";
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

const API_BASE = "https://placement-portal-backend.ramshekade20.workers.dev/api";

const TpoDashboard = ({
  totalPlaced: propTotalPlaced,
  totalCompanies: propTotalCompanies,
  upcomingDrives: propUpcomingDrives,
  placementRate: propPlacementRate,
  announcements: propAnnouncements,
  totalStudents: propTotalStudents,
  studentsUnplaced: propStudentsUnplaced,
  totalOffers: propTotalOffers,
}) => {
  const navigate = useNavigate();

  // Pull display name and login time from localStorage (safe lookup)
  const tpoName = localStorage.getItem("tpo_name") || localStorage.getItem("tpo_email") || "T&P Officer";
  const loginTime = localStorage.getItem("login_time") || "";

  const [stats, setStats] = useState({
    totalStudents: 0,
    studentsPlaced: 0,
    studentsUnplaced: 0,
    totalOffers: 0,
    placementRate: 0,
    registeredCompanies: 0,
    upcomingDrives: 0,
    activeAnnouncements: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchStats = async () => {
      try {
        setLoading(true);

        const token =
          localStorage.getItem("tpo_token") ||
          localStorage.getItem("token") ||
          localStorage.getItem("authToken");

        const authHeaders = { "Content-Type": "application/json" };
        if (token) {
          authHeaders["Authorization"] = `Bearer ${token}`;
        }

        const fetchConfig = {
          method: "GET",
          headers: authHeaders,
          credentials: "include",
        };

        // 1. Try dedicated dashboard-stats endpoint if available
        let statsLoaded = false;
        try {
          const res = await fetch(`${API_BASE}/tpo/dashboard-stats`, fetchConfig);
          if (res.ok) {
            const data = await res.json();
            if (data.success && data.stats) {
              if (isMounted) {
                setStats(data.stats);
                setLoading(false);
              }
              statsLoaded = true;
              return;
            }
          }
        } catch (e) {
          // Fall back to querying existing endpoints
        }

        if (statsLoaded) return;

        // 2. Fetch from existing verified live endpoints in parallel
        const [studentsRes, placedRes, companiesRes, jobsRes, announcementsRes] =
          await Promise.allSettled([
            fetch(`${API_BASE}/tnp/students?limit=10000`, fetchConfig),
            fetch(`${API_BASE}/tnp/placed-students?limit=10000`, fetchConfig),
            fetch(`${API_BASE}/tnp/companies`, fetchConfig),
            fetch(`${API_BASE}/tnp/jobs?limit=1000`, fetchConfig),
            fetch(`${API_BASE}/tpo/announcements?page=1&limit=1000`, fetchConfig),
          ]);

        let totalStudents = 0;
        let studentsPlaced = 0;
        let totalOffers = 0;
        let registeredCompanies = 0;
        let upcomingDrives = 0;
        let activeAnnouncements = 0;

        // 1. Total Students
        if (studentsRes.status === "fulfilled" && studentsRes.value.ok) {
          const sData = await studentsRes.value.json();
          const list = sData.data || [];
          totalStudents = Number(sData.count || list.length);
        }

        // 2. Placed Students & Total Offers
        if (placedRes.status === "fulfilled" && placedRes.value.ok) {
          const pData = await placedRes.value.json();
          const list = pData.data || [];
          totalOffers = Number(pData.total || list.length);

          // Get unique student IDs placed to prevent double counting
          const uniqueIds = new Set(
            list
              .map((row) => row.student?.student_id || row.student_id)
              .filter(Boolean)
          );
          studentsPlaced = uniqueIds.size;
        }

        // Validate against inconsistent dummy or edge cases (placed cannot exceed total students)
        if (totalStudents > 0 && studentsPlaced > totalStudents) {
          studentsPlaced = totalStudents;
        } else if (totalStudents === 0 && studentsPlaced > 0) {
          totalStudents = studentsPlaced;
        }

        // 3. Registered Companies
        if (companiesRes.status === "fulfilled" && companiesRes.value.ok) {
          const cData = await companiesRes.value.json();
          const list = cData.data || [];
          registeredCompanies = Number(cData.count || list.length);
        }

        // 4. Upcoming Drives (active drives with drive_date >= today)
        if (jobsRes.status === "fulfilled" && jobsRes.value.ok) {
          const jData = await jobsRes.value.json();
          const list = jData.jobs || jData.data || [];
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          upcomingDrives = list.filter((job) => {
            if (job.status && job.status !== "active") return false;
            if (!job.drive_date) return false;
            const driveDate = new Date(job.drive_date);
            return !isNaN(driveDate.getTime()) && driveDate >= today;
          }).length;
        }

        // 5. Active Announcements
        if (announcementsRes.status === "fulfilled" && announcementsRes.value.ok) {
          const aData = await announcementsRes.value.json();
          activeAnnouncements = Number(aData.total ?? aData.data?.length ?? 0);
        }

        const studentsUnplaced = Math.max(0, totalStudents - studentsPlaced);
        const placementRate =
          totalStudents > 0
            ? Number(((studentsPlaced / totalStudents) * 100).toFixed(1))
            : 0;

        if (isMounted) {
          setStats({
            totalStudents,
            studentsPlaced,
            studentsUnplaced,
            totalOffers,
            placementRate,
            registeredCompanies,
            upcomingDrives,
            activeAnnouncements,
          });
        }
      } catch (err) {
        console.error("Error fetching TPO dashboard statistics:", err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchStats();

    return () => {
      isMounted = false;
    };
  }, []);

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

  const displayPlaced = propTotalPlaced !== undefined ? propTotalPlaced : stats.studentsPlaced;
  const displayRate = propPlacementRate !== undefined ? propPlacementRate : stats.placementRate;
  const displayCompanies = propTotalCompanies !== undefined ? propTotalCompanies : stats.registeredCompanies;
  const displayDrives = propUpcomingDrives !== undefined ? propUpcomingDrives : stats.upcomingDrives;
  const displayAnnouncements = propAnnouncements !== undefined ? propAnnouncements : stats.activeAnnouncements;
  const displayTotalStudents = propTotalStudents !== undefined ? propTotalStudents : stats.totalStudents;
  const displayUnplaced = propStudentsUnplaced !== undefined ? propStudentsUnplaced : stats.studentsUnplaced;
  const displayOffers = propTotalOffers !== undefined ? propTotalOffers : stats.totalOffers;

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
                    <div className="tpo-card-stat-value">
                      {loading && propTotalPlaced === undefined ? "—" : displayPlaced}
                    </div>
                    <div className="tpo-card-stat-label">Students Placed</div>
                  </div>
                  <div className="tpo-card-stat-item">
                    <div className="tpo-card-stat-value">
                      {loading && propPlacementRate === undefined ? "—" : `${displayRate}%`}
                    </div>
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
                    <div className="tpo-card-stat-value">
                      {loading && propTotalCompanies === undefined ? "—" : displayCompanies}
                    </div>
                    <div className="tpo-card-stat-label">Registered Companies</div>
                  </div>
                  <div className="tpo-card-stat-item">
                    <div className="tpo-card-stat-value">
                      {loading && propUpcomingDrives === undefined ? "—" : displayDrives}
                    </div>
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
                    <div className="tpo-card-stat-value">
                      {loading && propAnnouncements === undefined ? "—" : displayAnnouncements}
                    </div>
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
                  <div className="rect-card-number">
                    {loading && propTotalStudents === undefined ? "—" : displayTotalStudents}
                  </div>
                  <div className="rect-card-desc">Total registered students</div>
                </div>
              </div>

              <div className="tpo-rect-card">
                <div className="rect-card-body">
                  <div className="rect-card-title">Students Unplaced</div>
                  <div className="rect-card-number">
                    {loading && propStudentsUnplaced === undefined ? "—" : displayUnplaced}
                  </div>
                  <div className="rect-card-desc">Students seeking placement</div>
                </div>
              </div>

              <div className="tpo-rect-card">
                <div className="rect-card-body">
                  <div className="rect-card-title">Total Offers</div>
                  <div className="rect-card-number">
                    {loading && propTotalOffers === undefined ? "—" : displayOffers}
                  </div>
                  <div className="rect-card-desc">Total placement offers received</div>
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