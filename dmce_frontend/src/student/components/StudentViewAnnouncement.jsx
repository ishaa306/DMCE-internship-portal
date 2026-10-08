import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import CollegeHeader from "../../shared/CollegeHeader";
import "./StudentViewAnnouncement.css";
import { FaCalendarAlt, FaBullhorn, FaExclamationCircle } from "react-icons/fa";
import { RiMegaphoneFill } from "react-icons/ri";

const ANNOUNCEMENTS_API = "https://placement-portal-backend.ramshekade20.workers.dev/api/student/announcements";


export default function StudentViewAnnouncement() {
  const navigate = useNavigate();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    const controller = new AbortController();

    const fetchAnnouncements = async () => {
      try {
        setLoading(true);
        // Toast for feedback
        // const toastId = toast.loading("Checking for updates...");

        const resp = await fetch(ANNOUNCEMENTS_API, {
          method: "GET",
          credentials: "include", // CRITICAL: Sends session cookies for auth
          headers: {
            "Accept": "application/json",
            "Content-Type": "application/json"
          },
          signal: controller.signal,
        });

        if (!resp.ok) {
          if (resp.status === 401) throw new Error("Session expired. Please log in.");
          throw new Error("Unable to fetch announcements.");
        }

        const payload = await resp.json();

        if (mounted) {
          // Normalize data structure
          const list = Array.isArray(payload)
            ? payload
            : (payload.data || payload.announcements || []);

          // Sort: Newest first
          const sortedList = list.sort((a, b) =>
            new Date(b.created_at || b.createdAt) - new Date(a.created_at || a.createdAt)
          );

          setAnnouncements(sortedList);
          // toast.dismiss(toastId);
        }
      } catch (err) {
        if (mounted && err.name !== 'AbortError') {
          console.error("Fetch error:", err);
          setError(err.message);
          toast.error(err.message);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchAnnouncements();

    return () => {
      mounted = false;
      controller.abort();
    };
  }, []);

  // -- Helper for Dates --
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString.endsWith('Z') ? dateString : dateString + 'Z');
    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: true
    }).format(date);
  };

  return (
    <div className="view-announcement-page">
      <Toaster position="top-right" />
      <CollegeHeader />

      {/* 1. LATEST NEWS TICKER (Professional Strip) */}


      <div className="view-announcement-container">
        {/* Header Section */}
        <div className="page-header">
          <h1><FaBullhorn className="header-icon" /> Campus Announcements</h1>
        </div>

        {/* LOADING STATE */}
        {loading && (
          <div className="announce-loading">
            <div className="spinner"></div>
            <p>Syncing with server...</p>
          </div>
        )}

        {/* ERROR STATE */}
        {error && (
          <div className="announce-error">
            <FaExclamationCircle className="error-icon" />
            <h3>Unable to load updates</h3>
            <p>{error}</p>
            <button onClick={() => window.location.reload()} className="retry-btn">
              Retry Connection
            </button>
          </div>
        )}

        {/* EMPTY STATE */}
        {!loading && !error && announcements.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon-circle"><RiMegaphoneFill /></div>
            <h3>No Announcements Yet</h3>
            <p>Check back later for updates from the TPO cell.</p>
          </div>
        )}

        {/* DATA LIST */}
        {!loading && !error && (
          <div className="announcements-grid">
            {announcements.map((ann) => (
              <div key={ann.announcement_id || ann.id} className="view-announcement-card">
                <div className="view-announcement-header">
                  <div className="card-top-row">
                    <span className="date-badge">
                      <FaCalendarAlt /> {formatDate(ann.created_at || ann.createdAt)}
                    </span>
                  </div>
                  <h2 className="view-announcement-title">{ann.title}</h2>
                </div>

                <div className="divider"></div>

                <div
                  className="view-announcement-body"
                  dangerouslySetInnerHTML={{ __html: ann.content }}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}