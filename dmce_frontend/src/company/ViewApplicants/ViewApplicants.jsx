import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import axios from "axios";
import { FaSync, FaExclamationCircle } from "react-icons/fa";
import CollegeHeader from "../../shared/CollegeHeader";
import "./ViewApplicants.css";

const ViewApplicants = () => {
  // State for job and applicant data
  const [jobs, setJobs] = useState([]);
  const [applicantsData, setApplicantsData] = useState({});
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [selectedRole, setSelectedRole] = useState(null);
  const [showExportOptions, setShowExportOptions] = useState(false);

  // Loading and error states
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [loadingApplicants, setLoadingApplicants] = useState(false);
  const [error, setError] = useState(null);

  // Helper functions for current date/time and user info
  const getCurrentDateTime = () => {
    // For development/testing purposes, use the fixed date if available

    // For production, use actual current date and time in IST
    const now = new Date();

    // Convert to IST (UTC+5:30)
    const options = {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    };

    // Format using Intl.DateTimeFormat for IST
    const formatter = new Intl.DateTimeFormat("en-IN", options);
    const parts = formatter.formatToParts(now);

    // Extract individual components
    const dateMap = {};
    parts.forEach((part) => {
      dateMap[part.type] = part.value;
    });

    // Assemble in YYYY-MM-DD HH:MM:SS format
    return `${dateMap.day}-${dateMap.month}-${dateMap.year} ${dateMap.hour}:${dateMap.minute}:${dateMap.second}`;
  };
  const getCurrentUser = () => {
    // First try to get user from localStorage (set during login)
    const currentUser = localStorage.getItem("currentUser");
    if (currentUser) {
      return currentUser;
    }

    // If not available in localStorage, try to get from company profile
    const storedData = localStorage.getItem("companyData");
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        if (parsedData && parsedData.hr_person_name) {
          return parsedData.hr_person_name;
        }
      } catch (e) {
        console.error("Error parsing company data from localStorage:", e);
      }
    }

    // Default fallback value
    return "kshitij-dmce";
  };
  // Fetch all jobs when component mounts
  useEffect(() => {
    fetchJobs();
  }, []);

  // Fetch applicants when a job is selected
  useEffect(() => {
    if (selectedJobId) {
      fetchApplicantsForJob(selectedJobId);
    }
  }, [selectedJobId]);

  // Pre-load data for all jobs when jobs are loaded
  useEffect(() => {
    // Pre-fetch applicants for all jobs on initial load
    const preloadAllJobsData = async () => {
      if (jobs && jobs.length > 0) {
        // Set the first job as selected by default
        setSelectedJobId(jobs[0].job_id);

        // Preload applicant data for all jobs in the background
        for (const job of jobs) {
          try {
            const response = await axios.get(
              `https://placement-portal-backend.ramshekade20.workers.dev/api/company/applications/${job.job_id}`,
              { withCredentials: true }
            );

            if (response.data && response.data.success) {
              const roleKey = `job_${job.job_id}`;
              const displayName = `${job.company_name || job.company || "Company"} - ${job.company_title || "Position"}`;
              const applications = Array.isArray(response.data.applications)
                ? response.data.applications
                : [];

              const formattedApplicants = applications.map((app) => ({
                name:
                  `${app.first_name || ""} ${app.last_name || ""}`.trim() ||
                  "Unknown",
                email: app.email || "unknown@email.com",
                branch: app.department || "Unknown",
                cgpa: app.cgpa || "N/A",
                status: app.status || "Under Review",
                application_id: app.application_id || null,
                student_id: app.student_id || null,
                contact_number_primary: app.contact_number_primary || "",
              }));

              setApplicantsData((prevData) => ({
                ...prevData,
                [roleKey]: { applicants: formattedApplicants, displayName },
              }));
            }
          } catch (error) {
            console.error(
              `Error pre-loading data for job ${job.job_id}:`,
              error
            );
          }
        }
      }
    };

    if (!loadingJobs && jobs.length > 0) {
      preloadAllJobsData();
    }
  }, [jobs, loadingJobs]);

  const fetchJobs = async () => {
    try {
      setLoadingJobs(true);
      setError(null);

      const response = await axios.get(
        "https://placement-portal-backend.ramshekade20.workers.dev/api/company/view-jobs",
        { withCredentials: true }
      );

      if (response.data && response.data.success) {
        setJobs(response.data.jobs || []);
      } else {
        throw new Error(response.data?.message || "Failed to fetch jobs");
      }
    } catch (error) {
      console.error("Error fetching jobs:", error);
      setError(
        error.response?.data?.message ||
        "Unable to load jobs. Please try again later."
      );
    } finally {
      setLoadingJobs(false);
    }
  };

  const fetchApplicantsForJob = async (jobId) => {
    try {
      setLoadingApplicants(true);

      const response = await axios.get(
        `https://placement-portal-backend.ramshekade20.workers.dev/api/company/applications/${jobId}`,
        { withCredentials: true }
      );

      console.log(response.data);

      if (response.data && response.data.success) {
        // Find the selected job to create the role key
        const selectedJob = jobs.find((job) => job.job_id === jobId);

        if (selectedJob) {
          const roleKey = `job_${selectedJob.job_id}`;
          const displayName = `${selectedJob.company_name || selectedJob.company || "Company"} - ${selectedJob.company_title || "Position"}`;
          setSelectedRole(displayName);

          // Process the applications data - ensure it's an array
          const applications = Array.isArray(response.data.applications)
            ? response.data.applications
            : [];

          // Format the applicants data
          const formattedApplicants = applications.map((app) => ({
            name:
              `${app.first_name || ""} ${app.last_name || ""}`.trim() ||
              "Unknown",
            email: app.email || "unknown@email.com",
            branch: app.department || "Unknown",
            cgpa: app.cgpa || "N/A",
            status: app.status || "Under Review",
            application_id: app.application_id || null,
            student_id: app.student_id || null,
            contact_number_primary: app.contact_number_primary || "",
          }));

          // Create or update the applicants data for this role
          setApplicantsData((prevData) => ({
            ...prevData,
            [roleKey]: { applicants: formattedApplicants, displayName },
          }));
        }
      } else {
        throw new Error(response.data?.message || "Failed to fetch applicants");
      }
    } catch (error) {
      console.error("Error fetching applicants:", error);
      // Create an empty array for this job if there's an error
      const selectedJob = jobs.find((job) => job.job_id === jobId);
      if (selectedJob) {
        const roleKey = `job_${selectedJob.job_id}`;
        const displayName = `${selectedJob.company_name || selectedJob.company || "Company"} - ${selectedJob.company_title || "Position"}`;
        setSelectedRole(displayName);
        setApplicantsData((prevData) => ({
          ...prevData,
          [roleKey]: { applicants: [], displayName },
        }));
      }
    } finally {
      setLoadingApplicants(false);
    }
  };

  const handleRoleClick = (jobId) => {
    setSelectedJobId(jobId);
    // The selectedRole will be set in the fetchApplicantsForJob function
  };

  const updateApplicantStatus = async (applicationId, newStatus) => {
    try {
      // Optimistically update UI
      setApplicantsData((prevData) => {
        const updatedData = { ...prevData };
        const roleKey = `job_${selectedJobId}`;

        if (selectedJobId && updatedData[roleKey] && updatedData[roleKey].applicants) {
          updatedData[roleKey].applicants = updatedData[roleKey].applicants.map((app) =>
            app.application_id === applicationId
              ? { ...app, status: newStatus }
              : app
          );
        }

        return updatedData;
      });

      // Send update to server
      await axios.post(
        "https://placement-portal-backend.ramshekade20.workers.dev/api/company/update-application-status",
        {
          application_id: applicationId,
          status: newStatus,
        },
        { withCredentials: true }
      );
    } catch (error) {
      console.error("Error updating applicant status:", error);
      // Revert optimistic update if there's an error
      fetchApplicantsForJob(selectedJobId);
      alert("Failed to update status. Please try again.");
    }
  };

  const exportToExcel = () => {
    if (!selectedJobId || !applicantsData[`job_${selectedJobId}`]) return;

    try {
      const roleData = applicantsData[`job_${selectedJobId}`];
      const data = roleData.applicants || [];

      // Create header data for the report section
      const headerData = [
        ["📊 APPLICANTS REPORT"],
        [""],
        ["Position:", selectedRole],
        ["Generated By:", getCurrentUser()],
        ["Generated On:", getCurrentDateTime()],
        ["Total Applicants:", data.length],
        ["Selected:", data.filter((app) => app.status && app.status.toLowerCase() === "selected").length],
        [
          "Under Review:",
          data.filter(
            (app) => app.status && (app.status.toLowerCase() === "under review" || app.status.toLowerCase() === "applied")
          ).length,
        ],
        ["Rejected:", data.filter((app) => app.status && app.status.toLowerCase() === "rejected").length],
        [""],
      ];

      // Create workbook and worksheet with report headers
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet(headerData);

      // Format the applicant data
      const applicantData = data.map((applicant) => ({
        Name: applicant.name,
        Email: applicant.email,
        Branch: applicant.branch,
        "Student ID": applicant.student_id,
        "Mobile No.": applicant.contact_number_primary || "N/A",
        Status:
          applicant.status && applicant.status.toLowerCase() === "applied" ? "Under Review" : applicant.status,
      }));

      // Create the column headers row
      const columnHeaders = [
        ["Name", "Email", "Branch", "Student ID", "Mobile No.", "Status"],
      ];

      // Add column headers at row 11
      XLSX.utils.sheet_add_aoa(ws, columnHeaders, { origin: "A11" });

      // Add applicant data starting from row 12, WITH skipHeader set to TRUE to avoid duplicating headers
      XLSX.utils.sheet_add_json(ws, applicantData, {
        origin: "A12",
        skipHeader: true, // This is the key fix - set to true to prevent duplicate headers
      });

      // Style the header row - Updated column widths to accommodate new column
      ws["!cols"] = [
        { wch: 20 }, // Name
        { wch: 30 }, // Email
        { wch: 10 }, // Branch
        { wch: 10 }, // Student ID
        { wch: 15 }, // Contact Number
        { wch: 15 }, // Status
      ];

      XLSX.utils.book_append_sheet(wb, ws, "Applicants Report");

      const fileName = `${selectedRole.replace(
        /[^a-zA-Z0-9]/g,
        "_"
      )}_Applicants_${getCurrentDateTime().replace(/[: -]/g, "")}.xlsx`;
      XLSX.writeFile(wb, fileName);

      setShowExportOptions(false);
      console.log(
        `📊 Excel exported successfully: ${fileName} at ${getCurrentDateTime()} by ${getCurrentUser()}`
      );
    } catch (error) {
      console.error("❌ Excel export failed:", error);
      alert("Failed to export Excel file. Please try again.");
    }
  };

  const exportToPDF = () => {
    if (!selectedJobId || !applicantsData[`job_${selectedJobId}`]) return;

    try {
      const roleData = applicantsData[`job_${selectedJobId}`];
      const data = roleData.applicants || [];
      const doc = new jsPDF();

      // Set document properties
      doc.setProperties({
        title: `Applicants Report - ${selectedRole}`,
        creator: getCurrentUser(),
        creationDate: new Date(),
        subject: "Job Application Status Report",
      });

      // Header section with proper text title (no emojis)
      doc.setFontSize(24);
      doc.setTextColor(30, 30, 63);
      doc.setFont("helvetica", "bold");
      doc.text("APPLICANTS REPORT", 105, 25, { align: "center" });

      // Add subtitle
      doc.setFontSize(14);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 100, 100);
      doc.text("Job Application Status Analysis", 105, 35, { align: "center" });

      // Add decorative line
      doc.setLineWidth(1.5);
      doc.setDrawColor(30, 30, 63);
      doc.line(20, 42, 190, 42);

      // Report metadata section
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.setFont("helvetica", "normal");

      // Left column
      doc.text(`Position: ${selectedRole}`, 20, 55);
      doc.text(`Generated By: ${getCurrentUser()}`, 20, 63);
      doc.text(`Generated On: ${getCurrentDateTime()}`, 20, 71);
      doc.text(`Total Applicants: ${data.length}`, 20, 79);

      // Right column statistics
      doc.text(
        `Selected: ${data.filter((app) => app.status && app.status.toLowerCase() === "selected").length}`,
        110,
        79
      );
      doc.text(
        `Under Review: ${data.filter(
          (app) => app.status && (app.status.toLowerCase() === "under review" || app.status.toLowerCase() === "applied")
        ).length
        }`,
        20,
        87
      );
      doc.text(
        `Rejected: ${data.filter((app) => app.status && app.status.toLowerCase() === "rejected").length}`,
        110,
        87
      );

      // Add another decorative line before table
      doc.setLineWidth(0.5);
      doc.setDrawColor(200, 200, 200);
      doc.line(20, 95, 190, 95);

      // Prepare table data - Added contact number column
      const tableData = data.map((applicant) => [
        applicant.name,
        applicant.email,
        applicant.branch,
        applicant.student_id,
        applicant.contact_number_primary || "N/A", // Added contact number
        applicant.status && applicant.status.toLowerCase() === "applied" ? "Under Review" : applicant.status,
      ]);

      // Create table with enhanced styling and improved width - updated header to include Contact Number
      autoTable(doc, {
        head: [
          ["Name", "Email", "Branch", "Student ID", "Mobile No.", "Status"],
        ], // Added Contact Number
        body: tableData,
        startY: 102,
        margin: { top: 102, left: 15, right: 15 }, // Reduced margins further to fit new column
        headStyles: {
          fillColor: [30, 30, 63],
          textColor: [255, 255, 255],
          fontSize: 10, // Reduced font size slightly
          fontStyle: "bold",
          halign: "center",
          valign: "middle",
        },
        bodyStyles: {
          fontSize: 9, // Reduced font size slightly
          textColor: [0, 0, 0],
          halign: "left",
          valign: "middle",
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252],
        },
        columnStyles: {
          0: { cellWidth: 30, halign: "left" }, // Name - slightly reduced
          1: { cellWidth: 50, halign: "left" }, // Email - slightly reduced
          2: { cellWidth: 25, halign: "center" }, // Branch - slightly reduced
          3: { cellWidth: 20, halign: "center" }, // CGPA - slightly reduced
          4: { cellWidth: 25, halign: "center" }, // Contact Number - new column
          5: { cellWidth: 30, halign: "center" }, // Status - slightly reduced
        },
        styles: {
          lineColor: [200, 200, 200],
          lineWidth: 0.1,
          cellPadding: 3, // Reduced padding to fit more columns
        },
        tableWidth: "auto", // Let table use full available width
        didParseCell: function (data) {
          // Color code status cells - now at index 5 instead of 4
          if (data.column.index === 5 && data.section === "body") {
            const status = data.cell.text[0];
            const lowerStatus = status ? status.toLowerCase() : "";
            if (lowerStatus === "selected") {
              data.cell.styles.fillColor = [220, 252, 231];
              data.cell.styles.textColor = [22, 101, 52];
              data.cell.styles.fontStyle = "bold";
            } else if (lowerStatus === "rejected") {
              data.cell.styles.fillColor = [254, 242, 242];
              data.cell.styles.textColor = [220, 38, 38];
              data.cell.styles.fontStyle = "bold";
            } else if (lowerStatus === "under review") {
              data.cell.styles.fillColor = [254, 243, 199];
              data.cell.styles.textColor = [217, 119, 6];
              data.cell.styles.fontStyle = "bold";
            }
          }
        },
      });

      // Add footer with page numbers and generation info
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(128, 128, 128);
        doc.setFont("helvetica", "normal");

        // Page number
        doc.text(`Page ${i} of ${pageCount}`, 105, 285, { align: "center" });

        // Generation info
        doc.text(
          `Generated by ${getCurrentUser()} on ${getCurrentDateTime()}`,
          105,
          292,
          { align: "center" }
        );

        // Add border around the entire page
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.5);
        doc.rect(10, 12, 190, 265); // Adjusted for better fit
      }

      const fileName = `${selectedRole.replace(
        /[^a-zA-Z0-9]/g,
        "_"
      )}_Applicants_${getCurrentDateTime().replace(/[: -]/g, "")}.pdf`;
      doc.save(fileName);

      setShowExportOptions(false);
      console.log(
        `📄 PDF exported successfully: ${fileName} at ${getCurrentDateTime()} by ${getCurrentUser()}`
      );
    } catch (error) {
      console.error("❌ PDF export failed:", error);
      console.error("Error details:", error.message);
      alert("Failed to export PDF file. Please check console for details.");
    }
  };

  const handleExportClick = () => {
    setShowExportOptions(!showExportOptions);
  };

  const getTotalApplicants = () => {
    // Safely calculate the total applicants
    try {
      return Object.values(applicantsData || {}).reduce((total, data) => {
        const applicants = data.applicants || [];
        return total + (Array.isArray(applicants) ? applicants.length : 0);
      }, 0);
    } catch (error) {
      console.error("Error calculating total applicants:", error);
      return 0;
    }
  };

  const getSelectedCount = () => {
    // Safely calculate the selected count
    try {
      return Object.values(applicantsData || {}).reduce((total, data) => {
        const applicants = data.applicants || [];
        if (!Array.isArray(applicants)) return total;
        return (
          total + applicants.filter((app) => app.status && app.status.toLowerCase() === "selected").length
        );
      }, 0);
    } catch (error) {
      console.error("Error calculating selected count:", error);
      return 0;
    }
  };

  const getUnderReviewCount = () => {
    // Safely calculate the under review count
    try {
      return Object.values(applicantsData || {}).reduce((total, data) => {
        const applicants = data.applicants || [];
        if (!Array.isArray(applicants)) return total;
        return (
          total +
          applicants.filter(
            (app) => app.status && (app.status.toLowerCase() === "under review" || app.status.toLowerCase() === "applied")
          ).length
        );
      }, 0);
    } catch (error) {
      console.error("Error calculating under review count:", error);
      return 0;
    }
  };

  const getStatusClass = (status) => {
    if (!status) return "applicant-status-default";
    const lowerStatus = status.toLowerCase();
    if (["selected", "approved", "accepted"].includes(lowerStatus)) {
      return "applicant-status-selected";
    }
    if (["rejected"].includes(lowerStatus)) {
      return "applicant-status-rejected";
    }
    if (["under review", "applied"].includes(lowerStatus)) {
      return "applicant-status-under-review";
    }
    return "applicant-status-default";
  };

  const getStatusDisplay = (status) => {
    if (!status) return "Unknown";
    return status.toLowerCase() === "applied" ? "Under Review" : status;
  };

  // Close export dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        showExportOptions &&
        !event.target.closest(".applicant-export-dropdown")
      ) {
        setShowExportOptions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showExportOptions]);

  // Show loading state for jobs
  if (loadingJobs) {
    return (
      <div className="applicant-dashboard-page">
        <CollegeHeader />
        <div className="applicant-loading">
          <div className="applicant-loading-spinner"></div>
          <p>Loading jobs data...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="applicant-dashboard-page">
        <CollegeHeader />
        <div className="applicant-error">
          <FaExclamationCircle className="applicant-error-icon" />
          <h3>Error Loading Data</h3>
          <p>{error}</p>
          <button onClick={fetchJobs} className="applicant-retry-btn">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Show empty state if no jobs
  if (!jobs || jobs.length === 0) {
    return (
      <div className="applicant-dashboard-page">
        <CollegeHeader />
        <div className="applicant-empty">
          <div className="applicant-empty-icon">📋</div>
          <h3>No Jobs Found</h3>
          <p>
            You haven't posted any jobs yet. Post a job first to see applicants.
          </p>
          <button
            onClick={() => (window.location.href = "/company/post-job")}
            className="applicant-action-btn"
          >
            Post a Job
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="applicant-dashboard-page">
      <CollegeHeader />

      <div className="applicant-main-container">
        <div className="applicant-page-header">
          <h1 className="applicant-page-title">📋 View Applicants by Role</h1>
          <p className="applicant-page-subtitle">
            Manage and review job applications across different positions
          </p>

          <div className="applicant-stats-grid">
            <div className="applicant-stat-card applicant-total-stat">
              <div className="applicant-stat-icon">👥</div>
              <div className="applicant-stat-content">
                <div className="applicant-stat-number">
                  {getTotalApplicants()}
                </div>
                <div className="applicant-stat-label">Total Applicants</div>
              </div>
            </div>

            <div className="applicant-stat-card applicant-selected-stat">
              <div className="applicant-stat-icon">✅</div>
              <div className="applicant-stat-content">
                <div className="applicant-stat-number">
                  {getSelectedCount()}
                </div>
                <div className="applicant-stat-label">Selected</div>
              </div>
            </div>

            <div className="applicant-stat-card applicant-review-stat">
              <div className="applicant-stat-icon">🔄</div>
              <div className="applicant-stat-content">
                <div className="applicant-stat-number">
                  {getUnderReviewCount()}
                </div>
                <div className="applicant-stat-label">Under Review</div>
              </div>
            </div>
          </div>
        </div>

        <div className="applicant-positions-section">
          <h3 className="applicant-section-title">🎯 Available Positions</h3>
          <div className="applicant-positions-grid">
            {jobs.map((job) => {
              const roleKey = `job_${job.job_id}`;
              const data = applicantsData[roleKey] || { applicants: [], displayName: "" };
              const applicants = data.applicants || [];
              const hasApplicants =
                Array.isArray(applicants) && applicants.length > 0;
              const selectedCount = hasApplicants
                ? applicants.filter((app) => app.status && app.status.toLowerCase() === "selected").length
                : 0;

              return (
                <div
                  key={job.job_id}
                  className={`applicant-position-card ${selectedJobId === job.job_id ? "applicant-position-active" : ""
                    }`}
                  onClick={() => handleRoleClick(job.job_id)}
                >
                  <div className="applicant-position-content">
                    <div className="applicant-position-title">
                      {job.company_title || "Untitled"}
                    </div>
                    <div className="applicant-position-company">
                      {job.job_title || "Role"}
                    </div>
                    <div className="applicant-position-stats">
                      {/* Always show applicant count, even while loading */}
                      <span className="applicant-applicant-count">
                        {hasApplicants
                          ? `${applicants.length} applicant${applicants.length !== 1 ? "s" : ""
                          }`
                          : loadingApplicants && selectedJobId === job.job_id
                            ? "Loading..."
                            : "0 applicants"}
                      </span>
                      {hasApplicants && (
                        <span className="applicant-selected-count">
                          {selectedCount} selected
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="applicant-position-arrow">
                    <span>→</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {selectedRole && (
          <div className="applicant-applicants-section">
            <div className="applicant-table-header">
              <h3 className="applicant-table-title">
                📊 Applicants for {selectedRole}
              </h3>
              <div className="applicant-table-actions">
                <button
                  onClick={() => fetchApplicantsForJob(selectedJobId)}
                  className="applicant-refresh-btn"
                >
                  <FaSync className={loadingApplicants ? "rotating" : ""} />
                  {loadingApplicants ? "Loading..." : "Refresh"}
                </button>
                <div className="applicant-export-dropdown">
                  <button
                    className="applicant-export-btn"
                    onClick={handleExportClick}
                    disabled={
                      !selectedJobId || !applicantsData[`job_${selectedJobId}`] ||
                      !applicantsData[`job_${selectedJobId}`].applicants ||
                      applicantsData[`job_${selectedJobId}`].applicants.length === 0
                    }
                  >
                    📥 Export Data
                  </button>
                  {showExportOptions && (
                    <div className="applicant-export-options">
                      <button
                        onClick={exportToExcel}
                        className="applicant-export-option"
                      >
                        📊 Export to Excel
                      </button>
                      <button
                        onClick={exportToPDF}
                        className="applicant-export-option"
                      >
                        📄 Export to PDF
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {loadingApplicants ? (
              <div className="applicant-loading applicant-loading-inline">
                <div className="applicant-loading-spinner"></div>
                <p>Loading applicants...</p>
              </div>
            ) : selectedJobId && applicantsData[`job_${selectedJobId}`] &&
              applicantsData[`job_${selectedJobId}`].applicants &&
              applicantsData[`job_${selectedJobId}`].applicants.length > 0 ? (
              <div className="applicant-table-container">
                <table className="applicant-applicants-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Branch</th>
                      <th>Student ID</th>
                      <th>Status</th>
                      <th>Mobile No.</th>
                    </tr>
                  </thead>
                  <tbody>
                    {applicantsData[`job_${selectedJobId}`].applicants.map((applicant, index) => (
                      <tr key={index} className="applicant-applicant-row">
                        <td className="applicant-name-cell">
                          <div className="applicant-name-avatar">
                            {applicant.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </div>
                          <span className="applicant-name-text">
                            {applicant.name}
                          </span>
                        </td>
                        <td className="applicant-email-cell">
                          {applicant.email}
                        </td>
                        <td className="applicant-branch-cell">
                          <span className="applicant-branch-badge">
                            {applicant.branch}
                          </span>
                        </td>
                        <td className="applicant-cgpa-cell">
                          {applicant.student_id}
                        </td>
                        <td className="applicant-status-cell">
                          <span
                            className={`applicant-status-badge ${getStatusClass(
                              applicant.status
                            )}`}
                          >
                            {getStatusDisplay(applicant.status)}
                          </span>
                        </td>
                        <td className="applicant-contact-cell">
                          <span className="applicant-contact-badge">
                            {applicant.contact_number_primary || (
                              <span style={{ color: "#aaa" }}>—</span>
                            )}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="applicant-no-applicants">
                <div className="applicant-no-applicants-icon">👥</div>
                <h4>No Applicants Yet</h4>
                <p>There are no applicants for this position yet.</p>
              </div>
            )}
          </div>
        )}

        {!selectedRole && (
          <div className="applicant-empty-state">
            <div className="applicant-empty-icon">🎯</div>
            <h3 className="applicant-empty-title">Select a Position</h3>
            <p className="applicant-empty-description">
              Choose a job position from the list above to view applicants and
              their details.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewApplicants;
