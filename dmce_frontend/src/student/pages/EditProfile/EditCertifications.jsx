import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  FaCertificate, FaLink, FaTrash, FaPlus, FaLock, FaLinkedin, FaGithub, FaGlobe,
  FaSave, FaExclamationTriangle, FaCheckCircle, FaInfoCircle
} from "react-icons/fa";
import { SiCodeforces, SiLeetcode, SiHackerrank } from "react-icons/si";
import { Section } from "./EditProfileHelpers";

// API endpoint for updating social links and certifications
const API_ENDPOINT = "https://placement-portal-backend.ramshekade20.workers.dev/api/student/profile/update/social";

// Responsive style hook
const useResponsive = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 700);
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 700);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return isMobile;
};

const getStyles = (isMobile) => ({
  section: {
    background: "#f7fafc",
    borderRadius: isMobile ? 11 : 19,
    padding: isMobile ? "1.3rem 0.7rem 1.1rem 0.7rem" : "2.2rem 2.2rem 1.9rem 2.2rem",
    border: "1.2px solid #e2e8f0",
    marginBottom: 0,
    maxWidth: isMobile ? "99vw" : 850,
    marginLeft: "auto",
    marginRight: "auto",
    boxShadow: "0 2px 10px rgba(30,30,63,0.07)"
  },
  listContainer: {
    display: "flex",
    flexDirection: "column",
    gap: isMobile ? 19 : 26,
    width: "100%",
  },
  listItem: (isLocked, isNew, hasError) => ({
    background: hasError ? "#fff2f0" : (isLocked ? "#f1f5f9" : isNew ? "#f0fff4" : "#e6f9f3"),
    border: hasError ? "1.7px solid #dc2626" : (isLocked ? "1.5px dashed #cbd5e1" : "1.7px solid #10b981"),
    borderRadius: 13,
    marginBottom: 0,
    padding: isMobile ? "1.1rem 0.7rem 1rem 0.7rem" : "1.4rem 1.4rem 1.15rem 1.4rem",
    boxShadow: isLocked ? "none" : "0 2px 8px rgba(30,30,63,0.07)",
    opacity: isLocked ? 0.84 : 1,
    position: "relative",
    transition: "background .18s"
  }),
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: isMobile ? 6 : 15,
    marginBottom: isMobile ? 8 : 14,
    flexWrap: "wrap"
  },
  title: (isLocked) => ({
    fontWeight: 700,
    fontSize: isMobile ? "1.13rem" : "1.20rem",
    color: "#1e1e3f",
    display: "flex",
    alignItems: "center",
    gap: 8,
    opacity: isLocked ? 0.7 : 1
  }),
  lockIcon: {
    color: "#eab308",
    fontSize: "1.08rem",
    marginLeft: 8
  },
  removeBtn: {
    background: "#dc2626",
    color: "#fff",
    fontSize: isMobile ? "0.97rem" : "1.08rem",
    padding: isMobile ? "6px 10px" : "9px 18px",
    borderRadius: "6px",
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: 6,
    fontWeight: 600,
    opacity: 0.95,
    boxShadow: "0 1px 4px rgba(220,38,38,0.1)",
    transition: "background-color 0.2s"
  },
  removeBtnHover: {
    backgroundColor: "#b91c1c"
  },
  fieldLabel: {
    fontWeight: 600,
    color: "#1e1e3f",
    fontSize: isMobile ? "1.08rem" : "1.12rem",
    marginBottom: 4,
    display: "flex",
    alignItems: "center",
    gap: 5
  },
  fieldRequired: {
    color: "#dc2626",
    fontSize: "0.8rem",
    marginLeft: 4
  },
  input: (isLocked, hasError) => ({
    width: "100%",
    fontSize: isMobile ? "1.13rem" : "1.09rem",
    padding: isMobile ? "13px 14px" : "11px 15px",
    border: hasError ? "1.4px solid #dc2626" : (isLocked ? "1.2px dashed #cbd5e1" : "1.4px solid #10b981"),
    borderRadius: 8,
    background: hasError ? "#fff2f0" : (isLocked ? "#f3f4f6" : "#fff"),
    color: "#22223b",
    outline: "none",
    marginBottom: 6,
    pointerEvents: isLocked ? "none" : "auto",
    opacity: isLocked ? 0.7 : 1,
    minHeight: 38,
    resize: "vertical",
    transition: "border .13s"
  }),
  errorText: {
    color: "#dc2626",
    fontSize: "0.75rem",
    marginTop: 2,
    marginBottom: 5
  },
  helpText: {
    color: "#64748b",
    fontSize: "0.75rem",
    marginTop: 2,
    fontStyle: "italic"
  },
  validUrl: {
    color: "#10b981",
    fontSize: "0.75rem",
    marginTop: 2,
    display: "flex",
    alignItems: "center",
    gap: 4
  },
  addBtn: {
    background: "#10b981",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    fontWeight: 700,
    fontSize: isMobile ? "1.13rem" : "1.18rem",
    padding: isMobile ? "14px 0" : "16px 0",
    marginTop: isMobile ? 13 : 17,
    marginBottom: isMobile ? 13 : 18,
    width: isMobile ? "100%" : 250,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    boxShadow: "0 2px 7px rgba(16,185,129,0.10)",
    textAlign: "center",
    transition: "background-color 0.2s"
  },
  addBtnHover: {
    backgroundColor: "#059669"
  },
  saveBtn: {
    background: "#10b981",
    color: "#fff",
    border: "none",
    borderRadius: 9,
    fontWeight: 700,
    fontSize: isMobile ? "1.15rem" : "1.22rem",
    padding: isMobile ? "15px 0" : "18px 0",
    marginTop: isMobile ? 16 : 26,
    width: isMobile ? "100%" : 265,
    maxWidth: "100%",
    cursor: "pointer",
    boxShadow: "0 2px 12px rgba(16,185,129,0.13)",
    letterSpacing: ".01em",
    display: "block",
    marginLeft: "auto",
    marginRight: "auto",
    textAlign: "center",
    transition: "background-color 0.2s"
  },
  saveBtnHover: {
    backgroundColor: "#059669"
  },
  saveBtnDisabled: {
    backgroundColor: "#94d1be",
    cursor: "not-allowed"
  },
  msgContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginTop: isMobile ? 20 : 25,
    padding: "10px 15px",
    borderRadius: 8,
    maxWidth: isMobile ? "100%" : 500,
    marginLeft: "auto",
    marginRight: "auto"
  },
  successMsg: {
    backgroundColor: "rgba(16,185,129,0.1)",
    border: "1px solid #10b981",
  },
  errorMsg: {
    backgroundColor: "rgba(239,68,68,0.1)",
    border: "1px solid #ef4444",
  },
  msgText: {
    fontWeight: 600,
    fontSize: isMobile ? "1.04rem" : "1.09rem"
  },
  footerText: {
    fontSize: "12px",
    color: "#64748b",
    textAlign: "center",
    marginTop: "25px",
    padding: "10px 0",
    borderTop: "1px solid #f1f5f9"
  },
  loadingContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "200px",
    flexDirection: "column",
    gap: 15
  },
  loadingSpinner: {
    width: "40px",
    height: "40px",
    border: "4px solid rgba(16,185,129,0.1)",
    borderRadius: "50%",
    borderTop: "4px solid #10b981",
    animation: "spin 1s linear infinite"
  },
  loadingText: {
    color: "#64748b",
    fontWeight: 600
  },
  emptyState: {
    textAlign: "center",
    padding: "25px 10px",
    color: "#64748b",
    fontStyle: "italic"
  },
  infoContainer: {
    marginBottom: 15,
    padding: 15,
    backgroundColor: "#f0f9ff",
    borderRadius: 10,
    border: "1px solid #bae6fd",
    display: "flex",
    alignItems: "flex-start",
    gap: 10
  },
  socialSection: {
    marginTop: "25px",
    padding: "20px",
    background: "#f0f9ff",
    borderRadius: "10px",
    border: "1px solid #bae6fd",
  },
  socialSectionTitle: {
    fontSize: "1.1rem",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "15px",
    color: "#0c4a6e",
    fontWeight: "600"
  }
});

const socialLabels = [
  { label: "LinkedIn", icon: <FaLinkedin color="#0077b5" />, placeholder: "https://linkedin.com/in/yourusername" },
  { label: "GitHub", icon: <FaGithub color="#333" />, placeholder: "https://github.com/yourusername" },
  { label: "Coding Profile", icon: <SiLeetcode color="#EE8208" />, placeholder: "https://leetcode.com/yourusername" },
  { label: "Portfolio", icon: <FaGlobe color="#1e1e3f" />, placeholder: "https://yourportfolio.com" },
];

const EditCertifications = () => {
  const [editData, setEditData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [saving, setSaving] = useState(false);
  const [validation, setValidation] = useState({
    certifications: {},
    social_links: {}
  });
  const [hasChanges, setHasChanges] = useState(false);
  const [hoverState, setHoverState] = useState({
    addButton: false,
    saveButton: false,
    removeButtons: {}
  });

  const isMobile = useResponsive();
  const styles = getStyles(isMobile);

  // Track how many certifications are initially loaded (locked)
  const [initialCount, setInitialCount] = useState(0);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(
          "https://placement-portal-backend.ramshekade20.workers.dev/api/student/profile/view",
          { withCredentials: true }
        );
        setEditData(res.data.profile);
        setInitialCount((res.data.profile?.certifications || []).length);
      } catch (err) {
        console.error("Failed to fetch profile:", err);
        setMsg({ type: 'error', text: "Failed to load profile data" });
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const isLocked = (idx) => idx < initialCount;
  const isNew = (idx) => idx >= initialCount;

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

  // Form validation
  const validateForm = () => {
    const errors = {
      certifications: {},
      social_links: {}
    };
    let isValid = true;

    // Validate certifications
    if (editData.certifications && editData.certifications.length > 0) {
      editData.certifications.forEach((cert, idx) => {
        // Skip validation for locked certifications
        if (isLocked(idx)) {
          return;
        }

        const certErrors = {};

        // Title is required
        if (!cert.name || cert.name.trim() === '') {
          certErrors.name = 'Certification title is required';
          isValid = false;
        }

        // URL format validation for link (if provided)
        if (cert.link && !isValidUrl(cert.link)) {
          certErrors.link = 'Please enter a valid URL';
          isValid = false;
        }

        if (Object.keys(certErrors).length > 0) {
          errors.certifications[idx] = certErrors;
        }
      });
    }

    // Validate social links
    if (editData.social_links && editData.social_links.length > 0) {
      editData.social_links.forEach((link, idx) => {
        if (link && !isValidUrl(link)) {
          errors.social_links[idx] = 'Please enter a valid URL';
          isValid = false;
        }
      });
    }

    setValidation(errors);
    return isValid;
  };

  const handleArrayFieldChange = (idx, field, value) => {
    // Clear validation error when user edits a field
    if (validation.certifications[idx] && validation.certifications[idx][field]) {
      const newValidation = { ...validation };
      if (newValidation.certifications[idx]) {
        delete newValidation.certifications[idx][field];
        if (Object.keys(newValidation.certifications[idx]).length === 0) {
          delete newValidation.certifications[idx];
        }
      }
      setValidation(newValidation);
    }

    // Clear message when form is edited
    if (msg.text) {
      setMsg({ type: '', text: '' });
    }

    setEditData((prev) => {
      const updatedArray = prev.certifications ? [...prev.certifications] : [];
      updatedArray[idx] = { ...updatedArray[idx], [field]: value };
      return { ...prev, certifications: updatedArray };
    });

    setHasChanges(true);
  };

  const handleAddItem = () => {
    setEditData((prev) => ({
      ...prev,
      certifications: prev.certifications
        ? [...prev.certifications, { name: "", link: "" }]
        : [{ name: "", link: "" }]
    }));

    setHasChanges(true);

    // Clear message when form is edited
    if (msg.text) {
      setMsg({ type: '', text: '' });
    }

    // Scroll to the new item
    setTimeout(() => {
      const certElements = document.querySelectorAll('[data-cert-item]');
      const lastCert = certElements[certElements.length - 1];
      if (lastCert) {
        lastCert.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  };

  const handleRemoveItem = (idx) => {
    // Cannot remove locked certifications
    if (isLocked(idx)) {
      setMsg({
        type: 'error',
        text: "Original certifications cannot be removed"
      });
      return;
    }

    setEditData((prev) => {
      const updatedArray = prev.certifications ? [...prev.certifications] : [];
      updatedArray.splice(idx, 1);
      return { ...prev, certifications: updatedArray };
    });

    // Also remove any validation errors for this certification
    if (validation.certifications[idx]) {
      const newValidation = { ...validation };
      delete newValidation.certifications[idx];
      setValidation(newValidation);
    }

    setHasChanges(true);

    // Clear message when form is edited
    if (msg.text) {
      setMsg({ type: '', text: '' });
    }
  };

  // Add Portfolio link to social links if not present
  useEffect(() => {
    if (editData && Array.isArray(editData.social_links)) {
      let links = [...editData.social_links];
      // add empty social links if missing (to always have 4)
      while (links.length < 4) links.push("");
      if (links.length > 4) links = links.slice(0, 4);
      if (links.some((val, idx) => val !== editData.social_links[idx])) {
        setEditData((prev) => ({
          ...prev,
          social_links: links
        }));
      }
    }
  }, [editData]);

  const handleSocialLinkChange = (idx, value) => {
    // Clear validation error when user edits a social link
    if (validation.social_links[idx]) {
      const newValidation = { ...validation };
      delete newValidation.social_links[idx];
      setValidation(newValidation);
    }

    // Clear message when form is edited
    if (msg.text) {
      setMsg({ type: '', text: '' });
    }

    setEditData((prev) => {
      const updatedLinks = prev.social_links ? [...prev.social_links] : [];
      updatedLinks[idx] = value;
      return { ...prev, social_links: updatedLinks };
    });

    setHasChanges(true);
  };

  const handleSave = async () => {
    // Validate form before saving
    if (!validateForm()) {
      setMsg({
        type: 'error',
        text: "Please fix the validation errors before saving"
      });

      // Scroll to the first certification with errors
      const firstErrorIdx = Object.keys(validation.certifications)[0];
      if (firstErrorIdx) {
        const errorElement = document.querySelector(`[data-cert-item="${firstErrorIdx}"]`);
        if (errorElement) {
          errorElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      } else {
        // If no certification errors, check for social link errors
        const firstSocialErrorIdx = Object.keys(validation.social_links)[0];
        if (firstSocialErrorIdx) {
          const errorElement = document.querySelector(`[data-social-item="${firstSocialErrorIdx}"]`);
          if (errorElement) {
            errorElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }
      }

      return;
    }

    setSaving(true);
    setMsg({ type: '', text: '' });

    try {
      const formData = new FormData();
      formData.append("certifications", JSON.stringify(editData.certifications || []));
      formData.append("social_links", JSON.stringify(editData.social_links || []));

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
        // After successful update, update initialCount
        setInitialCount(editData.certifications ? editData.certifications.length : 0);
        setMsg({ type: 'success', text: response.data.message || "Social links & Certifications updated successfully!" });
        setHasChanges(false);
      } else {
        setMsg({ type: 'error', text: response.data.error || "Failed to update. Please try again." });
      }
    } catch (error) {
      console.error("Failed to update certifications and social links:", error);

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

  // Show loading state
  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loadingSpinner}></div>
        <div style={styles.loadingText}>Loading certification details...</div>
      </div>
    );
  }

  if (!editData) {
    return (
      <div style={styles.loadingContainer}>
        <FaExclamationTriangle size={40} color="#ef4444" />
        <div style={styles.loadingText}>Failed to load profile data</div>
      </div>
    );
  }

  return (
    <div>
      <Section title="Certifications & Licenses" icon={<FaCertificate />} style={styles.section}>
        <div style={styles.infoContainer}>
          <FaInfoCircle size={18} color="#0284c7" style={{ marginTop: 2 }} />
          <div style={{ fontSize: "0.9rem", color: "#0c4a6e" }}>
            Add your certifications, licenses, and online courses that highlight your skills and qualifications. Include verification links when available.
          </div>
        </div>

        {(editData?.certifications ?? []).length > 0 ? (
          <div style={styles.listContainer}>
            {editData.certifications.map((cert, idx) => {
              const locked = isLocked(idx);
              const newCert = isNew(idx);
              const hasErrors = validation.certifications[idx] && Object.keys(validation.certifications[idx]).length > 0;

              return (
                <div
                  key={idx}
                  style={styles.listItem(locked, newCert, hasErrors)}
                  data-cert-item={idx}
                >
                  <div style={styles.header}>
                    <span style={styles.title(locked)}>
                      {/* Only show certification title once (input below for new, or just value for locked) */}
                      {locked
                        ? cert?.name || `Certification ${idx + 1}`
                        : ""}
                      {locked && (
                        <>
                          <FaLock style={styles.lockIcon} title="This certification is locked and cannot be edited or removed." />
                          <span style={{ color: "#eab308", fontSize: "0.99rem", marginLeft: 4 }}>Locked</span>
                        </>
                      )}
                    </span>
                    {!locked && (
                      <button
                        style={{
                          ...styles.removeBtn,
                          ...(hoverState.removeButtons[idx] ? styles.removeBtnHover : {})
                        }}
                        type="button"
                        onClick={() => handleRemoveItem(idx)}
                        onMouseEnter={() => setHoverState(prev => ({
                          ...prev,
                          removeButtons: { ...prev.removeButtons, [idx]: true }
                        }))}
                        onMouseLeave={() => setHoverState(prev => ({
                          ...prev,
                          removeButtons: { ...prev.removeButtons, [idx]: false }
                        }))}
                        title="Remove Certification"
                      >
                        <FaTrash /> <span>Remove</span>
                      </button>
                    )}
                  </div>
                  <div>
                    {!locked && (
                      <div>
                        <label style={styles.fieldLabel}>
                          Title <span style={styles.fieldRequired}>*</span>
                        </label>
                        <input
                          style={styles.input(locked, validation.certifications[idx]?.name)}
                          value={cert?.name || ""}
                          onChange={e => handleArrayFieldChange(idx, "name", e.target.value)}
                          placeholder="Certification Title"
                          disabled={locked}
                        />
                        {validation.certifications[idx]?.name && (
                          <div style={styles.errorText}>{validation.certifications[idx].name}</div>
                        )}
                      </div>
                    )}
                    <div>
                      <label style={styles.fieldLabel}>
                        Certificate Link
                        <span style={{ color: "#64748b", fontSize: "0.75rem", marginLeft: 4 }}>(optional)</span>
                      </label>
                      <input
                        style={styles.input(locked, validation.certifications[idx]?.link)}
                        value={cert?.link || ""}
                        onChange={e => handleArrayFieldChange(idx, "link", e.target.value)}
                        placeholder="https://"
                        disabled={locked}
                      />
                      {validation.certifications[idx]?.link && (
                        <div style={styles.errorText}>{validation.certifications[idx].link}</div>
                      )}
                      {!locked && cert?.link && isValidUrl(cert.link) && !validation.certifications[idx]?.link && (
                        <div style={styles.validUrl}>
                          <FaLink size={12} /> Valid URL format
                        </div>
                      )}
                      {!locked && !validation.certifications[idx]?.link && (
                        <div style={styles.helpText}>Link to your certificate verification page</div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={styles.emptyState}>
            <p>No certifications added yet. Click the button below to add your first certification.</p>
          </div>
        )}

        <button
          type="button"
          style={{
            ...styles.addBtn,
            ...(hoverState.addButton ? styles.addBtnHover : {})
          }}
          onClick={handleAddItem}
          onMouseEnter={() => setHoverState(prev => ({ ...prev, addButton: true }))}
          onMouseLeave={() => setHoverState(prev => ({ ...prev, addButton: false }))}
        >

          <span style={{ flex: 1, textAlign: "center" }}>Add Certification</span>
        </button>

        {/* Social Links Section */}
        <div style={styles.socialSection}>
          <h4 style={styles.socialSectionTitle}>
            <FaLink /> Professional & Social Links
          </h4>

          <div style={{ marginBottom: "10px" }}>
            <p style={{ fontSize: "0.9rem", color: "#334155", marginBottom: "15px" }}>
              Add links to your professional profiles and portfolio to showcase your work and make it easier for recruiters to find you.
            </p>
          </div>

          {Array.isArray(editData?.social_links) && editData.social_links.map((link, idx) => {
            const social = socialLabels[idx] || { label: `Link ${idx + 1}`, icon: <FaLink style={{ color: "#1e1e3f" }} /> };
            return (
              <div key={idx} style={{ marginBottom: 15 }} data-social-item={idx}>
                <label style={styles.fieldLabel}>
                  {social.icon} {social.label}
                </label>
                <input
                  style={styles.input(false, validation.social_links[idx])}
                  value={link || ""}
                  onChange={e => handleSocialLinkChange(idx, e.target.value)}
                  placeholder={social.placeholder}
                />
                {validation.social_links[idx] && (
                  <div style={styles.errorText}>{validation.social_links[idx]}</div>
                )}
                {link && isValidUrl(link) && !validation.social_links[idx] && (
                  <div style={styles.validUrl}>
                    <FaLink size={12} /> Valid URL format
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Section>

      <button
        style={{
          ...styles.saveBtn,
          ...(hoverState.saveButton && !saving && hasChanges ? styles.saveBtnHover : {}),
          ...(saving || !hasChanges ? styles.saveBtnDisabled : {})
        }}
        onClick={handleSave}
        disabled={saving || !hasChanges}
        onMouseEnter={() => setHoverState(prev => ({ ...prev, saveButton: true }))}
        onMouseLeave={() => setHoverState(prev => ({ ...prev, saveButton: false }))}
      >
        <span style={{ width: "100%", display: "inline-block", textAlign: "center" }}>
          {saving ? (
            <>
              <div className="spinner" style={{
                display: "inline-block",
                width: "16px",
                height: "16px",
                border: "3px solid rgba(255,255,255,0.3)",
                borderRadius: "50%",
                borderTop: "3px solid #fff",
                marginRight: "8px",
                verticalAlign: "middle"
              }}></div>
              Saving...
            </>
          ) : (
            <>
              <FaSave style={{ marginRight: "8px", verticalAlign: "middle" }} />
              {hasChanges ? "Save Changes" : "No Changes to Save"}
            </>
          )}
        </span>
      </button>

      {msg.text && (
        <div style={{
          ...styles.msgContainer,
          ...(msg.type === 'success' ? styles.successMsg : styles.errorMsg)
        }}>
          {msg.type === 'success' ? (
            <FaCheckCircle color="#10b981" size={20} />
          ) : (
            <FaExclamationTriangle color="#ef4444" size={20} />
          )}
          <div style={{
            ...styles.msgText,
            color: msg.type === 'success' ? "#059669" : "#b91c1c"
          }}>
            {msg.text}
          </div>
        </div>
      )}


      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @media (max-width: 600px) {
          button {
            width: 100%;
            justify-content: center;
          }
        }
      `}} />
    </div>
  );
};

export default EditCertifications;