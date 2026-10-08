import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaCode, FaPlus, FaTrash, FaLock, FaSave, FaExclamationTriangle, FaCheckCircle, FaLink, FaInfoCircle } from "react-icons/fa";
import { Section } from "./EditProfileHelpers";


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
    gap: isMobile ? 15 : 22,
    width: "100%",
  },
  listItem: (isLocked, hasError) => ({
    background: hasError ? "#fff2f0" : (isLocked ? "#f1f5f9" : "#e6f9f3"),
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
  projectTitle: (isLocked) => ({
    fontWeight: 700,
    fontSize: isMobile ? "1.11rem" : "1.18rem",
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
    fontSize: isMobile ? "1.02rem" : "1rem",
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
    fontSize: isMobile ? "1.10rem" : "1.04rem",
    padding: isMobile ? "11px 14px" : "10px 13px",
    border: hasError ? "1.4px solid #dc2626" : (isLocked ? "1.2px dashed #cbd5e1" : "1.4px solid #10b981"),
    borderRadius: 8,
    background: hasError ? "#fff2f0" : (isLocked ? "#f3f4f6" : "#fff"),
    color: "#22223b",
    outline: "none",
    marginBottom: 6,
    pointerEvents: isLocked ? "none" : "auto",
    opacity: isLocked ? 0.7 : 1,
    minHeight: 40,
    resize: "vertical",
    transition: "border .13s"
  }),
  errorText: {
    color: "#dc2626",
    fontSize: "0.75rem",
    marginTop: 2,
    marginBottom: 5
  },
  addBtn: {
    background: "#10b981",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    fontWeight: 700,
    fontSize: isMobile ? "1.10rem" : "1.14rem",
    padding: isMobile ? "13px 0" : "14px 0",
    marginTop: isMobile ? 13 : 17,
    marginBottom: isMobile ? 13 : 18,
    width: isMobile ? "100%" : 230,
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
    fontSize: isMobile ? "1.12rem" : "1.18rem",
    padding: isMobile ? "14px 0" : "15px 0",
    marginTop: isMobile ? 16 : 26,
    width: isMobile ? "100%" : 260,
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

const EditProjects = () => {
  const [editData, setEditData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [saving, setSaving] = useState(false);
  const isMobile = useResponsive();
  const styles = getStyles(isMobile);

  // Track which projects were fetched from the database initially
  const [originalProjects, setOriginalProjects] = useState([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [validation, setValidation] = useState({});
  const [hoverState, setHoverState] = useState({
    addButton: false,
    saveButton: false,
    removeButtons: {}
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(
          "https://placement-portal-backend.ramshekade20.workers.dev/api/student/profile/view",
          { withCredentials: true }
        );

        // Store the profile data
        setEditData(res.data.profile);

        // Keep a copy of the original projects to know which ones are locked
        setOriginalProjects(res.data.profile.projects || []);
      } catch (err) {
        console.error("Failed to fetch profile:", err);
        setMsg({ type: 'error', text: "Failed to load profile" });
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  // Function to determine if a project is one of the original ones (locked)
  const isOriginalProject = (project, idx) => {
    if (idx < originalProjects.length) {
      return true;
    }
    return false;
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

  const validateProjects = () => {
    const errors = {};
    let isValid = true;

    // Check if projects exist
    if (!editData.projects || editData.projects.length === 0) {
      return { isValid, errors };
    }

    // Validate each project
    editData.projects.forEach((project, idx) => {
      const projectErrors = {};

      // Skip validation for locked projects
      if (isOriginalProject(project, idx)) {
        return;
      }

      // Title is required
      if (!project.title || project.title.trim() === '') {
        projectErrors.title = 'Project name is required';
        isValid = false;
      }

      // Description is required
      if (!project.description || project.description.trim() === '') {
        projectErrors.description = 'Description is required';
        isValid = false;
      } else if (project.description.trim().length < 10) {
        projectErrors.description = 'Description must be at least 10 characters';
        isValid = false;
      }

      // URL format validation (if provided)
      if (project.url && !isValidUrl(project.url)) {
        projectErrors.url = 'Please enter a valid URL (e.g., https://example.com)';
        isValid = false;
      }

      if (Object.keys(projectErrors).length > 0) {
        errors[idx] = projectErrors;
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
      const updatedArray = prev.projects ? [...prev.projects] : [];
      updatedArray[idx] = { ...updatedArray[idx], [field]: value };
      return { ...prev, projects: updatedArray };
    });
    setHasChanges(true);
  };

  const handleAddItem = () => {
    setEditData((prev) => ({
      ...prev,
      projects: prev.projects
        ? [...prev.projects, { title: "", description: "", url: "" }]
        : [{ title: "", description: "", url: "" }],
    }));
    setHasChanges(true);

    // Scroll to the new item
    setTimeout(() => {
      const projectElements = document.querySelectorAll('[data-project-item]');
      const lastProject = projectElements[projectElements.length - 1];
      if (lastProject) {
        lastProject.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  };

  const handleRemoveItem = (idx) => {
    // Cannot remove original projects
    if (isOriginalProject(editData.projects[idx], idx)) {
      setMsg({
        type: 'error',
        text: "Original projects cannot be removed"
      });
      return;
    }

    setEditData((prev) => {
      const updatedArray = prev.projects ? [...prev.projects] : [];
      updatedArray.splice(idx, 1);
      return { ...prev, projects: updatedArray };
    });

    // Also remove any validation errors for this project
    if (validation[idx]) {
      const newValidation = { ...validation };
      delete newValidation[idx];
      setValidation(newValidation);
    }

    setHasChanges(true);
  };

  const handleSave = async () => {
    // Validate projects before saving
    const { isValid, errors } = validateProjects();

    if (!isValid) {
      setValidation(errors);
      setMsg({
        type: 'error',
        text: "Please fix the validation errors before saving"
      });

      // Scroll to the first project with errors
      const firstErrorIdx = Object.keys(errors)[0];
      if (firstErrorIdx) {
        const errorElement = document.querySelector(`[data-project-item="${firstErrorIdx}"]`);
        if (errorElement) {
          errorElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }

      return;
    }

    setSaving(true);
    setMsg({ type: '', text: '' });

    try {
      // Construct the updated projects array
      const updatedProjects = [...editData.projects];

      const formData = new FormData();
      formData.append("projects", JSON.stringify(updatedProjects || []));

      // Make the API call to update projects
      const response = await axios.post(
        "https://placement-portal-backend.ramshekade20.workers.dev/api/student/profile/update/project",
        formData,
        {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      console.log("API Response:", response.data);

      if (response.data && response.data.success) {
        // After successful update, update the originalProjects
        setOriginalProjects(updatedProjects);
        setMsg({ type: 'success', text: response.data.message || "Projects updated successfully!" });
        setHasChanges(false);
      } else {
        setMsg({ type: 'error', text: response.data.error || "Failed to update projects" });
      }
    } catch (error) {
      console.error("Failed to update projects:", error);

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

  // Show loading state
  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loadingSpinner}></div>
        <div style={styles.loadingText}>Loading your projects...</div>
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
      <Section title="Projects Portfolio" icon={<FaCode />} style={styles.section}>
        <div style={styles.infoContainer}>
          <FaInfoCircle size={18} color="#0284c7" style={{ marginTop: 2 }} />
          <div style={{ fontSize: "0.9rem", color: "#0c4a6e" }}>
            Projects showcase your technical abilities to potential employers. Add your most impressive work with detailed descriptions and links to repos or demos.
          </div>
        </div>

        {(editData?.projects ?? []).length > 0 ? (
          <div style={styles.listContainer}>
            {editData.projects.map((project, idx) => {
              const isLocked = isOriginalProject(project, idx);
              const hasErrors = validation[idx] && Object.keys(validation[idx]).length > 0;

              return (
                <div
                  key={idx}
                  style={styles.listItem(isLocked, hasErrors)}
                  data-project-item={idx}
                >
                  <div style={styles.header}>
                    <span style={styles.projectTitle(isLocked)}>
                      {project?.title || `Project ${idx + 1}`}
                      {isLocked && (
                        <>
                          <FaLock style={styles.lockIcon} title="This project is locked and cannot be edited." />
                          <span style={{ color: "#eab308", fontSize: "0.99rem", marginLeft: 4 }}>Locked</span>
                        </>
                      )}
                    </span>
                    {!isLocked && (
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
                        title="Remove Project"
                      >
                        <FaTrash /> <span>Remove</span>
                      </button>
                    )}
                  </div>
                  <div>
                    <div>
                      <label style={styles.fieldLabel}>
                        Project Name
                        {!isLocked && <span style={styles.fieldRequired}>*</span>}
                      </label>
                      <input
                        style={styles.input(isLocked, validation[idx]?.title)}
                        value={project?.title || ""}
                        onChange={e => handleArrayFieldChange(idx, "title", e.target.value)}
                        placeholder="Project Name"
                        disabled={isLocked}
                      />
                      {validation[idx]?.title && (
                        <div style={styles.errorText}>{validation[idx].title}</div>
                      )}
                    </div>
                    <div>
                      <label style={styles.fieldLabel}>
                        Description
                        {!isLocked && <span style={styles.fieldRequired}>*</span>}
                      </label>
                      <textarea
                        style={styles.input(isLocked, validation[idx]?.description)}
                        value={project?.description || ""}
                        onChange={e => handleArrayFieldChange(idx, "description", e.target.value)}
                        placeholder="Describe your project, technologies used, and your role"
                        disabled={isLocked}
                        rows={isMobile ? 3 : 2}
                      />
                      {validation[idx]?.description && (
                        <div style={styles.errorText}>{validation[idx].description}</div>
                      )}
                      {!isLocked && !validation[idx]?.description && (
                        <div style={styles.helpText}>Minimum 10 characters</div>
                      )}
                    </div>
                    <div>
                      <label style={styles.fieldLabel}>
                        Project Link
                        <span style={{ color: "#64748b", fontSize: "0.75rem", marginLeft: 4 }}>(optional)</span>
                      </label>
                      <input
                        style={styles.input(isLocked, validation[idx]?.url)}
                        value={project?.url || ""}
                        onChange={e => handleArrayFieldChange(idx, "url", e.target.value)}
                        placeholder="https://"
                        disabled={isLocked}
                      />
                      {validation[idx]?.url && (
                        <div style={styles.errorText}>{validation[idx].url}</div>
                      )}
                      {!isLocked && project?.url && isValidUrl(project.url) && !validation[idx]?.url && (
                        <div style={styles.validUrl}>
                          <FaLink size={12} /> Valid URL format
                        </div>
                      )}
                      {!isLocked && !validation[idx]?.url && (
                        <div style={styles.helpText}>GitHub repo, live demo, or portfolio link</div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={styles.emptyState}>
            <p>No projects added yet. Click the button below to add your first project.</p>
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
          <span style={{ flex: 1, textAlign: "center" }}>Add Project</span>
        </button>
      </Section>
      <button
        style={{
          ...styles.saveBtn,
          ...(hoverState.saveButton && !saving && hasChanges ? styles.saveBtnHover : {}),
          opacity: saving || !hasChanges ? 0.7 : 1,
          cursor: saving || !hasChanges ? "not-allowed" : "pointer"
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

export default EditProjects;