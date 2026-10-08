import React, { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import CollegeHeader from "../../shared/CollegeHeader";
import {
  FaFileExcel, FaUpload, FaCheck, FaTimes, FaSpinner,
  FaInfoCircle, FaSearch, FaFilter, FaDownload, FaEye, FaExclamationTriangle
} from "react-icons/fa";
import "./UploadResult.css";

const UploadResultsPage = () => {
  // Main state management
  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [processedData, setProcessedData] = useState(null);
  const [fileError, setFileError] = useState("");

  // Data visualization state
  const [selectedCount, setSelectedCount] = useState(0);
  const [showSelectedStudents, setShowSelectedStudents] = useState(false);
  const [showFullPreview, setShowFullPreview] = useState(false);
  const [filterText, setFilterText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [studentsPerPage] = useState(5);
  const [isHeaderFound, setIsHeaderFound] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [uploadStats, setUploadStats] = useState(null);

  // Current date and time information
  const currentDateTime = "2025-09-20 08:35:10";
  const currentUser = "kshitij-dmce";

  // Fetch jobs on component mount
  useEffect(() => {
    fetchJobs();
    document.title = "Upload Placement Results | DMCE Placement Portal";
  }, []);

  const fetchJobs = async () => {
    setLoadingJobs(true);
    setErrorMsg("");
    try {
      const response = await axios.get(
        "https://placement-portal-backend.ramshekade20.workers.dev/api/company/view-jobs",
        { withCredentials: true }
      );

      if (response.data && response.data.success) {
        const activeJobs = response.data.jobs.filter(job => job.status === "active");
        setJobs(activeJobs);
        console.log(`Loaded ${activeJobs.length} active job listings`);
      } else {
        const errorMessage = response.data?.message || "Failed to fetch jobs.";
        setErrorMsg(errorMessage);
      }
    } catch (e) {
      console.error("Error loading jobs:", e);
      setErrorMsg("Failed to load jobs. Please try again.");
    } finally {
      setLoadingJobs(false);
    }
  };

  const handleJobChange = (e) => {
    const jobId = e.target.value;
    setSelectedJobId(jobId);
    setSuccessMsg("");
    setErrorMsg("");
    setProcessedData(null);
    setShowSelectedStudents(false);
    setShowFullPreview(false);
    setFilterText("");
    setCurrentPage(1);
    setUploadStats(null);
  };

  const validateExcelFile = (file) => {
    const validTypes = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.oasis.opendocument.spreadsheet',
      'text/csv',
      'application/octet-stream', // Some Excel files might be detected as this
    ];

    // Check if the file extension is valid even if the MIME type doesn't match
    const validExtensions = ['.xlsx', '.xls', '.csv'];
    const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();

    if (!validTypes.includes(file.type) && !validExtensions.includes(fileExtension)) {
      return "Please upload only Excel files (.xlsx, .xls, .csv)";
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      return "File size exceeds 10MB limit";
    }

    return null;
  };

  const processExcelData = useCallback((data) => {
    try {
      if (!data || data.length < 1) {
        setFileError("Excel file appears to be empty or in an invalid format");
        return null;
      }

      // Find the header row that contains our required columns
      const headerRowIndex = data.findIndex(row => {
        if (!Array.isArray(row) || row.length === 0) return false;
        return row.some(cell =>
          typeof cell === 'string' && (
            cell.toLowerCase().includes('name') ||
            cell.toLowerCase().includes('email') ||
            cell.toLowerCase().includes('status') ||
            cell.toLowerCase().includes('student id')
          )
        );
      });

      if (headerRowIndex === -1) {
        setFileError("Could not find a header row with Name, Email, and Status columns");
        setIsHeaderFound(false);
        return null;
      }

      setIsHeaderFound(true);
      const headers = data[headerRowIndex];

      // Find the indices of required columns
      const nameIndex = headers.findIndex(h =>
        typeof h === 'string' && (h.toLowerCase() === 'name' || h.toLowerCase().includes('name')));
      const emailIndex = headers.findIndex(h =>
        typeof h === 'string' && (h.toLowerCase() === 'email' || h.toLowerCase().includes('email')));
      const statusIndex = headers.findIndex(h =>
        typeof h === 'string' && (h.toLowerCase() === 'status' || h.toLowerCase().includes('status')));

      // CRITICAL: Look for Student ID column which is needed for the backend
      const studentIdIndex = headers.findIndex(h =>
        typeof h === 'string' && (
          h.toLowerCase() === 'student id' ||
          h.toLowerCase().includes('student id')
        ));

      if (nameIndex === -1 || emailIndex === -1 || statusIndex === -1 || studentIdIndex === -1) {
        const missing = [];
        if (nameIndex === -1) missing.push("Name");
        if (emailIndex === -1) missing.push("Email");
        if (statusIndex === -1) missing.push("Status");
        if (studentIdIndex === -1) missing.push("Student ID");

        setFileError(`Missing required columns: ${missing.join(", ")}`);
        return null;
      }

      // Process data rows with progress tracking
      const dataRows = data.slice(headerRowIndex + 1);
      const processedRows = [];
      let selectedStudentsCount = 0;

      // Process the data all at once for simplicity
      for (let i = 0; i < dataRows.length; i++) {
        const row = dataRows[i];
        if (!row || row.length === 0) continue;

        // Extract data from row
        const name = row[nameIndex]?.toString() || '';
        const email = row[emailIndex]?.toString() || '';
        const status = row[statusIndex]?.toString().toLowerCase() || '';
        const studentId = row[studentIdIndex]?.toString() || '';

        // Skip rows with missing essential data
        if (!name || !email || !studentId) continue;

        // Check if student is selected - use the actual status value from the Excel
        const selected = ['selected', 'yes', 'true', 'pass', 'passed', 'approved', '1'].includes(status.toLowerCase());

        // Create processed row object
        const processedRow = {
          name,
          email,
          status,
          student_id: studentId,
          selected
        };

        processedRows.push(processedRow);
        if (selected) selectedStudentsCount++;

        // Update progress every 50 rows
        if (i % 50 === 0 || i === dataRows.length - 1) {
          const progress = Math.min(100, Math.round(((i + 1) / dataRows.length) * 100));
          setProcessingProgress(progress);
        }
      }

      // Set selected count and final progress
      setSelectedCount(selectedStudentsCount);
      setProcessingProgress(100);

      return processedRows;
    } catch (error) {
      console.error("Error processing Excel data:", error);
      setFileError(`Failed to process Excel data: ${error.message}`);
      return null;
    }
  }, []);

  const handleFileChange = async (e) => {
    setSuccessMsg("");
    setErrorMsg("");
    setFileError("");
    setProcessedData(null);
    setIsHeaderFound(false);
    setProcessingProgress(0);
    setShowSelectedStudents(false);
    setShowFullPreview(false);
    setUploadStats(null);

    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const validationError = validateExcelFile(file);
    if (validationError) {
      setFileError(validationError);
      e.target.value = null; // Reset file input
      return;
    }

    setSelectedFile(file);

    // Process the Excel file
    try {
      const reader = new FileReader();

      reader.onloadstart = () => {
        setProcessingProgress(10);
      };

      reader.onprogress = (e) => {
        if (e.lengthComputable) {
          const progress = Math.round((e.loaded / e.total) * 50); // First 50% for loading
          setProcessingProgress(progress);
        }
      };

      reader.onload = (evt) => {
        try {
          setProcessingProgress(60);
          const binaryData = evt.target.result;

          // Parse Excel file
          const workbook = XLSX.read(binaryData, { type: 'binary' });
          setProcessingProgress(70);

          if (workbook.SheetNames.length === 0) {
            setFileError("Excel file does not contain any sheets");
            return;
          }

          const sheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[sheetName];

          // Convert sheet to array of arrays
          const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
          setProcessingProgress(80);

          if (data.length < 2) {
            setFileError("Excel file must have at least a header row and one data row");
            return;
          }

          // Process the Excel data
          const processed = processExcelData(data);
          if (processed) {
            setProcessedData(processed);
          }
        } catch (error) {
          console.error("Excel parsing error:", error);
          setFileError(`Failed to parse Excel file: ${error.message}`);
        }
      };

      reader.onerror = (error) => {
        console.error("File reading error:", error);
        setFileError("Failed to read the file. Please try again.");
      };

      reader.readAsBinaryString(file);
    } catch (error) {
      console.error("File handling error:", error);
      setFileError(`Error handling file: ${error.message}`);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    setSuccessMsg("");
    setErrorMsg("");
    setUploadStats(null);

    if (!selectedJobId) {
      setErrorMsg("Please select a job listing.");
      return;
    }

    if (!selectedFile) {
      setErrorMsg("Please select an Excel file to upload.");
      return;
    }

    if (fileError) {
      setErrorMsg(fileError);
      return;
    }

    if (!processedData || !Array.isArray(processedData) || processedData.length === 0) {
      setErrorMsg("No valid data found in the Excel file.");
      return;
    }

    setUploading(true);

    try {
      // Extract student IDs of selected students (NOT emails)
      const selectedStudentIds = processedData
        .filter(student => student.selected)
        .map(student => student.student_id);

      if (selectedStudentIds.length === 0) {
        setErrorMsg("No students were marked as selected in the results file.");
        setUploading(false);
        return;
      }

      console.log(`Updating ${selectedStudentIds.length} selected students for job ${selectedJobId}`);

      // Send data as direct JSON with proper structure for the backend
      const response = await axios({
        method: 'post',
        url: `https://placement-portal-backend.ramshekade20.workers.dev/api/company/result/${selectedJobId}`,
        data: {
          selected_students: selectedStudentIds
        },
        headers: {
          'Content-Type': 'application/json'
        },
        withCredentials: true
      });

      if (response.data && response.data.success) {
        // Store upload stats for detailed display
        setUploadStats({
          job_id: response.data.job_id,
          selected: response.data.updated_selected,
          rejected: response.data.updated_rejected,
          timestamp: response.data.timestamp || currentDateTime
        });

        const successMessage = `Results uploaded successfully! ${response.data.updated_selected} students marked as selected and ${response.data.updated_rejected} marked as rejected.`;
        setSuccessMsg(successMessage);

        // Reset form state
        setSelectedFile(null);
        setProcessedData(null);
        setShowSelectedStudents(false);
        setShowFullPreview(false);

        // Reset file input
        const fileInput = document.getElementById("result-file");
        if (fileInput) fileInput.value = "";
      } else {
        throw new Error(response.data?.message || "Failed to update student statuses");
      }
    } catch (error) {
      console.error("Upload error:", error);

      // Detailed error handling
      if (error.response) {
        console.error("Server response:", error.response.data);
        console.error("Status code:", error.response.status);

        // More specific error message for different status codes
        if (error.response.status === 404) {
          setErrorMsg(`No applications found for this job. Students must apply before you can upload results.`);
        } else if (error.response.status === 400) {
          setErrorMsg(`Invalid request: ${error.response.data.details || error.response.data.error || 'Please check your data format'}`);
        } else if (error.response.status === 500) {
          setErrorMsg(`Server error: ${error.response.data.details || 'An unexpected error occurred on the server'}`);
        } else if (error.response.status === 401 || error.response.status === 403) {
          setErrorMsg("You don't have permission to perform this action. Please log in again or contact an administrator.");
        } else {
          setErrorMsg(`Error: ${error.response.data?.message || error.message}`);
        }
      } else if (error.request) {
        // The request was made but no response was received
        setErrorMsg("No response received from server. Please check your internet connection and try again.");
      } else {
        // Something else caused the error
        setErrorMsg(`Failed to upload results: ${error.message}`);
      }
    } finally {
      setUploading(false);
    }
  };

  // Toggle to view only selected students
  const toggleSelectedStudents = () => {
    setShowSelectedStudents(!showSelectedStudents);
    setCurrentPage(1);
  };

  // Toggle full preview
  const toggleFullPreview = () => {
    setShowFullPreview(!showFullPreview);
    setCurrentPage(1);
  };

  // Filter students based on search text
  const filteredStudents = useMemo(() => {
    if (!processedData) return [];

    let filtered = processedData;

    // Apply selected filter if active
    if (showSelectedStudents) {
      filtered = filtered.filter(student => student.selected);
    }

    // Apply search filter if text exists
    if (filterText.trim()) {
      const searchLower = filterText.toLowerCase();
      filtered = filtered.filter(student =>
        student.name.toLowerCase().includes(searchLower) ||
        student.email.toLowerCase().includes(searchLower) ||
        (student.student_id && student.student_id.toLowerCase().includes(searchLower))
      );
    }

    return filtered;
  }, [processedData, filterText, showSelectedStudents]);

  // Pagination logic
  const indexOfLastStudent = currentPage * studentsPerPage;
  const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
  const currentStudents = filteredStudents.slice(indexOfFirstStudent, indexOfLastStudent);
  const totalPages = Math.ceil(filteredStudents.length / studentsPerPage);

  // Get selected job title for display
  const getSelectedJobTitle = () => {
    const job = jobs.find(j => j.job_id === selectedJobId);
    return job ? `${job.company_title} @ ${job.company}` : "";
  };

  // Download processed data as CSV
  const downloadCSV = () => {
    if (!processedData || processedData.length === 0) return;

    try {
      // Create CSV content with headers
      let csvContent = "Name,Email,Student ID,Status,Selected\n";
      processedData.forEach(student => {
        // Properly escape CSV fields
        const escapeCsv = (field) => {
          if (field === null || field === undefined) return '';
          const str = String(field);
          if (str.includes(',') || str.includes('"') || str.includes('\n')) {
            return `"${str.replace(/"/g, '""')}"`;
          }
          return str;
        };

        csvContent += `${escapeCsv(student.name)},${escapeCsv(student.email)},${escapeCsv(student.student_id || '')},${escapeCsv(student.status)},${student.selected ? 'Yes' : 'No'}\n`;
      });

      // Create download link
      const encodedUri = encodeURI("data:text/csv;charset=utf-8," + csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);

      // Generate filename with job info
      const jobInfo = getSelectedJobTitle().replace(/[^a-z0-9]/gi, '_').toLowerCase();
      const timestamp = new Date().toISOString().slice(0, 19).replace(/[T:]/g, '-');
      link.setAttribute("download", `placement_results_${jobInfo}_${timestamp}.csv`);

      document.body.appendChild(link);

      // Trigger download
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error downloading CSV:", error);
      setErrorMsg("Failed to download CSV file");
    }
  };

  return (
    <div className="upload-results-bg">
      <CollegeHeader />
      <section className="upload-results-main">
        <div className="upload-results-card">
          <h2 className="upload-results-title">
            <FaUpload className="upload-icon" /> Upload Placement Results
          </h2>

          <div className="upload-results-warning">
            <FaExclamationTriangle className="warning-icon" />
            <span>
              <strong>Important:</strong> Your Excel file must include a <strong>Student ID</strong> column.
              The system uses student IDs (not emails) to update application statuses.
            </span>
          </div>

          <p className="upload-results-desc">
            Upload the final placement result for a job listing.<br />
            Please ensure your Excel file contains <strong>Name</strong>, <strong>Email</strong>, <strong>Student ID</strong>, and <strong>Status</strong> columns.
          </p>

          <form className="upload-results-form" onSubmit={handleUpload} autoComplete="off">
            <div className="upload-results-field">
              <label htmlFor="job-select">Select Job Listing</label>
              {loadingJobs ? (
                <div className="upload-results-loading">
                  <FaSpinner className="loading-spinner" /> Loading jobs...
                </div>
              ) : (
                <select
                  id="job-select"
                  value={selectedJobId}
                  onChange={handleJobChange}
                  disabled={uploading || loadingJobs || jobs.length === 0}
                  className="upload-results-select"
                >
                  <option value="">-- Select Job --</option>
                  {jobs.map((job) => (
                    <option key={job.job_id} value={job.job_id}>
                      {job.company_title} @ {job.job_title}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="upload-results-field">
              <label htmlFor="result-file">Select Result File (Excel only)</label>
              <div className="file-input-container">
                <input
                  type="file"
                  id="result-file"
                  onChange={handleFileChange}
                  accept=".xlsx, .xls, .csv"
                  disabled={uploading || loadingJobs}
                  className="upload-results-file"
                />
                <div className="file-input-icon">
                  <FaFileExcel />
                </div>
              </div>

              {fileError && (
                <div className="upload-results-file-error">
                  <FaTimes className="error-icon-small" />
                  {fileError}
                </div>
              )}

              {processingProgress > 0 && processingProgress < 100 && !fileError && (
                <div className="processing-progress">
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: `${processingProgress}%` }}
                    ></div>
                  </div>
                  <div className="progress-text">
                    {isHeaderFound ? 'Processing data...' : 'Analyzing file...'} {processingProgress}%
                  </div>
                </div>
              )}

              {selectedFile && !fileError && (
                <div className="upload-results-file-info">
                  <FaFileExcel className="file-excel-icon" />
                  <span className="file-name">{selectedFile.name}</span>
                  {processedData && (
                    <span className="file-status">
                      <FaCheck className="check-icon" /> Valid format
                    </span>
                  )}
                </div>
              )}
            </div>

            {processedData && Array.isArray(processedData) && processedData.length > 0 && (
              <div className="data-preview">
                <div className="data-preview-header">
                  <h3>Result Summary</h3>
                  <div className="data-preview-actions">
                    <button
                      type="button"
                      onClick={toggleSelectedStudents}
                      className="preview-action-btn"
                      title={showSelectedStudents ? "Show all students" : "Show only selected students"}
                    >
                      <FaFilter /> {showSelectedStudents ? "Show All" : "Selected Only"}
                    </button>
                    <button
                      type="button"
                      onClick={downloadCSV}
                      className="preview-action-btn"
                      title="Download processed data as CSV"
                    >
                      <FaDownload /> CSV
                    </button>
                    <button
                      type="button"
                      onClick={toggleFullPreview}
                      className="preview-action-btn"
                      title={showFullPreview ? "Hide student list" : "Show student list"}
                    >
                      <FaEye /> {showFullPreview ? "Hide List" : "Show List"}
                    </button>
                  </div>
                </div>

                <div className="data-preview-content">
                  <div className="data-preview-item">
                    <span className="preview-label">Total Students:</span>
                    <span className="preview-value">{processedData.length}</span>
                  </div>
                  <div className="data-preview-item">
                    <span className="preview-label">Selected:</span>
                    <span className="preview-value highlight-value">{selectedCount}</span>
                  </div>
                  <div className="data-preview-item">
                    <span className="preview-label">Not Selected:</span>
                    <span className="preview-value">{processedData.length - selectedCount}</span>
                  </div>
                  <div className="data-preview-item">
                    <span className="preview-label">Job Position:</span>
                    <span className="preview-value">{getSelectedJobTitle()}</span>
                  </div>
                </div>

                {showFullPreview && (
                  <div className="students-preview-section">
                    <div className="students-search-bar">
                      <div className="search-input-container">
                        <FaSearch className="search-icon" />
                        <input
                          type="text"
                          value={filterText}
                          onChange={(e) => {
                            setFilterText(e.target.value);
                            setCurrentPage(1);
                          }}
                          placeholder="Search by name, email, or student ID..."
                          className="students-search-input"
                        />
                        {filterText && (
                          <button
                            type="button"
                            onClick={() => setFilterText("")}
                            className="clear-search-btn"
                          >
                            <FaTimes />
                          </button>
                        )}
                      </div>
                      <span className="results-count">
                        {filteredStudents.length} {filteredStudents.length === 1 ? 'result' : 'results'}
                      </span>
                    </div>

                    <div className="students-table-container">
                      <table className="students-table">
                        <thead>
                          <tr>
                            <th>#</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Student ID</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {currentStudents.length > 0 ? (
                            currentStudents.map((student, index) => (
                              <tr key={index} className={student.selected ? "selected-row" : ""}>
                                <td>{indexOfFirstStudent + index + 1}</td>
                                <td>{student.name}</td>
                                <td>{student.email}</td>
                                <td>{student.student_id}</td>
                                <td>
                                  <span className={`status-badge ${student.selected ? 'status-selected' : 'status-not-selected'}`}>
                                    {student.selected ? "Selected" : student.status || "Not Selected"}
                                  </span>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr className="no-results-row">
                              <td colSpan="5">No students match your search criteria</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>

                    {totalPages > 1 && (
                      <div className="pagination">
                        <button
                          onClick={() => setCurrentPage(1)}
                          disabled={currentPage === 1}
                          className="pagination-btn"
                        >
                          First
                        </button>
                        <button
                          onClick={() => setCurrentPage(currentPage - 1)}
                          disabled={currentPage === 1}
                          className="pagination-btn"
                        >
                          Prev
                        </button>
                        <span className="page-indicator">
                          Page {currentPage} of {totalPages}
                        </span>
                        <button
                          onClick={() => setCurrentPage(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          className="pagination-btn"
                        >
                          Next
                        </button>
                        <button
                          onClick={() => setCurrentPage(totalPages)}
                          disabled={currentPage === totalPages}
                          className="pagination-btn"
                        >
                          Last
                        </button>
                      </div>
                    )}
                  </div>
                )}

                <div className="data-preview-note">
                  <FaInfoCircle className="info-icon" />
                  <span>
                    When you click "Update Student Statuses", selected students will be marked as "selected"
                    and all other applicants will be marked as "rejected" in the database.
                  </span>
                </div>
              </div>
            )}

            <button
              className="upload-results-btn"
              type="submit"
              disabled={uploading || loadingJobs || !selectedFile || !processedData}
            >
              {uploading ? (
                <>
                  <FaSpinner className="btn-spinner" /> Updating Database...
                </>
              ) : (
                <>
                  <FaUpload /> Update Student Statuses
                </>
              )}
            </button>

            {errorMsg && <div className="upload-results-error">
              <FaTimes className="error-icon" /> {errorMsg}
            </div>}

            {successMsg && <div className="upload-results-success">
              <FaCheck className="success-icon" /> {successMsg}
            </div>}

            {uploadStats && (
              <div className="upload-stats">
                <h4>Update Summary</h4>
                <div className="stats-grid">
                  <div className="stat-item">
                    <span className="stat-label">Selected Students:</span>
                    <span className="stat-value selected">{uploadStats.selected}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Rejected Students:</span>
                    <span className="stat-value rejected">{uploadStats.rejected}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Total Updated:</span>
                    <span className="stat-value">{uploadStats.selected + uploadStats.rejected}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Timestamp:</span>
                    <span className="stat-value timestamp">{uploadStats.timestamp}</span>
                  </div>
                </div>
              </div>
            )}
          </form>

          <div className="upload-results-note">
            <FaInfoCircle className="note-icon" />
            <span>
              Excel file must contain columns labeled <strong>Name</strong>, <strong>Email</strong>, <strong>Student ID</strong>, and <strong>Status</strong>.
              Students with "Selected" status will be marked as selected in the database.
            </span>
          </div>

          <div className="upload-results-footer">
            <div className="upload-timestamp">
              Current time: {currentDateTime}
            </div>
            <div className="upload-user">
              User: {currentUser}
            </div>
          </div>
        </div>
      </section>

      {/* Additional styles for new components */}
      <style jsx>{`
        .upload-results-warning {
          display: flex;
          align-items: center;
          background-color: #fff3cd;
          border: 1px solid #ffeeba;
          border-radius: 8px;
          padding: 12px 15px;
          margin-bottom: 18px;
          gap: 12px;
        }
        
        .warning-icon {
          color: #856404;
          font-size: 1.2rem;
          flex-shrink: 0;
        }
        
        .upload-results-warning span {
          color: #856404;
          font-size: 0.95rem;
          line-height: 1.4;
        }
        
        .upload-stats {
          margin-top: 20px;
          background-color: #e8f4ff;
          border: 1px solid #b8daff;
          border-radius: 8px;
          padding: 15px;
          animation: fadeIn 0.3s ease;
        }
        
        .upload-stats h4 {
          margin: 0 0 12px 0;
          color: #0c63e4;
          font-size: 1.05rem;
          border-bottom: 1px solid #b8daff;
          padding-bottom: 8px;
        }
        
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 12px;
        }
        
        .stat-item {
          display: flex;
          flex-direction: column;
        }
        
        .stat-label {
          font-size: 0.85rem;
          color: #495057;
          margin-bottom: 3px;
        }
        
        .stat-value {
          font-size: 1.1rem;
          font-weight: 600;
          color: #212529;
        }
        
        .stat-value.selected {
          color: #198754;
        }
        
        .stat-value.rejected {
          color: #dc3545;
        }
        
        .stat-value.timestamp {
          font-size: 0.95rem;
          font-family: monospace;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @media (max-width: 600px) {
          .stats-grid {
            grid-template-columns: 1fr;
          }
          
          .upload-results-warning {
            flex-direction: column;
            text-align: center;
          }
        }
      `}</style>
    </div>
  );
};

export default UploadResultsPage;