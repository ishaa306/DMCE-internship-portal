import React, { useState } from 'react';
import DocumentViewer from './DocumentViewer';
import { internshipApi } from '../../services/internshipApi';
import './InternshipVerification.css';

const InternshipReview = ({ internship, onBack, onUpdate }) => {
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  if (!internship) return null;

  const handleVerify = async () => {
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      await internshipApi.verifyInternship(internship.id);
      setSuccess('Internship verified successfully.');
      setShowVerifyModal(false);
      if (onUpdate) onUpdate();
    } catch (err) {
      console.error(err);
      if (err.status === 401) {
        setError('Your session has expired. Please log in again.');
      } else if (err.status === 403) {
        setError('You do not have permission to verify internships.');
      } else if (err.status === 404) {
        setError('Internship record not found.');
      } else if (err.status === 409) {
        setError('This internship has already been processed.');
      } else if (err.status === 400) {
        setError(err.message || 'Validation error.');
      } else {
        setError('Unable to update internship status. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    const trimmedReason = rejectionReason.trim();
    if (!trimmedReason) {
      setError('Rejection reason is required.');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      await internshipApi.rejectInternship(internship.id, trimmedReason);
      setSuccess('Internship rejected.');
      setShowRejectModal(false);
      setRejectionReason('');
      if (onUpdate) onUpdate();
    } catch (err) {
      console.error(err);
      if (err.status === 401) {
        setError('Your session has expired. Please log in again.');
      } else if (err.status === 403) {
        setError('You do not have permission to reject internships.');
      } else if (err.status === 404) {
        setError('Internship record not found.');
      } else if (err.status === 409) {
        setError('This internship has already been processed.');
      } else if (err.status === 400) {
        setError(err.message || 'Validation error.');
      } else {
        setError('Unable to update internship status. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="internship-review-container">
      <div className="review-header">
        <button className="back-button" onClick={onBack}>
          &larr; Back to List
        </button>
        <h2>Review Internship Details</h2>
      </div>

      {error && <div className="error-message" style={{ color: '#dc2626', backgroundColor: '#fef2f2', padding: '1rem', border: '1px solid #f87171', borderRadius: '4px', marginBottom: '1rem' }}>{error}</div>}
      {success && <div className="success-message" style={{ color: '#16a34a', backgroundColor: '#f0fdf4', padding: '1rem', border: '1px solid #86efac', borderRadius: '4px', marginBottom: '1rem' }}>{success}</div>}

      <div className="review-content">
        <div className="review-section">
          <h3>Student Information</h3>
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">Student Name</span>
              <span className="info-value">{internship.student_name || 'N/A'}</span>
            </div>
            <div className="info-item">
              <span className="info-label">GR Number</span>
              <span className="info-value">{internship.student_id}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Email</span>
              <span className="info-value">{internship.student_email || 'N/A'}</span>
            </div>
          </div>
        </div>

        <div className="review-section">
          <h3>Internship Information</h3>
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">Company Name</span>
              <span className="info-value">{internship.company_name}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Location</span>
              <span className="info-value">{internship.location}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Role</span>
              <span className="info-value">{internship.role}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Work Mode</span>
              <span className="info-value" style={{ textTransform: 'capitalize' }}>
                {internship.work_mode}
              </span>
            </div>
            <div className="info-item">
              <span className="info-label">Start Date</span>
              <span className="info-value">{internship.start_date}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Duration</span>
              <span className="info-value">{internship.duration}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Incentives</span>
              <span className="info-value">{internship.has_incentives ? 'Yes' : 'No'}</span>
            </div>
            {internship.has_incentives ? (
              <div className="info-item">
                <span className="info-label">Incentive Amount</span>
                <span className="info-value">₹ {internship.incentive_amount}</span>
              </div>
            ) : null}
            <div className="info-item">
              <span className="info-label">Internship Status</span>
              <span className="info-value">
                {internship.is_completed ? 'Completed' : 'Ongoing'}
              </span>
            </div>
          </div>
        </div>

        <div className="review-section">
          <h3>Documents</h3>
          <div className="documents-grid">
            <div className="document-card">
              <div className="document-title">Offer Letter</div>
              {internship.has_offer_letter ? (
                internship.offer_letter_key ? (
                  <DocumentViewer 
                    internshipId={internship.id}
                    docType="offer_letter"
                    title="Offer Letter"
                  />
                ) : (
                  <div className="doc-missing">Upload Pending</div>
                )
              ) : (
                <div className="doc-na">Not provided</div>
              )}
            </div>

            <div className="document-card">
              <div className="document-title">Completion Certificate</div>
              {internship.is_completed ? (
                internship.completion_certificate_key ? (
                  <DocumentViewer 
                    internshipId={internship.id}
                    docType="completion_certificate"
                    title="Completion Certificate"
                  />
                ) : (
                  <div className="doc-missing">Upload Pending</div>
                )
              ) : (
                <div className="doc-na">Not applicable — internship is ongoing</div>
              )}
            </div>
          </div>
        </div>

        <div className="review-section current-status-section">
          <h3>Current Status</h3>
          <div className={`status-badge status-${internship.status}`}>
            {internship.status.toUpperCase()}
          </div>
          {internship.status === 'verified' && internship.verified_by && (
            <div className="audit-box" style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: '#475569' }}>
              <div><strong>Verified by:</strong> {internship.verified_by}</div>
              {internship.verified_at && <div><strong>Verified at:</strong> {new Date(internship.verified_at).toLocaleString()}</div>}
            </div>
          )}
          {internship.status === 'rejected' && (
            <div className="rejection-reason-box">
              <strong>Reason for Rejection:</strong> {internship.rejection_reason}
              {internship.verified_by && (
                <div style={{ marginTop: '0.5rem', fontSize: '0.85rem' }}>
                  <strong>Rejected by:</strong> {internship.verified_by}
                  {internship.verified_at && <div><strong>Rejected at:</strong> {new Date(internship.verified_at).toLocaleString()}</div>}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="review-actions">
          {internship.status === 'pending' && (
            <>
              <button 
                className="btn-reject" 
                onClick={() => { setError(null); setShowRejectModal(true); }}
                disabled={isSubmitting}
              >
                Reject
              </button>
              <button 
                className="btn-verify" 
                onClick={() => { setError(null); setShowVerifyModal(true); }}
                disabled={isSubmitting}
              >
                Verify
              </button>
            </>
          )}
          {internship.status === 'verified' && (
            <div className="status-locked-msg" style={{ color: '#16a34a', fontWeight: '500' }}>✓ Verified</div>
          )}
          {internship.status === 'rejected' && (
            <div className="status-locked-msg" style={{ color: '#dc2626', fontWeight: '500' }}>✕ Rejected</div>
          )}
        </div>
      </div>

      {/* Verify Modal */}
      {showVerifyModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Verify Internship</h3>
            <p>Are you sure you want to verify this internship?</p>
            <div className="modal-details" style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '4px', margin: '1rem 0' }}>
              <div><strong>Student:</strong> {internship.student_name || 'N/A'}</div>
              <div><strong>Company:</strong> {internship.company_name}</div>
              <div><strong>Role:</strong> {internship.role}</div>
            </div>
            <p style={{ fontSize: '0.9rem', color: '#475569' }}>By confirming, this internship will be marked as VERIFIED.</p>
            <div className="modal-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
              <button className="btn-secondary" onClick={() => setShowVerifyModal(false)} disabled={isSubmitting}>Cancel</button>
              <button className="btn-verify" onClick={handleVerify} disabled={isSubmitting}>
                {isSubmitting ? 'Verifying...' : 'Verify Internship'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Reject Internship</h3>
            <p>Please provide a reason for rejecting this internship submission.</p>
            <div style={{ marginTop: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Rejection reason *</label>
              <textarea 
                value={rejectionReason}
                onChange={(e) => { setRejectionReason(e.target.value); setError(null); }}
                style={{ width: '100%', minHeight: '100px', padding: '0.75rem', borderRadius: '4px', border: '1px solid #cbd5e1', resize: 'vertical' }}
                placeholder="Enter rejection reason..."
                disabled={isSubmitting}
              />
            </div>
            <div className="modal-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
              <button className="btn-secondary" onClick={() => setShowRejectModal(false)} disabled={isSubmitting}>Cancel</button>
              <button className="btn-reject" onClick={handleReject} disabled={isSubmitting || !rejectionReason.trim()}>
                {isSubmitting ? 'Rejecting...' : 'Reject Internship'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InternshipReview;
