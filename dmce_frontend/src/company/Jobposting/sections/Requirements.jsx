import React, { useState, useEffect, useRef } from 'react';
import { FaArrowRight, FaChevronDown } from 'react-icons/fa';
import './Requirements.css';

const allBranches = [
  'Information Technology', 'Civil Engineering',
  'Civil & Infrastructure Engineering', 'Mechanical Engineering',
  'Computer Engineering', 'Artificial Intelligence and Data Science Engineering',
  'Electronics and Telecommunication Engineering',
  'Electronics Engineering',
  'Chemical Engineering'
];

const Requirements = ({ formData, setFormData, onNext }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [errors, setErrors] = useState({});
  const dropdownRef = useRef();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const validateField = (name, value) => {
    const numVal = parseFloat(value);
    if (!value) return null;

    if (['minTenth', 'minTwelfth', 'minDiploma'].includes(name)) {
      return (numVal >= 35 && numVal <= 100) ? null : 'Must be between 35 and 100';
    }

    if (name === 'minCGPA') {
      return (numVal >= 4 && numVal <= 10.1) ? null : 'Must be between 4 and 10.1';
    }

    if (name === 'minEngineering') {
      return (numVal >= 35 && numVal <= 100) ? null : 'Must be between 35 and 100';
    }

    return null;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    const errMsg = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: errMsg }));
  };

  const handleSelectBranch = (branch) => {
    if (!formData.eligibleBranches?.includes(branch)) {
      const updated = [...(formData.eligibleBranches || []), branch];
      setFormData(prev => ({ ...prev, eligibleBranches: updated }));
    }
  };

  const removeBranch = (branch) => {
    const updated = formData.eligibleBranches.filter(b => b !== branch);
    setFormData(prev => ({ ...prev, eligibleBranches: updated }));
  };

  const handleSaveNext = () => {
    const newErrors = {};

    // Validate numeric fields only if filled
    ['minTenth', 'minTwelfth', 'minDiploma', 'minCGPA', 'minEngineering'].forEach(field => {
      const err = validateField(field, formData[field]);
      if (err) newErrors[field] = err;
    });

    // Required fields
    if (!formData.batch) newErrors.batch = 'Batch is required';
    if (!formData.eligibleBranches || formData.eligibleBranches.length === 0)
      newErrors.eligibleBranches = 'Select at least one branch';

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      onNext?.();
    }
  };

  return (
    <div className="req-container">
      <div className="req-title">📋 Eligibility Requirements</div>

      <div className="req-grid">
        {['minTenth', 'minTwelfth', 'minDiploma', 'minEngineering'].map((field, idx) => (
          <div className="req-group" key={idx}>
            <label>
              {field === 'minTenth'
                ? '10th %'
                : field === 'minTwelfth'
                ? '12th %'
                : field === 'minDiploma'
                ? 'Diploma %'
                : 'Engineering %'}
            </label>
            <input
              name={field}
              type="number"
              value={formData[field] || ''}
              onChange={handleChange}
            />
            {errors[field] && <p className="input-error">{errors[field]}</p>}
          </div>
        ))}

        <div className="req-group">
          <label>Minimum CGPA</label>
          <input
            name="minCGPA"
            type="number"
            step="0.01"
            value={formData.minCGPA || ''}
            onChange={handleChange}
          />
          {errors.minCGPA && <p className="input-error">{errors.minCGPA}</p>}
        </div>

        <div className="req-group">
          <label>Live KT Allowed</label>
          <select name="ktAllowed" value={formData.ktAllowed || ''} onChange={handleChange}>
            <option value="">-- Select --</option>
            <option value="Yes">Yes</option>
            <option value="No">No</option>
          </select>
        </div>

        <div className="req-group req-dropdown" ref={dropdownRef}>
          <label>Eligible Branches *</label>
          <div className="req-dropdown-box" onClick={() => setShowDropdown(!showDropdown)}>
            <div className="req-branch-tags">
              {formData.eligibleBranches?.length ? (
                formData.eligibleBranches.map((b, i) => (
                  <span key={i} className="req-tag">
                    {b}
                    <span onClick={(e) => { e.stopPropagation(); removeBranch(b); }}>×</span>
                  </span>
                ))
              ) : <span className="req-placeholder">Select eligible branches</span>}
            </div>
            <FaChevronDown className="req-chevron" />
          </div>
          {errors.eligibleBranches && <p className="input-error">{errors.eligibleBranches}</p>}

          {showDropdown && (
            <div className="req-dropdown-list">
              {allBranches.filter(b => !formData.eligibleBranches?.includes(b)).map((b, i) => (
                <div key={i} className="req-dropdown-item" onClick={() => handleSelectBranch(b)}>
                  {b}
                </div>
              ))}
              {allBranches.filter(b => !formData.eligibleBranches?.includes(b)).length === 0 && (
                <div className="req-dropdown-item disabled">All branches selected</div>
              )}
            </div>
          )}
        </div>

        <div className="req-group">
          <label>Batch *</label>
          <select name="batch" value={formData.batch || ''} onChange={handleChange}>
            <option value="">-- Select --</option>
            {[2025, 2026, 2027, 2028, 2029, 2030].map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          {errors.batch && <p className="input-error">{errors.batch}</p>}
        </div>
      </div>

      <div className="req-btn-wrap">
        <button className="req-btn" onClick={handleSaveNext}>
          Save and Next <FaArrowRight />
        </button>
      </div>
    </div>
  );
};

export default Requirements;