import React, { useState, useRef } from "react";
import axios from "axios";
import { FaTimes, FaSave, FaUpload, FaGlobe, FaBuilding, FaUser, FaPhone, FaEnvelope } from "react-icons/fa";



const CompanyEditProfile = ({ profile, onClose, onUpdate }) => {
  const [form, setForm] = useState({
    company_name: profile?.company_name || "",
    email: profile?.email || "",
    hr_person_name: profile?.hr_person_name || "",
    hr_person_contact: profile?.hr_person_contact || "",
    company_website: profile?.company_website || "",
    existing_logo: profile?.company_logo || profile?.logo_url || "",
  });

  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(form.existing_logo);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState("success"); // "success" or "error"
  const [fieldErrors, setFieldErrors] = useState({});
  const fileInputRef = useRef(null);

  // Validation function
  const validate = () => {
    let errors = {};

    // Email validation
    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errors.email = "Please enter a valid email address";
    }

    // HR name validation
    if (!form.hr_person_name || form.hr_person_name.trim().length < 2) {
      errors.hr_person_name = "Enter a valid HR contact name";
    }

    // HR phone validation
    if (!form.hr_person_contact || !/^\d{10}$/.test(form.hr_person_contact)) {
      errors.hr_person_contact = "HR phone must be a 10-digit number";
    }

    // Website validation (if provided)
    if (form.company_website && !form.company_website.match(/^(https?:\/\/)?(www\.)?[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)+([/?].*)?$/)) {
      errors.company_website = "Enter a valid website URL";
    }

    return errors;
  };

  // Handle input changes
  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));

    // Clear messages and errors when form is being edited
    setMsg("");

    // Clear specific field error when editing that field
    if (fieldErrors[name]) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Handle logo file selection
  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size (max 2MB)
    if (file.size > 512 * 1024) {
      setFieldErrors(prev => ({
        ...prev,
        logo: "Logo image must be less than 512KB"
      }));
      return;
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      setFieldErrors(prev => ({
        ...prev,
        logo: "Logo must be a JPG, PNG, or GIF image"
      }));
      return;
    }

    // Clear any existing logo errors
    if (fieldErrors.logo) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.logo;
        return newErrors;
      });
    }

    // Set the file and create preview
    setLogoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // Trigger file input click
  const handleLogoClick = () => {
    fileInputRef.current.click();
  };

  // Form submission handler
  const handleSave = async e => {
    e.preventDefault();

    // Validate form fields
    const errors = validate();
    if (Object.keys(errors).length) {
      setFieldErrors(errors);
      return;
    }

    setSaving(true);
    setMsg("");

    try {
      // Create FormData for multipart/form-data submission (required for file upload)
      const formData = new FormData();

      // Append all form fields
      formData.append("company_name", form.company_name);
      formData.append("email", form.email);
      formData.append("hr_person_name", form.hr_person_name);
      formData.append("hr_person_contact", form.hr_person_contact);
      formData.append("company_website", form.company_website);

      // Add existing logo URL if no new logo is uploaded
      if (!logoFile && form.existing_logo) {
        formData.append("existing_logo", form.existing_logo);
      }

      // Add new logo file if selected
      if (logoFile) {
        formData.append("company_logo", logoFile);
      }

      // Send request to update profile
      const res = await axios.post(
        "https://placement-portal-backend.ramshekade20.workers.dev/api/company/profile/update",
        formData,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "multipart/form-data"
          }
        }
      );

      if (res.data.success) {
        setMsg(res.data.message || "Profile updated successfully!");
        setMsgType("success");

        // Update localStorage with new values
        localStorage.setItem("company_name", form.company_name);
        localStorage.setItem("currentUser", form.hr_person_name);

        // If a new logo was uploaded and the response includes the new URL
        if (res.data.logo_url) {
          localStorage.setItem("company_logo", res.data.logo_url);
        } else if (logoPreview && logoFile) {
          // Fallback if server doesn't return new URL but we have a preview
          localStorage.setItem("company_logo", logoPreview);
        }

        // Call the parent component's update handler if provided
        if (onUpdate) {
          setTimeout(() => {
            onUpdate({
              ...form,
              company_logo: res.data.logo_url || logoPreview || form.existing_logo
            });
          }, 1000);
        }
      } else {
        setMsg(res.data.error || "Failed to update profile");
        setMsgType("error");
      }
    } catch (err) {
      console.error("Profile update error:", err);
      setMsg(err.response?.data?.error || "Failed to update profile. Please try again.");
      setMsgType("error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="company-editprofile-overlay">
      <div className="company-editprofile-modal">
        <button className="company-editprofile-closebtn" onClick={onClose}><FaTimes /></button>
        <h2 className="company-editprofile-title">Edit Company Profile</h2>

        <form onSubmit={handleSave} className="company-editprofile-form">
          {/* Logo upload section */}
          <div className="company-editprofile-logo-section">
            <div
              className="company-editprofile-logo"
              onClick={handleLogoClick}
              style={{ backgroundImage: logoPreview ? `url(${logoPreview})` : 'none' }}
            >
              {!logoPreview && <FaBuilding size={30} />}
              <div className="company-editprofile-logo-overlay">
                <FaUpload />
                <span>Upload Logo</span>
              </div>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleLogoChange}
              accept="image/jpeg,image/png,image/gif"
              style={{ display: 'none' }}
            />
            {fieldErrors.logo && (
              <div className="company-editprofile-error logo-error">{fieldErrors.logo}</div>
            )}
            <div className="company-editprofile-logo-help">
              Company logo (JPG, PNG  max 512 KB)
            </div>
          </div>

          {/* Form fields grid */}
          <div className="company-editprofile-formgrid">
            <div className="company-editprofile-field">
              <label className="company-editprofile-label">
                <FaBuilding className="field-icon" /> Company Name
              </label>
              <input
                name="company_name"
                value={form.company_name}
                disabled
                className="company-editprofile-input"
              />
            </div>

            <div className="company-editprofile-field">
              <label className="company-editprofile-label">
                <FaEnvelope className="field-icon" /> Company Email
              </label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                required
                className={`company-editprofile-input${fieldErrors.email ? " company-editprofile-input-error" : ""}`}
              />
              {fieldErrors.email && (
                <div className="company-editprofile-error">{fieldErrors.email}</div>
              )}
            </div>

            <div className="company-editprofile-field">
              <label className="company-editprofile-label">
                <FaUser className="field-icon" /> HR Contact Person
              </label>
              <input
                name="hr_person_name"
                value={form.hr_person_name}
                onChange={handleChange}
                required
                className={`company-editprofile-input${fieldErrors.hr_person_name ? " company-editprofile-input-error" : ""}`}
              />
              {fieldErrors.hr_person_name && (
                <div className="company-editprofile-error">{fieldErrors.hr_person_name}</div>
              )}
            </div>

            <div className="company-editprofile-field">
              <label className="company-editprofile-label">
                <FaPhone className="field-icon" /> HR Phone Number
              </label>
              <input
                name="hr_person_contact"
                value={form.hr_person_contact}
                onChange={handleChange}
                required
                className={`company-editprofile-input${fieldErrors.hr_person_contact ? " company-editprofile-input-error" : ""}`}
                maxLength={10}
                pattern="[0-9]+"
                title="Enter a valid phone number"
              />
              {fieldErrors.hr_person_contact && (
                <div className="company-editprofile-error">{fieldErrors.hr_person_contact}</div>
              )}
            </div>

            <div className="company-editprofile-field">
              <label className="company-editprofile-label">
                <FaGlobe className="field-icon" /> Company Website
              </label>
              <input
                name="company_website"
                value={form.company_website}
                onChange={handleChange}
                className={`company-editprofile-input${fieldErrors.company_website ? " company-editprofile-input-error" : ""}`}
                placeholder="https://yourcompany.com"
              />
              {fieldErrors.company_website && (
                <div className="company-editprofile-error">{fieldErrors.company_website}</div>
              )}
            </div>
          </div>

          {/* Save button */}
          <button
            type="submit"
            className="company-editprofile-savebtn"
            disabled={saving}
          >
            <FaSave style={{ marginRight: 8 }} />
            {saving ? "Saving..." : "Save Changes"}
          </button>

          {/* Status message */}
          {msg && (
            <div className={`company-editprofile-msg ${msgType === "error" ? "company-editprofile-msg-error" : ""}`}>
              {msg}
            </div>
          )}
        </form>
      </div>

      {/* Inline styles */}
      <style>{`
        .company-editprofile-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(30,30,63,0.18);
          backdrop-filter: blur(3px);
          z-index: 1001;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .company-editprofile-modal {
          background: #fff;
          border-radius: 14px;
          padding: 32px 30px 28px 30px;
          box-shadow: 0 6px 32px rgba(30,30,63,0.16);
          min-width: 320px;
          max-width: 700px;
          width: 700px;
          position: relative;
          max-height: 95vh;
          overflow-y: auto;
        }
        .company-editprofile-closebtn {
          position: absolute;
          right: 18px;
          top: 18px;
          background: none;
          border: none;
          font-size: 1.3rem;
          color: #888;
          cursor: pointer;
          z-index: 1;
          transition: color 0.2s;
        }
        .company-editprofile-closebtn:hover {
          color: #dc2626;
        }
        .company-editprofile-title {
          font-weight: 700;
          font-size: 1.25rem;
          color: #1e1e3f;
          margin-bottom: 25px;
          text-align: center;
        }
        .company-editprofile-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        
        /* Logo section styling */
        .company-editprofile-logo-section {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-bottom: 10px;
        }
        .company-editprofile-logo {
          width: 100px;
          height: 100px;
          border-radius: 50%;
          background-color: #f0f4f8;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          cursor: pointer;
          border: 2px dashed #cbd5e1;
          overflow: hidden;
          background-size: cover;
          background-position: center;
          color: #64748b;
        }
        .company-editprofile-logo-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0,0,0,0.5);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.2s;
          color: white;
          border-radius: 50%;
        }
        .company-editprofile-logo:hover .company-editprofile-logo-overlay {
          opacity: 1;
        }
        .company-editprofile-logo-overlay span {
          font-size: 12px;
          margin-top: 5px;
        }
        .company-editprofile-logo-help {
          font-size: 12px;
          color: #64748b;
          margin-top: 8px;
          text-align: center;
        }
        .logo-error {
          text-align: center;
          margin-top: 5px;
        }
        
        /* Form grid styling */
        .company-editprofile-formgrid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          column-gap: 20px;
          row-gap: 20px;
        }
        .company-editprofile-field {
          display: flex;
          flex-direction: column;
        }
        .company-editprofile-label {
          font-weight: 600;
          font-size: 14px;
          margin-bottom: 5px;
          color: #1e1e3f;
          display: flex;
          align-items: center;
        }
        .field-icon {
          margin-right: 6px;
          font-size: 14px;
          color: #64748b;
        }
        .company-editprofile-input {
          padding: 10px;
          border-radius: 7px;
          border: 1px solid #cbd5e1;
          background: #f7fafc;
          font-size: 15px;
          color: #1e1e3f;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .company-editprofile-input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
        }
        .company-editprofile-input[disabled] {
          background: #f1f5f9;
          color: #94a3b8;
          border-color: #e2e8f0;
        }
        .company-editprofile-input-error {
          border: 1.5px solid #dc2626 !important;
          background: #fff2f0 !important;
        }
        .company-editprofile-error {
          color: #dc2626;
          font-size: 0.9rem;
          margin-top: 3px;
        }
        
        /* Save button styling */
        .company-editprofile-savebtn {
          padding: 12px 0;
          background-color: #10b981;
          color: #fff;
          border: none;
          border-radius: 7px;
          font-weight: bold;
          font-size: 16px;
          cursor: pointer;
          margin-top: 15px;
          box-shadow: 0 2px 8px rgba(16,185,129,0.09);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          transition: background-color 0.2s, transform 0.1s;
        }
        .company-editprofile-savebtn:hover:not(:disabled) {
          background-color: #0ca678;
          transform: translateY(-1px);
        }
        .company-editprofile-savebtn:active:not(:disabled) {
          transform: translateY(1px);
        }
        .company-editprofile-savebtn:disabled {
          background: #94e2cd;
          cursor: not-allowed;
        }
        
        /* Message styling */
        .company-editprofile-msg {
          margin-top: 15px;
          text-align: center;
          font-weight: 500;
          font-size: 14px;
          color: #059669;
          padding: 10px;
          border-radius: 7px;
          background-color: #d1fae5;
        }
        .company-editprofile-msg-error {
          color: #dc2626;
          background-color: #fee2e2;
        }
        
        /* Responsive styling */
        @media (max-width: 900px) {
          .company-editprofile-modal {
            width: 90vw;
            min-width: unset;
            padding: 25px 20px;
            max-width: 90vw;
          }
          .company-editprofile-formgrid {
            grid-template-columns: 1fr;
            column-gap: 0;
          }
          .company-editprofile-title {
            font-size: 1.2rem;
            margin-bottom: 20px;
          }
        }
        @media (max-width: 600px) {
          .company-editprofile-modal {
            padding: 20px 15px;
            border-radius: 12px;
            max-width: 95vw;
            width: 95vw;
          }
          .company-editprofile-title {
            font-size: 1.1rem;
            margin-bottom: 15px;
          }
          .company-editprofile-input {
            font-size: 14px;
            padding: 9px;
          }
          .company-editprofile-logo {
            width: 80px;
            height: 80px;
          }
        }
      `}</style>
    </div>
  );
};

export default CompanyEditProfile;