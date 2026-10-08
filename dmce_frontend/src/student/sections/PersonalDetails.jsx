import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const PersonalDetails = ({ data, setData,onNext }) => {
  const [form, setForm] = useState({
    first: '', middle: '', last: '', gender: '', dob: '',
    contact: '', email: '', contactAlt: '', aadhar: '', pan_number: '',
    alternate_email: '' 
  });
  
  // Add these validation states
  const [emailError, setEmailError] = useState('');
  const [ageError, setAgeError] = useState('');

  // Pre-fill the form when `data` is available
  useEffect(() => {
    if (data) {
      setForm(data);
    }
  }, [data]);
  
  // Email validation regex
  const validateEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };
  
  // Age validation function
  const validateAge = (birthDate) => {
    if (!birthDate) return false;
    
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age >= 18;
  };

  const handleChange = (e) => {
    let { name, value } = e.target;
    value = value.trimStart(); // avoid leading whitespace

    // Name validation
    if (['first_name', 'middle_name', 'last_name'].includes(name) && /[^a-zA-Z\s]/.test(value)) return;
    
    // Contact validation
    if (name === 'contact_number_primary' && (!/^\d*$/.test(value) || value.length > 10)) return;
    
    // Alternate contact validation - digits only
    if (name === 'contact_number_alternate') {
      if (!/^\d*$/.test(value) || value.length > 10) return;
    }
    
    // Aadhar validation - digits only
    if (name === 'aadhaar_number') {
      if (!/^\d*$/.test(value) || value.length > 12) return;
    }
    
    // Alternate email validation
    if (name === 'alternate_email' && value) {
      if (!validateEmail(value)) {
        setEmailError('Please enter a valid email address');
      } else {
        setEmailError('');
      }
    } else if (name === 'alternate_email' && !value) {
      setEmailError('');
    }
    
    // Date of birth validation - minimum 18 years
    if (name === 'date_of_birth') {
      if (!validateAge(value)) {
        setAgeError('You must be at least 18 years old');
      } else {
        setAgeError('');
      }
    }

    const updatedForm = { ...form, [name]: value };
    setForm(updatedForm);
    setData(updatedForm); // update parent state
  };

  const handlePanChange = (e) => {
    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    const updatedForm = { ...form, pan_number: value };
    setForm(updatedForm);
    setData(updatedForm); // update parent state
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate alternate email if provided
    if (form.alternate_email && !validateEmail(form.alternate_email)) {
      setEmailError('Please enter a valid email address');
      return;
    }
    
    // Validate age
    if (!validateAge(form.date_of_birth)) {
      setAgeError('You must be at least 18 years old');
      return;
    }
    
    alert('Personal details submitted successfully.');
    console.log('Form Data:', form);

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
    boxSizing: 'border-box'
  };

  const labelStyle = {
    fontWeight: 'bold',
    marginBottom: '5px',
    display: 'block',
    fontSize: '14px',
    color: '#000',
  };
  
  // Add these error styles
  const errorStyle = {
    color: '#ff4d4f',
    fontSize: '12px',
    marginTop: '4px',
    textAlign: 'left'
  };
  
  // Add error input style
  const errorInputStyle = {
    ...inputStyle,
    borderColor: '#ff4d4f',
    backgroundColor: '#fff2f0'
  };

  return (
    <div style={{
      background: '#fff',
      padding: '30px',
      borderRadius: '12px',
      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
      border: '1px solid #ccc',
      fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif'
    }}>
      <div style={{
        backgroundColor: '#1e1e3f',
        color: 'white',
        padding: '12px 20px',
        borderRadius: '8px 8px 0 0',
        fontSize: '18px',
        marginBottom: '25px',
        fontWeight: '600'
      }}>
        Personal Details
      </div>

      <form
        onSubmit={handleSubmit}
        style={{
          display: 'grid',
          gap: '20px',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))'
        }}
      >
        <div>
          <label style={labelStyle}>First Name <span style={{ color: 'red' }}>*</span></label>
          <input name="first_name" maxLength={20} value={data.first_name} onChange={handleChange} required style={inputStyle} />
        </div>

        <div>
          <label style={labelStyle}>Middle Name</label>
          <input name="middle_name" maxLength={20} value={data.middle_name} onChange={handleChange} style={inputStyle} />
        </div>

        <div>
          <label style={labelStyle}>Last Name <span style={{ color: 'red' }}>*</span></label>
          <input name="last_name" maxLength={20} value={data.last_name} onChange={handleChange} required style={inputStyle} />
        </div>

        <div>
          <label style={labelStyle}>Gender <span style={{ color: 'red' }}>*</span></label>
          <select
            name="gender"
            value={data.gender}
            onChange={handleChange}
            required
            style={{ ...inputStyle, color: form.gender ? '#000' : '#999' }}
          >
            <option value="" disabled>Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div>
          <label style={labelStyle}>Date of Birth <span style={{ color: 'red' }}>*</span></label>
          <input 
            type="date" 
            name="date_of_birth" 
            value={data.date_of_birth} 
            onChange={handleChange} 
            required 
            style={ageError ? errorInputStyle : inputStyle}
            // Make calendar icon dark with this style
            className="dark-calendar" 
          />
          {ageError && <p style={errorStyle}>{ageError}</p>}
        </div>

        <div>
          <label style={labelStyle}>Contact Number <span style={{ color: 'red' }}>*</span></label>
          <input
            name="contact_number_primary"
            type="tel"
            value={data.contact_number_primary}
            onChange={handleChange}
            maxLength={10}
            required
            style={inputStyle}
            placeholder="10 digit mobile number"
          />
        </div>

        <div>
          <label style={labelStyle}>Email ID <span style={{ color: 'red' }}>*</span></label>
          <input
            name="email"
            type="email"
            value={data.email}
            onChange={handleChange}
            disabled 
            required
            style={inputStyle}
            placeholder="example@email.com"
          />
        </div>
        <div>
          <label style={labelStyle}>Alternate Email </label>
          <input
            name="alternate_email"
            type="email"
            value={data.alternate_email}
            onChange={handleChange}
            style={emailError ? errorInputStyle : inputStyle}
            placeholder="Optional alternate email"
          />
          {emailError && <p style={errorStyle}>{emailError}</p>}
        </div>

        <div>
          <label style={labelStyle}>Alternate Contact</label>
          <input
            name="contact_number_alternate"
            type="tel"
            value={data.contact_number_alternate}
            onChange={handleChange}
            maxLength={10}
            style={inputStyle}
            placeholder="Optional 10-digit number"
          />
        </div>

        <div>
          <label style={labelStyle}>Aadhar Number <span style={{ color: 'red' }}>*</span></label>
          <input
            name="aadhaar_number"
            type="text"
            value={data.aadhaar_number}
            onChange={handleChange}
            maxLength={12}
            required
            style={inputStyle}
            placeholder="12-digit Aadhar number"
          />
        </div>

        <div>
          <label style={labelStyle}>PAN Card</label>
          <input
            name="pan_number"
            value={data.pan_number}
            maxLength={10}
            onChange={handlePanChange}
            style={inputStyle}
            placeholder="e.g. ABCDE1234F"
          />
        </div>

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
              transition: '0.3s'
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

export default PersonalDetails;