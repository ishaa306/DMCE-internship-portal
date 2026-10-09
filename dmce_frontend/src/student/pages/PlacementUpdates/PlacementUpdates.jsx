import React, { useState, useEffect } from "react";
import CollegeHeader from "../../../shared/CollegeHeader";
import PlacementForm from "./PlacementForm";
import { placementApi } from "../../../services/placementApi";
import "./PlacementUpdates.css";

const PlacementUpdates = () => {
  const [showForm, setShowForm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [submittedId, setSubmittedId] = useState(null);
  
  const [placements, setPlacements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPlacements = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await placementApi.getPlacements();
      setPlacements(response.data || []);
    } catch (err) {
      console.error("Failed to fetch placements:", err);
      setError("Unable to load placement records. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPlacements();
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
    fetchPlacements(); // Refresh records after submission
    
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
        <h2 className="internship-title">Placement Updates</h2>
        <div className="internship-underline" />
        
        {!showForm && (
          <>
            <p className="internship-description">
              Manage and submit your campus or off-campus placement details for verification.
            </p>

            <div className="internship-actions">
              <button className="add-internship-btn" onClick={handleAddClick}>
                + Add Placement
              </button>
            </div>
            
            {showSuccess && (
              <div className="success-toast fade-in">
                <span className="success-icon">✅</span>
                <div className="success-text">
                  <strong>Placement submitted successfully</strong>
                  <p>Your placement details have been submitted for verification.</p>
                  <p>Status: Pending Verification</p>
                  {submittedId && <p>Placement ID: #{submittedId}</p>}
                </div>
              </div>
            )}

            {isLoading ? (
              <div className="loading-state">
                <p>Loading placement records...</p>
              </div>
            ) : error ? (
              <div className="error-state">
                <p>{error}</p>
                <button className="btn-secondary" onClick={fetchPlacements}>Retry</button>
              </div>
            ) : placements.length === 0 ? (
              <div className="internship-empty-state">
                <div className="empty-icon">📁</div>
                <h3>No Placement Records Found</h3>
                <p>Your submitted placement records will appear here.</p>
              </div>
            ) : (
              <div className="internships-list">
                {placements.map((placement) => (
                  <div key={placement.id} className="internship-record-card fade-in">
                    <div className="record-header">
                      <h3>{placement.company_name}</h3>
                      <span className={`status-badge ${getStatusClass(placement.status)}`}>
                        {formatStatus(placement.status)}
                      </span>
                    </div>
                    
                    <h4 className="record-role">{placement.role}</h4>
                    
                    <div className="record-details">
                      <div className="detail-item">
                        <strong>Placement Type:</strong> {placement.placement_type}
                      </div>
                      <div className="detail-item">
                        <strong>CTC (LPA):</strong> {placement.ctc}
                      </div>
                    </div>

                    <div className="record-documents">
                      <div className="document-status">
                        <strong>Offer Letter</strong>
                        {placement.has_offer_letter === 1 ? (
                          placement.offer_letter_key ? (
                            <div className="document-uploaded">
                              <span className="success-icon">✓</span> Uploaded
                            </div>
                          ) : (
                            <div className="document-missing">Upload Pending</div>
                          )
                        ) : (
                          <div className="document-not-provided">Not provided</div>
                        )}
                      </div>
                    </div>

                    {placement.status === 'rejected' && placement.rejection_reason && (
                      <div className="rejection-reason">
                        <strong>Reason:</strong> {placement.rejection_reason}
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
            <PlacementForm 
              onCancel={handleCancelForm} 
              onSubmitSuccess={handleFormSubmitSuccess} 
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default PlacementUpdates;
