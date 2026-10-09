import React, { useState, useEffect } from "react";
import axios from "axios";
import CollegeHeader from "../../shared/CollegeHeader";
import { useNavigate } from "react-router-dom";

import Marquee from "react-fast-marquee";

// Import company logos for marquee
import aurionpro from "../../assets/images/auri.jpeg";
import cap from "../../assets/images/cap.png";
import tcs from "../../assets/images/tcs.png";
import delo from "../../assets/images/delo.png";
import ibm from "../../assets/images/ibm.png";

import "./ViewOpportunities.css";

const ViewOpportunities = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        'https://placement-portal-backend.ramshekade20.workers.dev/api/student/view-jobs',
        { withCredentials: true }
      );

      if (response.data && response.data.success) {
        setJobs(response.data.jobs || []);
        console.log(response.data.jobs);
      } else {
        throw new Error(response.data?.message || 'Failed to fetch jobs');
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
      setError('Failed to load job opportunities. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Format date from ISO format to DD-MM-YYYY
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      return `${day}-${month}-${year}`;
    } catch (error) {
      return dateString;
    }
  };

  // Generate initials for company
  const getCompanyInitials = (companyName) => {
    if (!companyName) return "CO";
    return companyName
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Truncate text with ellipsis if too long
  const truncateText = (text, maxLength) => {
    if (!text) return "";
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

  return (
    <div className="view-opportunities">
      <CollegeHeader />

      <div className="oppo-main">
        <h2 className="oppo-title">
          Campus Placement Opportunities
        </h2>
        <div className="oppo-underline" />

        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading opportunities...</p>
          </div>
        ) : error ? (
          <div className="error-message">
            <p>{error}</p>
            <button onClick={() => window.location.reload()}>Try Again</button>
          </div>
        ) : jobs.length === 0 ? (
          <div className="no-jobs-message">
            <p>No job opportunities available at the moment. Check back later!</p>
          </div>
        ) : (
          <div className="jobs-grid">
            {jobs
              .filter(job => job.status === "active") // Add this filter
              .map((job) => (
                <div
                  key={job.job_id}
                  className="job-card"
                  tabIndex={0}
                  onClick={() => navigate(`/opportunity/${job.job_id}`, { state: { job } })}
                >
                  <div className="job-card-header">
                    {job.company_logo ? (
                      <img
                        src={job.company_logo}
                        alt={job.company}
                        className="job-company-logo"
                        loading="eager"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : (
                      <div className="job-company-initials">
                        {getCompanyInitials(job.company)}
                      </div>
                    )}
                    <div
                      className="job-company-initials"
                      style={{ display: 'none' }}
                    >
                      {getCompanyInitials(job.company)}
                    </div>
                    <h3 className="job-company">{job.company_title}</h3>
                  </div>
                  <div className="job-card-body">
                    <div className="job-row">
                      <span className="job-label">Role:</span>
                      <span className="job-value">{truncateText(job.job_title, 18)}</span>
                    </div>
                    <div className="job-row">
                      <span className={`job-type job-type-${job.role_type === "Tech" ? "tech" : "nontech"}`}>
                        {job.role_type || "Job"}
                      </span>
                      <span className="job-date">
                        <span className="job-label">Drive:</span> {formatDate(job.drive_date)}
                      </span>
                    </div>
                    <div className="job-desc">
                      <span className="job-label">Description: </span>
                      {truncateText(job.job_description, 100)}
                    </div>

                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Footer with original static Recruiter Logos */}
      <footer className="oppo-footer">
        <h3 className="recruiters-title">🤝 Our Recruiters</h3>
        <div className="logos-marquee">
          <Marquee gradient={false} speed={40} className="logos-marquee-track">
            {[aurionpro, cap, tcs, delo, ibm].map((logo, i) => (
              <img
                key={i}
                src={logo}
                alt="Recruiter Logo"
                className="recruiter-logo"
                loading="lazy"
                style={{ marginLeft: "54px" }}
              />
            ))}
          </Marquee>
        </div>
      </footer>
    </div>
  );
};

export default ViewOpportunities;