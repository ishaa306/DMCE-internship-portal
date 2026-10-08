import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import CollegeHeader from '../shared/CollegeHeader';
import { MdPostAdd, MdWorkOutline, MdPeopleAlt, MdUploadFile } from 'react-icons/md';
import { FaChartLine, FaUsers, FaBriefcase, FaSignOutAlt, FaUserCircle } from 'react-icons/fa';
import './Dashboard.css';

const CompanyDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalJobs: 0,
    totalApplications: 0,
    activeJobs: 0
  });

  // Company profile state
  const [profile, setProfile] = useState({
    company_name: localStorage.getItem('company_name') || 'Welcome Company',
    company_logo: localStorage.getItem('company_logo') || '/default-company-logo.png',
    hr_person_name: localStorage.getItem('currentUser') || 'HR Manager'
  });

  // Update current date and time function
  const updateCurrentDateTime = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };

  const [currentDateTime, setCurrentDateTime] = useState(updateCurrentDateTime());

  useEffect(() => {
    // Fetch real dashboard data from API
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Update current date/time
        setCurrentDateTime(updateCurrentDateTime());

        // Fetch profile data first
        try {
          const profileResponse = await axios.get(
            'https://placement-portal-backend.ramshekade20.workers.dev/api/company/profile/view',
            { withCredentials: true }
          );

          if (profileResponse.data && profileResponse.data.profile) {
            const profileData = profileResponse.data.profile;
            // Extract logo URL with proper fallback checking
            let logoUrl = '/default-company-logo.png';
            if (profileData.logo_url && profileData.logo_url !== 'null' && profileData.logo_url !== 'undefined') {
              logoUrl = profileData.logo_url;
            } else if (profileData.company_logo && profileData.company_logo !== 'null' && profileData.company_logo !== 'undefined') {
              logoUrl = profileData.company_logo;
            }

            // Update profile state and localStorage
            const updatedProfile = {
              company_name: profileData.company_name || 'Welcome Company',
              company_logo: logoUrl,
              hr_person_name: profileData.hr_person_name || 'HR Manager'
            };

            setProfile(updatedProfile);

            // Update localStorage
            localStorage.setItem('company_name', updatedProfile.company_name);
            localStorage.setItem('company_logo', logoUrl);
            localStorage.setItem('currentUser', updatedProfile.hr_person_name);
          }
        } catch (profileError) {
          console.error('Error fetching company profile:', profileError);
          // Continue with existing profile data from localStorage
        }

        // Fetch jobs data from API
        const jobsResponse = await axios.get(
          'https://placement-portal-backend.ramshekade20.workers.dev/api/company/view-jobs',
          { withCredentials: true }
        );

        let jobsData = [];
        let applicationCount = 0;

        if (jobsResponse.data && jobsResponse.data.success && Array.isArray(jobsResponse.data.jobs)) {
          jobsData = jobsResponse.data.jobs;

          // For each job, fetch its applications
          for (const job of jobsData) {
            try {
              const appResponse = await axios.get(
                `https://placement-portal-backend.ramshekade20.workers.dev/api/company/applications/${job.job_id}`,
                { withCredentials: true }
              );

              if (appResponse.data && appResponse.data.success && Array.isArray(appResponse.data.applications)) {
                applicationCount += appResponse.data.applications.length;
              }
            } catch (err) {
              console.error(`Error fetching applications for job ${job.job_id}:`, err);
            }
          }

          // Calculate active jobs
          const activeJobs = jobsData.filter(job =>
            job.status === 'active' || job.status === 'open' || !job.status
          ).length;

          setStats({
            totalJobs: jobsData.length,
            totalApplications: applicationCount,
            activeJobs: activeJobs || Math.ceil(jobsData.length * 0.7) // Fallback
          });
        } else {
          // Fallback to default stats if API fails
          setStats({
            totalJobs: 0,
            totalApplications: 0,
            activeJobs: 0
          });
        }

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        // Fallback to default stats if API fails
        setStats({
          totalJobs: 0,
          totalApplications: 0,
          activeJobs: 0
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/';
  };

  const dashboardCards = [
    {
      id: 'create-job',
      icon: MdPostAdd,
      title: 'Create Job Posting',
      description: 'Create a new job opportunity for eligible students and manage requirements.',
      action: 'Create Job',
      path: '/company/create-job',
      color: '#1e1e3f'
    },
    {
      id: 'view-jobs',
      icon: MdWorkOutline,
      title: 'View Job Listings',
      description: 'See all jobs your company has posted so far and manage existing postings.',
      action: 'View Jobs',
      path: '/company/view-job-listings',
      color: '#1e1e3f'
    },
    {
      id: 'view-applicants',
      icon: MdPeopleAlt,
      title: 'View Applicants',
      description: 'Track applications, review candidates, and manage the recruitment process.',
      action: 'View Applicants',
      path: '/company/view-applicants',
      color: '#1e1e3f'
    },
    {
      id: 'upload-result',
      icon: MdUploadFile,
      title: 'Upload Result',
      description: 'Upload placement results for students who have been selected in the hiring process.',
      action: 'Upload Result',
      path: '/company/upload-result',
      color: '#1e1e3f'
    }
  ];

  if (loading) {
    return (
      <div className="co-dashboard-root">
        <CollegeHeader />
        <div className="co-loading">
          <div className="co-loading-spinner"></div>
          <div className="co-loading-text">Loading dashboard...</div>
          <div className="co-loading-info">Current Date and Time: {currentDateTime}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="co-dashboard-root">
      <CollegeHeader />

      <div className="co-announcement-strip">
        <marquee>📢 Welcome to the Company Portal! You can post jobs, view applications, and manage your recruitment process here.</marquee>
      </div>

      {/* Dashboard header with profile info */}
      <div className="co-dashboard-header">
        <div className="co-profile-info">
          <div className="co-profile-pic-container">
            <img
              src={profile.company_logo || '/default-company-logo.png'}
              alt={`${profile.company_name} Logo`}
              className="co-profile-pic"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/default-company-logo.png';
              }}
            />
          </div>
          <div className="co-text-info">
            <h2>{profile.company_name}</h2>
            <p>HR Contact: <strong>{profile.hr_person_name}</strong></p>
          </div>
        </div>
        <div className="co-header-buttons">
          <button onClick={() => navigate('/company/view-profile')} className="co-view-profile-button">
            <FaUserCircle style={{ marginRight: 8 }} />
            View Profile
          </button>
          <button onClick={handleLogout} className="co-logout-button">
            <FaSignOutAlt style={{ marginRight: 8 }} />
            Logout
          </button>
        </div>
      </div>

      {/* Main Action Cards */}
      <div className="co-card-container">
        {dashboardCards.map((card) => {
          const IconComponent = card.icon;
          return (
            <div key={card.id} className="co-card">
              <div className="co-card-content">
                <div className="co-icon-wrapper">
                  <IconComponent size={50} color={card.color} className="co-icon" />
                </div>
                <h3 className="co-card-title">{card.title}</h3>
                <p className="co-card-text">{card.description}</p>
              </div>
              <button
                className="co-button"
                onClick={() => navigate(card.path)}
                aria-label={`Navigate to ${card.title}`}
              >
                {card.action}
              </button>
            </div>
          );
        })}
      </div>

      {/* Statistics Section */}
      <div className="co-stats-section">
        <h3 className="co-stats-title">Quick Overview</h3>
        <div className="co-stats-container">
          <div className="co-stat-card">
            <FaBriefcase size={24} style={{ marginBottom: '10px' }} />
            <div className="co-stat-number">{stats.totalJobs}</div>
            <div className="co-stat-label">Total Jobs Posted</div>
          </div>
          <div className="co-stat-card">
            <FaUsers size={24} style={{ marginBottom: '10px' }} />
            <div className="co-stat-number">{stats.totalApplications}</div>
            <div className="co-stat-label">Total Applications</div>
          </div>
          <div className="co-stat-card">
            <FaChartLine size={24} style={{ marginBottom: '10px' }} />
            <div className="co-stat-number">{stats.activeJobs}</div>
            <div className="co-stat-label">Active Job Postings</div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default CompanyDashboard;