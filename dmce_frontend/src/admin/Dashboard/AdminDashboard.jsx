import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaUsers, FaUserShield, FaChartLine, FaSignOutAlt, FaUserCircle } from "react-icons/fa";
import CollegeHeader from "../../shared/CollegeHeader";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState({
    admin_name: localStorage.getItem("admin_name") || "Admin User",
    admin_avatar: localStorage.getItem("admin_avatar") || "/default-admin.png",
  });

 

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const cards = [
    {
      id: "manage-tpo",
      Icon: FaUsers,
      title: "Manage TPOs",  
      action: "Open Manage",
      path: "/admin/tpo-invite",
      color: "#1e1e3f",
    },
    {
      id: "manage-coordinators",
      Icon: FaUserShield,
      title: "Manage Coordinators",
      action: "Open Coordinators",
      path: "/admin/tnpco-invite",
      color: "#1e1e3f",
    },
    {
      id: "placement-analytics",
      Icon: FaChartLine,
      title: "Placement Analytics",
      action: "Open Analytics",
      path: "/admin/placement-analytics",
      color: "#1e1e3f",
    },
  ];

  return (
    <div className="admin-dashboard">
      <CollegeHeader />

      <div className="admin-banner-container">
        <img src="/banner.jpg" alt="College banner" className="admin-banner-image" />
      </div>


      <div className="admin-header">
        <div className="admin-profile-info">
          <img
            src={profile.admin_avatar}
            alt={`${profile.admin_name} avatar`}
            className="admin-profile-pic"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "/dmce.png";
            }}
          />
          <div className="admin-text-info">
            <h2>{profile.admin_name}</h2>
          </div>
        </div>

        <div className="admin-header-buttons">
          <button
            className="admin-view-profile"
            onClick={() => navigate("/admin/profile")}
            aria-label="View profile"
          >
            <FaUserCircle style={{ marginRight: 8 }} />
            View Profile
          </button>

          <button className="admin-logout" onClick={handleLogout} aria-label="Logout">
            <FaSignOutAlt style={{ marginRight: 8 }} />
            Logout
          </button>
        </div>
      </div>

      <main className="admin-main">
        <section className="admin-card-container" aria-label="Admin actions">
          {cards.map((c, idx) => {
            const Icon = c.Icon;
            return (
              <div
                key={c.id}
                className="admin-card"
                role="button"
                tabIndex={0}
                onClick={() => navigate(c.path)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") navigate(c.path);
                }}
              >
                <div className="admin-card-before" aria-hidden="true" />
                <div className="admin-card-content">
                  <div className="admin-icon-wrapper" aria-hidden="true">
                    <Icon size={48} color={c.color} className="admin-icon" />
                  </div>
                  <h3 className="admin-card-title">{c.title}</h3>
                </div>

                <button
                  className="admin-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(c.path);
                  }}
                  aria-label={c.action}
                >
                  {c.action}
                </button>
              </div>
            );
          })}
        </section>

        <section className="admin-stats-section" aria-label="Quick overview">
          <h3 className="admin-stats-title">Quick Overview</h3>
          <div className="admin-stats-container">
            <div className="admin-stat-card">
              <FaChartLine size={22} style={{ marginBottom: 10 }} />
              <div className="admin-stat-number">—</div>
              <div className="admin-stat-label">Total TPOs</div>
            </div>
            <div className="admin-stat-card">
              <FaUsers size={22} style={{ marginBottom: 10 }} />
              <div className="admin-stat-number">—</div>
              <div className="admin-stat-label">Pending Invites</div>
            </div>
            <div className="admin-stat-card">
              <FaUserShield size={22} style={{ marginBottom: 10 }} />
              <div className="admin-stat-number">—</div>
              <div className="admin-stat-label">Active Coordinators</div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default AdminDashboard;