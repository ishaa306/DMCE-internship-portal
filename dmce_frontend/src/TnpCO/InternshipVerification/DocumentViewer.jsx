import React, { useState, useEffect } from 'react';
import { internshipApi } from '../../services/internshipApi';
import './InternshipVerification.css';

const DocumentViewer = ({ internshipId, docType, title }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [docUrl, setDocUrl] = useState(null);
  const [contentType, setContentType] = useState(null);
  const [showViewer, setShowViewer] = useState(false);

  useEffect(() => {
    // Cleanup blob url on unmount or when url changes
    return () => {
      if (docUrl) {
        URL.revokeObjectURL(docUrl);
      }
    };
  }, [docUrl]);

  const handleViewDocument = async () => {
    setLoading(true);
    setError(null);
    try {
      let response;
      if (docType === 'offer_letter') {
        response = await internshipApi.downloadOfferLetter(internshipId);
      } else if (docType === 'completion_certificate') {
        response = await internshipApi.downloadCompletionCertificate(internshipId);
      }
      
      const blob = response.blob;
      const type = response.contentType || blob.type;
      setContentType(type);
      
      const objectUrl = URL.createObjectURL(blob);
      setDocUrl(objectUrl);
      setShowViewer(true);
    } catch (err) {
      console.error(`Error loading ${docType}:`, err);
      if (err.status === 401) {
        setError("Your session has expired. Please log in again.");
      } else if (err.status === 403) {
        setError("You do not have permission to access this document.");
      } else if (err.status === 404) {
        setError("Document not found.");
      } else {
        setError("Unable to load document. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!docUrl) return;
    const a = document.createElement('a');
    a.href = docUrl;
    // Fallback extension if we can't figure it out perfectly
    const ext = contentType?.includes('pdf') ? 'pdf' : contentType?.includes('image') ? 'jpg' : 'doc';
    a.download = `${title.replace(/\s+/g, '_')}_${internshipId}.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const isPreviewable = contentType && (contentType.includes('pdf') || contentType.includes('image'));

  return (
    <div className="document-viewer-container">
      {!showViewer ? (
        <div className="document-actions">
          <button 
            className="btn-download" 
            onClick={handleViewDocument}
            disabled={loading}
          >
            {loading ? "Loading document..." : "View Document"}
          </button>
          {error && <div className="doc-error">{error}</div>}
        </div>
      ) : (
        <div className="document-preview-area">
          <div className="document-preview-header">
            <h4>{title}</h4>
            <div className="document-preview-actions">
              <button className="btn-secondary" onClick={handleDownload}>
                Download
              </button>
              <button className="btn-secondary" onClick={() => setShowViewer(false)}>
                Close
              </button>
            </div>
          </div>
          
          <div className="document-preview-content">
            {isPreviewable ? (
              contentType.includes('pdf') ? (
                <iframe 
                  src={docUrl} 
                  title={title} 
                  className="pdf-viewer"
                  frameBorder="0"
                />
              ) : (
                <img src={docUrl} alt={title} className="image-viewer" />
              )
            ) : (
              <div className="no-preview">
                <p>Preview is not available for this file type.</p>
                <button className="btn-download" onClick={handleDownload}>
                  Download Document
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentViewer;
