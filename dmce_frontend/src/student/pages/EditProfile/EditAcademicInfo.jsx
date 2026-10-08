import React, { useState } from "react";
import axios from "axios";
import { FaGraduationCap, FaCheckCircle, FaExclamationCircle } from "react-icons/fa";
import { Section, EditableItem, EditableInput } from "./EditProfileHelpers";

// Dropdown options
const CURRENT_YEAR_OPTIONS = [
  { value: "First year", label: "First year" },
  { value: "Second year", label: "Second year" },
  { value: "Third year", label: "Third year" },
  { value: "Fourth year", label: "Fourth year" },
];
const LAST_SEM_OPTIONS = [
  { value: "Sem 1", label: "Sem 1" },
  { value: "Sem 2", label: "Sem 2" },
  { value: "Sem 3", label: "Sem 3" },
  { value: "Sem 4", label: "Sem 4" },
  { value: "Sem 5", label: "Sem 5" },
  { value: "Sem 6", label: "Sem 6" },
  { value: "Sem 7", label: "Sem 7" },
  { value: "Sem 8", label: "Sem 8" },
];

const renderFileLink = (url, label) => (
  <a
    href={url}
    target="_blank"
    rel="noopener noreferrer"
    style={{
      color: "#2563eb",
      textDecoration: "underline",
      fontWeight: 500,
      marginLeft: 4,
    }}
  >
    {label}
  </a>
);

// Responsive style hook
const useResponsive = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 750);
  React.useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 750);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return isMobile;
};

const getStyles = (isMobile) => ({
  mainContainer: {
    maxWidth: 1500,
    margin: "0 auto",
    background: "#f7fafc",
    borderRadius: 18,
    padding: isMobile ? "1.2rem 0.4rem" : "2.6rem 2.1rem",
    boxShadow: "0 4px 24px rgba(30,30,63,0.05)",
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    gap: isMobile ? 18 : 32,
  },
  academicGrid: {
    display: "grid",
    gridTemplateColumns: isMobile
      ? "1fr"
      : "repeat(auto-fit, minmax(270px, 1fr))",
    gap: isMobile ? 17 : 30,
    marginBottom: isMobile ? 17 : 22,
    width: "100%",
  },
  eduListContainer: {
    display: "flex",
    flexDirection: isMobile ? "column" : "row",
    gap: isMobile ? 16 : 30,
    width: "100%",
    flexWrap: "wrap",
  },
  eduListItem: {
    background: "#fff",
    borderRadius: 13,
    border: "1.3px solid #e2e8f0",
    boxShadow: "0 1px 7px rgba(30,30,63,0.06)",
    padding: isMobile ? "1.1rem 1rem" : "1.3rem 1.5rem",
    minWidth: isMobile ? "unset" : 270,
    flex: 1,
    marginBottom: 0,
    marginTop: 0,
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  listHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 9,
    borderBottom: "1.5px solid #e2e8f0",
    paddingBottom: 7,
    marginBottom: 10,
  },
  listTitle: {
    fontWeight: 700,
    fontSize: isMobile ? "1.08rem" : "1.13rem",
    color: "#1e1e3f",
  },
  listMeta: {
    fontSize: isMobile ? "1.01rem" : "1.06rem",
    color: "#64748b",
  },
  listContent: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
    fontSize: isMobile ? "1rem" : "1.08rem",
  },
  saveContainer: {
    display: "flex",
    justifyContent: "center",
    width: "100%",
  },
  saveButton: {
    marginTop: isMobile ? 19 : 26,
    background: "#10b981",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    fontWeight: 700,
    fontSize: isMobile ? "1.10rem" : "1.18rem",
    padding: "13px 0",
    width: isMobile ? "100%" : 240,
    maxWidth: "100%",
    cursor: "pointer",
    boxShadow: "0 2px 12px rgba(16,185,129,0.07)",
    letterSpacing: ".01em",
    transition: "background .16s",
    display: "block",
    textAlign: "center",
  },
  saveButtonDisabled: {
    background: "#94d1be",
    cursor: "not-allowed",
  },
  msg: {
    marginTop: isMobile ? 13 : 18,
    fontWeight: 600,
    textAlign: "center",
    fontSize: isMobile ? "1.06rem" : "1.09rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  successMsg: {
    color: "#059669",
  },
  errorMsg: {
    color: "#dc2626",
  },
  inputError: {
    border: "1.5px solid #dc2626",
    background: "#fef2f2",
  },
  errorText: {
    color: "#dc2626",
    fontSize: "0.875rem",
    marginTop: 4,
  },
  footerInfo: {
    fontSize: "0.75rem",
    color: "#64748b",
    marginTop: "15px",
    textAlign: "center",
  },
  loadingStyle: {
    textAlign: "center",
    marginTop: isMobile ? 30 : 60,
    color: "#64748b",
    fontSize: isMobile ? "1.15rem" : "1rem",
  },
});

/**
 * Controlled child component with API integration
 * editData and setEditData come from parent.
 */
const EditAcademicInfo = ({ editData, setEditData }) => {
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState(""); // 'success' or 'error'
  const [saving, setSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const isMobile = useResponsive();
  const styles = getStyles(isMobile);

  if (!editData) return <div style={styles.loadingStyle}>Loading academic information...</div>;

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Clear any specific field errors when the user edits a field
    if (fieldErrors[name]) {
      const newErrors = { ...fieldErrors };
      delete newErrors[name];
      setFieldErrors(newErrors);
    }

    // Clear any message when form is edited
    if (msg) {
      setMsg('');
      setMsgType('');
    }

    // Handle specific validations
    if (name === "expected_graduation_year") {
      // Ensure it's a number and within reasonable range
      const numValue = parseInt(value, 10);
      const currentYear = new Date().getFullYear();

      if (isNaN(numValue)) {
        setFieldErrors({
          ...fieldErrors,
          expected_graduation_year: "Please enter a valid year"
        });
      } else if (numValue < currentYear) {
        setFieldErrors({
          ...fieldErrors,
          expected_graduation_year: "Graduation year must be current or future year"
        });
      } else if (numValue > currentYear + 10) {
        setFieldErrors({
          ...fieldErrors,
          expected_graduation_year: "Graduation year seems too far in the future"
        });
      } else if (numValue < currentYear) {
        setFieldErrors({
          ...fieldErrors,
          expected_graduation_year: "Graduation year must be current or future year"
        });
      }
    }

    // Update the form data
    setEditData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    const errors = {};
    let isValid = true;

    // Validate current_year
    if (!editData.current_year) {
      errors.current_year = "Please select your current year";
      isValid = false;
    }

    // Validate expected_graduation_year
    if (!editData.expected_graduation_year) {
      errors.expected_graduation_year = "Please enter your expected graduation year";
      isValid = false;
    } else {
      const numValue = parseInt(editData.expected_graduation_year, 10);
      const currentYear = new Date().getFullYear();

      if (isNaN(numValue)) {
        errors.expected_graduation_year = "Please enter a valid year";
        isValid = false;
      } else if (numValue < currentYear) {
        errors.expected_graduation_year = "Graduation year must be current or future year";
        isValid = false;
      } else if (numValue > currentYear + 10) {
        errors.expected_graduation_year = "Graduation year seems too far in the future";
        isValid = false;
      }
    }

    // Validate CGPA if provided
    if (editData.cgpa) {
      const cgpaValue = parseFloat(editData.cgpa);
      if (isNaN(cgpaValue)) {
        errors.cgpa = "Please enter a valid CGPA";
        isValid = false;
      } else if (cgpaValue < 4 || cgpaValue > 10) {
        errors.cgpa = "CGPA must be between 4 and 10";
        isValid = false;
      }
    }

    // Validate last_semester (renamed from last_Sem to match API)
    if (!editData.last_semester) {
      errors.last_semester = "Please select your last completed semester";
      isValid = false;
    }

    setFieldErrors(errors);
    return isValid;
  };
  const handleSave = async () => {
    // Validate the form before submission
    if (!validateForm()) {
      setMsg('Please fix the validation errors before submitting');
      setMsgType('error');
      return;
    }

    setSaving(true);
    setMsg("");
    setMsgType("");

    try {
      // Prepare form data for API
      const formData = new FormData();

      // Fields expected by the API
      formData.append("current_year", editData.current_year || "");
      formData.append("expected_graduation_year", editData.expected_graduation_year || "");
      formData.append("cgpa", editData.cgpa || "");
      formData.append("last_semester", editData.last_semester || editData.last_Sem || "");

      // Call the API to update academic info
      const response = await axios.post(
        'https://placement-portal-backend.ramshekade20.workers.dev/api/student/profile/update/academic',
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
        setMsg(response.data.message || "Academic information updated successfully!");
        setMsgType('success');

        // Update local state to reflect server changes (if needed)
        setEditData(prev => ({
          ...prev,
          // Ensure local state matches what was saved on server
          current_year: editData.current_year,
          expected_graduation_year: editData.expected_graduation_year,
          last_semester: editData.last_semester || editData.last_Sem,
        }));
      } else {
        // Handle error in response
        setMsg(response.data.error || "Failed to update academic information");
        setMsgType('error');
      }
    } catch (error) {
      console.error("API Error:", error);

      // Extract error message from response
      let errorMessage = "Failed to update academic information. Please try again.";
      let errorDetails = "";

      if (error.response && error.response.data) {
        errorMessage = error.response.data.error || errorMessage;
        errorDetails = error.response.data.details || "";
      } else if (error.message) {
        errorMessage = error.message;
      }

      // Check for specific database errors
      if (errorDetails && errorDetails.includes("D1_ERROR")) {
        if (errorDetails.includes("SQLITE_CONSTRAINT")) {
          errorMessage = "There was a conflict with existing data. Please try different values.";
        } else if (errorDetails.includes("SQLITE_ERROR")) {
          errorMessage = "There was a database error. Please try again later.";
        }
      }

      setMsg(errorMessage);
      setMsgType('error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={styles.mainContainer}>
      {/* Academic Status */}
      <Section title="Current Academic Status" icon={<FaGraduationCap />}>
        <div style={styles.academicGrid}>
          <EditableItem label="Department">
            <EditableInput name="department" value={editData?.department} disabled />
          </EditableItem>
          <EditableItem label="Current Year *">
            <select
              name="current_year"
              className="uvp-edit-input"
              value={editData?.current_year || ""}
              onChange={handleChange}
              style={{
                width: "100%",
                padding: isMobile ? "12px 12px" : "9px 10px",
                borderRadius: 7,
                fontSize: isMobile ? "1.06rem" : "1.01rem",
                ...(fieldErrors.current_year ? styles.inputError : {})
              }}
            >
              <option value="">Select Year</option>
              {CURRENT_YEAR_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            {fieldErrors.current_year && (
              <div style={styles.errorText}>{fieldErrors.current_year}</div>
            )}
          </EditableItem>
          <EditableItem label="PRN Number">
            <EditableInput name="prn" value={editData?.prn || ""} disabled />
          </EditableItem>
          <EditableItem label="Division">
            <EditableInput name="division" value={editData?.division || ""} disabled />
          </EditableItem>
          <EditableItem label="Year of Admission">
            <EditableInput name="year_of_admission" value={editData?.year_of_admission || ""} disabled />
          </EditableItem>
          <EditableItem label="Expected Graduation Year *">
            <EditableInput
              name="expected_graduation_year"
              value={editData?.expected_graduation_year || ""}
              onChange={handleChange}
              type="number"
              min={new Date().getFullYear()}
              max={new Date().getFullYear() + 10}
              style={fieldErrors.expected_graduation_year ? styles.inputError : {}}
              placeholder="e.g., 2026"
            />
            {fieldErrors.expected_graduation_year && (
              <div style={styles.errorText}>{fieldErrors.expected_graduation_year}</div>
            )}
          </EditableItem>
          <EditableItem label="Current CGPA">
            <EditableInput
              name="cgpa"
              value={editData?.cgpa || ""}
              onChange={handleChange}
              type="number"
              min={4}
              max={10}
              step={0.01}
              placeholder="CGPA (4-10)"
              style={fieldErrors.cgpa ? styles.inputError : {}}
            />
            {fieldErrors.cgpa && (
              <div style={styles.errorText}>{fieldErrors.cgpa}</div>
            )}
          </EditableItem>
          <EditableItem label="Last Completed Semester *">
            <select
              name="last_semester"
              className="uvp-edit-input"
              value={editData?.last_semester || editData?.last_Sem || ""}
              onChange={handleChange}
              style={{
                width: "100%",
                padding: isMobile ? "12px 12px" : "9px 10px",
                borderRadius: 7,
                fontSize: isMobile ? "1.06rem" : "1.01rem",
                ...(fieldErrors.last_semester ? styles.inputError : {})
              }}
            >
              <option value="">Select Semester</option>
              {LAST_SEM_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            {fieldErrors.last_semester && (
              <div style={styles.errorText}>{fieldErrors.last_semester}</div>
            )}
          </EditableItem>
        </div>
      </Section>

      {/* Educational Records */}
      <Section title="Educational Records" icon={<FaGraduationCap />}>
        <div style={styles.eduListContainer}>
          {/* SSC */}
          <div style={styles.eduListItem}>
            <div style={styles.listHeader}>
              <h4 style={styles.listTitle}>SSC (10th Grade)</h4>
              <span style={styles.listMeta}>
                {editData?.ssc_year || "Year not specified"}
              </span>
            </div>
            <div style={styles.listContent}>
              <div>
                <span style={{ fontWeight: 600, color: "#374151" }}>
                  Percentage:&nbsp;
                </span>
                <span>
                  {editData?.ssc_percentage
                    ? `${editData.ssc_percentage}%`
                    : "Not specified"}
                </span>
              </div>
              {editData?.ssc_marksheet_url && (
                <div>
                  <span style={{ fontWeight: 600, color: "#374151" }}>
                    Marksheet:&nbsp;
                  </span>
                  {renderFileLink(editData.ssc_marksheet_url, "SSC Marksheet")}
                </div>
              )}
            </div>
          </div>
          {/* HSC */}
          <div style={styles.eduListItem}>
            <div style={styles.listHeader}>
              <h4 style={styles.listTitle}>HSC (12th Grade)</h4>
              <span style={styles.listMeta}>
                {editData?.hsc_year || "Year not specified"}
              </span>
            </div>
            <div style={styles.listContent}>
              <div>
                <span style={{ fontWeight: 600, color: "#374151" }}>
                  Percentage:&nbsp;
                </span>
                <span>
                  {editData?.hsc_percentage
                    ? `${editData.hsc_percentage}%`
                    : "Not specified"}
                </span>
              </div>
              {editData?.hsc_marksheet_url && (
                <div>
                  <span style={{ fontWeight: 600, color: "#374151" }}>
                    Marksheet:&nbsp;
                  </span>
                  {renderFileLink(editData.hsc_marksheet_url, "HSC Marksheet")}
                </div>
              )}
            </div>
          </div>
          {/* Diploma (optional) */}
          {(editData?.diploma_percentage || editData?.diploma_marksheet_url) && (
            <div style={styles.eduListItem}>
              <div style={styles.listHeader}>
                <h4 style={styles.listTitle}>Diploma</h4>
                <span style={styles.listMeta}>
                  {editData?.diploma_year || "Year not specified"}
                </span>
              </div>
              <div style={styles.listContent}>
                <div>
                  <span style={{ fontWeight: 600, color: "#374151" }}>
                    Percentage:&nbsp;
                  </span>
                  <span>
                    {editData?.diploma_percentage
                      ? `${editData.diploma_percentage}%`
                      : "Not specified"}
                  </span>
                </div>
                {editData?.diploma_marksheet_url && (
                  <div>
                    <span style={{ fontWeight: 600, color: "#374151" }}>
                      Marksheet:&nbsp;
                    </span>
                    {renderFileLink(
                      editData.diploma_marksheet_url,
                      "Diploma Marksheet"
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </Section>

      <div style={styles.saveContainer}>
        <button
          className="uvp-edit-button"
          style={{
            ...styles.saveButton,
            ...(saving ? styles.saveButtonDisabled : {})
          }}
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? <span>Saving...</span> : <>Update Academic Info</>}
        </button>
      </div>

      {msg && (
        <div
          className={`uvp-save-msg ${msgType === 'success' ? 'success' : 'error'}`}
          style={{
            ...styles.msg,
            ...(msgType === 'success' ? styles.successMsg : styles.errorMsg)
          }}
        >
          {msgType === 'success' ? (
            <FaCheckCircle />
          ) : (
            <FaExclamationCircle />
          )}
          {msg}
        </div>
      )}

    </div>
  );
};

export default EditAcademicInfo;