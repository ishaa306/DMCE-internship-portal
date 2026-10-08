import React, { useState } from 'react';

const AcademicDetails = ({ data, setData,onNext }) => {
  // Add validation state
  const [prnError, setPrnError] = useState('');
  
  // Get current year for dynamic year range generation
  const currentYear = new Date().getFullYear();

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'student_id') {
      // Only allow exactly 11 characters, not more not less
      if (/^[a-zA-Z0-9]{0,11}$/.test(value)) {
        setData(prev => ({ ...prev, [name]: value }));
      }
    } else if (name === 'prn') {
      // Only allow digits and max 16 characters
      if (/^\d*$/.test(value) && value.length <= 16) {
        setData(prev => ({ ...prev, [name]: value }));
        
        // Set error if PRN is provided but not exactly 16 digits
        if (value.length > 0 && value.length !== 16) {
          setPrnError('Must be exactly 16 digits');
        } else {
          setPrnError('');
        }
      }
    } else {
      setData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Additional validation for student_id length before submission
    if (data.student_id && data.student_id.length !== 11) {
      alert('Student ID must be exactly 11 characters.');
      return;
    }

    // Validate PRN length before submission
    if (data.prn && data.prn.length !== 16) {
      alert('PRN must be exactly 16 digits.');
      return;
    }
    
    alert('Academic details submitted successfully.');
    console.log('Form Data:', data);

    // Call onNext if provided
    if (onNext) onNext();
  };

  const inputStyle = {
    width: '100%',
    padding: '10px',
    fontSize: '16px',
    borderRadius: '6px',
    border: '1.5px solid #ccc',
    backgroundColor: '#fff',
    color: '#000',
    boxSizing: 'border-box',
    fontWeight: '500',
  };

  const errorInputStyle = {
    ...inputStyle,
    borderColor: '#ff4d4f',
    backgroundColor: '#fff2f0'
  };

  // Generate year options dynamically up to current year
  const yearOptions = [];
  // Starting from 2010 (arbitrary start) up to the current year
  for (let year = 2020; year <= currentYear; year++) {
    yearOptions.push(<option key={year} value={year}>{year}</option>);
  }

  // Generate graduation year options (current year to current year + 6)
  const graduationYearOptions = [];
  for (let year = 2024; year <= currentYear + 7; year++) {
    graduationYearOptions.push(<option key={year} value={year}>{year}</option>);
  }

  const departmentOptions = [
    'Humanities and Science',
    'Information Technology',
    'Civil Engineering',
    'Civil & Infrastructure Engineering',
    'Mechanical Engineering',
    'Computer Engineering',
    'Artificial Intelligence and Data Science Engineering',
    'Electronics and Telecommunication Engineering',
    'Electronics Engineering',
    'Chemical Engineering'
  ];

  const yearLevelOptions = [
    'First Year',
    'Second Year',
    'Third Year',
    'Fourth Year',
  ];

  return (
    <div style={{
      background: '#fff',
      padding: '30px',
      borderRadius: '12px',
      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
      border: '1px solid #ccc',
      fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
    }}>
      <div style={{
        backgroundColor: '#1e1e3f',
        color: 'white',
        padding: '12px 20px',
        borderRadius: '8px 8px 0 0',
        fontSize: '18px',
        marginBottom: '25px',
        fontWeight: '600',
        userSelect: 'none',
      }}>
        Academic Details
      </div>

      <form
        onSubmit={handleSubmit}
        style={{
          display: 'grid',
          gap: '20px',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        }}
      >
        <div style={{ position: 'relative' }}>
          <input
            name="student_id"
            placeholder="Student ID "
            value={data.student_id || ''}
            onChange={handleChange}
            required
            disabled 
            maxLength={11}
            style={inputStyle}
          />
          {data.student_id && data.student_id.length !== 11 && (
            <div style={{ 
              color: 'red', 
              fontSize: '12px', 
              position: 'absolute', 
              bottom: '-18px',
              left: '0' 
            }}>
              Must be exactly 11 characters
            </div>
          )}
        </div>

        <div style={{ position: 'relative' }}>
          <input
            name="prn"
            placeholder="PRN Number (16 digits) *"
            value={data.prn || ''}
            onChange={handleChange}
            required
            maxLength={16}
            type="text" // Keep as text for better control
            inputMode="numeric" // Shows numeric keyboard on mobile
            style={prnError ? errorInputStyle : inputStyle}
            onKeyPress={(e) => {
              // Extra protection - allow only digits
              if (!/\d/.test(e.key)) {
                e.preventDefault();
              }
            }}
          />
          {prnError && (
            <div style={{
              color: 'red',
              fontSize: '12px',
              position: 'absolute',
              bottom: '-18px',
              left: '0'
            }}>
              {prnError}
            </div>
          )}
        </div>

        <select
          name="current_year"
          value={data.current_year || ''}
          onChange={handleChange}
          required
          style={{ ...inputStyle, color: data.current_year ? '#000' : '#666' }}
        >
          <option value="">Select Current Year *</option>
          {yearLevelOptions.map((year, index) => (
            <option key={index} value={year}>{year}</option>
          ))}
        </select>

        <select
          name="year_of_admission"
          value={data.year_of_admission || ''}
          onChange={handleChange}
          required
          style={{ ...inputStyle, color: data.year_of_admission ? '#000' : '#666' }}
        >
          <option value="">Admission Year *</option>
          {yearOptions}
        </select>

        <select
          name="expected_graduation_year"
          value={data.expected_graduation_year || ''}
          onChange={handleChange}
          required
          style={{ ...inputStyle, color: data.expected_graduation_year ? '#000' : '#666' }}
        >
          <option value="">Graduating Year *</option>
          {graduationYearOptions}
        </select>

        <select
          name="department"
          value={data.department || ''}
          onChange={handleChange}
          required
          style={{ ...inputStyle, color: data.department ? '#000' : '#666' }}
        >
          <option value="">Select Programs (Branch)*</option>
          {departmentOptions.map((dept, index) => (
            <option key={index} value={dept}>{dept}</option>
          ))}
        </select>

        <select
          name="division"
          value={data.division || ''}
          onChange={handleChange}
          required
          style={{ ...inputStyle, color: data.division ? '#000' : '#666' }}
        >
          <option value="">Select Division *</option>
          <option value="A">A</option>
          <option value="B">B</option>
          <option value="C">C</option>
        </select>

        <div style={{ gridColumn: '1 / -1', textAlign: 'center' }}>
          <button
            type="submit"
            style={{
              padding: '12px 30px',
              backgroundColor: '#1e1e3f',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: '0.3s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#3b82f6')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#1e1e3f')}
          >
            Save & Next
          </button>
        </div>
      </form>
    </div>
  );
};

export default AcademicDetails;
