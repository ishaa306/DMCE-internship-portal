import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CollegeHeader from '../../shared/CollegeHeader';
import './StudentDashboard.css';
import { FaUserCircle, FaBriefcase, FaFileAlt, FaSignOutAlt, FaLaptopCode } from 'react-icons/fa';

const StudentDashboard = () => {
  const navigate = useNavigate();

  // State for profile
  const [profile, setProfile] = useState({
    gr_number: localStorage.getItem('gr_number'),
    full_name: localStorage.getItem('full_name'),
    profile_url: localStorage.getItem('profile_url')
  });
  const safeVal = (val, fallback) =>
    (!val || val === 'null' || val === 'undefined') ? fallback : val;

  useEffect(() => {
    const needsFetch =
      !profile.gr_number ||
      !profile.full_name ||
      profile.gr_number === 'null' ||
      profile.full_name === 'null' ||
      profile.gr_number === 'undefined' ||
      profile.full_name === 'undefined';

    if (needsFetch) {
      fetch('https://placement-portal-backend.ramshekade20.workers.dev/api/student/profile/data', { credentials: 'include' })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            const gr_number = safeVal(data.user_id, '');
            const full_name = safeVal(data.full_name, '');
            const profile_url = safeVal(data.profile_url, '');

            // Update localStorage
            localStorage.setItem('gr_number', gr_number);
            localStorage.setItem('full_name', full_name);
            localStorage.setItem('profile_url', profile_url);

            // Update state
            setProfile({ gr_number, full_name, profile_url });
          } else {
            // Log error if API response is not successful
            console.error('API error:', data.error || 'Unknown error', data.details || '');
          }
        })
        .catch(err => {
          // Log network or parsing errors
          console.error('Fetch error:', err.message || err);
        });
    }
  }, [profile.gr_number, profile.full_name]);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/';
  };

  const handleNavigate = (path) => {
    navigate(path);
  };

  // New handler for clickable marquee
  const handleAnnouncementClick = () => {
    navigate('/student-view-announcements');
  };

  const handleAnnouncementKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      navigate('/student-view-announcements');
    }
  };

  return (
    <div className="student-dashboard">
      <CollegeHeader />

      <div className="banner-container">
        <img src="/banner.jpg" alt="Recruiters Banner" className="banner-image" />
      </div>

      <div className="announcement-strip">
        {/* Clickable marquee — navigates to announcements on click or Enter/Space key */}
        <marquee
          onClick={handleAnnouncementClick}
          onKeyDown={handleAnnouncementKeyDown}
          role="button"
          tabIndex={0}
          style={{ cursor: 'pointer' }}
        >
          📢 Click here to view all Announcements
        </marquee>
      </div>

      <div className="dashboard-header">
        <div className="profile-info">
          <img
            src={profile.profile_url}
            alt="Default User"
            className="profile-pic"
          />
          <div className="text-info">
            <h2>{profile.full_name || 'Welcome Student'}</h2>
            <p>GR No: <strong>{profile.gr_number || 'Unknown'}</strong></p>
          </div>
        </div>
        <button onClick={handleLogout} className="logout-button">
          <FaSignOutAlt style={{ marginRight: 8 }} />
          Logout
        </button>
      </div>

      <div className="card-grid">
        <div className="dashboard-card" onClick={() => handleNavigate('/profile')}>
          <div className="dashboard-card-icon profile">
            <FaUserCircle />
          </div>
          <h3>View & Edit Profile</h3>
          <p>Edit & View your personal and academic details here.</p>
        </div>
        <div className="dashboard-card" onClick={() => handleNavigate('/view-opportunities')}>
          <div className="dashboard-card-icon opportunities">
            <FaBriefcase />
          </div>
          <h3>View Opportunities</h3>
          <p>Browse and apply for active company openings.</p>
        </div>
        <div className="dashboard-card" onClick={() => handleNavigate('/view-application-status')}>
          <div className="dashboard-card-icon status">
            <FaFileAlt />
          </div>
          <h3>Application Status</h3>
          <p>Check the current status of your applications.</p>
        </div>
        <div className="dashboard-card" onClick={() => handleNavigate('/student/internships')}>
          <div className="dashboard-card-icon internships">
            <FaLaptopCode />
          </div>
          <h3>Internship Updates</h3>
          <p>Manage and submit your internship details.</p>
        </div>
        <div className="dashboard-card" onClick={() => handleNavigate('/student/placements')}>
          <div className="dashboard-card-icon status">
            <FaBriefcase />
          </div>
          <h3>Campus Placement Details</h3>
          <p>Manage and submit your campus/off-campus placement details.</p>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;