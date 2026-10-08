import React, { useEffect } from 'react';

const InternshipAndWorkExperience = ({ data, setData, markSectionVisited, onNext }) => {
  // Initialize experiences array if it doesn't exist, but preserve existing data
  useEffect(() => {
  setData(prevData => {
    if (!prevData.experiences || !Array.isArray(prevData.experiences)) {
      return { ...prevData, experiences: [] };
    }
    return prevData;
  });
}, []);
 // Empty dependency array to run only once

  const experiences = data.experiences || [];

  const calculateDuration = (start, end, currentlyWorking) => {
    if (!start) return '';
    const startDate = new Date(start);
    const endDate = currentlyWorking || !end ? new Date() : new Date(end);
    if (endDate < startDate) return '';

    let years = endDate.getFullYear() - startDate.getFullYear();
    let months = endDate.getMonth() - startDate.getMonth();

    if (months < 0) {
      years--;
      months += 12;
    }

    let durationStr = '';
    if (years > 0) durationStr += `${years} year${years > 1 ? 's' : ''} `;
    if (months > 0) durationStr += `${months} month${months > 1 ? 's' : ''}`;

    return durationStr.trim() || 'Less than a month';
  };

  const handleExperienceChange = (index, e) => {
    const { name, value, type, checked } = e.target;
    const updatedExperiences = [...experiences];
    
    // Ensure the experience object exists at the given index
    if (!updatedExperiences[index]) {
      updatedExperiences[index] = {
        title: '',
        employmentType: '',
        company: '',
        currentlyWorking: false,
        startDate: '',
        endDate: '',
        location: '',
        locationType: '',
        description: '',
        mediaLink: '',
        duration: ''
      };
    }
    
    updatedExperiences[index][name] = type === 'checkbox' ? checked : value;

    if (name === 'currentlyWorking' && checked) {
      updatedExperiences[index].endDate = '';
    }

    if (['startDate', 'endDate', 'currentlyWorking'].includes(name)) {
      updatedExperiences[index].duration = calculateDuration(
        updatedExperiences[index].startDate,
        updatedExperiences[index].endDate,
        updatedExperiences[index].currentlyWorking
      );
    }

    setData(prev => ({ ...prev, experiences: updatedExperiences }));
  };

  const addExperience = () => {
    if (experiences.length < 3) {
      setData(prev => ({
        ...prev,
        experiences: [
          ...experiences,
          {
            title: '',
            employmentType: '',
            company: '',
            currentlyWorking: false,
            startDate: '',
            endDate: '',
            location: '',
            locationType: '',
            description: '',
            mediaLink: '',
            duration: ''
          }
        ]
      }));
    }
  };

  const removeExperience = (index) => {
    const updatedExperiences = experiences.filter((_, idx) => idx !== index);
    setData(prev => ({ ...prev, experiences: updatedExperiences }));
  };

    const handleSubmit = (e) => {
    e.preventDefault();
    
    // Mark this section as visited
    markSectionVisited('internship');
    
    alert('Internship & Work Experience submitted successfully.');
    console.log('Form Data:', data);
    
    // Call onNext if provided
    if (onNext) onNext();
  };

  const inputStyle = {
    width: '100%',
    padding: '10px 12px',
    borderRadius: '6px',
    border: '1px solid #ccc',
    fontSize: '16px',
    color: '#000',
    backgroundColor: '#fff',
    boxSizing: 'border-box'
  };

  const labelStyle = {
    marginBottom: '6px',
    fontWeight: '600',
    fontSize: '16px',
    color: '#1e1e3f'
  };

  const cardStyle = {
    backgroundColor: '#f0f4ff',
    borderRadius: '10px',
    padding: '20px',
    boxShadow: '0 4px 10px rgba(30, 30, 63, 0.1)',
    marginBottom: '20px',
    position: 'relative'
  };

  const buttonStyle = {
    padding: '10px 20px',
    backgroundColor: '#1e1e3f',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 'bold',
    transition: 'background-color 0.3s'
  };

  const removeButtonStyle = {
    position: 'absolute',
    top: '15px',
    right: '15px',
    padding: '5px 10px',
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: 'bold'
  };

  return (
    <div style={{
      background: '#fff',
      padding: '30px',
      borderRadius: '12px',
      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
      border: '1px solid #ccc',
      maxWidth: '900px',
      margin: '30px auto',
    }}>
      <div style={{
        backgroundColor: '#1e1e3f',
        color: 'white',
        padding: '12px 20px',
        borderRadius: '8px 8px 0 0',
        fontSize: '18px',
        marginBottom: '25px',
        fontWeight: '600',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <span>Internship & Work Experience</span>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '20px' }}>
        {experiences.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '40px 20px',
            color: '#666',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            border: '2px dashed #dee2e6'
          }}>
            <p style={{ margin: '0 0 15px 0', fontSize: '16px' }}>
              No work experience added yet
            </p>
            <p style={{ margin: '0', fontSize: '14px' }}>
              Click "Add Experience" to get started
            </p>
          </div>
        )}

        {experiences.map((exp, idx) => (
          <div key={idx} style={cardStyle}>
            {experiences.length > 1 && (
              <button
                type="button"
                onClick={() => removeExperience(idx)}
                style={removeButtonStyle}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#c82333'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#dc3545'}
                title="Remove this experience"
              >
                Remove
              </button>
            )}

            <div style={{ marginBottom: '15px' }}>
              <label style={labelStyle}>Title <span style={{ color: 'red' }}>*</span></label>
              <input 
                type="text" 
                name="title" 
                placeholder="Job or Internship Title" 
                value={exp?.title || ''} 
                onChange={(e) => handleExperienceChange(idx, e)} 
                required 
                style={inputStyle} 
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={labelStyle}>Employment Type <span style={{ color: 'red' }}>*</span></label>
              <select
                name="employmentType" 
                value={exp?.employmentType || ''} 
                onChange={(e) => handleExperienceChange(idx, e)} 
                required 
                style={inputStyle}
              >
                <option value="">Select Employment Type</option>
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Internship">Internship</option>
                <option value="Contract">Contract</option>
                <option value="Freelance">Freelance</option>
              </select>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={labelStyle}>Company / Organization <span style={{ color: 'red' }}>*</span></label>
              <input 
                type="text" 
                name="company" 
                placeholder="Company or Organization Name" 
                value={exp?.company || ''} 
                onChange={(e) => handleExperienceChange(idx, e)} 
                required 
                style={inputStyle} 
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                cursor: 'pointer', 
                color: '#000', 
                fontWeight: '500' 
              }}>
                <input 
                  type="checkbox" 
                  name="currentlyWorking" 
                  checked={exp?.currentlyWorking || false} 
                  onChange={(e) => handleExperienceChange(idx, e)} 
                  style={{ 
                    marginRight: '8px', 
                    width: '16px', 
                    height: '16px', 
                    accentColor: '#1e1e3f', 
                    backgroundColor: '#fff' 
                  }} 
                />
                I am currently working in this role
              </label>
            </div>

            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
              gap: '15px', 
              marginBottom: '15px' 
            }}>
              <div>
                <label style={labelStyle}>Start Date <span style={{ color: 'red' }}>*</span></label>
                <input 
                  type="date" 
                  name="startDate" 
                  value={exp?.startDate || ''} 
                  onChange={(e) => handleExperienceChange(idx, e)} 
                  required 
                  style={inputStyle} 
                />
              </div>

              <div>
                <label style={labelStyle}>
                  End Date {exp?.currentlyWorking ? '(Disabled)' : <span style={{ color: 'red' }}>*</span>}
                </label>
                <input 
                  type="date" 
                  name="endDate" 
                  value={exp?.endDate || ''} 
                  onChange={(e) => handleExperienceChange(idx, e)} 
                  disabled={exp?.currentlyWorking || false} 
                  required={!exp?.currentlyWorking} 
                  style={{
                    ...inputStyle,
                    backgroundColor: exp?.currentlyWorking ? '#e9ecef' : '#fff',
                    cursor: exp?.currentlyWorking ? 'not-allowed' : 'auto'
                  }} 
                />
              </div>

              <div>
                <label style={labelStyle}>Duration</label>
                <input 
                  type="text" 
                  name="duration" 
                  value={exp?.duration || ''} 
                  readOnly 
                  style={{ 
                    ...inputStyle, 
                    backgroundColor: '#e9ecef', 
                    cursor: 'not-allowed' 
                  }} 
                  placeholder="Duration will be calculated" 
                />
              </div>
            </div>

            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
              gap: '15px', 
              marginBottom: '15px' 
            }}>
              <div>
                <label style={labelStyle}>Location <span style={{ color: 'red' }}>*</span></label>
                <input 
                  type="text" 
                  name="location" 
                  placeholder="City, State, Country" 
                  value={exp?.location || ''} 
                  onChange={(e) => handleExperienceChange(idx, e)} 
                  required 
                  style={inputStyle} 
                />
              </div>

              <div>
                <label style={labelStyle}>Location Type <span style={{ color: 'red' }}>*</span></label>
                <select
                  name="locationType" 
                  value={exp?.locationType || ''} 
                  onChange={(e) => handleExperienceChange(idx, e)} 
                  required 
                  style={inputStyle}
                >
                  <option value="">Select Location Type</option>
                  <option value="Remote">Remote</option>
                  <option value="On-site">On-site</option>
                  <option value="Hybrid">Hybrid</option>
                </select>
              </div>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={labelStyle}>Description</label>
              <textarea 
                name="description" 
                placeholder="Brief description about your role and responsibilities" 
                value={exp?.description || ''} 
                onChange={(e) => handleExperienceChange(idx, e)} 
                rows={4} 
                style={{ 
                  ...inputStyle, 
                  resize: 'vertical', 
                  fontFamily: 'inherit' 
                }} 
              />
            </div>

            <div>
              <label style={labelStyle}>Media Link (URL)</label>
              <input 
                type="url" 
                name="mediaLink" 
                placeholder="Link to certificate, project, or media" 
                value={exp?.mediaLink || ''} 
                onChange={(e) => handleExperienceChange(idx, e)} 
                style={inputStyle} 
              />
            </div>
          </div>
        ))}

        {experiences.length < 3 && (
          <button 
            type="button" 
            onClick={addExperience} 
            style={{
              ...buttonStyle,
              width: 'fit-content'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#3b82f6'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#1e1e3f'}
          >
            Add Experience
          </button>
        )}

        <button 
          type="submit" 
          style={{
            padding: '14px',
            backgroundColor: '#1e1e3f',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            fontWeight: 'bold',
            fontSize: '16px',
            cursor: 'pointer',
            transition: 'background-color 0.3s'
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#3b82f6'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#1e1e3f'}
        >
          Save & Next
        </button>
      </form>
    </div>
  );
};

export default InternshipAndWorkExperience;