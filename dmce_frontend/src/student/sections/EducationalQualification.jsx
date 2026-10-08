import React from 'react';

const EducationalQualification = ({ data, setData, onNext }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;

    // For percentage fields
    if (name === 'ssc_percentage' || name === 'hsc_percentage' || name === 'diploma_percentage') {
      // Allow empty string or "NA"
      if (value === '' || value === 'NA') {
        setData({ ...data, [name]: value });
        return;
      }
      
      // Check if input is a valid number format with up to 3 digits before decimal and 2 after
      if (!/^\d{1,3}(\.\d{0,2})?$/.test(value)) {
        return;
      }
      
      // For percentage, we'll only validate the range if there's a complete value
      if (value.indexOf('.') === -1 || value.split('.')[1].length === 2) {
        const numValue = parseFloat(value);
        if (numValue > 100 || numValue < 35) {
          // Don't prevent typing, just show warning
          setData({ ...data, [name]: value });
          return;
        }
      }
    }
    // For CGPA field
    else if (name === "cgpa") {
      if (value === '') {
        setData({ ...data, [name]: value });
        return;
      }
      // Allow single digit with up to 2 decimal places
      if (!/^\d{1}(\.\d{0,2})?$/.test(value)) {
        return;
      }
      
      // For CGPA, allow typing but show warning if outside range (4-10)
      const numValue = parseFloat(value);
      if (numValue > 10 || numValue < 4) {
        setData({ ...data, [name]: value });
        return;
      }
    }
    // For year fields
    else if (name === 'ssc_year' || name === 'hsc_year' || name === 'diploma_year') {
      if (value === '') {
        setData({ ...data, [name]: value });
        return;
      }
      // Only allow 4-digit numbers for years
      if (!/^\d{1,4}$/.test(value)) {
        return;
      }
    }

    setData({ ...data, [name]: value });
  };

  // Update in the handleSubmit function to validate Live KT selection
  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate all fields before submission
    if (data.ssc_percentage && data.ssc_percentage !== 'NA') {
      const sscPercent = parseFloat(data.ssc_percentage);
      if (sscPercent < 35 || sscPercent > 100) {
        alert('10th percentage must be between 35 and 100');
        return;
      }
    }

    if (data.hsc_percentage && data.hsc_percentage !== 'NA') {
      const hscPercent = parseFloat(data.hsc_percentage);
      if (hscPercent < 35 || hscPercent > 100) {
        alert('12th percentage must be between 35 and 100');
        return;
      }
    }

    if (data.diploma_percentage && data.diploma_percentage !== 'NA') {
      const diplomaPercent = parseFloat(data.diploma_percentage);
      if (diplomaPercent < 35 || diplomaPercent > 100) {
        alert('Diploma percentage must be between 35 and 100');
        return;
      }
    }

    if (data.cgpa) {
      const cgpaValue = parseFloat(data.cgpa);
      if (cgpaValue < 4 || cgpaValue > 10) {
        alert('CGPA must be between 4 and 10');
        return;
      }
    }

    // Check if Live KT is selected
    if (!data.liveKT) {
      alert('Please select whether you have a Live KT or not');
      return;
    }

    const has12th = data.hsc_percentage || data.hsc_year;
    const hasDiploma = data.diploma_percentage || data.diploma_year;

    if (!has12th && !hasDiploma) {
      alert('Please fill either 12th or Diploma details.');
      return;
    }

    // Add submission timestamp and user info
    const submissionData = {
      ...data,
      submission_time: "2025-07-18 07:18:21",
      submitted_by: "kshitij-dmce"
    };

    alert('Educational Qualification submitted successfully.');
    console.log('Data:', submissionData);

    // Call onNext if provided
    if (onNext) onNext();
  };

  const inputStyle = {
    padding: '10px',
    borderRadius: '6px',
    border: '1px solid #ccc',
    backgroundColor: '#fff',
    color: '#000',
    fontSize: '12px',
    width: '100%',
  };

  const sectionHeaderStyle = {
    gridColumn: '1 / -1',
    margin: '10px 0 5px',
    fontWeight: 'bold',
    fontSize: '16px',
    color: '#1e1e3f',
  };

  const noteStyle = {
    backgroundColor: '#e7f3ff',
    color: '#003366',
    padding: '10px 15px',
    borderRadius: '6px',
    fontSize: '14px',
    marginBottom: '20px',
    border: '1px solid #b3d8ff',
  };

  const semOptions = Array.from({ length: 8 }, (_, i) => `Sem ${i + 1}`);

  return (
    <div style={{
      background: '#fff',
      padding: '30px',
      borderRadius: '12px',
      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
      border: '1px solid #ccc',
    }}>
      <div style={{
        backgroundColor: '#1e1e3f',
        color: 'white',
        padding: '12px 20px',
        borderRadius: '8px 8px 0 0',
        fontSize: '18px',
        marginBottom: '25px',
      }}>
        Educational Qualification
      </div>

      <div style={noteStyle}>
        <strong>⚠️ Note:</strong> If marks are not available, leave <strong>"Blank"</strong>. Percentage must be between 35-100. CGPA must be between 4-10.
      </div>

      <form onSubmit={handleSubmit} style={{
        display: 'grid',
        gap: '20px',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
      }}>
        {/* 10th */}
        <div style={sectionHeaderStyle}>10th Details  <span style={{ color: 'red' }}>*</span></div>
        <div style={{ position: 'relative' }}>
          <input 
            name="ssc_percentage" 
            placeholder="10th Percentage (35-100)" 
            value={data.ssc_percentage || ''}
            onChange={handleChange} 
            style={inputStyle} 
            required 
          />
          {data.ssc_percentage && data.ssc_percentage !== 'NA' && parseFloat(data.ssc_percentage) && (parseFloat(data.ssc_percentage) < 35 || parseFloat(data.ssc_percentage) > 100) && (
            <div style={{ color: 'red', fontSize: '12px', position: 'absolute', top: '100%', left: '0' }}>
              Percentage must be between 35-100
            </div>
          )}
        </div>
        <div style={{ position: 'relative' }}>
          <input 
            name="ssc_year" 
            placeholder="Year of Passing (eg - 2020)" 
            value={data.ssc_year || ''}
            onChange={handleChange} 
            style={inputStyle} 
            required 
          />
          {data.ssc_year && data.ssc_year.length === 4 && (parseInt(data.ssc_year) < 1950 || parseInt(data.ssc_year) > new Date().getFullYear()) && (
            <div style={{ color: 'red', fontSize: '12px', position: 'absolute', top: '100%', left: '0' }}>
              Enter a valid year (1950-{new Date().getFullYear()})
            </div>
          )}
        </div>
        {/* Removed marksheet input */}

        {/* 12th */}
        <div style={sectionHeaderStyle}>12th Details</div>
        <div style={{ position: 'relative' }}>
          <input 
            name="hsc_percentage" 
            placeholder="12th Percentage (35-100)" 
            value={data.hsc_percentage || ''}
            onChange={handleChange} 
            style={inputStyle} 
          />
          {data.hsc_percentage && data.hsc_percentage !== 'NA' && parseFloat(data.hsc_percentage) && (parseFloat(data.hsc_percentage) < 35 || parseFloat(data.hsc_percentage) > 100) && (
            <div style={{ color: 'red', fontSize: '12px', position: 'absolute', top: '100%', left: '0' }}>
              Percentage must be between 35-100
            </div>
          )}
        </div>
        <div style={{ position: 'relative' }}>
          <input 
            name="hsc_year" 
            placeholder="Year of Passing (eg - 2024)" 
            value={data.hsc_year || ''}
            onChange={handleChange} 
            style={inputStyle} 
          />
          {data.hsc_year && data.hsc_year.length === 4 && (parseInt(data.hsc_year) < 1950 || parseInt(data.hsc_year) > new Date().getFullYear()) && (
            <div style={{ color: 'red', fontSize: '12px', position: 'absolute', top: '100%', left: '0' }}>
              Enter a valid year (1950-{new Date().getFullYear()})
            </div>
          )}
        </div>
        {/* Removed marksheet input */}

        {/* Diploma */}
        <div style={sectionHeaderStyle}>Diploma Details</div>
        <div style={{ position: 'relative' }}>
          <input 
            name="diploma_percentage" 
            placeholder="Diploma Percentage (35-100)" 
            value={data.diploma_percentage || ''}
            onChange={handleChange} 
            style={inputStyle} 
          />
          {data.diploma_percentage && data.diploma_percentage !== 'NA' && parseFloat(data.diploma_percentage) && (parseFloat(data.diploma_percentage) < 35 || parseFloat(data.diploma_percentage) > 100) && (
            <div style={{ color: 'red', fontSize: '12px', position: 'absolute', top: '100%', left: '0' }}>
              Percentage must be between 35-100
            </div>
          )}
        </div>
        <div style={{ position: 'relative' }}>
          <input 
            name="diploma_year" 
            placeholder="Year of Passing" 
            value={data.diploma_year || ''}
            onChange={handleChange} 
            style={inputStyle} 
          />
          {data.diploma_year && data.diploma_year.length === 4 && (parseInt(data.diploma_year) < 1950 || parseInt(data.diploma_year) > new Date().getFullYear()) && (
            <div style={{ color: 'red', fontSize: '12px', position: 'absolute', top: '100%', left: '0' }}>
              Enter a valid year (1950-{new Date().getFullYear()})
            </div>
          )}
        </div>
        {/* Removed marksheet input */}

        {/* Last Passed Semester */}
        <div style={sectionHeaderStyle}>Last Passed Semester  <span style={{ color: 'red' }}>*</span></div>
        <select name="last_semester" value={data.last_semester || ''} onChange={handleChange} style={inputStyle} required>
          <option value="">Select Semester</option>
          {semOptions.map((sem, idx) => (
            <option key={idx} value={sem}>{sem}</option>
          ))}
        </select>

        <div style={{ position: 'relative' }}>
          <input
            name="cgpa"
            placeholder="Enter Avg CGPA till Last Passed Sem"
            value={data.cgpa || ''}
            onChange={handleChange}
            style={inputStyle}
            required
          />
          {data.cgpa && parseFloat(data.cgpa) && (parseFloat(data.cgpa) < 4 || parseFloat(data.cgpa) > 10) && (
            <div style={{ color: 'red', fontSize: '12px', position: 'absolute', top: '100%', left: '0' }}>
              CGPA must be between 4-10
            </div>
          )}
        </div>

        {/* Live KT */}
        <div style={{ gridColumn: '1 / -1' }}>
          <label style={{
            display: 'block',
            margin: '5px 0 12px',
            fontWeight: '600',
            color: '#1e1e3f',
            fontSize: '16px',
          }}>
            Do you have any Live KT? <span style={{ color: 'red' }}>*</span>
          </label>

          <label style={{
            marginRight: '30px',
            fontSize: '15px',
            color: '#1e1e3f',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
          }}>
            <input
              type="radio"
              name="liveKT"
              value="Yes"
              checked={data.liveKT === 'Yes'}
              onChange={handleChange}
              style={{
                appearance: 'none',
                width: '20px',
                height: '20px',
                border: '2px solid #ccc',
                borderRadius: '50%',
                backgroundColor: '#fff',
                cursor: 'pointer',
                boxShadow: data.liveKT === 'Yes' ? 'inset 0 0 0 6px #1e1e3f' : 'none',
              }}
              required
            />
            Yes
          </label>

          <label style={{
            fontSize: '15px',
            color: '#1e1e3f',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
          }}>
            <input
              type="radio"
              name="liveKT"
              value="No"
              checked={data.liveKT === 'No'}
              onChange={handleChange}
              style={{
                appearance: 'none',
                width: '20px',
                height: '20px',
                border: '2px solid #ccc',
                borderRadius: '50%',
                backgroundColor: '#fff',
                cursor: 'pointer',
                boxShadow: data.liveKT === 'No' ? 'inset 0 0 0 6px #1e1e3f' : 'none',
              }}
              required
            />
            No
          </label>
          {!data.liveKT && (
            <div style={{ color: 'red', fontSize: '12px', marginTop: '5px' }}>
              Please select whether you have a Live KT
            </div>
          )}
        </div>

        {/* Submit */}
        <div style={{ gridColumn: '1 / -1', textAlign: 'center', marginTop: '15px' }}>
          <div style={{ 
            color: '#666', 
            fontSize: '12px', 
            marginBottom: '10px',
            fontStyle: 'italic'
          }}>
          </div>
          <button type="submit" style={{
            padding: '12px 30px',
            backgroundColor: '#1e1e3f',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            fontWeight: 'bold',
            cursor: 'pointer',
          }}>
            Save & Next
          </button>
        </div>
      </form>
    </div>
  );
};

export default EducationalQualification;