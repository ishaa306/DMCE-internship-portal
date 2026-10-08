import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import "./ViewAnnouncements.css";
import CollegeHeader from "../../shared/CollegeHeader";
import {
  FaPlus,
  FaSearch,
  FaBullhorn,
  FaCalendarAlt,
  FaClock,
} from "react-icons/fa";
import { RiMegaphoneFill } from "react-icons/ri";

const ViewAnnouncements = () => {
  const navigate = useNavigate();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const fetchAnnouncements = async () => {
    setLoading(true);
    setError("");

    try {
      const token =
        localStorage.getItem("tpo_token") || localStorage.getItem("token");
      const headers = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const response = await fetch(
        "https://placement-portal-backend.ramshekade20.workers.dev/api/tpo/announcements?page=1&limit=50",
        {
          method: "GET",
          headers: headers,
          credentials: "include",
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        // Sort newest first
        const sortedData = (data.data || []).sort((a, b) => {
          // Ensure we compare them as UTC dates
          const dateA = new Date(
            a.created_at.endsWith("Z") ? a.created_at : a.created_at + "Z"
          );
          const dateB = new Date(
            b.created_at.endsWith("Z") ? b.created_at : b.created_at + "Z"
          );
          return dateB - dateA;
        });
        setAnnouncements(sortedData);
      } else {
        if (response.status === 401)
          throw new Error("Session expired. Please Log Out and Log In again.");
        throw new Error(data.message || "Failed to fetch announcements");
      }
    } catch (err) {
      console.error("Fetch Error:", err);
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const filteredAnnouncements = announcements.filter((announcement) => {
    const term = searchTerm.toLowerCase();
    const titleMatch = announcement.title?.toLowerCase().includes(term);
    const contentMatch = announcement.content?.toLowerCase().includes(term);
    return titleMatch || contentMatch;
  });

  // --- FIX: FORCE UTC PARSING ---
  // If your DB returns "2025-12-20 11:30:00", we append 'Z' to make it "2025-12-20 11:30:00Z"
  // This tells the browser "This is UTC time, please convert it to my local time."

  const getLocalDate = (dateString) => {
    if (!dateString) return new Date();
    // If it already has 'Z' or offset, leave it. If not, treat as UTC.
    if (dateString.includes("Z") || dateString.includes("+"))
      return new Date(dateString);
    return new Date(dateString + "Z");
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Date N/A";
    const date = getLocalDate(dateString);
    return new Intl.DateTimeFormat("en-IN", {
      // Changed to 'en-IN' for correct day/month order if preferred
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  };

  const formatTime = (dateString) => {
    if (!dateString) return "";
    const date = getLocalDate(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };
  // --------------------------------

  return (
    <div className="view-announcements-container">
      <Toaster position="top-right" />
      <CollegeHeader />

      <div className="announcements-wrapper">
        <div className="announcements-header-section">
          <div className="header-title-row">
            <h1>
              <FaBullhorn className="header-icon" /> Announcements
            </h1>
            <button
              className="create-announcement-btn"
              onClick={() => navigate("/tpo/create-announcement")}
            >
              <FaPlus /> New Announcement
            </button>
          </div>

          <div className="search-wrapper">
            <div className="search-bar">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search by title or content..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading updates...</p>
          </div>
        ) : error ? (
          <div className="error-state">
            <p>{error}</p>
            <button onClick={fetchAnnouncements} className="retry-btn">
              Retry
            </button>
          </div>
        ) : (
          <div className="announcements-content">
            {filteredAnnouncements.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon-circle">
                  <RiMegaphoneFill />
                </div>
                <h2>No Announcements Found</h2>
                <p>
                  {searchTerm
                    ? `No matches found for "${searchTerm}"`
                    : "There are no announcements posted yet."}
                </p>
                {!searchTerm && (
                  <button
                    className="create-first-btn"
                    onClick={() => navigate("/tpo/create-announcement")}
                  >
                    Create First Announcement
                  </button>
                )}
              </div>
            ) : (
              <div className="cards-grid">
                {filteredAnnouncements.map((announcement) => (
                  <div
                    key={announcement.announcement_id}
                    className="announcement-card"
                  >
                    <div className="card-header">
                      <div className="card-meta">
                        <span className="date-badge">
                          <FaCalendarAlt />{" "}
                          {formatDate(announcement.created_at)}
                        </span>
                        <span className="time-badge">
                          <FaClock /> {formatTime(announcement.created_at)}
                        </span>
                      </div>
                      <h3 title={announcement.title}>{announcement.title}</h3>
                    </div>

                    <div className="card-body">
                      <div
                        className="rich-text-content"
                        dangerouslySetInnerHTML={{
                          __html: announcement.content,
                        }}
                      />
                    </div>

                    <div className="card-footer">
                      <span className="read-indicator">Posted by TPO</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewAnnouncements;
