import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaUpload,
  FaChartLine,
  FaSignOutAlt,
  FaUserGraduate,
  FaUsers,
  FaFileUpload,
  FaClipboardCheck,
} from "react-icons/fa";
import CollegeHeader from "../../shared/CollegeHeader";
import "./TnPCODashboard.css";
import sampleData from "../sampleData";

const TnPCODashboard = () => {
  const navigate = useNavigate();
  const [loading] = useState(false);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  // Compute placement data for current year using sampleData
  const {
    totalStudents,
    placedStudents,
    unplacedStudents,
    placementRate,
    currentYear,
  } = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const students = sampleData.students || [];

    const currentYearStudents = students.filter(
      (s) => Number(s.passoutYear) === Number(currentYear)
    );

    const total = currentYearStudents.length;
    const placed = currentYearStudents.filter(
      (s) => String(s.placedStatus || "").toLowerCase() === "selected"
    ).length;
    const unplaced = total - placed;
    const rate = total > 0 ? ((placed / total) * 100).toFixed(2) : "0.00";

    return {
      totalStudents: total,
      placedStudents: placed,
      unplacedStudents: unplaced,
      placementRate: rate,
      currentYear,
    };
  }, []);

  // Coordinator profile (from localStorage if available)
  const coordinatorName = localStorage.getItem("tnpco_name") || "TNP Coordinator";
  const coordinatorDept = localStorage.getItem("tnpco_department") || "Information Technology";
  const coordinatorAvatar = localStorage.getItem("tnpco_avatar") || "https://cdn-icons-png.flaticon.com/512/149/149071.png";

  const cards = [
    {
      id: "profile",
      title: "View & Edit Profile",
      desc: "View and update your coordinator profile and contact details.",
      icon: FaUserGraduate,
      path: "/tnpco/profile",
      type: "profile",
    },
    {
      id: "student-upload",
      title: "Student Upload",
      desc: "Upload student details, resumes, or placement records easily.",
      icon: FaFileUpload,
      path: "/tnpco/student-upload",
      type: "upload",
    },
    {
      id: "analytics",
      title: "View Records & Analytics",
      desc: "View students, placements and year-wise records and statistics.",
      icon: FaChartLine,
      path: "/tnpco/analytics",
      type: "analytics",
    },
    {
      id: "internships",
      title: "Internship Verification",
      desc: "Review and verify student internship records and documents.",
      icon: FaClipboardCheck,
      path: "/tnpco/internships",
      type: "internships",
    }
  ];

  return (
    <div className="tnpco-dashboard">
      <CollegeHeader />

      <div className="announcement-strip">
        📢 TnP Coordinator Portal — manage uploads, view analytics and coordinate placements
      </div>

      {/* Dashboard header with profile info */}
      <div className="dashboard-header">
        <div className="profile-info">
          <div className="profile-pic-container">
            <img
              src={coordinatorAvatar}
              alt={`${coordinatorName} avatar`}
              className="profile-pic"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "https://cdn-icons-png.flaticon.com/512/149/149071.png";
              }}
            />
          </div>
          <div className="text-info">
            <h2>{coordinatorName}</h2>
            <p>Department: <strong>{coordinatorDept}</strong></p>
          </div>
        </div>

        <div className="header-buttons">
         
          <button onClick={handleLogout} className="logout-button">
            <FaSignOutAlt style={{ marginRight: 8 }} />
            Logout
          </button>
        </div>
      </div>

      {/* Main Action Cards */}
      <div className="card-container">
        {cards.map((card) => {
          const IconComponent = card.icon;
          return (
            <div
              key={card.id}
              className="card"
              role="button"
              tabIndex={0}
              onClick={() => navigate(card.path)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") navigate(card.path);
              }}
            >
              <div className="card-content">
                <div className="icon-wrapper">
                  <IconComponent size={50} color="#1e1e3f" className="icon" />
                </div>
                <h3 className="card-title">{card.title}</h3>
                <p className="card-text">{card.desc}</p>
              </div>
              <button
                className="button"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(card.path);
                }}
                aria-label={`Navigate to ${card.title}`}
              >
                View
              </button>
            </div>
          );
        })}
      </div>

      {/* Statistics Section */}
      <div className="stats-section">
        <h3 className="stats-title">Quick Overview</h3>
        <div className="stats-container">
          <div className="stat-card">
            <FaUserGraduate size={24} style={{ marginBottom: '10px' }} />
            <div className="stat-number">{totalStudents}</div>
            <div className="stat-label">Total Students ({currentYear})</div>
          </div>
          <div className="stat-card">
            <FaUpload size={24} style={{ marginBottom: '10px' }} />
            <div className="stat-number">{placedStudents}</div>
            <div className="stat-label">Placed Students</div>
          </div>
          <div className="stat-card">
            <FaChartLine size={24} style={{ marginBottom: '10px' }} />
            <div className="stat-number">{placementRate}%</div>
            <div className="stat-label">Placement Rate</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TnPCODashboard;