import React, { useState } from "react";
import axios from "axios";
import { FaCode, FaCheckCircle, FaExclamationCircle, FaFilePdf, FaSpinner, FaUpload } from 'react-icons/fa';
import { Section, EditableItem, EditableInput } from "./EditProfileHelpers";

const sectionStyle = {
  background: "#f8fafc",
  borderRadius: 14,
  padding: "24px 18px 19px 18px",
  border: "1px solid #e2e8f0",
  marginBottom: 0,
  maxWidth: 520,
  marginLeft: "auto",
  marginRight: "auto"
};

const buttonStyle = {
  background: "#10b981",
  color: "#fff",
  border: "none",
  borderRadius: 7,
  fontWeight: 600,
  padding: "10px 26px",
  marginTop: 20,
  cursor: "pointer"
};

const buttonDisabledStyle = {
  background: "#94d1be",
  cursor: "not-allowed"
};

const resumeButtonStyle = {
  background: "#1e1e3f",
  color: "#fff",
  border: "none",
  borderRadius: 5,
  fontWeight: 600,
  padding: "8px 15px",
  marginTop: 10,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  gap: 8,
  fontSize: "0.9rem",
  transition: "background-color 0.2s"
};

const resumeButtonHoverStyle = {
  backgroundColor: "#3b3b7e"
};

const resumeButtonDisabledStyle = {
  backgroundColor: "#9ca3af",
  cursor: "not-allowed"
};

/**
 * Controlled child component with API integration
 * editData and setEditData come from parent.
 */
const EditSkills = ({ editData, setEditData }) => {
  const [msg, setMsg] = useState('');
  const [msgType, setMsgType] = useState(''); // 'success' or 'error'
  const [saving, setSaving] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [fileError, setFileError] = useState('');
  const [buttonHover, setButtonHover] = useState({
    save: false,
    resume: false
  });

  // File input reference
  const fileInputRef = React.useRef(null);

  if (!editData) return <div style={{ textAlign: "center", marginTop: 30, color: "#64748b" }}>Loading skills information...</div>;

  // Helper function to ensure data is in the right format for display
  const ensureStringFormat = (value) => {
    if (Array.isArray(value)) {
      return value.join(', ');
    }
    return value || "";
  };

  const validateSkills = (skills) => {
    // Handle array input
    if (Array.isArray(skills)) {
      return skills.filter(skill => skill && typeof skill === 'string' && skill.trim() !== '');
    }

    // Handle string input
    if (!skills || typeof skills !== 'string' || skills.trim() === '') {
      return [];
    }

    // Split by commas, filter out empty entries, and trim whitespace
    return skills.split(',')
      .map(skill => skill.trim())
      .filter(skill => skill !== '');
  };

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;

    // Clear any field errors when the user edits a field
    if (fieldErrors[name]) {
      const newErrors = { ...fieldErrors };
      delete newErrors[name];
      setFieldErrors(newErrors);
    }

    // Clear any file error when the user selects a new file
    if (type === "file" && fileError) {
      setFileError('');
    }

    // Clear any message when form is edited
    if (msg) {
      setMsg('');
      setMsgType('');
    }

    let updated = { ...editData };

    if (type === "file") {
      if (files && files[0]) {
        // Validate file type (must be PDF)
        if (files[0].type !== 'application/pdf') {
          setFileError('Only PDF files are allowed');
          return;
        }

        // Validate file size (max 350KB)
        if (files[0].size > 350 * 1024) {
          setFileError('File size must be less than 350KB');
          return;
        }

        updated[name] = files[0];
      }
    } else {
      updated[name] = value;
    }

    setEditData(updated);
  };

  const validateForm = () => {
    const errors = {};
    let isValid = true;

    // Validate programming_languages (required)
    if (!editData.programming_languages) {
      errors.programming_languages = 'Please enter at least one programming language';
      isValid = false;
    } else {
      // Check if there are actual valid entries after processing
      const languages = validateSkills(editData.programming_languages);
      if (languages.length === 0) {
        errors.programming_languages = 'Please enter at least one valid programming language';
        isValid = false;
      }
    }

    // Validate skills/soft_skills (required)
    if (!editData.skills && !editData.soft_skills) {
      errors.skills = 'Please enter at least one technical skill';
      isValid = false;
    } else {
      // Check if there are actual valid entries after processing
      const skills = validateSkills(editData.skills || editData.soft_skills);
      if (skills.length === 0) {
        errors.skills = 'Please enter at least one valid technical skill';
        isValid = false;
      }
    }

    setFieldErrors(errors);
    return isValid;
  };

  // Handle resume upload separately
  const handleResumeUpload = async () => {
    if (!editData.resume || !(editData.resume instanceof File)) {
      setFileError('Please select a resume file first');
      return;
    }

    if (fileError) {
      setMsg(fileError);
      setMsgType('error');
      return;
    }

    setUploadingResume(true);
    setMsg('');
    setMsgType('');

    try {
      const file = editData.resume;
      const arrayBuffer = await file.arrayBuffer();

      // Send binary data with file metadata in headers
      const response = await axios.post(
        'https://placement-portal-backend.ramshekade20.workers.dev/api/student/profile/update/resume',
        arrayBuffer,
        {
          headers: {
            'Content-Type': 'application/octet-stream',
            'X-File-Name': file.name,
            'X-File-Type': file.type,
          },
          withCredentials: true,
        }
      );

      console.log("Resume Update Response:", response.data);

      if (response.data && response.data.success) {
        setMsg(response.data.message || "Resume updated successfully!");
        setMsgType('success');
        setEditData(prev => ({
          ...prev,
          resume_url: response.data.resume_url || prev.resume_url,
          resume: null
        }));
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        setMsg(response.data.error || "Failed to update resume");
        setMsgType('error');
      }
    } catch (error) {
      console.error("Resume Upload Error:", error);
      let errorMessage = "Failed to update resume. Please try again.";
      if (error.response && error.response.data) {
        errorMessage = error.response.data.error || error.response.data.details || errorMessage;
      } else if (error.message) {
        errorMessage = error.message;
      }
      setMsg(errorMessage);
      setMsgType('error');
    } finally {
      setUploadingResume(false);
    }
  };

  const handleSave = async () => {
    // Validate the form before submission
    if (!validateForm()) {
      setMsg('Please fix the validation errors before submitting');
      setMsgType('error');
      return;
    }

    setSaving(true);
    setMsg('');
    setMsgType('');

    try {
      // Prepare form data for API
      const formData = new FormData();

      // Format programming languages as JSON array
      const programmingLanguages = validateSkills(editData.programming_languages);
      formData.append('programming_languages', JSON.stringify(programmingLanguages));

      // Format skills as JSON array
      const skills = validateSkills(editData.skills || editData.soft_skills);
      formData.append('skills', JSON.stringify(skills));
      formData.append('soft_skills', JSON.stringify(skills)); // Add both for compatibility

      // Call the API to update skills
      const response = await axios.post(
        'https://placement-portal-backend.ramshekade20.workers.dev/api/student/profile/update/skills',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          withCredentials: true
        }
      );

      console.log("API Response:", response.data);

      if (response.data && response.data.success) {
        // Show success message
        setMsg(response.data.message || "Skills updated successfully!");
        setMsgType('success');

        // Update local state to reflect server changes
        setEditData(prev => ({
          ...prev,
          programming_languages: programmingLanguages.join(', '),
          skills: skills.join(', '),
          soft_skills: skills.join(', ')
        }));
      } else {
        // Handle error in response
        setMsg(response.data.error || "Failed to update skills");
        setMsgType('error');
      }
    } catch (error) {
      console.error("API Error:", error);

      // Extract error message from response
      let errorMessage = "Failed to update skills. Please try again.";
      let errorDetails = "";

      if (error.response && error.response.data) {
        errorMessage = error.response.data.error || errorMessage;
        errorDetails = error.response.data.details || "";
      } else if (error.message) {
        errorMessage = error.message;
      }

      // Check for specific database errors
      if (errorDetails && errorDetails.includes("D1_ERROR")) {
        errorMessage = "There was a database error. Please try again later.";
      }

      setMsg(errorMessage);
      setMsgType('error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <Section title="Technical Skills" icon={<FaCode />} style={sectionStyle}>
        <EditableItem label="Programming Languages *">
          <EditableInput
            name="programming_languages"
            value={ensureStringFormat(editData?.programming_languages)}
            onChange={handleChange}
            placeholder="e.g. Java, Python, JavaScript, C++"
            style={fieldErrors.programming_languages ? {
              border: "1.5px solid #dc2626",
              background: "#fff2f0"
            } : {}}
          />
          {fieldErrors.programming_languages && (
            <div style={{ color: "#dc2626", fontSize: "0.875rem", marginTop: 4 }}>
              {fieldErrors.programming_languages}
            </div>
          )}
          <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: 4 }}>
            Separate each language with a comma
          </div>
        </EditableItem>

        <EditableItem label="Technical Skills *">
          <EditableInput
            name="skills"
            value={ensureStringFormat(editData?.skills || editData?.soft_skills)}
            onChange={handleChange}
            placeholder="e.g. Web Development, Data Analysis, Cloud Computing"
            style={fieldErrors.skills ? {
              border: "1.5px solid #dc2626",
              background: "#fff2f0"
            } : {}}
          />
          {fieldErrors.skills && (
            <div style={{ color: "#dc2626", fontSize: "0.875rem", marginTop: 4 }}>
              {fieldErrors.skills}
            </div>
          )}
          <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: 4 }}>
            Separate each skill with a comma
          </div>
        </EditableItem>

        <EditableItem label="Update Resume">
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            name="resume"
            onChange={handleChange}
            style={{ marginTop: 8 }}
          />
          {fileError && (
            <div style={{ color: "#dc2626", fontSize: "0.875rem", marginTop: 4 }}>
              {fileError}
            </div>
          )}
          <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: 4 }}>
            Only PDF files, max 350KB
          </div>
          {editData.resume && editData.resume instanceof File && (
            <div style={{ fontSize: "0.875rem", color: "#059669", marginTop: 4, display: "flex", alignItems: "center", gap: 5 }}>
              <FaFilePdf /> Selected: {editData.resume.name.length > 30 ? editData.resume.name.substring(0, 30) + '...' : editData.resume.name}
            </div>
          )}

          <button
            style={{
              ...resumeButtonStyle,
              ...(uploadingResume || !(editData.resume instanceof File) ? resumeButtonDisabledStyle : {}),
              ...(buttonHover.resume && !(uploadingResume || !(editData.resume instanceof File)) ? resumeButtonHoverStyle : {})
            }}
            onClick={handleResumeUpload}
            disabled={uploadingResume || !(editData.resume instanceof File)}
            onMouseEnter={() => setButtonHover(prev => ({ ...prev, resume: true }))}
            onMouseLeave={() => setButtonHover(prev => ({ ...prev, resume: false }))}
            type="button"
          >
            {uploadingResume ? (
              <>
                <FaSpinner style={{ animation: "spin 1s linear infinite" }} />
                Uploading Resume...
              </>
            ) : (
              <>
                <FaUpload />
                Upload Resume
              </>
            )}
          </button>

          {editData.resume_url && (
            <div style={{ fontSize: "0.875rem", marginTop: 10 }}>
              <a
                href={editData.resume_url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: "#2563eb",
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                  padding: "5px 10px",
                  border: "1px solid #2563eb",
                  borderRadius: 4,
                  transition: "background-color 0.2s"
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = "#f0f9ff"}
                onMouseOut={(e) => e.target.style.backgroundColor = "transparent"}
              >
                <FaFilePdf />
                View Current Resume
              </a>
            </div>
          )}
        </EditableItem>
      </Section>

      <div style={{ display: "flex", justifyContent: "center", marginTop: 15 }}>
        <button
          style={{
            ...buttonStyle,
            ...(saving ? buttonDisabledStyle : {}),
            ...(buttonHover.save && !saving ? { backgroundColor: "#059669" } : {})
          }}
          onClick={handleSave}
          disabled={saving}
          onMouseEnter={() => setButtonHover(prev => ({ ...prev, save: true }))}
          onMouseLeave={() => setButtonHover(prev => ({ ...prev, save: false }))}
        >
          {saving ? (
            <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              <FaSpinner style={{ animation: "spin 1s linear infinite" }} />
              Saving...
            </span>
          ) : (
            <>Update Skills</>
          )}
        </button>
      </div>

      {msg && (
        <div
          style={{
            marginTop: 18,
            fontWeight: 600,
            textAlign: "center",
            color: msgType === 'success' ? "#059669" : "#dc2626",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8
          }}
        >
          {msgType === 'success' ? <FaCheckCircle /> : <FaExclamationCircle />}
          {msg}
        </div>
      )}

      {/* Add this CSS for the spinner animation */}
      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}} />
    </div>
  );
};


export default EditSkills;