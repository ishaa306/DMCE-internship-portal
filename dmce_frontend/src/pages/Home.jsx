import React, { useState } from 'react';
import * as XLSX from 'xlsx';

export default function Home() {
  const [data, setData] = useState([]);
  const [uploadSuccess, setUploadSuccess] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFile = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const workbook = XLSX.read(event.target.result, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        setData(jsonData);
      } catch (error) {
        console.error('❌ Excel parsing error:', error);
        alert('Error parsing Excel file. Please check the format.');
      }
    };

    reader.onerror = (error) => {
      console.error('❌ File reading error:', error);
      alert('Error reading file. Please try again.');
    };

    reader.readAsBinaryString(file);
  };

  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const handleUpload = async () => {
    if (!data.length) {
      alert('Please upload and parse a file first!');
      return;
    }

    try {
      setLoading(true);
      setUploadSuccess(null);
      const batchSize = 10;
      let index = 0;
      let overallResult = [];

      while (index < data.length) {
        const batch = data.slice(index, index + batchSize);
        const batchNumber = Math.floor(index / batchSize) + 1;

        try {
          const response = await fetch('https://placement-portal-backend.ramshekade20.workers.dev/api/dummydata', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(batch),
          });

          const responseData = await response.json();

          if (!response.ok) {
            throw new Error(`Batch ${batchNumber} failed: ${JSON.stringify(responseData)}`);
          }

          overallResult.push({
            batch: batchNumber,
            result: responseData
          });

        } catch (error) {
          overallResult.push({
            batch: batchNumber,
            result: { message: `❌ Error: ${error.message}` }
          });
        }

        index += batchSize;
        if (index < data.length) await delay(1500); // 1.5s delay between batches
      }

      const successMessage = `✅ Upload complete.\n\n${overallResult
        .map(({ batch, result }) => `Batch ${batch}: ${result.message || 'OK'}`)
        .join('\n')}`;

      setUploadSuccess(successMessage);
    } catch (err) {
      console.error('❌ Upload failed:', err);
      setUploadSuccess(`❌ Error uploading: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h2>📤 Upload Students Excel</h2>
      <input
        type="file"
        accept=".xlsx, .xls"
        onChange={handleFile}
        onClick={(e) => e.target.value = null}
      />
      <br /><br />
      <button
        onClick={handleUpload}
        disabled={loading}
        style={{
          padding: '8px 16px',
          cursor: loading ? 'not-allowed' : 'pointer',
          opacity: loading ? 0.7 : 1
        }}
      >
        {loading ? '⏳ Uploading...' : '📤 Upload to DB'}
      </button>

      {loading && (
        <p style={{ color: '#666' }}>
          Processing... Please keep this tab open.
        </p>
      )}

      {uploadSuccess && (
        <pre style={{
          background: '#f3f3f3',
          padding: '1em',
          borderRadius: '4px',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word'
        }}>
          {uploadSuccess}
        </pre>
      )}

      <div style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
        <p>📝 Notes:</p>
        <ul>
          <li>Upload Excel files with columns: GR, Email</li>
          <li>Data is processed in batches of <strong>10</strong></li>
          <li>Please wait for completion</li>
        </ul>
      </div>
    </div>
  );
}
