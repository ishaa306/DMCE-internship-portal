import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import CollegeHeader from '../../shared/CollegeHeader';
import StatusMessage from '../components/StatusMessage';
import './TnpCoordinator.css';

const TnpCoordinator = () => {
  const [data, setData] = useState([]);
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState(null);
  const [loading, setLoading] = useState(false);

  // Company details state
  const [companyDetails, setCompanyDetails] = useState({
    companyName: '',
    companyEmail: ''
  });
  const [companyError, setCompanyError] = useState('');
  const [companySuccess, setCompanySuccess] = useState('');
  const [sendingMail, setSendingMail] = useState(false);

  const handleFile = (e) => {
    const selectedFile = e.target.files[0];
    setError('');

    if (!selectedFile) return;

    const isExcel = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel'
    ].includes(selectedFile.type);

    if (!isExcel) {
      setError('Only Excel files (.xls, .xlsx) are allowed.');
      setFile(null);
      return;
    }

    console.log('📁 File selected:', selectedFile.name);
    setFile(selectedFile);

    const reader = new FileReader();

    reader.onload = (event) => {
      console.log('📄 File read successfully');
      try {
        const workbook = XLSX.read(event.target.result, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        console.log('📊 Sheet name:', sheetName);

        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        if (jsonData.length === 0) {
          throw new Error('Excel file is empty or contains no valid data.');
        }

        console.log(`📋 Parsed ${jsonData.length} rows from Excel:`, {
          firstRow: jsonData[0],
          lastRow: jsonData[jsonData.length - 1]
        });

        setData(jsonData);
      } catch (error) {
        console.error('❌ Excel parsing error:', error);
        setError(`Error parsing Excel file: ${error.message || 'Please check the file format and try again.'}`);
        setFile(null);
      }
    };

    reader.onerror = (error) => {
      console.error('❌ File reading error:', error);
      setError('Unable to read the file. The file might be corrupted or too large.');
      setFile(null);
    };

    reader.readAsBinaryString(selectedFile);
  };

  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  // Helper function to extract meaningful error messages
  const extractErrorMessage = (responseData, status, defaultMessage) => {
    // Handle specific HTTP status codes
    if (status === 409) {
      return "This data already exists in the database.";
    } else if (status === 400) {
      return "Invalid data format. Please check your Excel file structure.";
    } else if (status === 401 || status === 403) {
      return "You don't have permission to upload this data.";
    } else if (status === 404) {
      return "The upload endpoint could not be found.";
    } else if (status === 500) {
      return "Server error occurred. Please try again later or contact support.";
    }

    // Try to extract meaningful error message from response
    if (responseData && responseData.message) {
      return responseData.message;
    }
    if (responseData && responseData.error) {
      return responseData.error;
    }
    if (responseData && typeof responseData === 'string') {
      return responseData;
    }

    // Fall back to default message
    return defaultMessage;
  };

  const handleUpload = async () => {
    if (!data.length) {
      setError('Please select an Excel file with valid data before uploading.');
      return;
    }

    try {
      setLoading(true);
      setUploadSuccess(null);
      setError('');
      const batchSize = 10;
      let index = 0;
      let overallResult = [];
      let failedBatches = [];

      console.log(`🚀 Starting upload of ${data.length} records in batches of ${batchSize}`);
      console.time('Total Upload Time');

      while (index < data.length) {
        const batch = data.slice(index, index + batchSize);
        const batchNumber = Math.floor(index / batchSize) + 1;
        const totalBatches = Math.ceil(data.length / batchSize);

        console.log(`📦 Processing batch ${batchNumber}/${totalBatches}:`, {
          startIndex: index,
          endIndex: index + batch.length - 1,
          records: batch
        });

        console.time(`Batch ${batchNumber} Request`);
        try {
          const response = await fetch('https://placement-portal-backend.ramshekade20.workers.dev/api/dummydata', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(batch),
          });

          const responseData = await response.json();

          if (!response.ok) {
            console.error(`❌ Batch ${batchNumber} failed:`, {
              status: response.status,
              statusText: response.statusText,
              response: responseData
            });

            const errorMessage = extractErrorMessage(
              responseData,
              response.status,
              `Upload failed for batch ${batchNumber}.`
            );

            failedBatches.push({
              batch: batchNumber,
              error: errorMessage,
              status: response.status,
              records: batch.length
            });

            // Don't throw here, continue with next batch
          } else {
            console.log(`✅ Batch ${batchNumber} success:`, {
              status: response.status,
              response: responseData
            });

            overallResult.push({
              batch: batchNumber,
              result: responseData,
              records: batch.length
            });
          }

        } catch (error) {
          console.error(`❌ Batch ${batchNumber} error:`, error);

          // Add to failed batches if not already added
          if (!failedBatches.some(fb => fb.batch === batchNumber)) {
            failedBatches.push({
              batch: batchNumber,
              error: error.message || `Network or server error occurred`,
              status: 'Request Error',
              records: batch.length
            });
          }
        } finally {
          console.timeEnd(`Batch ${batchNumber} Request`);
        }

        index += batchSize;

        if (index < data.length) {
          console.log(`⏳ Waiting before next batch...`);
          await delay(1500);
        }
      }

      console.timeEnd('Total Upload Time');

      // Calculate success stats
      const totalRecords = data.length;
      const successfulRecords = overallResult.reduce((sum, batch) => sum + batch.records, 0);
      const failedRecords = failedBatches.reduce((sum, batch) => sum + batch.records, 0);

      console.log('🎉 Upload completed:', {
        totalBatches: Math.ceil(totalRecords / batchSize),
        successfulBatches: overallResult.length,
        failedBatches: failedBatches.length,
        totalRecords,
        successfulRecords,
        failedRecords
      });

      if (failedBatches.length > 0) {
        const failureMessages = failedBatches.map(({ batch, error, records }) =>
          `• Batch ${batch} (${records} records): ${error}`
        ).join('\n');

        setError(`⚠️ Some uploads failed:\n\n${failureMessages}\n\n${successfulRecords} of ${totalRecords} records were uploaded successfully.`);

        if (overallResult.length > 0) {
          const successMessage = `✅ ${successfulRecords} records uploaded successfully in ${overallResult.length} batches.`;
          setUploadSuccess(successMessage);
        }
      } else {
        const successMessage = `✅ All ${totalRecords} records uploaded successfully!\n\nResults:\n${overallResult.map(({ batch, result, records }) =>
          `• Batch ${batch} (${records} records): ${result.message || 'Data processed successfully'}`
        ).join('\n')
          }`;

        setUploadSuccess(successMessage);
        setFile(null);
        setData([]);
      }

    } catch (err) {
      console.error('❌ Upload failed:', err);
      setError(`Upload failed: ${err.message || 'An unexpected error occurred. Please try again.'}`);
    } finally {
      setLoading(false);
    }
  };

  // Company details handlers
  const handleCompanyInputChange = (e) => {
    const { name, value } = e.target;
    setCompanyDetails(prev => ({
      ...prev,
      [name]: value
    }));
    setCompanyError('');
    setCompanySuccess('');
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSendMail = async () => {
    setCompanyError('');
    setCompanySuccess('');

    // Validation
    if (!companyDetails.companyName.trim()) {
      setCompanyError('Company name is required.');
      return;
    }

    if (!companyDetails.companyEmail.trim()) {
      setCompanyError('Company email is required.');
      return;
    }

    if (!validateEmail(companyDetails.companyEmail)) {
      setCompanyError('Please enter a valid email address.');
      return;
    }

    try {
      setSendingMail(true);

      const mailPayload = {
        company_name: companyDetails.companyName.trim(),
        email: companyDetails.companyEmail.trim()
      };

      console.log('📧 Sending mail with payload:', mailPayload);

      const response = await fetch('https://placement-portal-backend.ramshekade20.workers.dev/api/list-company', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mailPayload)
      });

      const responseData = await response.json();
      console.log('📧 Mail response:', responseData);

      if (!response.ok) {
        // Extract meaningful error message based on status code
        const errorMessage = extractErrorMessage(
          responseData,
          response.status,
          'Failed to send invitation email.'
        );

        if (response.status === 409) {
          throw new Error(`This company (${companyDetails.companyName}) has already been invited.`);
        } else {
          throw new Error(errorMessage);
        }
      }

      setCompanySuccess(`✅ Invitation email sent successfully to ${companyDetails.companyEmail}`);

      // Clear form after successful send
      setCompanyDetails({
        companyName: '',
        companyEmail: ''
      });

    } catch (error) {
      console.error('❌ Mail sending failed:', error);
      setCompanyError(`${error.message}`);
    } finally {
      setSendingMail(false);
    }
  };

  return (
    <div className="tnp-container">
      <CollegeHeader />

      {/* Company Invitation Section */}
      <div className="upload-section">
        <h2 className="header">Company Invitation Portal</h2>

        <div className="company-form">
          <div className="form-group">
            <label htmlFor="companyName" className="form-label">
              🏢 Company Name
            </label>
            <input
              id="companyName"
              name="companyName"
              type="text"
              placeholder="Enter company name"
              value={companyDetails.companyName}
              onChange={handleCompanyInputChange}
              className="form-input"
              disabled={sendingMail}
            />
          </div>

          <div className="form-group">
            <label htmlFor="companyEmail" className="form-label">
              📧 Company Email
            </label>
            <input
              id="companyEmail"
              name="companyEmail"
              type="email"
              placeholder="Enter company email address"
              value={companyDetails.companyEmail}
              onChange={handleCompanyInputChange}
              className="form-input"
              disabled={sendingMail}
            />
          </div>

          {companyError && (
            <div className="error-container">
              <p className="error-msg">{companyError}</p>
            </div>
          )}

          {companySuccess && (
            <div className="success-container">
              <p className="success-msg-text">{companySuccess}</p>
            </div>
          )}

          <button
            onClick={handleSendMail}
            disabled={sendingMail || !companyDetails.companyName.trim() || !companyDetails.companyEmail.trim()}
            className={`send-mail-btn ${(sendingMail || !companyDetails.companyName.trim() || !companyDetails.companyEmail.trim()) ? 'disabled' : ''}`}
          >
            {sendingMail ? '📧 Sending...' : '📧 Send Invitation'}
          </button>
        </div>
      </div>

      {/* Student Data Upload Section */}
      <div className="upload-section">
        <h2 className="header">Student Data Upload Portal</h2>

        <div className={`file-box ${loading ? 'loading' : ''}`}>
          {loading ? (
            <div className="loading-indicator">
              <div className="spinner"></div>
              <p>Processing... Please keep this tab open.</p>
            </div>
          ) : file ? (
            <div className="file-info">
              <p className="file-name">{file.name}</p>
              <p className="file-size">
                Records to process: {data.length || 'Calculating...'}
              </p>
            </div>
          ) : (
            <p className="file-name placeholder">
              Drag & drop your Excel file here or click "Choose File"
            </p>
          )}
        </div>

        {error && (
          <div className="error-container">
            <p className="error-title">⚠️ Error</p>
            <pre className="error-msg">{error}</pre>
          </div>
        )}

        {uploadSuccess && (
          <div className="success-container">
            <p className="success-title">✅ Success</p>
            <pre className="success-msg">{uploadSuccess}</pre>
          </div>
        )}

        <input
          id="fileInput"
          type="file"
          accept=".xls,.xlsx"
          onChange={handleFile}
          onClick={(e) => e.target.value = null}
          style={{ display: 'none' }}
        />

        <div className="button-group">
          <label htmlFor="fileInput" className="choose-file-btn">
            Choose File
          </label>

          <button
            onClick={handleUpload}
            disabled={!file || loading}
            className={`upload-btn ${(!file || loading) ? 'disabled' : ''}`}
          >
            {loading ? '⏳ Processing...' : '📤 Upload & Send Mail'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TnpCoordinator;