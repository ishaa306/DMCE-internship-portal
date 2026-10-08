import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaTrophy, FaTrash, FaPlus, FaLock, FaSave, FaExclamationTriangle, FaCheckCircle, FaLink, FaInfoCircle } from "react-icons/fa";
import { Section } from "./EditProfileHelpers";

// Current Date and Time constants
const currentDateTime = "2025-07-26 11:14:47";
const currentUser = "kshitij-dmce";

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
    borderRadius: isMobile ? 10 : 18,
    padding: isMobile ? "1.2rem 0.6rem 1rem 0.6rem" : "2.1rem 2.2rem 1.7rem 2.2rem",
    border: "1.3px solid #e2e8f0",
    marginBottom: 0,
    maxWidth: isMobile ? "99vw" : 850,
    marginLeft: "auto",
    marginRight: "auto",
    boxShadow: "0 2px 9px rgba(30,30,63,0.06)"
  },
  listContainer: {
    display: "flex",
    flexDirection: "column",
    gap: isMobile ? 20 : 28,
    width: "100%",
  },
  listItem: (isLocked, isNew, hasError) => ({
    background: hasError ? "#fff2f0" : (isLocked ? "#f1f5f9" : isNew ? "#f0fff4" : "#e6f9f3"),
    border: hasError ? "1.7px solid #dc2626" : (isLocked ? "1.5px dashed #cbd5e1" : "1.7px solid #10b981"),
    borderRadius: 13,
    marginBottom: 0,
    padding: isMobile ? "1.15rem 0.8rem 1rem 0.8rem" : "1.4rem 1.4rem 1.2rem 1.4rem",
    boxShadow: isLocked ? "none" : "0 2px 8px rgba(30,30,63,0.04)",
    opacity: isLocked ? 0.80 : 1,
    position: "relative",
    transition: "background .18s"
  }),
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: isMobile ? 5 : 14,
    marginBottom: isMobile ? 7 : 13,
    flexWrap: "wrap"
  },
  title: (isLocked) => ({
    fontWeight: 700,
    fontSize: isMobile ? "1.13rem" : "1.21rem",
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
    boxShadow: "0 1px 4px rgba(220,38,38,0.08)",
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
    fontSize: isMobile ? "1.13rem" : "1.08rem",
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
    boxShadow: "0 2px 7px rgba(16,185,129,0.07)",
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
    boxShadow: "0 2px 12px rgba(16,185,129,0.08)",
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
  }
});

const EditAchievements = () => {
  const [editData, setEditData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [saving, setSaving] = useState(false);
  const [validation, setValidation] = useState({});
  const [hasChanges, setHasChanges] = useState(false);
  const [hoverState, setHoverState] = useState({
    addButton: false,
    saveButton: false,
    removeButtons: {}
  });

  const isMobile = useResponsive();
  const styles = getStyles(isMobile);

  // Track how many achievements are initially loaded (locked)
  const [initialCount, setInitialCount] = useState(0);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(
          "https://placement-portal-backend.ramshekade20.workers.dev/api/student/profile/view",
          {
            withCredentials: true
          }
        );
        setEditData(res.data.profile);
        setInitialCount((res.data.profile?.achievements || []).length);
      } catch (err) {
        console.error("Failed to load profile:", err);
        setMsg({ type: 'error', text: "Failed to load profile data" });
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  // Only lock initial achievements, not newly added ones
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

  const validateAchievements = () => {
    const errors = {};
    let isValid = true;

    // Check if achievements exist
    if (!editData.achievements || editData.achievements.length === 0) {
      return { isValid, errors };
    }

    // Validate each achievement
    editData.achievements.forEach((achievement, idx) => {
      const achievementErrors = {};

      // Skip validation for locked achievements
      if (isLocked(idx)) {
        return;
      }

      // Title is required
      if (!achievement.title || achievement.title.trim() === '') {
        achievementErrors.title = 'Achievement title is required';
        isValid = false;
      }

      // Description is required
      if (!achievement.description || achievement.description.trim() === '') {
        achievementErrors.description = 'Description is required';
        isValid = false;
      } else if (achievement.description.trim().length < 10) {
        achievementErrors.description = 'Description must be at least 10 characters';
        isValid = false;
      }

      // URL format validation (if provided)
      if (achievement.media && !isValidUrl(achievement.media)) {
        achievementErrors.media = 'Please enter a valid URL (e.g., https://example.com)';
        isValid = false;
      }

      if (Object.keys(achievementErrors).length > 0) {
        errors[idx] = achievementErrors;
      }
    });

    return { isValid, errors };
  };

  const handleArrayFieldChange = (idx, field, value) => {
    // Clear validation error when user edits a field
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

    setEditData((prev) => {
      const updatedArray = prev.achievements ? [...prev.achievements] : [];
      updatedArray[idx] = { ...updatedArray[idx], [field]: value };
      return { ...prev, achievements: updatedArray };
    });

    setHasChanges(true);

    // Clear any message when form is edited
    if (msg.text) {
      setMsg({ type: '', text: '' });
    }
  };

  const handleAddItem = () => {
    setEditData((prev) => ({
      ...prev,
      achievements: prev.achievements
        ? [...prev.achievements, { title: "", description: "", media: "" }]
        : [{ title: "", description: "", media: "" }]
    }));

    setHasChanges(true);

    // Clear any message when adding a new item
    if (msg.text) {
      setMsg({ type: '', text: '' });
    }

    // Scroll to the new item
    setTimeout(() => {
      const achievementElements = document.querySelectorAll('[data-achievement-item]');
      const lastAchievement = achievementElements[achievementElements.length - 1];
      if (lastAchievement) {
        lastAchievement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  };

  const handleRemoveItem = (idx) => {
    // Cannot remove locked achievements
    if (isLocked(idx)) {
      setMsg({
        type: 'error',
        text: "Original achievements cannot be removed"
      });
      return;
    }

    setEditData((prev) => {
      const updatedArray = prev.achievements ? [...prev.achievements] : [];
      updatedArray.splice(idx, 1);
      return { ...prev, achievements: updatedArray };
    });

    // Also remove any validation errors for this achievement
    if (validation[idx]) {
      const newValidation = { ...validation };
      delete newValidation[idx];
      setValidation(newValidation);
    }

    setHasChanges(true);

    // Clear any message when removing an item
    if (msg.text) {
      setMsg({ type: '', text: '' });
    }
  };

  const handleSave = async () => {
    // Validate achievements before saving
    const { isValid, errors } = validateAchievements();

    if (!isValid) {
      setValidation(errors);
      setMsg({
        type: 'error',
        text: "Please fix the validation errors before saving"
      });

      // Scroll to the first achievement with errors
      const firstErrorIdx = Object.keys(errors)[0];
      if (firstErrorIdx) {
        const errorElement = document.querySelector(`[data-achievement-item="${firstErrorIdx}"]`);
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
      formData.append("achievements", JSON.stringify(editData.achievements || []));

      // Call the API to update achievements
      const response = await axios.post(
        "https://placement-portal-backend.ramshekade20.workers.dev/api/student/profile/update/achievement",
        formData,
        {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      console.log("API Response:", response.data);

      if (response.data && response.data.success) {
        // After successful update, update the initialCount
        setInitialCount(editData.achievements ? editData.achievements.length : 0);
        setMsg({ type: 'success', text: response.data.message || "Achievements updated successfully!" });
        setHasChanges(false);
      } else {
        setMsg({ type: 'error', text: response.data.error || "Failed to update achievements" });
      }
    } catch (error) {
      console.error("Failed to update achievements:", error);

      // Extract the error message
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

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loadingSpinner}></div>
        <div style={styles.loadingText}>Loading your achievements...</div>
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
      <Section title="Achievements & Awards" icon={<FaTrophy />} style={styles.section}>
        <div style={styles.infoContainer}>
          <FaInfoCircle size={18} color="#0284c7" style={{ marginTop: 2 }} />
          <div style={{ fontSize: "0.9rem", color: "#0c4a6e" }}>
            Showcase your notable achievements, awards, certifications, or recognition you've received. These help demonstrate your skills and accomplishments to potential employers.
          </div>
        </div>

        {(editData?.achievements ?? []).length > 0 ? (
          <div style={styles.listContainer}>
            {editData.achievements.map((ach, idx) => {
              const locked = isLocked(idx);
              const newAch = isNew(idx);
              const hasErrors = validation[idx] && Object.keys(validation[idx]).length > 0;

              return (
                <div
                  key={idx}
                  style={styles.listItem(locked, newAch, hasErrors)}
                  data-achievement-item={idx}
                >
                  <div style={styles.header}>
                    <span style={styles.title(locked)}>
                      {ach?.title || `Achievement ${idx + 1}`}
                      {locked && (
                        <>
                          <FaLock style={styles.lockIcon} title="This achievement is locked and cannot be edited or removed." />
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
                        title="Remove Achievement"
                      >
                        <FaTrash /> <span>Remove</span>
                      </button>
                    )}
                  </div>
                  <div>
                    <div>
                      <label style={styles.fieldLabel}>
                        Title
                        {!locked && <span style={styles.fieldRequired}>*</span>}
                      </label>
                      <input
                        style={styles.input(locked, validation[idx]?.title)}
                        value={ach?.title || ""}
                        onChange={e => handleArrayFieldChange(idx, "title", e.target.value)}
                        placeholder="Achievement Title"
                        disabled={locked}
                      />
                      {validation[idx]?.title && (
                        <div style={styles.errorText}>{validation[idx].title}</div>
                      )}
                    </div>
                    <div>
                      <label style={styles.fieldLabel}>
                        Description
                        {!locked && <span style={styles.fieldRequired}>*</span>}
                      </label>
                      <textarea
                        style={styles.input(locked, validation[idx]?.description)}
                        value={ach?.description || ""}
                        onChange={e => handleArrayFieldChange(idx, "description", e.target.value)}
                        placeholder="Describe your achievement, when you received it, and why it's significant"
                        disabled={locked}
                        rows={isMobile ? 3 : 2}
                      />
                      {validation[idx]?.description && (
                        <div style={styles.errorText}>{validation[idx].description}</div>
                      )}
                      {!locked && !validation[idx]?.description && (
                        <div style={styles.helpText}>Minimum 10 characters</div>
                      )}
                    </div>
                    <div>
                      <label style={styles.fieldLabel}>
                        Media Link
                        <span style={{ color: "#64748b", fontSize: "0.75rem", marginLeft: 4 }}>(optional)</span>
                      </label>
                      <input
                        style={styles.input(locked, validation[idx]?.media)}
                        value={ach?.media || ""}
                        onChange={e => handleArrayFieldChange(idx, "media", e.target.value)}
                        placeholder="https://"
                        disabled={locked}
                      />
                      {validation[idx]?.media && (
                        <div style={styles.errorText}>{validation[idx].media}</div>
                      )}
                      {!locked && ach?.media && isValidUrl(ach.media) && !validation[idx]?.media && (
                        <div style={styles.validUrl}>
                          <FaLink size={12} /> Valid URL format
                        </div>
                      )}
                      {!locked && !validation[idx]?.media && (
                        <div style={styles.helpText}>Link to certificate, photo, or other evidence</div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={styles.emptyState}>
            <p>No achievements added yet. Click the button below to add your first achievement.</p>
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
          <span style={{ flex: 1, textAlign: "center" }}>Add Achievement</span>
        </button>
      </Section>
      <button
        style={{
          ...styles.saveBtn,
          ...(hoverState.saveButton && !saving && hasChanges ? styles.saveBtnHover : {}),
          ...(saving || !hasChanges ? styles.saveBtnDisabled : {}),
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
              Save Changes
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

export default EditAchievements;