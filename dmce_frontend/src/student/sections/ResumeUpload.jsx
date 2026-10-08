import React, { useEffect, useState, useRef } from 'react';
import { uploadFileBinary } from './uploadFileBinary';

const ResumeUpload = ({ data, setData }) => {
  const [file, setFile] = useState(null);
  const [filename, setFilename] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const isMobile = window.innerWidth <= 600;

  useEffect(() => {
    if (data?.resume instanceof File) {
      setFile(data.resume);
      setFilename(data.resume.name || data.resumeName || 'Resume file');
      if (data.resumeConfirmed) {
        setSuccess('Resume is ready for upload!');
      }
    } else if (typeof data?.resume_url === 'string' && data.resume_url) {
      setFilename(data.resumeName || 'Resume file');
      setFile(true);
      setSuccess('Resume uploaded!');
    } else {
      setFile(null);
      setFilename('');
      setSuccess('');
    }
  }, [data?.resume, data?.resumeName, data?.resume_url, data?.resumeConfirmed]);

  const handleChange = (e) => {
    const selectedFile = e.target.files[0];
    setError('');
    setSuccess('');
    if (!selectedFile) return;
    const isValidType = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ].includes(selectedFile.type);
    const isValidSize = selectedFile.size <= 350 * 1024;
    if (!isValidType) {
      setError('Only PDF, DOC, or DOCX files are allowed.');
      return;
    }
    if (!isValidSize) {
      setError('File size must be less than 350KB.');
      return;
    }
    setFile(selectedFile);
    setFilename(selectedFile.name);
    setData(prev => ({ ...prev, resume: selectedFile, resumeName: selectedFile.name, resume_url: undefined }));
    setSuccess('Resume selected successfully!');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUploadResume = async () => {
    setError('');
    setSuccess('');
    if (!(file instanceof File)) {
      setError('Please select a valid resume file first.');
      return;
    }
    setUploading(true);
    try {
      const url = await uploadFileBinary(file, 'resume');
      setData(prev => ({
        ...prev,
        resume_url: url,
        resume: null,
        resumeName: filename,
        resumeConfirmed: true
      }));
      setSuccess('Resume uploaded successfully!');
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (err) {
      setError(err.message || 'Failed to upload resume.');
    } finally {
      setUploading(false);
    }
  };

  const styles = {
    container: {
      background: '#fff',
      padding: isMobile ? '20px' : '30px',
      borderRadius: '12px',
      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
      border: '1px solid #ccc',
      maxWidth: '600px',
      width: '100%',
      margin: '30px auto',
      textAlign: 'center',
      maxHeight: 'calc(100vh - 100px)',
      overflowY: 'auto'
    },
    header: {
      backgroundColor: '#1e1e3f',
      color: 'white',
      padding: isMobile ? '10px 15px' : '12px 20px',
      borderRadius: '8px 8px 0 0',
      fontSize: isMobile ? '16px' : '18px',
      marginBottom: isMobile ? '15px' : '25px'
    },
    uploadBox: {
      width: isMobile ? '220px' : '280px',
      minHeight: isMobile ? '120px' : '150px',
      border: '3px dashed #1e3a8a',
      borderRadius: '12px',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      margin: '0 auto 15px auto',
      backgroundColor: '#f0f4ff',
      padding: '10px',
      fontSize: isMobile ? '14px' : '15px',
      color: '#000',
      position: 'relative',
      flexDirection: 'column'
    },
    filename: {
      wordBreak: 'break-word',
      maxWidth: '100%',
      display: 'block',
      fontWeight: '500'
    },
    successBadge: {
      position: 'absolute',
      top: '8px',
      right: '8px',
      backgroundColor: 'rgba(16,185,129,0.85)',
      color: 'white',
      padding: '4px 10px',
      borderRadius: '12px',
      fontSize: '12px',
      fontWeight: 'bold',
      zIndex: 2,
      boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
    },
    noFileText: {
      color: '#999'
    },
    fileInputLabel: {
      cursor: 'pointer',
      backgroundColor: '#1e3a8a',
      color: '#fff',
      padding: isMobile ? '8px 18px' : '10px 22px',
      borderRadius: '10px',
      fontWeight: 'bold',
      fontSize: isMobile ? '14px' : '15px',
      marginBottom: '10px',
      display: 'inline-block',
      touchAction: 'manipulation',
      userSelect: 'none',
      WebkitTapHighlightColor: 'transparent',
    },
    errorText: {
      color: 'red',
      marginTop: '8px',
      fontSize: isMobile ? '12px' : '14px',
      fontWeight: '500'
    },
    successText: {
      color: '#059669',
      marginTop: '8px',
      fontSize: isMobile ? '12px' : '14px',
      fontWeight: '600'
    },
    helpText: {
      fontSize: isMobile ? '12px' : '14px',
      color: '#444',
      marginTop: '6px'
    },
    formatText: {
      fontSize: isMobile ? '12px' : '14px',
      color: 'red',
      marginTop: '4px'
    },
    uploadButton: {
      cursor: file ? 'pointer' : 'not-allowed',
      backgroundColor: file ? '#1e3a8a' : '#888',
      color: '#fff',
      padding: isMobile ? '8px 24px' : '10px 32px',
      borderRadius: '10px',
      fontWeight: 'bold',
      fontSize: isMobile ? '14px' : '15px',
      border: 'none',
      marginTop: '18px',
      transition: 'background-color 0.3s ease',
      touchAction: 'manipulation',
      WebkitTapHighlightColor: 'transparent',
    },
    downloadLink: {
      marginTop: '10px',
      display: 'inline-block',
      color: '#2563eb',
      fontWeight: 'bold',
      textDecoration: 'underline',
      fontSize: isMobile ? '13px' : '15px',
      wordBreak: 'break-word'
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        Upload Resume  <span style={{ color: 'red' }}>*</span>
      </div>
      <div style={styles.uploadBox}>
        {(filename || data?.resume_url) && data?.resumeConfirmed && (
          <div style={styles.successBadge}>Confirmed ✓</div>
        )}
        {data?.resume_url ? (
          <div>
            <div style={styles.filename}>
              {filename || 'Resume file'}
            </div>
            {/* Download/View link for uploaded resume */}
            <a
              href={data.resume_url}
              target="_blank"
              rel="noopener noreferrer"
              style={styles.downloadLink}
            >
              View/Download Resume
            </a>
          </div>
        ) : filename ? (
          <div style={styles.filename}>{filename}</div>
        ) : (
          <span style={styles.noFileText}>No Resume Selected</span>
        )}
      </div>
      <input
        type="file"
        accept=".pdf,.doc,.docx"
        onChange={handleChange}
        style={{ display: 'none' }}
        aria-label="Choose resume file"
        id="resumeInput"
        ref={fileInputRef}
      />
      <label htmlFor="resumeInput" style={styles.fileInputLabel}>
        Choose Resume
      </label>
      {error && (<p style={styles.errorText}>{error}</p>)}
      {success && (<p style={styles.successText}>{success}</p>)}
      <p style={styles.helpText}>
        Upload your resume. Max size: <strong>350KB</strong>
      </p>
      <p style={styles.formatText}>
        Accepted formats: <strong>.pdf</strong>, <strong>.doc</strong>, <strong>.docx</strong>
      </p>
      <button
        onClick={handleUploadResume}
        disabled={!file || uploading}
        style={{
          ...styles.uploadButton,
          backgroundColor: (!file || uploading) ? '#888' : '#1e3a8a',
          cursor: (!file || uploading) ? 'not-allowed' : 'pointer'
        }}
      >
        {uploading ? 'Uploading...' : 'Upload Now'}
      </button>
    </div>
  );
};

export default ResumeUpload;