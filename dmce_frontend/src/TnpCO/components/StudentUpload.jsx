import React, { useState } from "react";
import * as XLSX from "xlsx";
import CollegeHeader from "../../shared/CollegeHeader";
import "../pages/TnpCoordinator.css";

const StudentUpload = () => {
  const [data, setData] = useState([]);
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFile = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    const isExcel = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
    ].includes(selectedFile.type);

    if (!isExcel) {
      setError("Only Excel files (.xls, .xlsx) are allowed.");
      setFile(null);
      return;
    }

    setFile(selectedFile);
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const workbook = XLSX.read(event.target.result, { type: "binary" });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        setData(jsonData);
        setError("");
      } catch {
        setError("Error parsing Excel file. Please check the format.");
        setFile(null);
      }
    };
    reader.readAsBinaryString(selectedFile);
  };

  const handleUpload = async () => {
    if (!data.length) {
      setError("Please select an Excel file before uploading.");
      return;
    }

    try {
      setLoading(true);
      setUploadSuccess(null);

      // simple upload
      await fetch(
        "https://placement-portal-backend.ramshekade20.workers.dev/api/dummydata",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }
      );

      setUploadSuccess("✅ Upload successful!");
      setFile(null);
      setData([]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="tnp-container">
      <CollegeHeader />

      <div className="upload-section">
        <h2 className="header">Student Data Upload</h2>

        <div className={`file-box ${loading ? "loading" : ""}`}>
          {loading ? (
            <p>Processing... Please keep this tab open.</p>
          ) : file ? (
            <div className="file-info">
              <p className="file-name">{file.name}</p>
              <p className="file-size">Records: {data.length}</p>
            </div>
          ) : (
            <p className="file-name placeholder">
              Drag & drop or click “Choose File”
            </p>
          )}
        </div>

        {error && <p className="error-msg">{error}</p>}
        {uploadSuccess && <p className="success-msg">{uploadSuccess}</p>}

        <input
          id="fileInput"
          type="file"
          accept=".xls,.xlsx"
          onChange={handleFile}
          style={{ display: "none" }}
        />

        <div className="button-group">
          <label htmlFor="fileInput" className="choose-file-btn">
            Choose File
          </label>
          <button
            onClick={handleUpload}
            disabled={!file || loading}
            className={`upload-btn ${!file || loading ? "disabled" : ""}`}
          >
            {loading ? "⏳ Processing..." : "📤 Upload"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentUpload;
