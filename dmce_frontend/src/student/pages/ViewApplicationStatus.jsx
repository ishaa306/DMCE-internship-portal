import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaSync, FaExclamationCircle } from "react-icons/fa";
import CollegeHeader from "../../shared/CollegeHeader";
import './ViewApplicationStatus.css';

const ViewApplicationStatus = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchApplicationStatus();
  }, []);

  const fetchApplicationStatus = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(
        'https://placement-portal-backend.ramshekade20.workers.dev/api/student/application-status',
        { withCredentials: true }
      );

      if (response.data && response.data.success) {
        setApplications(response.data.result || []);
      } else {
        throw new Error(response.data?.message || 'Failed to fetch application status');
      }
    } catch (error) {
      console.error('Error fetching application status:', error);
      setError(error.response?.data?.message || 'Unable to load your applications. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

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

  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case "applied":
        return "status-badge status-underreview";
      case "selected":
      case "approved":
      case "accepted":
        return "status-badge status-selected";
      case "rejected":
      case "declined":
        return "status-badge status-rejected";
      case "pending":
        return "status-badge status-pending";
      case "interview scheduled":
        return "status-badge status-interview";
      default:
        return "status-badge";
    }
  };

  const getReadableStatus = (status) => {
    if (!status) return "Unknown";

    // Capitalize first letter of each word
    return status.split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  return (
    <div className="status-page">
      <CollegeHeader />
      <div className="status-container">
        <div className="status-header">
          <h2 className="status-title">My Applications</h2>
          <button
            className="status-refresh-btn"
            onClick={fetchApplicationStatus}
            disabled={loading}
          >
            <FaSync className={loading ? "rotating" : ""} />
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {error && (
          <div className="status-error">
            <FaExclamationCircle />
            <p>{error}</p>
            <button onClick={fetchApplicationStatus}>Try Again</button>
          </div>
        )}

        {!error && applications.length === 0 && !loading && (
          <div className="status-empty">
            <div className="status-empty-icon">📋</div>
            <h3>No Applications Found</h3>
            <p>You haven't applied to any positions yet. Browse available opportunities and start applying!</p>
          </div>
        )}

        {!error && applications.length > 0 && (
          <div className="status-table-wrapper">
            <table className="status-table">
              <thead>
                <tr>
                  <th>Company</th>
                  <th>Type</th>
                  <th>Position</th>
                  <th>Date Applied</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app, index) => (
                  <tr key={index}>
                    <td>{app.company_title}</td>
                    <td>{app.role_type}</td>
                    <td>{app.job_title}</td>
                    <td>{formatDate(app.applied_at)}</td>
                    <td>
                      <span className={getStatusClass(app.application_status)}>
                        {getReadableStatus(app.application_status)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {loading && (
          <div className="status-loading">
            <div className="status-spinner"></div>
            <p>Loading your applications...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewApplicationStatus;