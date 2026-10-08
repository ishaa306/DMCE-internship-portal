import React, { useState } from "react";
import { FaPlusCircle } from "react-icons/fa";
import "./SalaryDetails.css";

const SalaryDetails = ({ data = {}, setData, onNext }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Only allow numbers for CTC and stipend
    if ((name === "ctc" || name === "stipend") && value !== "") {
      const numericValue = value.replace(/[^0-9.]/g, "");
      if (numericValue !== value) {
        return;
      }
    }

    setData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveNext = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    console.log("Submitting Salary Details:", data);
    try {
      const hasStipend = data.stipend && data.stipend.trim() !== "";
      const hasCtc = data.ctc && data.ctc.trim() !== "";

      if (!hasStipend && !hasCtc) {
        alert(
          "Please enter either CTC (for full-time positions) or Stipend (for internships). At least one is required."
        );
        setIsSubmitting(false);
        return;
      }

      if (
        hasStipend &&
        (isNaN(data.stipend) || parseFloat(data.stipend) <= 0)
      ) {
        alert("Please enter a valid stipend amount (numbers only).");
        setIsSubmitting(false);
        return;
      }

      if (hasCtc && (isNaN(data.ctc) || parseFloat(data.ctc) <= 0)) {
        alert("Please enter a valid CTC amount (numbers only).");
        setIsSubmitting(false);
        return;
      }

      if (!validateAllSections(data)) {
        setIsSubmitting(false);
        return;
      }

      // REQUIRED BACKEND FIX: split datetime-local into date and time
      let deadline_date = "";
      let deadline_time = "";

      if (data.deadline_date_time) {
        const parts = data.deadline_date_time.split("T");
        deadline_date = parts[0];
        deadline_time = parts[1];
      }

      const jobPayload = {
        company_title: data.company_title || "", // REQUIRED
        job_title: data.job_title || "",
        job_description: data.job_description || "",
        industry: data.industry || "",
        jobLocation: data.jobLocation || "",
        jobType: data.jobType || "",
        roleType: data.roleType || "",
        openings: parseInt(data.openings) || 0,
        skills_required: data.skills_required || "",
        ctc: hasCtc ? data.ctc : null,
        stipend: hasStipend ? data.stipend : null,
        perks: data.perks || "",
        batch: data.batch || "",
        minCGPA: data.minCGPA ? parseFloat(data.minCGPA) : null,
        minTenth: data.minTenth ? parseFloat(data.minTenth) : null,
        minTwelfth: data.minTwelfth ? parseFloat(data.minTwelfth) : null,
        minDiploma: data.minDiploma ? parseFloat(data.minDiploma) : null,
        eligibleBranches: JSON.stringify(data.eligibleBranches || []),
        ktAllowed: data.ktAllowed || "No",
        driveDate: data.driveDate || "",
        interviewMode: data.interviewMode || "",
        selectionRounds: data.selectionRounds || "",
        deadline_date, // REQUIRED
        deadline_time, // REQUIRED
      };

      const formData = new FormData();
      Object.keys(jobPayload).forEach((key) => {
        if (jobPayload[key] !== null && jobPayload[key] !== undefined) {
          formData.append(key, jobPayload[key]);
        }
      });

      const response = await fetch(
        "https://placement-portal-backend.ramshekade20.workers.dev/api/company/post-job",
        {
          credentials: "include",
          method: "POST",
          body: formData,
        }
      );

      const responseData = await response.json();
      console.log("Response Status:", response.status);

      if (!response.ok) {
        throw new Error(
          responseData.message ||
          responseData.details ||
          `Server error: ${response.status}`
        );
      }

      alert(
        "Job posted successfully! The position is now live for students to apply."
      );

      if (onNext) onNext();
    } catch (error) {
      console.error("Error posting job:", error);
      alert(`Error posting job: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Validate all required fields across all sections
  const validateAllSections = (data) => {
    if (
      !data.job_title ||
      !data.job_description ||
      !data.jobLocation ||
      !data.openings ||
      !data.jobType
    ) {
      alert(
        "Please go back and fill all required fields in the Job Role section."
      );
      return false;
    }

    if (!data.skills_required || data.skills_required.trim() === "") {
      alert("Please go back and add required skills in the Job Role section.");
      return false;
    }

    if (
      !data.batch ||
      !(data.eligibleBranches && data.eligibleBranches.length)
    ) {
      alert(
        "Please go back and fill required fields in the Requirements section."
      );
      return false;
    }

    if (
      !data.selectionRounds ||
      !data.driveDate ||
      !data.interviewMode ||
      !data.deadline_date_time
    ) {
      alert(
        "Please go back and fill all required fields in the Hiring Process section."
      );
      return false;
    }

    return true;
  };

  const formatDisplayValue = (value, type) => {
    if (!value) return "";
    if (type === "ctc") {
      return `₹${parseFloat(value).toLocaleString("en-IN")} LPA`;
    }
    if (type === "stipend") {
      return `₹${parseFloat(value).toLocaleString("en-IN")} per month`;
    }
    return value;
  };

  return (
    <div className="salary-details-container">
      <div className="salary-details-header">💰 Compensation & Benefits</div>

      <form
        className="salary-details-form"
        onSubmit={(e) => e.preventDefault()}
      >
        <div className="compensation-section">
          <div className="compensation-note">
            <p className="note-text">
              <strong>Note:</strong> Either CTC (for full-time positions) or
              Stipend (for internships) is required.
            </p>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">
                💸 Stipend (in ₹ per month)
                <span className="optional-text">
                  (Required for internships)
                </span>
              </label>
              <input
                name="stipend"
                type="text"
                placeholder="e.g. 25000"
                value={data.stipend || ""}
                onChange={handleChange}
                className={`form-input ${!data.stipend && !data.ctc ? "error" : ""
                  }`}
              />
              {data.stipend && (
                <div className="display-value">
                  {formatDisplayValue(data.stipend, "stipend")}
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">
                📈 CTC (in ₹ LPA)
                <span className="optional-text">(Required for full-time)</span>
              </label>
              <input
                name="ctc"
                type="text"
                placeholder="e.g. 7.5"
                value={data.ctc || ""}
                onChange={handleChange}
                className={`form-input ${!data.stipend && !data.ctc ? "error" : ""
                  }`}
              />
              {data.ctc && (
                <div className="display-value">
                  {formatDisplayValue(data.ctc, "ctc")}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="form-group full-width">
          <label className="form-label">🎁 Perks & Benefits</label>
          <textarea
            name="perks"
            placeholder="e.g. Work from Home, Certificate, Insurance"
            value={data.perks || ""}
            onChange={handleChange}
            className="form-textarea"
            rows={4}
          />
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="post-job-btn"
            onClick={handleSaveNext}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Posting..." : (
              <>
                <FaPlusCircle size={18} />
                Post Job
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SalaryDetails;
