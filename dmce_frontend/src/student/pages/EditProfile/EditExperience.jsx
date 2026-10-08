import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaBuilding, FaTrash, FaPlus, FaSave, FaLock, FaExclamationTriangle, FaCheckCircle, FaInfoCircle, FaLink } from 'react-icons/fa';
import { Section } from "./EditProfileHelpers";


// API endpoint
const API_ENDPOINT = "https://placement-portal-backend.ramshekade20.workers.dev/api/student/profile/update/experience";

// Responsive style hook
const useResponsive = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 700);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 700);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return isMobile;
};

const EditExperience = () => {
  const [editData, setEditData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [saving, setSaving] = useState(false);
  const [originalExperiences, setOriginalExperiences] = useState([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [validation, setValidation] = useState({});
  const [hoverState, setHoverState] = useState({
    addButton: false,
    saveButton: false,
    removeButtons: {}
  });

  const isMobile = useResponsive();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(
          "https://placement-portal-backend.ramshekade20.workers.dev/api/student/profile/view",
          { withCredentials: true }
        );

        setEditData(res.data.profile);

        // Store original experiences for locking
        setOriginalExperiences(res.data.profile.internships || []);
      } catch (err) {
        console.error("Failed to fetch profile:", err);
        setMsg({ type: 'error', text: "Failed to load profile" });
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  // Check if experience is from original data
  const isOriginalExperience = (idx) => {
    return idx < originalExperiences.length;
  };

  // Validate URL format
  const isValidUrl = (url) => {
    if (!url) return true; // Empty is valid (not required)
    try {
      const parsed = new URL(url);
      return ['http:', 'https:'].includes(parsed.protocol);
    } catch {
      return false;
    }
  };

  // Validate date range (start date must be before end date)
  const isValidDateRange = (startDate, endDate) => {
    if (!startDate || !endDate) return true;
    return new Date(startDate) <= new Date(endDate);
  };

  const calculateDuration = (start, end, currentlyWorking) => {
    if (!start) return '';
    const startDate = new Date(start);
    const endDate = currentlyWorking || !end ? new Date() : new Date(end);
    if (endDate < startDate) return '';

    let years = endDate.getFullYear() - startDate.getFullYear();
    let months = endDate.getMonth() - startDate.getMonth();

    if (months < 0) {
      years--;
      months += 12;
    }

    let durationStr = '';
    if (years > 0) durationStr += `${years} year${years > 1 ? 's' : ''} `;
    if (months > 0) durationStr += `${months} month${months > 1 ? 's' : ''}`;

    return durationStr.trim() || 'Less than a month';
  };

  // Form validation
  const validateExperiences = () => {
    const errors = {};
    let isValid = true;

    // Check if experiences exist
    if (!editData.internships || editData.internships.length === 0) {
      return { isValid, errors };
    }

    // Validate each experience
    editData.internships.forEach((experience, idx) => {
      // Skip validation for locked experiences
      if (isOriginalExperience(idx)) {
        return;
      }

      const expErrors = {};

      // Required fields validation
      if (!experience.title || experience.title.trim() === '') {
        expErrors.title = 'Title is required';
        isValid = false;
      }

      if (!experience.company || experience.company.trim() === '') {
        expErrors.company = 'Company name is required';
        isValid = false;
      }

      if (!experience.employmentType || experience.employmentType.trim() === '') {
        expErrors.employmentType = 'Employment type is required';
        isValid = false;
      }

      if (!experience.location || experience.location.trim() === '') {
        expErrors.location = 'Location is required';
        isValid = false;
      }

      if (!experience.locationType || experience.locationType.trim() === '') {
        expErrors.locationType = 'Location type is required';
        isValid = false;
      }

      if (!experience.startDate) {
        expErrors.startDate = 'Start date is required';
        isValid = false;
      }

      // End date is required unless currently working
      if (!experience.currentlyWorking && !experience.endDate) {
        expErrors.endDate = 'End date is required if not currently working';
        isValid = false;
      }

      // Date range validation
      if (experience.startDate && experience.endDate && !experience.currentlyWorking) {
        if (!isValidDateRange(experience.startDate, experience.endDate)) {
          expErrors.endDate = 'End date must be after start date';
          isValid = false;
        }
      }

      // URL format validation (if provided)
      if (experience.mediaLink && !isValidUrl(experience.mediaLink)) {
        expErrors.mediaLink = 'Please enter a valid URL';
        isValid = false;
      }

      if (Object.keys(expErrors).length > 0) {
        errors[idx] = expErrors;
      }
    });

    return { isValid, errors };
  };

  const handleArrayFieldChange = (idx, field, value) => {
    // Don't allow changes to original experiences
    if (isOriginalExperience(idx)) {
      return;
    }

    // Clear validation error when field is edited
    if (validation[idx] && validation[idx][field]) {
      const newValidation = { ...validation };
      if (newValidation[idx]) {
        delete newValidation[idx][field];
        if (Object.keys(newValidation[idx]).length === 0) {
          delete newValidation[idx];
        }
      }
      setValidation(newValidation);
    }

    // Clear message when form is edited
    if (msg.text) {
      setMsg({ type: '', text: '' });
    }

    setEditData(prev => {
      const updatedArray = prev.internships ? [...prev.internships] : [];
      updatedArray[idx] = { ...updatedArray[idx], [field]: value };

      // Update duration if date fields changed
      if (['startDate', 'endDate', 'currentlyWorking'].includes(field)) {
        updatedArray[idx].duration = calculateDuration(
          updatedArray[idx].startDate,
          updatedArray[idx].endDate,
          field === 'currentlyWorking' ? value : updatedArray[idx].currentlyWorking
        );
      }

      // Clear end date if currently working
      if (field === 'currentlyWorking' && value === true) {
        updatedArray[idx].endDate = '';

        // Clear end date validation error if exists
        if (validation[idx] && validation[idx].endDate) {
          const newValidation = { ...validation };
          delete newValidation[idx].endDate;
          if (Object.keys(newValidation[idx]).length === 0) {
            delete newValidation[idx];
          }
          setValidation(newValidation);
        }
      }

      return { ...prev, internships: updatedArray };
    });

    setHasChanges(true);
  };

  const handleAddItem = () => {
    if (!editData.internships || editData.internships.length < 3) {
      setEditData(prev => ({
        ...prev,
        internships: prev.internships
          ? [...prev.internships, {
            title: '',
            employmentType: '',
            company: '',
            currentlyWorking: false,
            startDate: '',
            endDate: '',
            location: '',
            locationType: '',
            description: '',
            mediaLink: '',
            duration: ''
          }]
          : [{
            title: '',
            employmentType: '',
            company: '',
            currentlyWorking: false,
            startDate: '',
            endDate: '',
            location: '',
            locationType: '',
            description: '',
            mediaLink: '',
            duration: ''
          }]
      }));
      setHasChanges(true);

      // Clear any message
      if (msg.text) {
        setMsg({ type: '', text: '' });
      }

      // Scroll to the new item after it's added
      setTimeout(() => {
        const experienceElements = document.querySelectorAll('[data-experience-item]');
        const lastExperience = experienceElements[experienceElements.length - 1];
        if (lastExperience) {
          lastExperience.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    } else {
      setMsg({ type: 'error', text: "Maximum 3 experiences allowed" });
      setTimeout(() => setMsg({ type: '', text: '' }), 3000);
    }
  };

  const handleRemoveItem = (idx) => {
    // Don't allow removal of original experiences
    if (isOriginalExperience(idx)) {
      setMsg({ type: 'error', text: "Original experiences cannot be removed" });
      return;
    }

    setEditData(prev => {
      const updatedArray = prev.internships ? [...prev.internships] : [];
      updatedArray.splice(idx, 1);
      return { ...prev, internships: updatedArray };
    });

    // Clear validation errors for this experience
    if (validation[idx]) {
      const newValidation = { ...validation };
      delete newValidation[idx];
      setValidation(newValidation);
    }

    setHasChanges(true);

    // Clear any message
    if (msg.text) {
      setMsg({ type: '', text: '' });
    }
  };

  const handleSave = async () => {
    // Validate experiences before saving
    const { isValid, errors } = validateExperiences();

    if (!isValid) {
      setValidation(errors);
      setMsg({
        type: 'error',
        text: "Please fix the validation errors before saving"
      });

      // Scroll to the first experience with errors
      const firstErrorIdx = Object.keys(errors)[0];
      if (firstErrorIdx) {
        const errorElement = document.querySelector(`[data-experience-item="${firstErrorIdx}"]`);
        if (errorElement) {
          errorElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }

      return;
    }

    setSaving(true);
    setMsg({ type: '', text: '' });

    try {
      const formData = new FormData();
      formData.append('internships', JSON.stringify(editData.internships || []));

      // Use the correct API endpoint for experience updates
      const response = await axios.post(
        API_ENDPOINT,
        formData,
        {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" }
        }
      );

      console.log("API Response:", response.data);

      if (response.data && response.data.success) {
        // Update original experiences after successful save
        setOriginalExperiences(editData.internships || []);
        setMsg({ type: 'success', text: response.data.message || "Work experience updated successfully!" });
        setHasChanges(false);
      } else {
        setMsg({ type: 'error', text: response.data.error || "Failed to update work experience" });
      }
    } catch (error) {
      console.error("Failed to update experience:", error);

      // Extract error message
      let errorText = "Failed to update. Please try again.";
      let errorDetails = "";

      if (error.response && error.response.data) {
        errorText = error.response.data.error || errorText;
        errorDetails = error.response.data.details || "";
      }

      // Check for specific database errors
      if (errorDetails && errorDetails.includes("D1_ERROR")) {
        errorText = "There was a database error. Please try again later.";
      }

      setMsg({ type: 'error', text: errorText });
    } finally {
      setSaving(false);
    }
  };

  // Responsive styles
  const containerStyle = {
    background: '#fff',
    padding: isMobile ? '15px' : '30px',
    borderRadius: '12px',
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
    border: '1px solid #ccc',
    maxWidth: '1300px',
    margin: '0 auto'
  };

  const headerStyle = {
    backgroundColor: '#1e1e3f',
    color: 'white',
    padding: isMobile ? '10px 15px' : '12px 20px',
    borderRadius: '8px 8px 0 0',
    fontSize: isMobile ? '16px' : '18px',
    marginBottom: isMobile ? '15px' : '25px',
    fontWeight: '600',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  };

  const inputStyle = (hasError) => ({
    width: '100%',
    padding: isMobile ? '8px 10px' : '10px 12px',
    borderRadius: '6px',
    border: hasError ? '1px solid #dc2626' : '1px solid #ccc',
    fontSize: isMobile ? '14px' : '16px',
    color: '#000',
    backgroundColor: hasError ? '#fff2f0' : '#fff',
    boxSizing: 'border-box'
  });

  const lockedInputStyle = {
    width: '100%',
    padding: isMobile ? '8px 10px' : '10px 12px',
    borderRadius: '6px',
    border: '1px dashed #ccc',
    fontSize: isMobile ? '14px' : '16px',
    color: '#000',
    backgroundColor: '#e9ecef',
    boxSizing: 'border-box',
    cursor: 'not-allowed',
    opacity: 0.8
  };

  const labelStyle = {
    marginBottom: isMobile ? '4px' : '6px',
    fontWeight: '600',
    fontSize: isMobile ? '14px' : '16px',
    color: '#1e1e3f'
  };

  const cardStyle = (isLocked, hasError) => ({
    backgroundColor: hasError ? '#fff2f0' : (isLocked ? '#f5f5f9' : '#f0f4ff'),
    borderRadius: '10px',
    padding: isMobile ? '15px' : '20px',
    boxShadow: isLocked ? '0 2px 6px rgba(30, 30, 63, 0.07)' : '0 4px 10px rgba(30, 30, 63, 0.1)',
    marginBottom: isMobile ? '15px' : '20px',
    position: 'relative',
    border: hasError ? '1px solid #dc2626' : (isLocked ? '1px dashed #ccc' : '1px solid #dde5ff')
  });

  const buttonStyle = {
    padding: isMobile ? '8px 16px' : '10px 20px',
    backgroundColor: '#1e1e3f',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 'bold',
    transition: 'background-color 0.3s',
    fontSize: isMobile ? '14px' : '16px'
  };

  const removeButtonStyle = {
    position: 'absolute',
    top: isMobile ? '10px' : '15px',
    right: isMobile ? '8px' : '15px',
    padding: isMobile ? '4px 10px' : '5px 10px',
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: isMobile ? '10px' : '12px',
    fontWeight: 'bold'
  };

  const lockedBadgeStyle = {
    position: 'absolute',
    top: isMobile ? '10px' : '15px',
    right: isMobile ? '10px' : '15px',
    padding: isMobile ? '4px 8px' : '5px 10px',
    backgroundColor: 'rgba(255, 193, 7, 0.2)',
    color: '#eab308',
    border: '1px solid rgba(255, 193, 7, 0.3)',
    borderRadius: '4px',
    fontSize: isMobile ? '10px' : '12px',
    fontWeight: 'bold',
    display: 'flex',
    alignItems: 'center',
    gap: '5px'
  };

  const messageStyle = (type) => ({
    padding: isMobile ? '10px 15px' : '12px 20px',
    backgroundColor: type === 'success' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
    border: `1px solid ${type === 'success' ? '#10b981' : '#ef4444'}`,
    color: type === 'success' ? '#059669' : '#b91c1c',
    borderRadius: '6px',
    marginTop: '20px',
    textAlign: 'center',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    maxWidth: isMobile ? '100%' : '500px',
    marginLeft: 'auto',
    marginRight: 'auto',
    fontSize: isMobile ? '14px' : '16px'
  });

  const footerStyle = {
    fontSize: '12px',
    color: '#64748b',
    textAlign: 'center',
    marginTop: '25px',
    padding: '10px 0',
    borderTop: '1px solid #f1f5f9'
  };

  // Error message style
  const errorTextStyle = {
    color: '#dc2626',
    fontSize: '12px',
    marginTop: '4px',
    marginBottom: '4px'
  };

  // Help text style
  const helpTextStyle = {
    color: '#64748b',
    fontSize: '12px',
    marginTop: '4px',
    fontStyle: 'italic'
  };

  // Responsive grid styles
  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: isMobile ? '10px' : '15px',
    marginBottom: isMobile ? '10px' : '15px'
  };

  // Info container style
  const infoContainerStyle = {
    marginBottom: isMobile ? '15px' : '20px',
    padding: isMobile ? '12px' : '15px',
    backgroundColor: '#f0f9ff',
    borderRadius: '10px',
    border: '1px solid #bae6fd',
    display: 'flex',
    alignItems: 'flex-start',
    gap: '10px'
  };

  // Show loading state
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '200px',
        flexDirection: 'column',
        gap: '15px'
      }}>
        <div style={{
          width: isMobile ? '30px' : '40px',
          height: isMobile ? '30px' : '40px',
          border: `${isMobile ? '3px' : '4px'} solid rgba(30,30,63,0.1)`,
          borderRadius: '50%',
          borderTop: `${isMobile ? '3px' : '4px'} solid #1e1e3f`,
          animation: 'spin 1s linear infinite'
        }}></div>
        <div style={{ color: '#64748b', fontWeight: '600', fontSize: isMobile ? '14px' : '16px' }}>Loading experience details...</div>
      </div>
    );
  }

  if (!editData) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '200px',
        flexDirection: 'column',
        gap: '15px'
      }}>
        <FaExclamationTriangle size={isMobile ? 30 : 40} color="#ef4444" />
        <div style={{ color: '#64748b', fontWeight: '600', fontSize: isMobile ? '14px' : '16px' }}>Failed to load profile data</div>
      </div>
    );
  }

  const experiences = editData.internships || [];

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '7px' : '10px' }}>
          <FaBuilding size={isMobile ? 14 : 16} />
          <span>Work Experience</span>
        </div>
      </div>

      <div style={infoContainerStyle}>
        <FaInfoCircle size={18} color="#0284c7" style={{ marginTop: 2 }} />
        <div style={{ fontSize: isMobile ? '0.85rem' : '0.9rem', color: '#0c4a6e' }}>
          Add your relevant work experiences to highlight your professional background. Include internships, part-time jobs, or full-time positions related to your field of study.
        </div>
      </div>

      <div style={{ marginBottom: isMobile ? '20px' : '30px' }}>
        {experiences.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: isMobile ? '30px 15px' : '40px 20px',
            color: '#666',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            border: '2px dashed #dee2e6'
          }}>
            <p style={{ margin: '0 0 15px 0', fontSize: isMobile ? '10px' : '12px' }}>
              No work experience added yet
            </p>
            <p style={{ margin: '0', fontSize: isMobile ? '12px' : '14px' }}>
              Click "Add Experience" to get started
            </p>
          </div>
        )}

        {experiences.map((exp, idx) => {
          const isLocked = isOriginalExperience(idx);
          const hasErrors = validation[idx] && Object.keys(validation[idx]).length > 0;

          return (
            <div
              key={idx}
              style={cardStyle(isLocked, hasErrors)}
              data-experience-item={idx}
            >
              {isLocked ? (
                <div style={lockedBadgeStyle}>
                  <FaLock size={isMobile ? 8 : 10} /> Locked
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => handleRemoveItem(idx)}
                  style={{
                    ...removeButtonStyle,
                    backgroundColor: hoverState.removeButtons[idx] ? '#c82333' : '#dc3545'
                  }}
                  onMouseEnter={() => setHoverState(prev => ({
                    ...prev,
                    removeButtons: { ...prev.removeButtons, [idx]: true }
                  }))}
                  onMouseLeave={() => setHoverState(prev => ({
                    ...prev,
                    removeButtons: { ...prev.removeButtons, [idx]: false }
                  }))}
                  title="Remove this experience"
                >
                  {isMobile ? <FaTrash size={10} /> : 'Remove'}
                </button>
              )}

              <div style={{ marginBottom: isMobile ? '12px' : '15px', paddingTop: isMobile ? '15px' : 0 }}>
                <label style={labelStyle}>
                  Title <span style={{ color: 'red' }}>*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  placeholder="Job or Internship Title"
                  value={exp?.title || ''}
                  onChange={(e) => handleArrayFieldChange(idx, "title", e.target.value)}
                  disabled={isLocked}
                  required
                  style={isLocked ? lockedInputStyle : inputStyle(validation[idx]?.title)}
                />
                {validation[idx]?.title && (
                  <div style={errorTextStyle}>{validation[idx].title}</div>
                )}
              </div>

              <div style={{ marginBottom: isMobile ? '12px' : '15px' }}>
                <label style={labelStyle}>
                  Employment Type <span style={{ color: 'red' }}>*</span>
                </label>
                <select
                  name="employmentType"
                  value={exp?.employmentType || ''}
                  onChange={(e) => handleArrayFieldChange(idx, "employmentType", e.target.value)}
                  disabled={isLocked}
                  required
                  style={isLocked ? lockedInputStyle : inputStyle(validation[idx]?.employmentType)}
                >
                  <option value="">Select Employment Type</option>
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Internship">Internship</option>
                  <option value="Contract">Contract</option>
                  <option value="Freelance">Freelance</option>
                </select>
                {validation[idx]?.employmentType && (
                  <div style={errorTextStyle}>{validation[idx].employmentType}</div>
                )}
              </div>

              <div style={{ marginBottom: isMobile ? '12px' : '15px' }}>
                <label style={labelStyle}>
                  Company / Organization <span style={{ color: 'red' }}>*</span>
                </label>
                <input
                  type="text"
                  name="company"
                  placeholder="Company or Organization Name"
                  value={exp?.company || ''}
                  onChange={(e) => handleArrayFieldChange(idx, "company", e.target.value)}
                  disabled={isLocked}
                  required
                  style={isLocked ? lockedInputStyle : inputStyle(validation[idx]?.company)}
                />
                {validation[idx]?.company && (
                  <div style={errorTextStyle}>{validation[idx].company}</div>
                )}
              </div>

              <div style={{ marginBottom: isMobile ? '12px' : '15px' }}>
                <label style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  cursor: isLocked ? 'not-allowed' : 'pointer',
                  color: '#000',
                  fontWeight: '500',
                  opacity: isLocked ? 0.8 : 1,
                  fontSize: isMobile ? '13px' : 'inherit'
                }}>
                  <input
                    type="checkbox"
                    name="currentlyWorking"
                    checked={exp?.currentlyWorking || false}
                    onChange={(e) => handleArrayFieldChange(idx, "currentlyWorking", e.target.checked)}
                    disabled={isLocked}
                    style={{
                      marginRight: '8px',
                      width: isMobile ? '14px' : '16px',
                      height: isMobile ? '14px' : '16px',
                      accentColor: '#1e1e3f',
                      backgroundColor: '#fff',
                      cursor: isLocked ? 'not-allowed' : 'pointer',
                      opacity: isLocked ? 0.8 : 1
                    }}
                  />
                  I am currently working in this role
                </label>
              </div>

              <div style={gridStyle}>
                <div>
                  <label style={labelStyle}>
                    Start Date <span style={{ color: 'red' }}>*</span>
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    value={exp?.startDate || ''}
                    onChange={(e) => handleArrayFieldChange(idx, "startDate", e.target.value)}
                    disabled={isLocked}
                    required
                    style={isLocked ? lockedInputStyle : inputStyle(validation[idx]?.startDate)}
                  />
                  {validation[idx]?.startDate && (
                    <div style={errorTextStyle}>{validation[idx].startDate}</div>
                  )}
                </div>

                <div>
                  <label style={labelStyle}>
                    End Date {exp?.currentlyWorking ? '(Disabled)' : <span style={{ color: 'red' }}>*</span>}
                  </label>
                  <input
                    type="date"
                    name="endDate"
                    value={exp?.endDate || ''}
                    onChange={(e) => handleArrayFieldChange(idx, "endDate", e.target.value)}
                    disabled={isLocked || exp?.currentlyWorking}
                    required={!exp?.currentlyWorking}
                    style={{
                      ...(isLocked ? lockedInputStyle : inputStyle(validation[idx]?.endDate)),
                      backgroundColor: (exp?.currentlyWorking || isLocked) ? '#e9ecef' : (validation[idx]?.endDate ? '#fff2f0' : '#fff'),
                      cursor: (exp?.currentlyWorking || isLocked) ? 'not-allowed' : 'auto'
                    }}
                  />
                  {validation[idx]?.endDate && (
                    <div style={errorTextStyle}>{validation[idx].endDate}</div>
                  )}
                </div>

                <div>
                  <label style={labelStyle}>Duration</label>
                  <input
                    type="text"
                    name="duration"
                    value={exp?.duration || ''}
                    readOnly
                    style={{
                      ...inputStyle(),
                      backgroundColor: '#e9ecef',
                      cursor: 'not-allowed'
                    }}
                    placeholder="Duration will be calculated"
                  />
                  <div style={helpTextStyle}>Automatically calculated</div>
                </div>
              </div>

              <div style={{
                ...gridStyle,
                gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(250px, 1fr))',
              }}>
                <div>
                  <label style={labelStyle}>
                    Location <span style={{ color: 'red' }}>*</span>
                  </label>
                  <input
                    type="text"
                    name="location"
                    placeholder="City, State, Country"
                    value={exp?.location || ''}
                    onChange={(e) => handleArrayFieldChange(idx, "location", e.target.value)}
                    disabled={isLocked}
                    required
                    style={isLocked ? lockedInputStyle : inputStyle(validation[idx]?.location)}
                  />
                  {validation[idx]?.location && (
                    <div style={errorTextStyle}>{validation[idx].location}</div>
                  )}
                </div>

                <div>
                  <label style={labelStyle}>
                    Location Type <span style={{ color: 'red' }}>*</span>
                  </label>
                  <select
                    name="locationType"
                    value={exp?.locationType || ''}
                    onChange={(e) => handleArrayFieldChange(idx, "locationType", e.target.value)}
                    disabled={isLocked}
                    required
                    style={isLocked ? lockedInputStyle : inputStyle(validation[idx]?.locationType)}
                  >
                    <option value="">Select Location Type</option>
                    <option value="Remote">Remote</option>
                    <option value="On-site">On-site</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                  {validation[idx]?.locationType && (
                    <div style={errorTextStyle}>{validation[idx].locationType}</div>
                  )}
                </div>
              </div>

              <div style={{ marginBottom: isMobile ? '12px' : '15px' }}>
                <label style={labelStyle}>Description</label>
                <textarea
                  name="description"
                  placeholder="Brief description about your role and responsibilities"
                  value={exp?.description || ''}
                  onChange={(e) => handleArrayFieldChange(idx, "description", e.target.value)}
                  disabled={isLocked}
                  rows={isMobile ? 3 : 4}
                  style={{
                    ...(isLocked ? lockedInputStyle : inputStyle(validation[idx]?.description)),
                    resize: 'vertical',
                    fontFamily: 'inherit'
                  }}
                />
                <div style={helpTextStyle}>Describe your key responsibilities and achievements</div>
              </div>

              <div>
                <label style={labelStyle}>Media Link (URL)</label>
                <input
                  type="url"
                  name="mediaLink"
                  placeholder="Link to certificate, project, or media"
                  value={exp?.mediaLink || ''}
                  onChange={(e) => handleArrayFieldChange(idx, "mediaLink", e.target.value)}
                  disabled={isLocked}
                  style={isLocked ? lockedInputStyle : inputStyle(validation[idx]?.mediaLink)}
                />
                {validation[idx]?.mediaLink && (
                  <div style={errorTextStyle}>{validation[idx].mediaLink}</div>
                )}
                {!isLocked && exp?.mediaLink && isValidUrl(exp.mediaLink) && !validation[idx]?.mediaLink && (
                  <div style={{
                    color: '#10b981',
                    fontSize: '12px',
                    marginTop: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4
                  }}>
                    <FaLink size={12} /> Valid URL format
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {(experiences.length < 3) && (
          <button
            type="button"
            onClick={handleAddItem}
            style={{
              ...buttonStyle,
              width: isMobile ? '100%' : 'fit-content',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: isMobile ? 'center' : 'flex-start',
              gap: '8px',
              backgroundColor: hoverState.addButton ? '#3b82f6' : '#1e1e3f'
            }}
            onMouseEnter={() => setHoverState(prev => ({ ...prev, addButton: true }))}
            onMouseLeave={() => setHoverState(prev => ({ ...prev, addButton: false }))}
          >
            <FaPlus size={isMobile ? 12 : 14} /> Add Experience
          </button>
        )}

        <button
          onClick={handleSave}
          disabled={saving || !hasChanges}
          style={{
            padding: isMobile ? '12px' : '14px',
            backgroundColor: (saving || !hasChanges) ? '#a0aec0' : (hoverState.saveButton ? '#3b82f6' : '#1e1e3f'),
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            fontWeight: 'bold',
            fontSize: isMobile ? '15px' : '16px',
            cursor: (saving || !hasChanges) ? 'not-allowed' : 'pointer',
            transition: 'background-color 0.3s',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px'
          }}
          onMouseEnter={() => {
            if (!saving && hasChanges) setHoverState(prev => ({ ...prev, saveButton: true }));
          }}
          onMouseLeave={() => {
            if (!saving && hasChanges) setHoverState(prev => ({ ...prev, saveButton: false }));
          }}
        >
          {saving ? (
            <>
              <div style={{
                display: "inline-block",
                width: isMobile ? "14px" : "16px",
                height: isMobile ? "14px" : "16px",
                border: "3px solid rgba(255,255,255,0.3)",
                borderRadius: "50%",
                borderTop: "3px solid #fff",
                animation: "spin 1s linear infinite"
              }}></div>
              <span>Saving...</span>
            </>
          ) : (
            <>
              <FaSave size={isMobile ? 14 : 16} />
              <span>Save Changes</span>
            </>
          )}
        </button>
      </div>

      {msg.text && (
        <div style={messageStyle(msg.type)}>
          {msg.type === 'success' ? (
            <FaCheckCircle color="#10b981" size={isMobile ? 18 : 20} />
          ) : (
            <FaExclamationTriangle color="#ef4444" size={isMobile ? 18 : 20} />
          )}
          <span style={{ fontWeight: '600' }}>{msg.text}</span>
        </div>
      )}

      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @media (max-width: 700px) {
          input[type="date"] {
            -webkit-appearance: none;
            font-size: 14px;
          }
          
          select {
            font-size: 14px;
          }
        }
      `}} />
    </div>
  );
};

export default EditExperience;