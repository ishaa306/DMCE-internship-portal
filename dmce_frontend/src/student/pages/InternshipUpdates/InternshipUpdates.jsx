import React, { useState, useEffect } from "react";
import CollegeHeader from "../../../shared/CollegeHeader";
import InternshipForm from "./InternshipForm";
import { internshipApi } from "../../../services/internshipApi";
import "./InternshipUpdates.css";

const InternshipUpdates = () => {
  const [showForm, setShowForm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [submittedId, setSubmittedId] = useState(null);
  
  const [internships, setInternships] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploadingId, setUploadingId] = useState(null);

  const handleUploadCertificate = async (internshipId, file) => {
    if (!file) return;
    setUploadingId(internshipId);
    setError(null);
    try {
      await internshipApi.uploadCompletionCertificate(internshipId, file);
      fetchInternships();
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 5000);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to upload certificate. Please try again.");
    } finally {
      setUploadingId(null);
    }
  };

  const fetchInternships = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await internshipApi.getInternships();
      setInternships(response.data || []);
    } catch (err) {
      console.error("Failed to fetch internships:", err);
      setError("Unable to load internship records. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInternships();
  }, []);

  const handleAddClick = () => {
    setShowForm(true);
    setShowSuccess(false);
    setSubmittedId(null);
  };

  const handleCancelForm = () => {
    setShowForm(false);
  };

  const handleFormSubmitSuccess = (data) => {
    setShowForm(false);
    setShowSuccess(true);
    setSubmittedId(data?.id);
    fetchInternships(); // Refresh records after submission
    
    // Auto-hide success message after 8 seconds
    setTimeout(() => {
      setShowSuccess(false);
    }, 8000);
  };

  const formatStatus = (status) => {
    if (status === 'verified') return 'Verified';
    if (status === 'rejected') return 'Rejected';
    return 'Pending Verification';
  };

  const getStatusClass = (status) => {
    if (status === 'verified') return 'status-verified';
    if (status === 'rejected') return 'status-rejected';
    return 'status-pending';
  };

  return (
    <div className="internship-updates-page">
      <CollegeHeader />

      <div className="internship-main">
        <h2 className="internship-title">Internship Updates</h2>
        <div className="internship-underline" />
        
        {!showForm && (
          <>
            <p className="internship-description">
              Manage and submit your internship details for placement verification.
            </p>

            <div className="internship-actions">
              <button className="add-internship-btn" onClick={handleAddClick}>
                + Add Internship
              </button>
            </div>
            
            {showSuccess && (
              <div className="success-toast fade-in">
                <span className="success-icon">✅</span>
                <div className="success-text">
                  <strong>Internship submitted successfully</strong>
                  <p>Your internship details have been submitted for verification.</p>
                  <p>Status: Pending Verification</p>
                  {submittedId && <p>Internship ID: #{submittedId}</p>}
                </div>
              </div>
            )}

            {isLoading ? (
              <div className="loading-state">
                <p>Loading internship records...</p>
              </div>
            ) : error ? (
              <div className="error-state">
                <p>{error}</p>
                <button className="btn-secondary" onClick={fetchInternships}>Retry</button>
              </div>
            ) : internships.length === 0 ? (
              <div className="internship-empty-state">
                <div className="empty-icon">📁</div>
                <h3>No Internship Records Found</h3>
                <p>Your submitted internship records will appear here.</p>
              </div>
            ) : (
              <div className="internships-list">
                {internships.map((internship) => (
                  <div key={internship.id} className="internship-record-card fade-in">
                    <div className="record-header">
                      <h3>{internship.company_name}</h3>
                      <span className={`status-badge ${getStatusClass(internship.status)}`}>
                        {formatStatus(internship.status)}
                      </span>
                    </div>
                    
                    <h4 className="record-role">{internship.role}</h4>
                    
                    <div className="record-details">
                      <div className="detail-item">
                        <strong>Location:</strong> {internship.location}
                      </div>
                      <div className="detail-item">
                        <strong>Work Mode:</strong> {internship.work_mode.charAt(0).toUpperCase() + internship.work_mode.slice(1)}
                      </div>
                      <div className="detail-item">
                        <strong>Start Date:</strong> {internship.start_date}
                      </div>
                      <div className="detail-item">
                        <strong>Duration:</strong> {internship.duration}
                      </div>
                    </div>

                    <div className="record-documents">
                      <div className="document-status">
                        <strong>Offer Letter</strong>
                        {internship.has_offer_letter === 1 ? (
                          internship.offer_letter_key ? (
                            <div className="document-uploaded">
                              <span className="success-icon">✓</span> Uploaded
                              <br />
                              <a 
                                href={`${import.meta.env.VITE_INTERNSHIP_API_URL || 'http://localhost:8787'}/api/internships/${internship.id}/offer-letter`} 
                                target="_blank" 
                                rel="noreferrer"
                                className="document-link"
                              >
                                View Document
                              </a>
                            </div>
                          ) : (
                            <div className="document-missing">Upload Pending</div>
                          )
                        ) : (
                          <div className="document-not-provided">Not provided</div>
                        )}
                      </div>

                      <div className="document-status">
                        <strong>Completion Certificate</strong>
                        {internship.completion_certificate_key ? (
                          <div className="document-uploaded">
                            <span className="success-icon">✓</span> Uploaded
                            <br />
                            <a 
                              href={`${import.meta.env.VITE_INTERNSHIP_API_URL || 'http://localhost:8787'}/api/internships/${internship.id}/completion-certificate`} 
                              target="_blank" 
                              rel="noreferrer"
                              className="document-link"
                            >
                              View Document
                            </a>
                          </div>
                        ) : (
                          <div className={internship.is_completed === 1 ? "document-missing" : "document-not-provided"}>
                            {internship.is_completed === 1 ? "Upload Pending" : "Internship ongoing"}
                            <div style={{ marginTop: '8px' }}>
                              <label className="add-internship-btn" style={{ cursor: uploadingId === internship.id ? 'wait' : 'pointer', display: 'inline-block', padding: '4px 8px', fontSize: '0.85rem', width: 'auto' }}>
                                {uploadingId === internship.id ? "Uploading..." : "Upload Now"}
                                <input
                                  type="file"
                                  style={{ display: 'none' }}
                                  accept=".pdf,.jpg,.jpeg,.png"
                                  disabled={uploadingId === internship.id}
                                  onChange={(e) => handleUploadCertificate(internship.id, e.target.files[0])}
                                />
                              </label>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {internship.status === 'rejected' && internship.rejection_reason && (
                      <div className="rejection-reason">
                        <strong>Reason:</strong> {internship.rejection_reason}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {showForm && (
          <div className="fade-in">
            <InternshipForm 
              onCancel={handleCancelForm} 
              onSubmitSuccess={handleFormSubmitSuccess} 
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default InternshipUpdates;
