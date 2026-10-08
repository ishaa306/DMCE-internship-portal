import React, { useState } from 'react';
import { internshipApi } from '../../../services/internshipApi';
import './InternshipForm.css';

const InternshipForm = ({ onCancel, onSubmitSuccess }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5;

  const [formData, setFormData] = useState({
    companyName: '',
    location: '',
    role: '',
    workMode: '',
    hasIncentives: '',
    incentiveAmount: '',
    startDate: '',
    duration: '',
    hasOfferLetter: '',
    offerLetter: null,
    isCompleted: '',
    completionCertificate: null,
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [loadingText, setLoadingText] = useState('Submitting...');
  
  // Track successful partial steps
  const [createdInternshipId, setCreatedInternshipId] = useState(null);
  const [offerLetterUploaded, setOfferLetterUploaded] = useState(false);
  const [certificateUploaded, setCertificateUploaded] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (submitError) setSubmitError(null);
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files.length > 0) {
      const file = files[0];
      // Basic validation: 5MB limit
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({ ...prev, [name]: 'File size should be less than 5MB' }));
        return;
      }
      // Note: Backend checks type. For better UX, frontend could check it too, but we will let backend handle it for now
      setFormData((prev) => ({ ...prev, [name]: file }));
      if (errors[name]) {
        setErrors((prev) => ({ ...prev, [name]: '' }));
      }
    }
  };

  const removeFile = (name) => {
    setFormData((prev) => ({ ...prev, [name]: null }));
  };

  const validateStep = () => {
    const newErrors = {};
    let isValid = true;

    if (currentStep === 1) {
      if (!formData.companyName.trim()) {
        newErrors.companyName = 'Company Name is required';
        isValid = false;
      }
      if (!formData.location.trim()) {
        newErrors.location = 'Location is required';
        isValid = false;
      }
      if (!formData.role.trim()) {
        newErrors.role = 'Role is required';
        isValid = false;
      }
    } else if (currentStep === 2) {
      if (!formData.workMode) {
        newErrors.workMode = 'Work Mode is required';
        isValid = false;
      }
      if (!formData.hasIncentives) {
        newErrors.hasIncentives = 'Please select if incentives are provided';
        isValid = false;
      }
      if (formData.hasIncentives === 'Yes' && !formData.incentiveAmount.trim()) {
        newErrors.incentiveAmount = 'Incentive amount is required';
        isValid = false;
      }
      if (!formData.startDate) {
        newErrors.startDate = 'Start date is required';
        isValid = false;
      }
      if (!formData.duration) {
        newErrors.duration = 'Duration is required';
        isValid = false;
      }
    } else if (currentStep === 3) {
      if (!formData.hasOfferLetter) {
        newErrors.hasOfferLetter = 'Please select an option';
        isValid = false;
      }
      if (formData.hasOfferLetter === 'Yes' && !formData.offerLetter && !offerLetterUploaded) {
        newErrors.offerLetter = 'Offer Letter is required';
        isValid = false;
      }
    } else if (currentStep === 4) {
      if (!formData.isCompleted) {
        newErrors.isCompleted = 'Please select an option';
        isValid = false;
      }
      if (formData.isCompleted === 'Yes' && !formData.completionCertificate && !certificateUploaded) {
        newErrors.completionCertificate = 'Completion Certificate is required';
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  const nextStep = () => {
    if (validateStep()) {
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep() || isSubmitting) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      let internshipId = createdInternshipId;

      // Step 1: Create Internship if not already created
      if (!internshipId) {
        setLoadingText('Submitting internship details...');
        const payload = {
          company_name: formData.companyName,
          location: formData.location,
          role: formData.role,
          work_mode: formData.workMode.toLowerCase(),
          has_incentives: formData.hasIncentives === 'Yes',
          incentive_amount: formData.incentiveAmount,
          start_date: formData.startDate,
          duration: formData.duration,
          has_offer_letter: formData.hasOfferLetter === 'Yes',
          is_completed: formData.isCompleted === 'Yes',
        };

        const response = await internshipApi.createInternship(payload);
        internshipId = response.data?.id;
        setCreatedInternshipId(internshipId);
      }

      // Step 2: Upload Offer Letter
      if (formData.hasOfferLetter === 'Yes' && formData.offerLetter && !offerLetterUploaded) {
        setLoadingText('Uploading Offer Letter...');
        await internshipApi.uploadOfferLetter(internshipId, formData.offerLetter);
        setOfferLetterUploaded(true);
      }

      // Step 3: Upload Completion Certificate
      if (formData.isCompleted === 'Yes' && formData.completionCertificate && !certificateUploaded) {
        setLoadingText('Uploading Completion Certificate...');
        await internshipApi.uploadCompletionCertificate(internshipId, formData.completionCertificate);
        setCertificateUploaded(true);
      }
      
      // All done!
      onSubmitSuccess({ id: internshipId });
    } catch (error) {
      console.error('Submission error:', error);
      
      if (error.status === 401 || error.status === 403) {
        setSubmitError('Authentication error. Please log in again.');
      } else if (error.message) {
        setSubmitError(error.message);
      } else {
        setSubmitError('An error occurred during submission. You can retry to continue uploading failed documents.');
      }
    } finally {
      setIsSubmitting(false);
      setLoadingText('Submitting...');
    }
  };

  const renderStepIndicator = () => {
    return (
      <div className="step-indicator">
        {[1, 2, 3, 4, 5].map((step) => (
          <div key={step} className={`step-item ${currentStep === step ? 'active' : ''} ${currentStep > step ? 'completed' : ''}`}>
            <div className="step-circle">{currentStep > step ? '✓' : step}</div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="internship-form-container">
      <div className="internship-form-header">
        <h3>{currentStep === 5 ? 'Review Internship Details' : 'Add New Internship'}</h3>
        <button className="close-form-btn" onClick={onCancel}>×</button>
      </div>

      {renderStepIndicator()}

      <form className="internship-form-body" onSubmit={handleSubmit}>

        {/* Step 1: Basic Details */}
        {currentStep === 1 && (
          <div className="form-step fade-in">
            <h4 className="step-title">Basic Details</h4>

            <div className="form-group">
              <label>Company Name <span className="required">*</span></label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                placeholder="e.g. ABC Technologies"
                className={errors.companyName ? 'error-input' : ''}
              />
              {errors.companyName && <span className="error-text">{errors.companyName}</span>}
            </div>

            <div className="form-group">
              <label>Location <span className="required">*</span></label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g. Mumbai, Navi Mumbai"
                className={errors.location ? 'error-input' : ''}
              />
              {errors.location && <span className="error-text">{errors.location}</span>}
            </div>

            <div className="form-group">
              <label>Role <span className="required">*</span></label>
              <input
                type="text"
                name="role"
                value={formData.role}
                onChange={handleChange}
                placeholder="e.g. Software Developer Intern"
                className={errors.role ? 'error-input' : ''}
              />
              {errors.role && <span className="error-text">{errors.role}</span>}
            </div>
          </div>
        )}

        {/* Step 2: Internship Details */}
        {currentStep === 2 && (
          <div className="form-step fade-in">
            <h4 className="step-title">Internship Details</h4>

            <div className="form-group">
              <label>Work Mode <span className="required">*</span></label>
              <select name="workMode" value={formData.workMode} onChange={handleChange} className={errors.workMode ? 'error-input' : ''}>
                <option value="">Select Work Mode</option>
                <option value="On-site">On-site</option>
                <option value="Hybrid">Hybrid</option>
                <option value="Remote">Remote</option>
              </select>
              {errors.workMode && <span className="error-text">{errors.workMode}</span>}
            </div>

            <div className="form-group">
              <label>Does this internship provide incentives? <span className="required">*</span></label>
              <div className="radio-group">
                <label className="radio-label">
                  <input type="radio" name="hasIncentives" value="Yes" checked={formData.hasIncentives === 'Yes'} onChange={handleChange} />
                  Yes
                </label>
                <label className="radio-label">
                  <input type="radio" name="hasIncentives" value="No" checked={formData.hasIncentives === 'No'} onChange={handleChange} />
                  No
                </label>
              </div>
              {errors.hasIncentives && <span className="error-text">{errors.hasIncentives}</span>}
            </div>

            {formData.hasIncentives === 'Yes' && (
              <div className="form-group slide-down">
                <label>Incentive / Stipend Amount <span className="required">*</span></label>
                <input
                  type="text"
                  name="incentiveAmount"
                  value={formData.incentiveAmount}
                  onChange={handleChange}
                  placeholder="e.g. 15,000/month"
                  className={errors.incentiveAmount ? 'error-input' : ''}
                />
                {errors.incentiveAmount && <span className="error-text">{errors.incentiveAmount}</span>}
              </div>
            )}

            <div className="form-row">
              <div className="form-group">
                <label>Starting Date <span className="required">*</span></label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  className={errors.startDate ? 'error-input' : ''}
                />
                {errors.startDate && <span className="error-text">{errors.startDate}</span>}
              </div>

              <div className="form-group">
                <label>Duration <span className="required">*</span></label>
                <select name="duration" value={formData.duration} onChange={handleChange} className={errors.duration ? 'error-input' : ''}>
                  <option value="">Select Duration</option>
                  <option value="1 Month">1 Month</option>
                  <option value="2 Months">2 Months</option>
                  <option value="3 Months">3 Months</option>
                  <option value="4 Months">4 Months</option>
                  <option value="5 Months">5 Months</option>
                  <option value="6 Months">6 Months</option>
                  <option value="6+ Months">6+ Months</option>
                </select>
                {errors.duration && <span className="error-text">{errors.duration}</span>}
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Offer Letter */}
        {currentStep === 3 && (
          <div className="form-step fade-in">
            <h4 className="step-title">Offer Letter</h4>

            <div className="form-group">
              <label>Have you received an offer letter? <span className="required">*</span></label>
              <div className="radio-group">
                <label className="radio-label">
                  <input type="radio" name="hasOfferLetter" value="Yes" checked={formData.hasOfferLetter === 'Yes'} onChange={handleChange} />
                  Yes
                </label>
                <label className="radio-label">
                  <input type="radio" name="hasOfferLetter" value="No" checked={formData.hasOfferLetter === 'No'} onChange={handleChange} />
                  No
                </label>
              </div>
              {errors.hasOfferLetter && <span className="error-text">{errors.hasOfferLetter}</span>}
            </div>

            {formData.hasOfferLetter === 'Yes' && (
              <div className="form-group slide-down">
                <label>Upload Offer Letter <span className="required">*</span></label>
                <p className="field-hint">Accepted formats: PDF, DOC, DOCX. Max size: 5MB</p>

                {!formData.offerLetter ? (
                  <div className={`file-upload-box ${errors.offerLetter ? 'error-box' : ''}`}>
                    <input type="file" name="offerLetter" id="offerLetter" accept=".pdf,.doc,.docx" onChange={handleFileChange} />
                    <label htmlFor="offerLetter" className="file-upload-label">
                      <span className="upload-icon">📄</span>
                      <span>Choose File</span>
                    </label>
                  </div>
                ) : (
                  <div className="selected-file">
                    <span className="file-name">📄 {formData.offerLetter.name}</span>
                    <button type="button" className="remove-file-btn" onClick={() => removeFile('offerLetter')}>Remove</button>
                  </div>
                )}
                {errors.offerLetter && <span className="error-text">{errors.offerLetter}</span>}
              </div>
            )}
          </div>
        )}

        {/* Step 4: Completion Certificate */}
        {currentStep === 4 && (
          <div className="form-step fade-in">
            <h4 className="step-title">Completion Certificate</h4>

            <div className="form-group">
              <label>Is this internship completed? <span className="required">*</span></label>
              <div className="radio-group-vertical">
                <label className="radio-label">
                  <input type="radio" name="isCompleted" value="Yes" checked={formData.isCompleted === 'Yes'} onChange={handleChange} />
                  Yes
                </label>
                <label className="radio-label">
                  <input type="radio" name="isCompleted" value="No" checked={formData.isCompleted === 'No'} onChange={handleChange} />
                  No, currently ongoing
                </label>
              </div>
              {errors.isCompleted && <span className="error-text">{errors.isCompleted}</span>}
            </div>

            {formData.isCompleted === 'Yes' && (
              <div className="form-group slide-down">
                <label>Upload Completion Certificate <span className="required">*</span></label>
                <p className="field-hint">Accepted formats: PDF, DOC, DOCX, JPG, PNG. Max size: 5MB</p>

                {!formData.completionCertificate ? (
                  <div className={`file-upload-box ${errors.completionCertificate ? 'error-box' : ''}`}>
                    <input type="file" name="completionCertificate" id="completionCertificate" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" onChange={handleFileChange} />
                    <label htmlFor="completionCertificate" className="file-upload-label">
                      <span className="upload-icon">🎓</span>
                      <span>Choose File</span>
                    </label>
                  </div>
                ) : (
                  <div className="selected-file">
                    <span className="file-name">🎓 {formData.completionCertificate.name}</span>
                    <button type="button" className="remove-file-btn" onClick={() => removeFile('completionCertificate')}>Remove</button>
                  </div>
                )}
                {errors.completionCertificate && <span className="error-text">{errors.completionCertificate}</span>}
              </div>
            )}
          </div>
        )}

        {/* Step 5: Review */}
        {currentStep === 5 && (
          <div className="form-step fade-in review-step">

            <div className="review-section">
              <div className="review-row">
                <span className="review-label">Company</span>
                <span className="review-value">{formData.companyName}</span>
              </div>
              <div className="review-row">
                <span className="review-label">Location</span>
                <span className="review-value">{formData.location}</span>
              </div>
              <div className="review-row">
                <span className="review-label">Role</span>
                <span className="review-value">{formData.role}</span>
              </div>
            </div>

            <div className="review-section">
              <div className="review-row">
                <span className="review-label">Work Mode</span>
                <span className="review-value">{formData.workMode}</span>
              </div>
              <div className="review-row">
                <span className="review-label">Incentives</span>
                <span className="review-value">
                  {formData.hasIncentives === 'Yes' ? `Yes — ${formData.incentiveAmount}` : 'No'}
                </span>
              </div>
              <div className="review-row">
                <span className="review-label">Starting Date</span>
                <span className="review-value">{formData.startDate}</span>
              </div>
              <div className="review-row">
                <span className="review-label">Duration</span>
                <span className="review-value">{formData.duration}</span>
              </div>
            </div>

            <div className="review-section">
              <div className="review-row">
                <span className="review-label">Offer Letter</span>
                <span className="review-value">
                  {formData.hasOfferLetter === 'Yes' && formData.offerLetter
                    ? formData.offerLetter.name
                    : 'Not provided'}
                </span>
              </div>
              <div className="review-row">
                <span className="review-label">Completion Certificate</span>
                <span className="review-value">
                  {formData.isCompleted === 'Yes' && formData.completionCertificate
                    ? formData.completionCertificate.name
                    : (formData.isCompleted === 'No' ? 'Not provided — Internship ongoing' : 'Not provided')}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Form Actions */}
        <div className="form-actions">
          {currentStep > 1 && (
            <button type="button" className="btn-secondary" onClick={prevStep} disabled={isSubmitting}>
              ← Back
            </button>
          )}

          <div className="spacer">
            {submitError && <span className="submit-error-text">{submitError}</span>}
          </div>

          {currentStep < totalSteps ? (
            <button type="button" className="btn-primary" onClick={nextStep}>
              Next →
            </button>
          ) : (
            <button type="submit" className="btn-success" disabled={isSubmitting}>
              {isSubmitting ? `⏳ ${loadingText}` : 'Submit Internship'}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default InternshipForm;
