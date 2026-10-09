import React, { useState } from 'react';
import { placementApi } from '../../../services/placementApi';
import './PlacementForm.css';

const PlacementForm = ({ onCancel, onSubmitSuccess }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

  const [formData, setFormData] = useState({
    companyName: '',
    placementType: '',
    role: '',
    ctc: '',
    hasOfferLetter: '',
    offerLetter: null,
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [loadingText, setLoadingText] = useState('Submitting...');
  
  const [createdPlacementId, setCreatedPlacementId] = useState(null);
  const [offerLetterUploaded, setOfferLetterUploaded] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (submitError) setSubmitError(null);
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files.length > 0) {
      const file = files[0];
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({ ...prev, [name]: 'File size should be less than 5MB' }));
        return;
      }
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
      if (!formData.placementType) {
        newErrors.placementType = 'Placement Type is required';
        isValid = false;
      }
      if (!formData.role.trim()) {
        newErrors.role = 'Role is required';
        isValid = false;
      }
      if (!formData.ctc.trim()) {
        newErrors.ctc = 'CTC is required';
        isValid = false;
      }
    } else if (currentStep === 2) {
      if (!formData.hasOfferLetter) {
        newErrors.hasOfferLetter = 'Please select an option';
        isValid = false;
      }
      if (formData.hasOfferLetter === 'Yes' && !formData.offerLetter && !offerLetterUploaded) {
        newErrors.offerLetter = 'Offer Letter is required';
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
      let placementId = createdPlacementId;

      if (!placementId) {
        setLoadingText('Submitting placement details...');
        const payload = {
          company_name: formData.companyName,
          placement_type: formData.placementType,
          role: formData.role,
          ctc: formData.ctc,
          has_offer_letter: formData.hasOfferLetter === 'Yes',
        };

        const response = await placementApi.createPlacement(payload);
        placementId = response.data?.id;
        setCreatedPlacementId(placementId);
      }

      if (formData.hasOfferLetter === 'Yes' && formData.offerLetter && !offerLetterUploaded) {
        setLoadingText('Uploading Offer Letter...');
        await placementApi.uploadOfferLetter(placementId, formData.offerLetter);
        setOfferLetterUploaded(true);
      }
      
      onSubmitSuccess({ id: placementId });
    } catch (error) {
      console.error('Submission error:', error);
      setSubmitError(error.message || 'An error occurred during submission.');
    } finally {
      setIsSubmitting(false);
      setLoadingText('Submitting...');
    }
  };

  const renderStepIndicator = () => {
    return (
      <div className="step-indicator">
        {[1, 2, 3].map((step) => (
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
        <h3>{currentStep === 3 ? 'Review Placement Details' : 'Add New Placement'}</h3>
        <button className="close-form-btn" onClick={onCancel}>×</button>
      </div>

      {renderStepIndicator()}

      <form className="internship-form-body" onSubmit={handleSubmit}>

        {/* Step 1: Basic Details */}
        {currentStep === 1 && (
          <div className="form-step fade-in">
            <h4 className="step-title">Placement Details</h4>

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
              <label>Placement Type <span className="required">*</span></label>
              <select name="placementType" value={formData.placementType} onChange={handleChange} className={errors.placementType ? 'error-input' : ''}>
                <option value="">Select Placement Type</option>
                <option value="Campus">Campus</option>
                <option value="Off-Campus">Off-Campus</option>
              </select>
              {errors.placementType && <span className="error-text">{errors.placementType}</span>}
            </div>

            <div className="form-group">
              <label>Role <span className="required">*</span></label>
              <input
                type="text"
                name="role"
                value={formData.role}
                onChange={handleChange}
                placeholder="e.g. Software Engineer"
                className={errors.role ? 'error-input' : ''}
              />
              {errors.role && <span className="error-text">{errors.role}</span>}
            </div>

            <div className="form-group">
              <label>CTC (LPA) <span className="required">*</span></label>
              <input
                type="text"
                name="ctc"
                value={formData.ctc}
                onChange={handleChange}
                placeholder="e.g. 10 LPA"
                className={errors.ctc ? 'error-input' : ''}
              />
              {errors.ctc && <span className="error-text">{errors.ctc}</span>}
            </div>
          </div>
        )}

        {/* Step 2: Offer Letter */}
        {currentStep === 2 && (
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

        {/* Step 3: Review */}
        {currentStep === 3 && (
          <div className="form-step fade-in review-step">

            <div className="review-section">
              <div className="review-row">
                <span className="review-label">Company</span>
                <span className="review-value">{formData.companyName}</span>
              </div>
              <div className="review-row">
                <span className="review-label">Placement Type</span>
                <span className="review-value">{formData.placementType}</span>
              </div>
              <div className="review-row">
                <span className="review-label">Role</span>
                <span className="review-value">{formData.role}</span>
              </div>
              <div className="review-row">
                <span className="review-label">CTC (LPA)</span>
                <span className="review-value">{formData.ctc}</span>
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
              {isSubmitting ? `⏳ ${loadingText}` : 'Submit Placement'}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default PlacementForm;
