import React, { useState } from "react";
import axios from "axios";
import {
  FaUser, FaIdCard, FaVenusMars, FaBirthdayCake,
  FaPhoneAlt, FaEnvelope, FaIdBadge, FaCheckCircle,
  FaExclamationCircle, FaCamera, FaSpinner
} from "react-icons/fa";


// --- Responsive tweaks hook ---
const useResponsive = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 700);
  React.useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 700);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return isMobile;
};

const getStyles = (isMobile) => ({
  outerContainer: {
    maxWidth: isMobile ? "100%" : 950, // Ensure it takes full width on mobile
    margin: isMobile ? "14px 0" : "38px auto",
    padding: isMobile ? "1.2rem 0.7rem 1.1rem 0.7rem" : "2.5rem 2.2rem 2.2rem 2.2rem", // Increased horizontal padding
    background: "#f9fafb",
    borderRadius: isMobile ? 12 : 22,
    boxShadow: "0 6px 32px rgba(30,30,63,.10)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    boxSizing: "border-box" // Ensure padding doesn't make it overflow
  },
  imageSection: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    marginBottom: isMobile ? 20 : 32,
    gap: 10
  },
  profileImg: {
    width: isMobile ? 110 : 145,
    height: isMobile ? 110 : 145,
    objectFit: "cover",
    borderRadius: "50%",
    border: "4px solid #10b981",
    boxShadow: "0 2px 12px rgba(16,185,129,0.13)",
    background: "#fff",
  },
  photoUploadSection: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 12,
    marginTop: 8
  },
  photoButton: {
    background: "#1e1e3f",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    fontWeight: 600,
    fontSize: isMobile ? "0.9rem" : "0.95rem",
    padding: "10px 16px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    transition: "background-color 0.2s"
  },
  photoButtonHover: {
    backgroundColor: "#3b3b7e"
  },
  photoButtonDisabled: {
    backgroundColor: "#9ca3af",
    cursor: "not-allowed"
  },
  fileInput: {
    display: "none"
  },
  sectionBox: {
    background: "#fff",
    borderRadius: isMobile ? 10 : 18,
    padding: isMobile ? "1.1rem 0.9rem 1.2rem 0.9rem" : "1.8rem 2rem 1.5rem 2rem", // Increased horizontal padding
    border: "1.7px solid #e2e8f0",
    minWidth: isMobile ? "100%" : 0, // Make sure it takes full width on mobile
    width: isMobile ? "100%" : "auto", // Make sure it takes full width on mobile
    flex: 1,
    boxShadow: "0 1px 7px rgba(30,30,63,0.07)",
    marginBottom: isMobile ? 16 : 0
  },
  sectionHeader: {
    fontSize: isMobile ? "1.13rem" : "1.22rem",
    fontWeight: 700,
    color: "#1e1e3f",
    display: "flex",
    alignItems: "center",
    gap: isMobile ? 10 : 13,
    borderBottom: "2px solid #e2e8f0",
    paddingBottom: isMobile ? 5 : 8,
    marginBottom: isMobile ? 11 : 19,
    letterSpacing: ".01em"
  },
  twoColumnRow: {
    display: "flex",
    width: "100%",
    gap: isMobile ? 18 : 48,
    alignItems: "flex-start",
    justifyContent: "center",
    flexDirection: isMobile ? "column" : "row"
  },
  flexCol: {
    flex: "1 1 375px",
    minWidth: isMobile ? "100%" : 275, // Make sure it takes full width on mobile
    display: "flex",
    flexDirection: "column",
    gap: isMobile ? 12 : 17
  },
  labelStyle: {
    fontWeight: 600,
    color: "#374151",
    fontSize: isMobile ? "1.06rem" : "1rem",
    marginBottom: isMobile ? 6 : 5, // Increased bottom margin for mobile
    display: "flex",
    alignItems: "center",
    gap: isMobile ? 7 : 8,
    width: "100%" // Ensure label takes full width
  },
  inputStyle: {
    width: "100%", // Already full width but emphasizing
    fontSize: isMobile ? "1.12rem" : "1.09rem",
    padding: isMobile ? "13px 14px" : "11px 14px",
    border: "1.5px solid #d1d5db",
    borderRadius: 8,
    background: "#f8fafc",
    color: "#22223b",
    outline: "none",
    transition: "border .13s",
    marginBottom: isMobile ? 2 : 1, // Slightly increased for mobile
    boxSizing: "border-box" // Ensure padding doesn't make it overflow
  },
  inputDisabled: {
    background: "#f1f5f9",
    color: "#9ca3af",
    cursor: "not-allowed"
  },
  saveBtnStyle: {
    background: "#10b981",
    color: "#fff",
    border: "none",
    borderRadius: isMobile ? 7 : 9,
    fontWeight: 700,
    fontSize: isMobile ? "1.16rem" : "1.17rem",
    padding: isMobile ? "15px 0" : "15px 0",
    marginTop: isMobile ? 28 : 36,
    width: isMobile ? "100%" : 340,
    maxWidth: "100%",
    cursor: "pointer",
    letterSpacing: ".01em",
    boxShadow: "0 2px 12px rgba(16,185,129,0.12)",
    transition: "background .18s",
    alignSelf: "center"
  },
  saveBtnHover: {
    background: "#059669"
  },
  saveBtnDisabled: {
    background: "#94d1be",
    cursor: "not-allowed"
  },
  msgStyle: {
    marginTop: isMobile ? 14 : 20,
    fontWeight: 600,
    textAlign: "center",
    fontSize: isMobile ? "1.08rem" : "1.08rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8
  },
  successMsg: {
    color: "#059669",
  },
  errorMsg: {
    color: "#dc2626",
  },
  loadingStyle: {
    textAlign: "center",
    marginTop: isMobile ? 30 : 60,
    color: "#64748b",
    fontSize: isMobile ? "1.15rem" : "1rem"
  },
  datePickerStyle: {
    width: "100%", // Ensure date picker takes full width
    fontSize: isMobile ? "1.12rem" : "1.09rem",
    padding: isMobile ? "12px 14px" : "10px 14px",
    border: "1.5px solid #d1d5db",
    borderRadius: 8,
    background: "#f8fafc",
    color: "#000000ff",
    outline: "none",
    boxSizing: "border-box" // Ensure padding doesn't make it overflow
  },
  helpText: {
    fontSize: "0.75rem",
    color: "#64748b",
    marginTop: 4,
    width: "100%"
  }
});

/**
 * EditBasicInfo component with full API integration
 */
const EditBasicInfo = ({ editData, setEditData }) => {
  const [photoPreview, setPhotoPreview] = useState(editData?.profile_url || "");
  const [msg, setMsg] = useState('');
  const [msgType, setMsgType] = useState(''); // 'success' or 'error'
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [photoHover, setPhotoHover] = useState(false);
  const [hoverSave, setHoverSave] = useState(false);
  const isMobile = useResponsive();
  const styles = getStyles(isMobile);

  // Input field references for date and file
  const dateInputRef = React.useRef(null);
  const fileInputRef = React.useRef(null);

  React.useEffect(() => {
    setPhotoPreview(editData?.profile_url || "");
  }, [editData?.profile_url]);

  // Calculate minimum date for 18 years old
  const calculateMinAge = () => {
    const today = new Date();
    const minDate = new Date();
    minDate.setFullYear(today.getFullYear() - 18);
    return minDate.toISOString().split('T')[0]; // Format as YYYY-MM-DD
  };

  if (!editData) return <div style={styles.loadingStyle}>Loading profile information...</div>;

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    let updated = { ...editData };

    if (type === "file") {
      // Handle file upload
      if (files && files[0]) {
        // Check file size (max 350KB)
        if (files[0].size > 350 * 1024) {
          setFieldErrors({
            ...fieldErrors,
            profile_photo: "File size must be less than 350KB"
          });
          return;
        }

        // Check file type
        if (!files[0].type.match('image.*')) {
          setFieldErrors({
            ...fieldErrors,
            profile_photo: "Only image files are allowed"
          });
          return;
        }

        // Clear error if validation passes
        const newErrors = { ...fieldErrors };
        delete newErrors.profile_photo;
        setFieldErrors(newErrors);

        // Update state with file
        updated[name] = files[0];
        setEditData(updated);

        // Create preview
        const reader = new FileReader();
        reader.onload = (ev) => setPhotoPreview(ev.target.result);
        reader.readAsDataURL(files[0]);
      }
    } else {
      // Handle text inputs

      // Validate contact number (10 digits)
      if (name === "contact_number_primary" || name === "contact_number_alternate") {
        const onlyNumbers = value.replace(/[^0-9]/g, '');

        if (onlyNumbers.length > 10) {
          // Don't update if more than 10 digits
          return;
        }

        // Update validation error for primary number
        if (name === "contact_number_primary" && onlyNumbers.length !== 10 && onlyNumbers.length > 0) {
          setFieldErrors({
            ...fieldErrors,
            contact_number_primary: "Contact number must be 10 digits"
          });
        } else if (name === "contact_number_primary") {
          const newErrors = { ...fieldErrors };
          delete newErrors.contact_number_primary;
          setFieldErrors(newErrors);
        }

        updated[name] = onlyNumbers;
      }
      // Validate email
      else if (name === "alternate_email" && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(value) && value.length > 0) {
          setFieldErrors({
            ...fieldErrors,
            alternate_email: "Please enter a valid email address"
          });
        } else if (value === editData.email) {
          setFieldErrors({
            ...fieldErrors,
            alternate_email: "Alternate email must be different from primary email"
          });
        } else {
          const newErrors = { ...fieldErrors };
          delete newErrors.alternate_email;
          setFieldErrors(newErrors);
        }

        updated[name] = value;
      }
      // Handle date of birth
      else if (name === "date_of_birth") {
        // Check if user is at least 18 years old
        const selectedDate = new Date(value);
        const today = new Date();
        const minAgeDate = new Date();
        minAgeDate.setFullYear(today.getFullYear() - 18);

        if (selectedDate > minAgeDate) {
          setFieldErrors({
            ...fieldErrors,
            date_of_birth: "You must be at least 18 years old"
          });
        } else {
          const newErrors = { ...fieldErrors };
          delete newErrors.date_of_birth;
          setFieldErrors(newErrors);
        }

        updated[name] = value;
      }
      // Handle Aadhaar number - ensure 12 digits only
      else if (name === "aadhaar_number") {
        // Remove non-numeric characters
        const onlyNumbers = value.replace(/[^0-9]/g, '');

        if (onlyNumbers.length > 12) {
          // Don't update if more than 12 digits
          return;
        }

        if (onlyNumbers.length !== 12 && onlyNumbers.length > 0) {
          setFieldErrors({
            ...fieldErrors,
            aadhaar_number: "Aadhaar number must be 12 digits"
          });
        } else {
          const newErrors = { ...fieldErrors };
          delete newErrors.aadhaar_number;
          setFieldErrors(newErrors);
        }

        updated[name] = onlyNumbers;
      }
      // Handle PAN number - enforce format
      else if (name === "pan_number") {
        // Convert to uppercase
        const uppercaseValue = value.toUpperCase();

        // PAN format validation: ABCDE1234F
        const panRegex = /^[A-Z0-9]*$/;

        if (!panRegex.test(uppercaseValue) || uppercaseValue.length > 10) {
          return;
        }

        if (uppercaseValue.length > 0 && uppercaseValue.length !== 10) {
          setFieldErrors({
            ...fieldErrors,
            pan_number: "PAN must be 10 characters"
          });
        } else if (uppercaseValue.length === 10) {
          // Full validation when complete
          const fullPanRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
          if (!fullPanRegex.test(uppercaseValue)) {
            setFieldErrors({
              ...fieldErrors,
              pan_number: "Invalid PAN format (ABCDE1234F)"
            });
          } else {
            const newErrors = { ...fieldErrors };
            delete newErrors.pan_number;
            setFieldErrors(newErrors);
          }
        } else {
          const newErrors = { ...fieldErrors };
          delete newErrors.pan_number;
          setFieldErrors(newErrors);
        }

        updated[name] = uppercaseValue;
      }
      // Handle other fields
      else {
        updated[name] = value;
      }

      setEditData(updated);
    }

    // Clear success/error message when form changes
    if (msg) {
      setMsg('');
      setMsgType('');
    }
  };

  const validateForm = () => {
    const errors = {};
    let isValid = true;

    // Check if date of birth is valid (18+ years)
    if (editData.date_of_birth) {
      const birthDate = new Date(editData.date_of_birth);
      const today = new Date();
      const minAgeDate = new Date();
      minAgeDate.setFullYear(today.getFullYear() - 18);

      if (birthDate > minAgeDate) {
        errors.date_of_birth = "You must be at least 18 years old";
        isValid = false;
      }
    }

    // Check if contact number is valid
    if (editData.contact_number_primary) {
      if (editData.contact_number_primary.length !== 10) {
        errors.contact_number_primary = "Contact number must be 10 digits";
        isValid = false;
      }
    } else {
      errors.contact_number_primary = "Contact number is required";
      isValid = false;
    }

    // Check alternate contact if provided
    if (editData.contact_number_alternate && editData.contact_number_alternate.length !== 10) {
      errors.contact_number_alternate = "Alternate contact must be 10 digits";
      isValid = false;
    }

    // Check if alternate email is valid
    if (editData.alternate_email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(editData.alternate_email)) {
        errors.alternate_email = "Please enter a valid email address";
        isValid = false;
      }

      // If it matches the primary email, flag it as an error
      if (editData.alternate_email === editData.email) {
        errors.alternate_email = "Alternate email must be different from your primary email";
        isValid = false;
      }
    }

    // // Make sure to check Aadhaar format if needed
    // if (editData.aadhaar_number && editData.aadhaar_number.length > 0) {
    //   // Remove spaces and check if it's a 12-digit number
    //   const cleanAadhaar = editData.aadhaar_number.replace(/\s/g, '');
    //   if (!/^\d{12}$/.test(cleanAadhaar)) {
    //     errors.aadhaar_number = "Aadhaar number must be 12 digits";
    //     isValid = false;
    //   }
    // }


    // Aadhaar validation (required)
    if (!editData.aadhaar_number || editData.aadhaar_number.trim() === "") {
      errors.aadhaar_number = "Add Aadhaar card details";
      isValid = false;
    } else {
      const cleanAadhaar = editData.aadhaar_number.replace(/\s/g, '');
      if (!/^\d{12}$/.test(cleanAadhaar)) {
        errors.aadhaar_number = "Aadhaar number must be 12 digits";
        isValid = false;
      }
    }







    // Check PAN format if provided
    if (editData.pan_number && editData.pan_number.length > 0) {
      // PAN format: ABCDE1234F (5 letters, 4 numbers, 1 letter)
      const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
      if (!panRegex.test(editData.pan_number)) {
        errors.pan_number = "Invalid PAN format (e.g., ABCDE1234F)";
        isValid = false;
      }
    }

    setFieldErrors(errors);
    return isValid;
  };

  // Separate function to handle profile photo update
  // const handleProfilePhotoUpdate = async () => {
  //   if (!editData.profile_photo || !(editData.profile_photo instanceof File)) {
  //     setFieldErrors({
  //       ...fieldErrors,
  //       profile_photo: "Please select a photo first"
  //     });
  //     return;
  //   }

  //   setUploadingPhoto(true);
  //   setMsg('');
  //   setMsgType('');

  //   try {
  //     // Prepare form data specifically for profile photo
  //     const formData = new FormData();
  //     formData.append('profile_photo', editData.profile_photo);

  //     // Call the API to update profile photo
  //     const response = await axios.post(
  //       'https://placement-portal-backend.ramshekade20.workers.dev/api/student/profile/update/profile-pic',
  //       formData,
  //       {
  //         headers: {
  //           'Content-Type': 'multipart/form-data'
  //         },
  //         withCredentials: true
  //       }
  //     );

  //     console.log("Photo Update Response:", response.data);

  //     if (response.data.success) {
  //       // Update the profile URL in the state
  //       setEditData({
  //         ...editData,
  //         profile_url: response.data.profile_url || photoPreview,
  //         profile_photo: null // Clear the file after successful upload
  //       });

  //       // Reset file input
  //       if (fileInputRef.current) {
  //         fileInputRef.current.value = "";
  //       }

  //       setMsg(response.data.message || "Profile photo updated successfully!");
  //       setMsgType('success');
  //     } else {
  //       setMsg(response.data.error || "Failed to update profile photo");
  //       setMsgType('error');
  //     }
  //   } catch (error) {
  //     console.error("Photo Upload Error:", error);

  //     // Extract error message
  //     let errorMessage = "Failed to update profile photo. Please try again.";

  //     if (error.response && error.response.data) {
  //       errorMessage = error.response.data.error || errorMessage;
  //     }

  //     setMsg(errorMessage);
  //     setMsgType('error');
  //   } finally {
  //     setUploadingPhoto(false);
  //   }
  // };


  const handleProfilePhotoUpdate = async () => {
    if (!editData.profile_photo || !(editData.profile_photo instanceof File)) {
      setFieldErrors({
        ...fieldErrors,
        profile_photo: "Please select a photo first"
      });
      return;
    }

    setUploadingPhoto(true);
    setMsg('');
    setMsgType('');

    try {
      const file = editData.profile_photo;
      const arrayBuffer = await file.arrayBuffer();

      // Send binary data using fetch (not axios)
      const response = await fetch(
        'https://placement-portal-backend.ramshekade20.workers.dev/api/student/profile/update/profile-pic',
        {
          method: 'POST',
          body: arrayBuffer,
          headers: {
            'X-File-Name': file.name,
            'X-File-Type': file.type,
            // You can add authentication headers here if needed
          },
          credentials: 'include'
        }
      );

      const data = await response.json();
      console.log("Photo Update Response:", data);

      if (data.success) {
        setEditData({
          ...editData,
          profile_url: data.profile_url || photoPreview,
          profile_photo: null // Clear the file after successful upload
        });

        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }

        setMsg(data.message || "Profile photo updated successfully!");
        setMsgType('success');
      } else {
        const errorMsg = data.error || data.details || "Failed to update profile photo";
        setMsg(errorMsg);
        setMsgType('error');
      }
    } catch (error) {
      console.error("Photo Upload Error:", error);

      let errorMessage = "Failed to update profile photo. Please try again.";

      if (error.response && error.response.data) {
        errorMessage = error.response.data.error || error.response.data.details || errorMessage;
      } else if (error.message) {
        errorMessage = error.message;
      }

      setMsg(errorMessage);
      setMsgType('error');
    } finally {
      setUploadingPhoto(false);
    }
  };


  const handleSave = async () => {
    // Validate form first
    if (!validateForm()) {
      setMsg('Please fix the validation errors');
      setMsgType('error');
      return;
    }

    setSaving(true);
    setMsg('');
    setMsgType('');

    try {
      // Prepare form data for API
      const formData = new FormData();

      // These are the fields API is expecting
      formData.append('date_of_birth', editData.date_of_birth || '');
      formData.append('contact_number_primary', editData.contact_number_primary || '');
      formData.append('contact_number_alternate', editData.contact_number_alternate || '');
      formData.append('aadhaar_number', editData.aadhaar_number || '');
      formData.append('pan_number', editData.pan_number || '');
      formData.append('alternate_email', editData.alternate_email || '');

      // Call the API to update personal info
      const response = await axios.post(
        'https://placement-portal-backend.ramshekade20.workers.dev/api/student/profile/update/personal',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          withCredentials: true
        }
      );

      console.log("Update response:", response.data);

      if (response.data.success) {
        setMsg(response.data.message || "Profile updated successfully!");
        setMsgType('success');
      } else {
        setMsg(response.data.error || "Failed to update profile");
        setMsgType('error');
      }
    } catch (error) {
      console.error("API Error:", error);

      // Extract error message from response or use a default
      let errorMessage = "Failed to update profile. Please try again.";
      let errorDetails = "";

      if (error.response && error.response.data) {
        errorMessage = error.response.data.error || error.response.data.details || errorMessage;
        errorDetails = error.response.data.details || "";
      } else if (error.message) {
        errorMessage = error.message;
      }

      // Check for specific database constraint errors
      if (errorDetails && errorDetails.includes("UNIQUE constraint failed")) {
        if (errorDetails.includes("alternate_email")) {
          errorMessage = "This alternate email is already registered with another account.";
          // Also set the field error to make it more obvious
          setFieldErrors({
            ...fieldErrors,
            alternate_email: "This email is already in use"
          });
        } else if (errorDetails.includes("contact_number_primary")) {
          errorMessage = "This contact number is already registered with another account.";
          setFieldErrors({
            ...fieldErrors,
            contact_number_primary: "This number is already in use"
          });
        } else if (errorDetails.includes("aadhaar_number")) {
          errorMessage = "This Aadhaar number is already registered with another account.";
          setFieldErrors({
            ...fieldErrors,
            aadhaar_number: "This Aadhaar number is already in use"
          });
        } else if (errorDetails.includes("pan_number")) {
          errorMessage = "This PAN number is already registered with another account.";
          setFieldErrors({
            ...fieldErrors,
            pan_number: "This PAN number is already in use"
          });
        }
      }

      setMsg(errorMessage);
      setMsgType('error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={styles.outerContainer}>
      {/* Profile Image at the Top */}
      <div style={styles.imageSection}>
        <img
          src={photoPreview || "/default-profile.png"}
          alt="Profile"
          style={styles.profileImg}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "/default-profile.png";
          }}
        />
        <div style={styles.photoUploadSection}>
          <input
            id="profile_photo"
            ref={fileInputRef}
            type="file"
            accept="image/*"
            name="profile_photo"
            onChange={handleChange}
            style={styles.fileInput}
          />
          <label
            htmlFor="profile_photo"
            style={{
              color: "#334155",
              fontWeight: 500,
              fontSize: isMobile ? "1rem" : "0.95rem",
              cursor: "pointer",
              display: "inline-block",
              textDecoration: "underline"
            }}
          >
            Select Profile Photo
          </label>
          {editData.profile_photo instanceof File && (
            <div style={{
              fontSize: "0.85rem",
              color: "#10b981",
              display: "flex",
              alignItems: "center",
              gap: 5,
              fontStyle: "italic"
            }}>
              <FaCheckCircle size={14} />
              {editData.profile_photo.name.length > 20
                ? editData.profile_photo.name.substring(0, 20) + '...'
                : editData.profile_photo.name}
            </div>
          )}
          <button
            type="button"
            onClick={handleProfilePhotoUpdate}
            disabled={uploadingPhoto || !(editData.profile_photo instanceof File)}
            style={{
              ...styles.photoButton,
              ...(photoHover && !(uploadingPhoto || !(editData.profile_photo instanceof File)) ? styles.photoButtonHover : {}),
              ...((uploadingPhoto || !(editData.profile_photo instanceof File)) ? styles.photoButtonDisabled : {})
            }}
            onMouseEnter={() => setPhotoHover(true)}
            onMouseLeave={() => setPhotoHover(false)}
          >
            {uploadingPhoto ? (
              <>
                <FaSpinner style={{ animation: "spin 1s linear infinite" }} />
                Uploading...
              </>
            ) : (
              <>
                <FaCamera />
                Update Profile Photo
              </>
            )}
          </button>
          {fieldErrors.profile_photo && (
            <div style={{
              color: "#dc2626",
              fontSize: isMobile ? "0.8rem" : "0.875rem",
              marginTop: 4,
              width: "100%",
              textAlign: "center",
              wordBreak: "break-word"
            }}>
              {fieldErrors.profile_photo}
            </div>
          )}
          <div style={styles.helpText}>
            Recommended: Square image, max 350KB
          </div>
        </div>
      </div>
      <div style={styles.twoColumnRow}>
        {/* Personal Info */}
        <div style={styles.sectionBox}>
          <div style={styles.sectionHeader}><FaIdCard /> Personal Information</div>
          <div style={{ display: "flex", flexDirection: "column", gap: isMobile ? 10 : 14 }}>
            <div>
              <label style={styles.labelStyle}><FaUser /> First Name</label>
              <input style={{ ...styles.inputStyle, ...styles.inputDisabled }} value={editData?.first_name || ""} disabled />
            </div>
            <div>
              <label style={styles.labelStyle}><FaUser /> Middle Name</label>
              <input style={{ ...styles.inputStyle, ...styles.inputDisabled }} value={editData?.middle_name || ""} disabled />
            </div>
            <div>
              <label style={styles.labelStyle}><FaUser /> Last Name</label>
              <input style={{ ...styles.inputStyle, ...styles.inputDisabled }} value={editData?.last_name || ""} disabled />
            </div>
            <div>
              <label style={styles.labelStyle}><FaIdBadge /> Student ID</label>
              <input style={{ ...styles.inputStyle, ...styles.inputDisabled }} value={editData?.student_id || ""} disabled />
            </div>
            <div>
              <label style={styles.labelStyle}><FaVenusMars /> Gender</label>
              <input style={{ ...styles.inputStyle, ...styles.inputDisabled }} value={editData?.gender || ""} disabled />
            </div>
            <div>
              <label style={styles.labelStyle}><FaBirthdayCake /> Date of Birth (18+ years) *</label>
              <input
                ref={dateInputRef}
                name="date_of_birth"
                type="date"
                value={editData?.date_of_birth || ""}
                onChange={handleChange}
                max={calculateMinAge()}
                style={{
                  ...styles.datePickerStyle,
                  border: fieldErrors.date_of_birth ? "1.5px solid #dc2626" : "1.5px solid #d1d5db",
                  background: fieldErrors.date_of_birth ? "#fff2f0" : "#f8fafc"
                }}
              />
              {fieldErrors.date_of_birth && (
                <div style={{
                  color: "#dc2626",
                  fontSize: isMobile ? "0.8rem" : "0.875rem",
                  marginTop: 4,
                  width: "100%",
                  wordBreak: "break-word"
                }}>
                  {fieldErrors.date_of_birth}
                </div>
              )}
              <div style={styles.helpText}>
                You must be at least 18 years old
              </div>
            </div>
          </div>
        </div>
        {/* Contact Info */}
        <div style={styles.sectionBox}>
          <div style={styles.sectionHeader}><FaPhoneAlt /> Contact Information</div>
          <div style={{ display: "flex", flexDirection: "column", gap: isMobile ? 10 : 14 }}>
            <div>
              <label style={styles.labelStyle}><FaPhoneAlt /> Primary Contact *</label>
              <input
                name="contact_number_primary"
                value={editData?.contact_number_primary || ""}
                onChange={handleChange}
                maxLength={10}
                style={{
                  ...styles.inputStyle,
                  border: fieldErrors.contact_number_primary ? "1.5px solid #dc2626" : "1.5px solid #d1d5db",
                  background: fieldErrors.contact_number_primary ? "#fff2f0" : "#f8fafc"
                }}
                placeholder="Primary Contact (10 digits)"
              />
              {fieldErrors.contact_number_primary && (
                <div style={{
                  color: "#dc2626",
                  fontSize: isMobile ? "0.8rem" : "0.875rem",
                  marginTop: 4,
                  width: "100%",
                  wordBreak: "break-word"
                }}>
                  {fieldErrors.contact_number_primary}
                </div>
              )}
            </div>
            <div>
              <label style={styles.labelStyle}><FaPhoneAlt /> Alternate Contact</label>
              <input
                name="contact_number_alternate"
                value={editData?.contact_number_alternate || ""}
                onChange={handleChange}
                maxLength={10}
                style={{
                  ...styles.inputStyle,
                  border: fieldErrors.contact_number_alternate ? "1.5px solid #dc2626" : "1.5px solid #d1d5db",
                  background: fieldErrors.contact_number_alternate ? "#fff2f0" : "#f8fafc"
                }}
                placeholder="Alternate Contact (10 digits)"
              />
              {fieldErrors.contact_number_alternate && (
                <div style={{
                  color: "#dc2626",
                  fontSize: isMobile ? "0.8rem" : "0.875rem",
                  marginTop: 4,
                  width: "100%",
                  wordBreak: "break-word"
                }}>
                  {fieldErrors.contact_number_alternate}
                </div>
              )}
            </div>
            <div>
              <label style={styles.labelStyle}><FaEnvelope /> Email Address</label>
              <input value={editData?.email || ""} style={{ ...styles.inputStyle, ...styles.inputDisabled }} disabled />
            </div>
            <div>
              <label style={styles.labelStyle}><FaEnvelope /> Alternate Email</label>
              <input
                name="alternate_email"
                value={editData?.alternate_email || ""}
                onChange={handleChange}
                style={{
                  ...styles.inputStyle,
                  border: fieldErrors.alternate_email ? "1.5px solid #dc2626" : "1.5px solid #d1d5db",
                  background: fieldErrors.alternate_email ? "#fff2f0" : "#f8fafc"
                }}
                placeholder="Alternate Email (Optional)"
              />
              {fieldErrors.alternate_email && (
                <div style={{
                  color: "#dc2626",
                  fontSize: isMobile ? "0.8rem" : "0.875rem",
                  marginTop: 4,
                  width: "100%",
                  wordBreak: "break-word"
                }}>
                  {fieldErrors.alternate_email}
                </div>
              )}
            </div>
            <div>
              <label style={styles.labelStyle}><FaIdCard /> Aadhaar Number *</label>
              <input
                name="aadhaar_number"
                value={editData?.aadhaar_number || ""}
                onChange={handleChange}
                maxLength={12}
                required // <-- Add this line
                style={{
                  ...styles.inputStyle,
                  border: fieldErrors.aadhaar_number ? "1.5px solid #dc2626" : "1.5px solid #d1d5db",
                  background: fieldErrors.aadhaar_number ? "#fff2f0" : "#f8fafc"
                }}
                placeholder="12 digit Aadhaar Number"
              />
              {fieldErrors.aadhaar_number && (
                <div style={{
                  color: "#dc2626",
                  fontSize: isMobile ? "0.8rem" : "0.875rem",
                  marginTop: 4,
                  width: "100%",
                  wordBreak: "break-word"
                }}>
                  {fieldErrors.aadhaar_number}
                </div>
              )}
            </div>
            <div>
              <label style={styles.labelStyle}><FaIdBadge /> PAN Number</label>
              <input
                name="pan_number"
                value={editData?.pan_number || ""}
                onChange={handleChange}
                maxLength={10}
                style={{
                  ...styles.inputStyle,
                  border: fieldErrors.pan_number ? "1.5px solid #dc2626" : "1.5px solid #d1d5db",
                  background: fieldErrors.pan_number ? "#fff2f0" : "#f8fafc"
                }}
                placeholder="PAN Number (Format: ABCDE1234F)"
              />
              {fieldErrors.pan_number && (
                <div style={{
                  color: "#dc2626",
                  fontSize: isMobile ? "0.8rem" : "0.875rem",
                  marginTop: 4,
                  width: "100%",
                  wordBreak: "break-word"
                }}>
                  {fieldErrors.pan_number}
                </div>
              )}
              <div style={styles.helpText}>
                Format: ABCDE1234F (5 letters, 4 numbers, 1 letter)
              </div>
            </div>
          </div>
        </div>
      </div>
      <button
        style={{
          ...styles.saveBtnStyle,
          ...(saving ? styles.saveBtnDisabled : {}),
          ...(hoverSave && !saving ? styles.saveBtnHover : {})
        }}
        onClick={handleSave}
        disabled={saving}
        onMouseEnter={() => setHoverSave(true)}
        onMouseLeave={() => setHoverSave(false)}
      >
        {saving ? (
          <>
            <FaSpinner style={{
              animation: "spin 1s linear infinite",
              marginRight: 8,
              display: "inline-block"
            }} />
            Saving...
          </>
        ) : (
          "Update Details"
        )}
      </button>
      {msg && (
        <div style={{
          ...styles.msgStyle,
          ...(msgType === 'success' ? styles.successMsg : styles.errorMsg)
        }}>
          {msgType === 'success' ? (
            <FaCheckCircle />
          ) : (
            <FaExclamationCircle />
          )}
          {msg}
        </div>
      )}

      {/* Add this CSS for the spinner animation */}
      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}} />
    </div>
  );
};

export default EditBasicInfo;