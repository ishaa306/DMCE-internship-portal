import { FaClock } from 'react-icons/fa';
import React, { useState, useEffect, useCallback } from 'react';
import {
  FaArrowRight,
  FaRegCalendarAlt,
  FaInfoCircle,
  FaExclamationCircle,
  FaCheck
} from 'react-icons/fa';
import './Hiring.css';

const Hiring = ({ data = {}, setData, onNext }) => {
  const [hiringErrors, setHiringErrors] = useState({});
  const [hiringTouched, setHiringTouched] = useState({});
  const [hiringDateRange, setHiringDateRange] = useState({
    minDateTime: '',
    maxDateTime: ''
  });

  // Calculate datetime restrictions (tomorrow to 6 months from now)
  useEffect(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const sixMonthsLater = new Date();
    sixMonthsLater.setMonth(sixMonthsLater.getMonth() + 6);

    const formatDateTime = (date) => {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const d = String(date.getDate()).padStart(2, '0');
      const h = String(date.getHours()).padStart(2, '0');
      const min = String(date.getMinutes()).padStart(2, '0');
      return `${y}-${m}-${d}T${h}:${min}`;
    };

    setHiringDateRange({
      minDateTime: formatDateTime(tomorrow),
      maxDateTime: formatDateTime(sixMonthsLater)
    });
  }, []);

  // Field validation
  const validateHiringField = useCallback((name, value) => {
    if (!name) return '';

    switch (name) {
      case 'selectionRounds':
        if (!value || value.trim() === '') {
          return 'Please describe the selection rounds';
        }
        if (value.length < 10) {
          return 'Please provide more details about selection rounds';
        }
        break;

      case 'deadline_date_time':
        if (!value) {
          return 'Application deadline date and time is required';
        } else {
          const selected = new Date(value);
          const now = new Date();
          if (selected <= now) {
            return 'Application deadline must be in the future';
          }
        }
        break;

      case 'driveDate':
        if (!value) {
          return 'Drive date is required';
        } else {
          const selected = new Date(value);
          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 1);
          tomorrow.setHours(0, 0, 0, 0);

          const sixMonthsLater = new Date();
          sixMonthsLater.setMonth(sixMonthsLater.getMonth() + 6);

          if (selected < tomorrow) {
            return 'Drive date must be at least tomorrow';
          }
          if (selected > sixMonthsLater) {
            return 'Drive date cannot be more than 6 months in the future';
          }
        }
        break;

      case 'interviewMode':
        if (!value) {
          return 'Please select an interview mode';
        }
        break;

      default:
        break;
    }

    return '';
  }, []);

  // Change handler
  const handleHiringChange = useCallback(
    (e) => {
      const { name, value } = e.target;

      setData((prev) => ({ ...prev, [name]: value }));
      setHiringTouched((prev) => ({ ...prev, [name]: true }));

      const error = validateHiringField(name, value);
      setHiringErrors((prev) => ({ ...prev, [name]: error }));
    },
    [setData, validateHiringField]
  );

  // Blur handler
  const handleHiringBlur = useCallback(
    (e) => {
      const { name, value } = e.target;

      setHiringTouched((prev) => ({ ...prev, [name]: true }));

      const error = validateHiringField(name, value);
      setHiringErrors((prev) => ({ ...prev, [name]: error }));
    },
    [validateHiringField]
  );

  // Form validation
  const validateHiringForm = useCallback(() => {
    const requiredFields = [
      'selectionRounds',
      'deadline_date_time',
      'driveDate',
      'interviewMode'
    ];

    const newErrors = {};
    const newTouched = {};
    let valid = true;

    requiredFields.forEach((field) => {
      const error = validateHiringField(field, data[field]);
      if (error) {
        newErrors[field] = error;
        valid = false;
      }
      newTouched[field] = true;
    });

    setHiringErrors(newErrors);
    setHiringTouched(newTouched);

    return valid;
  }, [data, validateHiringField]);

  // Save and next
  const handleHiringSaveNext = useCallback(() => {
    if (validateHiringForm()) {
      const el = document.querySelector('.hire-success-animation');
      if (el) el.classList.add('hire-show');

      setTimeout(() => {
        onNext && onNext();
      }, 500);
    } else {
      const firstError = document.querySelector('.hire-field-error');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [validateHiringForm, onNext]);

  const isHiringFieldValid = (field) =>
    hiringTouched[field] && !hiringErrors[field];

  return (
    <div className="hire-container">
      <div className="hire-success-animation">
        <div className="hire-success-icon">
          <FaCheck />
        </div>
      </div>

      <div className="hire-header">
        <div className="hire-header-icon">🧩</div>
        <h2>Hiring Process Details</h2>
      </div>

      <div className="hire-info-box">
        <FaInfoCircle className="hire-info-icon" />
        <p>
          Please provide details about your hiring process. The application
          deadline must be in the future and within the next 6 months.
        </p>
      </div>

      <form className="hire-form" autoComplete="off">
        {/* Selection Rounds */}
        <div className={`hire-form-group ${hiringTouched.selectionRounds && hiringErrors.selectionRounds ? 'hire-has-error' : ''} ${isHiringFieldValid('selectionRounds') ? 'hire-is-valid' : ''}`}>
          <label>
            Selection Rounds <span className="hire-required">*</span>
          </label>
          <textarea
            name="selectionRounds"
            value={data.selectionRounds || ''}
            onChange={handleHiringChange}
            onBlur={handleHiringBlur}
            className="hire-textarea"
          />
          {hiringTouched.selectionRounds && hiringErrors.selectionRounds && (
            <div className="hire-field-error">
              <FaExclamationCircle /> {hiringErrors.selectionRounds}
            </div>
          )}
        </div>

        {/* Application Deadline Date & Time */}
        <div className={`hire-form-group ${hiringTouched.deadline_date_time && hiringErrors.deadline_date_time ? 'hire-has-error' : ''} ${isHiringFieldValid('deadline_date_time') ? 'hire-is-valid' : ''}`}>
          <label>
            Application Deadline (Date & Time – IST) <span className="hire-required">*</span>
          </label>
          <input
            type="datetime-local"
            name="deadline_date_time"
            value={data.deadline_date_time || ''}
            min={hiringDateRange.minDateTime}
            max={hiringDateRange.maxDateTime}
            onChange={handleHiringChange}
            onBlur={handleHiringBlur}
            className="hire-input"
          />
          {hiringTouched.deadline_date_time && hiringErrors.deadline_date_time && (
            <div className="hire-field-error">
              <FaExclamationCircle /> {hiringErrors.deadline_date_time}
            </div>
          )}
        </div>

        {/* Drive Date + Interview Mode */}
        <div className="hire-form-row">
          <div className={`hire-form-group ${hiringTouched.driveDate && hiringErrors.driveDate ? 'hire-has-error' : ''}`}>
            <label>
              Tentative Drive Date <span className="hire-required">*</span>
            </label>
            <input
              type="date"
              name="driveDate"
              value={data.driveDate || ''}
              onChange={handleHiringChange}
              onBlur={handleHiringBlur}
              className="hire-input"
            />
            {hiringErrors.driveDate && (
              <div className="hire-field-error">
                <FaExclamationCircle /> {hiringErrors.driveDate}
              </div>
            )}
          </div>

          <div className={`hire-form-group ${hiringTouched.interviewMode && hiringErrors.interviewMode ? 'hire-has-error' : ''}`}>
            <label>
              Mode of Interview <span className="hire-required">*</span>
            </label>
            <select
              name="interviewMode"
              value={data.interviewMode || ''}
              onChange={handleHiringChange}
              onBlur={handleHiringBlur}
              className="hire-select"
            >
              <option value="">Select Interview Mode</option>
              <option value="Online">Online</option>
              <option value="Offline">Offline</option>
              <option value="Hybrid">Hybrid</option>
            </select>
            {hiringErrors.interviewMode && (
              <div className="hire-field-error">
                <FaExclamationCircle /> {hiringErrors.interviewMode}
              </div>
            )}
          </div>
        </div>

        <div className="hire-form-actions">
          <button type="button" className="hire-save-next-btn" onClick={handleHiringSaveNext}>
            <span>Save and Next</span> <FaArrowRight />
          </button>
        </div>
      </form>
    </div>
  );
};

export default Hiring;
