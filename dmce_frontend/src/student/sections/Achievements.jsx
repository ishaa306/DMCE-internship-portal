// // import React, { useState } from 'react';

// // const Achievements = ({data, setData}) => {
// //   const achievements = data.achievements || [{ title: '', description: '', media: '' }];

// //   const handleChange = (index, e) => {
// //     const { name, value } = e.target;
// //     const updated = [...achievements];
// //     updated[index] = { ...updated[index], [name]: value };
// //     setData((prev) => ({ ...prev, achievements: updated }));
// //   };

// //   const handleAdd = () => {
// //     if (achievements.length < 5) {
// //       setData((prev) => ({
// //         ...prev,
// //         achievements: [...achievements, { title: '', description: '', media: '' }],
// //       }));
// //     }
// //   };


// //   const handleSubmit = async () => {


// //   const formData = new FormData();

// //   // Append text fields from `data`
// //   formData.append('first_name', data.first_name);
// //   formData.append('middle_name', data.middle_name);
// //   formData.append('last_name', data.last_name);
// //   formData.append('gender', data.gender);
// //   formData.append('date_of_birth', data.date_of_birth);
// //   formData.append('contact_number_primary', data.contact_number_primary);
// //   formData.append('contact_number_alternate', data.contact_number_alternate);
// //   formData.append('email', data.email);
// //   formData.append('alternate_email', data.alternate_email);
// //   formData.append('aadhaar_number', data.aadhaar_number);
// //   formData.append('pan_number', data.pan_number);
// //   formData.append('student_id_number', data.student_id);
// //   formData.append('prn', data.prn);
// //   formData.append('current_year', data.current_year);
// //   formData.append('division', data.division);
// //   formData.append('department', data.department);
// //   formData.append('year_of_admission', data.year_of_admission);
// //   formData.append('expected_graduation_year', data.expected_graduation_year);

// //   // Academic Percentages
// //   formData.append('ssc_percentage', data.ssc_percentage);
// //   formData.append('ssc_year', data.ssc_year);
// //   formData.append('hsc_percentage', data.hsc_percentage);
// //   formData.append('hsc_year', data.hsc_year);
// //   formData.append('diploma_percentage', data.diploma_percentage);
// //   formData.append('diploma_year', data.diploma_year);

// //   // Semester CGPAs

// //     formData.append('cgpa', data['cgpa']);
// //     formData.append('last_semester',data.last_semester)


// //   // JSON fields
// //   formData.append('programming_languages', JSON.stringify(data.programming_languages || []));
// //   formData.append('skills', JSON.stringify(data.skills || []));
// //   formData.append('certifications', JSON.stringify(data.certifications || []));
// //   formData.append('projects', JSON.stringify(data.projects || []));
// //   formData.append('achievements', JSON.stringify(data.achievements || []));
// //   formData.append('internships', JSON.stringify(data.experiences || []));
// //     formData.append('social_links', JSON.stringify(data.social_links || []));


// //   // File fields (ensure they are File objects from input[type="file"])
// //   if (data.profile_photo instanceof File) {
// //     formData.append('profile_photo', data.profile_photo);
// //   }

// //   // similarly for resume, marksheets etc. if they are File objects
// //   if (data.resume instanceof File) {
// //     formData.append('resume', data.resume);
// //   }
// //   if (data.ssc_marksheet instanceof File) {
// //     formData.append('ssc_marksheet', data.ssc_marksheet);
// //   }
// //   if (data.hsc_marksheet instanceof File) {
// //     formData.append('hsc_marksheet', data.hsc_marksheet);
// //   }
// //   if (data.diploma_marksheet instanceof File) {
// //     formData.append('diploma_marksheet', data.diploma_marksheet);
// //   }
// // for (let pair of formData.entries()) {
// //   console.log(`${pair[0]}:`, pair[1]);
// // }



// //   try {
// //     const res = await fetch('https://placement-portal-backend.ramshekade20.workers.dev/api/student/profile/create', {
// //   method: 'POST',
// //   credentials: 'include', // ✅ sends HttpOnly cookie (JWT)
// //   body: formData,         // ✅ let browser set Content-Type for FormData
// // });


// //     const result = await res.json();

// //     if (res.ok) {
// //       alert('✅ Profile created successfully!');
// //       console.log(result);
// //       window.location.href = '/student-dashboard';
// //     } else {
// //       alert('❌ Failed: ' + result?.details || 'Something went wrong');
// //       console.error(result);
// //     }
// //   } catch (error) {
// //     console.error('❌ Error:', error);
// //     alert('❌ Error occurred during profile submission.');
// //   }
// // };
// //    return (
// //     <div
// //       style={{
// //         background: '#fff',
// //         padding: '30px',
// //         borderRadius: '12px',
// //         boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
// //         border: '1px solid #ccc',
// //         maxWidth: '700px',
// //         width: '100%',
// //         margin: '30px auto',
// //         maxHeight: 'calc(100vh - 100px)',
// //         overflowY: 'auto',
// //       }}
// //     >
// //       <div
// //         style={{
// //           backgroundColor: '#1e1e3f',
// //           color: 'white',
// //           padding: '12px 20px',
// //           borderRadius: '8px 8px 0 0',
// //           fontSize: '18px',
// //           marginBottom: '25px',
// //           textAlign: 'center',
// //         }}
// //       >
// //         Achievements & Extra Curricular Activities
// //       </div>

// //       {achievements.map((item, index) => (
// //         <div
// //           key={index}
// //           style={{
// //             marginBottom: '25px',
// //             paddingBottom: '20px',
// //             borderBottom: index !== achievements.length - 1 ? '1px solid #eee' : 'none',
// //           }}
// //         >
// //           <h4
// //             style={{
// //               color: '#1e3a8a',
// //               fontSize: '17px',
// //               marginBottom: '15px',
// //             }}
// //           >
// //             Achievement {index + 1}
// //           </h4>

// //           <div style={{ marginBottom: '12px' }}>
// //             <label style={{ fontWeight: 'bold', color: '#000' }}>Title *</label>
// //             <br />
// //             <input
// //               type="text"
// //               name="title"
// //               value={item.title}
// //               onChange={(e) => handleChange(index, e)}
// //               placeholder="e.g., Hackathon Winner"
// //               style={{
// //                 width: '100%',
// //                 padding: '10px',
// //                 borderRadius: '8px',
// //                 border: '1px solid #ccc',
// //                 marginTop: '6px',
// //                 backgroundColor: '#fff',
// //                 color: '#000',
// //               }}
// //               required
// //             />
// //           </div>

// //           <div style={{ marginBottom: '12px' }}>
// //             <label style={{ fontWeight: 'bold', color: '#000' }}>Description *</label>
// //             <br />
// //             <textarea
// //               name="description"
// //               value={item.description}
// //               onChange={(e) => handleChange(index, e)}
// //               rows={3}
// //               placeholder="Explain what you achieved..."
// //               style={{
// //                 width: '100%',
// //                 padding: '10px',
// //                 borderRadius: '8px',
// //                 border: '1px solid #ccc',
// //                 marginTop: '6px',
// //                 backgroundColor: '#fff',
// //                 color: '#000',
// //                 resize: 'vertical',
// //               }}
// //               required
// //             ></textarea>
// //           </div>

// //           <div>
// //             <label style={{ fontWeight: 'bold', color: '#000' }}>Media URL (optional)</label>
// //             <br />
// //             <input
// //               type="url"
// //               name="media"
// //               value={item.media}
// //               onChange={(e) => handleChange(index, e)}
// //               placeholder="e.g., https://youtu.be/example"
// //               style={{
// //                 width: '100%',
// //                 padding: '10px',
// //                 borderRadius: '8px',
// //                 border: '1px solid #ccc',
// //                 marginTop: '6px',
// //                 backgroundColor: '#fff',
// //                 color: '#000',
// //               }}
// //             />
// //           </div>
// //         </div>
// //       ))}

// //       <div style={{ textAlign: 'center', marginTop: '10px' }}>
// //         <button
// //           onClick={handleAdd}
// //           disabled={achievements.length >= 5}
// //           style={{
// //             backgroundColor: achievements.length < 5 ? '#1e3a8a' : '#aaa',
// //             color: 'white',
// //             padding: '10px 20px',
// //             borderRadius: '10px',
// //             border: 'none',
// //             fontWeight: 'bold',
// //             fontSize: '15px',
// //             marginRight: '12px',
// //             cursor: achievements.length < 5 ? 'pointer' : 'not-allowed',
// //           }}
// //           type="button"
// //         >
// //           Add Achievement
// //         </button>

// //         {/* Submit button should ideally be handled by parent, but keeping it here if you want */}
// //         <button
// //           onClick={handleSubmit}
// //           style={{
// //             backgroundColor: '#22c55e',
// //             color: 'white',
// //             padding: '10px 22px',
// //             borderRadius: '10px',
// //             border: 'none',
// //             fontWeight: 'bold',
// //             fontSize: '15px',
// //             cursor: 'pointer',
// //           }}
// //           type="button"
// //         >
// //           Submit Profile
// //         </button>
// //       </div>
// //     </div>
// //   );
// // };

// // export default Achievements;

// import React, { useState, useEffect } from 'react';
// import { FaPlus, FaTrash, FaSave, FaSpinner, FaExclamationTriangle, FaCheckCircle, FaLink, FaTrophy, FaInfoCircle } from 'react-icons/fa';

// const Achievements = ({ data, setData }) => {
//   // State for validation and UX
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [message, setMessage] = useState({ type: '', text: '' });
//   const [validationErrors, setValidationErrors] = useState({});
//   const [formTouched, setFormTouched] = useState(false);
//   const [showConfirmation, setShowConfirmation] = useState(false);
//   const [showErrorConfirmation, setShowErrorConfirmation] = useState(false);
//   const [errorDetails, setErrorDetails] = useState('');

//   const achievements = data.achievements || [{ title: '', description: '', media: '' }];

//   useEffect(() => {
//     // Clear message after 5 seconds if it's a success message
//     if (message.type === 'success') {
//       const timer = setTimeout(() => {
//         setMessage({ type: '', text: '' });
//       }, 5000);
//       return () => clearTimeout(timer);
//     }
//   }, [message]);

//   // Validate form data before submission
//   const validateForm = () => {
//     const errors = {};
//     let isValid = true;

//     // Check for required fields with more specific tracking
//     const requiredFieldsBySection = {
//       personal: [
//         { field: 'profile_photo', label: 'Profile Photo' },
//         { field: 'first_name', label: 'First Name' },
//         { field: 'last_name', label: 'Last Name' },
//         { field: 'gender', label: 'Gender' },
//         { field: 'date_of_birth', label: 'Date of Birth' },
//         { field: 'contact_number_primary', label: 'Primary Contact Number' },
//         { field: 'email', label: 'Email' },
//         { field: 'aadhaar_number', label: 'Aadhaar Number' },
//       ],
//       academic: [
//         { field: 'student_id', label: 'Student ID' },
//         { field: 'prn', label: 'PRN' },
//         { field: 'current_year', label: 'Current Year' },
//         { field: 'division', label: 'Division' },
//         { field: 'department', label: 'Department' },
//         { field: 'year_of_admission', label: 'Year of Admission' },
//         { field: 'expected_graduation_year', label: 'Expected Graduation Year' },
//       ],
//       education: [
//         { field: 'ssc_percentage', label: 'SSC Percentage' },
//         { field: 'ssc_year', label: 'SSC Year' },
//         { field: 'last_semester', label: 'Last Passed Semester' },
//       ],
//       additional: [
//         { field: 'resume', label: 'Resume' }
//       ]
//     };

//     const missingFields = [];

//     // Check each section for missing fields
//     Object.entries(requiredFieldsBySection).forEach(([section, fields]) => {
//       fields.forEach(({ field, label }) => {
//         if (!data[field]) {
//           missingFields.push({ section, field, label });
//           isValid = false;
//         }
//       });
//     });

//     if (missingFields.length > 0) {
//       errors.missingRequiredFields = true;
//       errors.missingFieldsList = missingFields;
//     }

//     // Validate achievements
//     achievements.forEach((achievement, index) => {
//       if (achievement.title.trim() === '') {
//         errors[`achievement_${index}_title`] = 'Title is required';
//         isValid = false;
//       }
//       if (achievement.description.trim() === '') {
//         errors[`achievement_${index}_description`] = 'Description is required';
//         isValid = false;
//       }
//       if (achievement.media && !isValidURL(achievement.media)) {
//         errors[`achievement_${index}_media`] = 'Please enter a valid URL';
//         isValid = false;
//       }
//     });

//     setValidationErrors(errors);
//     return isValid;
//   };

//   // URL validation helper
//   const isValidURL = (url) => {
//     if (!url) return true; // Optional field
//     try {
//       new URL(url);
//       return true;
//     } catch (e) {
//       return false;
//     }
//   };

//   const handleChange = (index, e) => {
//     const { name, value } = e.target;
//     const updated = [...achievements];
//     updated[index] = { ...updated[index], [name]: value };
//     setData((prev) => ({ ...prev, achievements: updated }));

//     // Clear specific error when field is changed
//     if (validationErrors[`achievement_${index}_${name}`]) {
//       const updatedErrors = { ...validationErrors };
//       delete updatedErrors[`achievement_${index}_${name}`];
//       setValidationErrors(updatedErrors);
//     }

//     setFormTouched(true);
//   };

//   const handleAdd = () => {
//     if (achievements.length < 5) {
//       setData((prev) => ({
//         ...prev,
//         achievements: [...achievements, { title: '', description: '', media: '' }],
//       }));
//     }
//   };

//   const handleRemove = (index) => {
//     if (achievements.length > 1) {
//       const updated = [...achievements];
//       updated.splice(index, 1);
//       setData((prev) => ({ ...prev, achievements: updated }));

//       // Clear related validation errors
//       const updatedErrors = { ...validationErrors };
//       Object.keys(updatedErrors).forEach(key => {
//         if (key.startsWith(`achievement_${index}_`)) {
//           delete updatedErrors[key];
//         }
//       });
//       setValidationErrors(updatedErrors);
//     }
//   };

//   const handleSubmit = async () => {
//     // First validate the form
//     if (!validateForm()) {
//       // Better error messaging based on validation results
//       if (validationErrors.missingRequiredFields) {
//         setMessage({
//           type: 'error',
//           text: 'Required fields are missing from previous sections.'
//         });
//       } else {
//         setMessage({
//           type: 'error',
//           text: 'Please fix the errors in this form before submitting.'
//         });
//       }
//       window.scrollTo(0, 0);
//       return;
//     }

//     setIsSubmitting(true);
//     setMessage({ type: '', text: '' });

//     const formData = new FormData();

//     // Append text fields from `data`
//     formData.append('first_name', data.first_name);
//     formData.append('middle_name', data.middle_name || '');
//     formData.append('last_name', data.last_name);
//     formData.append('gender', data.gender);
//     formData.append('date_of_birth', data.date_of_birth);
//     formData.append('contact_number_primary', data.contact_number_primary);
//     formData.append('contact_number_alternate', data.contact_number_alternate || '');
//     formData.append('email', data.email);
//     formData.append('alternate_email', data.alternate_email || '');
//     formData.append('aadhaar_number', data.aadhaar_number);
//     formData.append('pan_number', data.pan_number || '');
//     formData.append('student_id_number', data.student_id);
//     formData.append('prn', data.prn);
//     formData.append('current_year', data.current_year);
//     formData.append('division', data.division);
//     formData.append('department', data.department);
//     formData.append('year_of_admission', data.year_of_admission);
//     formData.append('expected_graduation_year', data.expected_graduation_year);
//     formData.append('last_semester', data.last_semester || '');

//     // Academic Percentages
//     formData.append('ssc_percentage', data.ssc_percentage);
//     formData.append('ssc_year', data.ssc_year);
//     formData.append('hsc_percentage', data.hsc_percentage || '');
//     formData.append('hsc_year', data.hsc_year || '');
//     formData.append('diploma_percentage', data.diploma_percentage || '');
//     formData.append('diploma_year', data.diploma_year || '');

//     // Semester CGPAs
//     formData.append('cgpa', data['cgpa'] || '');
//     formData.append('liveKt',data.liveKT );

//     // JSON fields
//     formData.append('programming_languages', JSON.stringify(data.programming_languages || []));
//     formData.append('skills', JSON.stringify(data.skills || []));
//     formData.append('certifications', JSON.stringify(data.certifications || []));
//     formData.append('projects', JSON.stringify(data.projects || []));
//     formData.append('achievements', JSON.stringify(data.achievements || []));
//     formData.append('internships', JSON.stringify(data.experiences || []));
//     formData.append('social_links', JSON.stringify(data.social_links || []));

//     // File fields (ensure they are File objects from input[type="file"])
//     if (data.profile_photo instanceof File) {
//       formData.append('profile_photo', data.profile_photo);
//     }

//     // similarly for resume, marksheets etc. if they are File objects
//     if (data.resume instanceof File) {
//       formData.append('resume', data.resume);
//     }
//     console.log(formData);

// try {
//   const res = await fetch('https://placement-portal-backend.ramshekade20.workers.dev/api/student/profile/create', {
//     method: 'POST',
//     credentials: 'include',
//     body: formData,
//   });

//   let result;
//   let errorMsg = 'Something went wrong';
//   let details;

//   const contentType = res.headers.get("content-type");
//   if (contentType && contentType.includes("application/json")) {
//     try {
//       result = await res.json();
//     } catch (e) {
//       result = null;
//       errorMsg = 'Response was not valid JSON.';
//     }
//   } else {
//     try {
//       result = await res.text();
//       // If it looks like HTML, show first 200 chars for debugging
//       if (typeof result === "string" && result.trim().startsWith("<!DOCTYPE")) {
//         errorMsg = "Server returned an HTML error page. Check server logs or proxy function.";
//         details = result.slice(0, 200) + (result.length > 200 ? "..." : "");
//       } else {
//         errorMsg = result || errorMsg;
//       }
//     } catch (e) {
//       result = null;
//       errorMsg = 'Response was not valid text.';
//     }
//   }

//   if (res.ok) {
//     setMessage({
//       type: 'success',
//       text: '✅ Profile created successfully!'
//     });

//     setShowConfirmation(true);
//     console.log(result);

//     setTimeout(() => {
//       window.location.href = '/student-dashboard';
//     }, 2000);
//   } else {
//     // Extract error details from JSON or fallback to raw text
//     if (typeof result === "object" && result?.details) {
//       if (result.details.includes("SQLITE_CONSTRAINT")) {
//         if (result.details.includes("student_id")) {
//           errorMsg = 'A profile with this Student ID already exists. Please contact the admin if you need to update your information.';
//         } else if (result.details.includes("UNIQUE")) {
//           errorMsg = 'This profile information already exists in our system. Please use different information or contact support.';
//         } else {
//           errorMsg = 'There was a constraint violation. Some information you provided may already be in use.';
//         }
//         details = result.details;
//       } else {
//         errorMsg = result.details;
//       }
//     }

//     setMessage({
//       type: 'error',
//       text: `❌ ${errorMsg}`
//     });

//     setErrorDetails(details || errorMsg);
//     setShowErrorConfirmation(true);

//     console.error('Submission failed:', result);
//     window.scrollTo(0, 0);
//   }
// } catch (error) {
//   // For truly network-level errors
//   const errorMsg = error?.message || 'Network error. Please check your internet connection and try again.';

//   setMessage({
//     type: 'error',
//     text: `Server Error ❌ ${errorMsg}`
//   });

//   setErrorDetails(errorMsg);
//   setShowErrorConfirmation(true);

//   window.scrollTo(0, 0);
// } finally {
//   setIsSubmitting(false);
// }
//   };

//   // Styles with improved accessibility and mobile responsiveness
//   const styles = {
//     container: {
//       background: '#fff',
//       padding: '25px',
//       borderRadius: '12px',
//       boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
//       border: '1px solid #ccc',
//       maxWidth: '700px',
//       width: '100%',
//       margin: '30px auto',
//       maxHeight: 'calc(100vh - 100px)',
//       overflowY: 'auto',
//       position: 'relative'
//     },
//     header: {
//       backgroundColor: '#1e1e3f',
//       color: 'white',
//       padding: '14px 20px',
//       borderRadius: '8px 8px 0 0',
//       fontSize: '18px',
//       marginBottom: '25px',
//       textAlign: 'center',
//       display: 'flex',
//       alignItems: 'center',
//       justifyContent: 'center',
//       gap: '8px'
//     },
//     achievementBlock: {
//       marginBottom: '25px',
//       paddingBottom: '20px',
//       borderBottom: '1px solid #eee',
//       position: 'relative'
//     },
//     achievementHeader: {
//       display: 'flex',
//       justifyContent: 'space-between',
//       alignItems: 'center',
//       marginBottom: '15px'
//     },
//     achievementTitle: {
//       color: '#1e3a8a',
//       fontSize: '17px',
//       margin: '0',
//       display: 'flex',
//       alignItems: 'center',
//       gap: '8px'
//     },
//     formGroup: {
//       marginBottom: '16px'
//     },
//     label: {
//       fontWeight: 'bold',
//       color: '#000',
//       display: 'block',
//       marginBottom: '6px'
//     },
//     input: {
//       width: '100%',
//       padding: '12px',
//       borderRadius: '8px',
//       border: '1px solid #ccc',
//       backgroundColor: '#fff',
//       color: '#000',
//       fontSize: '15px',
//       transition: 'border 0.2s ease'
//     },
//     inputError: {
//       border: '1px solid #e74c3c',
//       backgroundColor: '#fff5f5'
//     },
//     textarea: {
//       width: '100%',
//       padding: '12px',
//       borderRadius: '8px',
//       border: '1px solid #ccc',
//       backgroundColor: '#fff',
//       color: '#000',
//       resize: 'vertical',
//       minHeight: '100px',
//       fontSize: '15px'
//     },
//     errorText: {
//       color: '#e74c3c',
//       fontSize: '12px',
//       marginTop: '4px',
//       display: 'flex',
//       alignItems: 'center',
//       gap: '5px'
//     },
//     buttonContainer: {
//       display: 'flex',
//       justifyContent: 'center',
//       gap: '15px',
//       marginTop: '20px',
//       flexWrap: 'wrap'
//     },
//     button: {
//       display: 'flex',
//       alignItems: 'center',
//       gap: '8px',
//       padding: '12px 24px',
//       borderRadius: '10px',
//       border: 'none',
//       fontWeight: 'bold',
//       fontSize: '15px',
//       cursor: 'pointer',
//       transition: 'all 0.2s ease',
//       color: 'white'
//     },
//     addButton: {
//       backgroundColor: '#1e3a8a',
//     },
//     disabledButton: {
//       backgroundColor: '#a0aec0',
//       cursor: 'not-allowed',
//       opacity: 0.7
//     },
//     submitButton: {
//       backgroundColor: '#22c55e',
//     },
//     removeButton: {
//       backgroundColor: '#ef4444',
//       padding: '8px',
//       borderRadius: '50%',
//       width: '32px',
//       height: '32px',
//       display: 'flex',
//       alignItems: 'center',
//       justifyContent: 'center',
//       cursor: 'pointer',
//       position: 'absolute',
//       top: '5px',
//       right: '5px'
//     },
//     messageContainer: {
//       padding: '12px 16px',
//       borderRadius: '8px',
//       marginBottom: '20px',
//       display: 'flex',
//       alignItems: 'center',
//       gap: '10px',
//       animation: 'fadeIn 0.3s ease'
//     },
//     successMessage: {
//       backgroundColor: 'rgba(34, 197, 94, 0.1)',
//       border: '1px solid #22c55e',
//       color: '#166534'
//     },
//     errorMessage: {
//       backgroundColor: 'rgba(239, 68, 68, 0.1)',
//       border: '1px solid #ef4444',
//       color: '#b91c1c'
//     },
//     warningMessage: {
//       backgroundColor: 'rgba(245, 158, 11, 0.1)',
//       border: '1px solid #f59e0b',
//       color: '#92400e'
//     },
//     infoBox: {
//       backgroundColor: 'rgba(59, 130, 246, 0.1)',
//       border: '1px solid #3b82f6',
//       borderRadius: '8px',
//       padding: '12px',
//       marginBottom: '20px',
//       fontSize: '14px',
//       color: '#1e40af',
//       display: 'flex',
//       alignItems: 'flex-start',
//       gap: '10px'
//     },
//     overlay: {
//       position: 'fixed',
//       top: 0,
//       left: 0,
//       right: 0,
//       bottom: 0,
//       backgroundColor: 'rgba(0, 0, 0, 0.6)',
//       display: 'flex',
//       justifyContent: 'center',
//       alignItems: 'center',
//       zIndex: 1000
//     },
//     confirmationBox: {
//       backgroundColor: 'white',
//       padding: '25px',
//       borderRadius: '12px',
//       boxShadow: '0 5px 20px rgba(0, 0, 0, 0.2)',
//       maxWidth: '400px',
//       width: '90%',
//       textAlign: 'center'
//     },
//     errorConfirmationBox: {
//       backgroundColor: 'white',
//       padding: '25px',
//       borderRadius: '12px',
//       boxShadow: '0 5px 20px rgba(0, 0, 0, 0.2)',
//       maxWidth: '400px',
//       width: '90%',
//       textAlign: 'center'
//     },
//     checkIcon: {
//       color: '#22c55e',
//       fontSize: '60px',
//       margin: '15px 0'
//     },
//     errorIcon: {
//       color: '#ef4444',
//       fontSize: '60px',
//       margin: '15px 0'
//     },
//     closeButton: {
//       backgroundColor: '#1e1e3f',
//       color: 'white',
//       border: 'none',
//       padding: '10px 20px',
//       borderRadius: '8px',
//       marginTop: '15px',
//       cursor: 'pointer',
//       fontWeight: 'bold',
//       transition: 'background-color 0.2s ease'
//     },
//     helpText: {
//       fontSize: '13px',
//       color: '#64748b',
//       padding: '10px 15px',
//       backgroundColor: '#f8fafc',
//       borderRadius: '8px',
//       marginBottom: '20px'
//     },
//     footerText: {
//       fontSize: '12px', 
//       color: '#64748b',
//       textAlign: 'center',
//       marginTop: '25px',
//       padding: '10px 0',
//       borderTop: '1px solid #f1f5f9'
//     }
//   };

//   return (
//     <div style={styles.container}>
//       {message.text && (
//         <div
//           style={{
//             ...styles.messageContainer,
//             ...(message.type === 'success' ? styles.successMessage :
//               message.type === 'warning' ? styles.warningMessage : styles.errorMessage)
//           }}
//         >
//           {message.type === 'success' ? (
//             <FaCheckCircle size={18} />
//           ) : message.type === 'warning' ? (
//             <FaExclamationTriangle size={18} />
//           ) : (
//             <FaExclamationTriangle size={18} />
//           )}
//           <span>{message.text}</span>
//         </div>
//       )}

//       {validationErrors.missingRequiredFields && (
//         <div style={styles.infoBox}>
//           <FaInfoCircle size={20} style={{ marginTop: '3px' }} />
//           <div>
//             <p style={{ margin: '0 0 8px 0', fontWeight: 'bold' }}>
//               Some required fields are missing from previous sections:
//             </p>
//             <ul style={{ margin: 0, paddingLeft: '20px' }}>
//               {validationErrors.missingFieldsList &&
//                 Object.entries(
//                   validationErrors.missingFieldsList.reduce((acc, item) => {
//                     if (!acc[item.section]) acc[item.section] = [];
//                     acc[item.section].push(item.label);
//                     return acc;
//                   }, {})
//                 ).map(([section, fields], idx) => (
//                   <li key={idx}>
//                     <strong style={{ textTransform: 'capitalize' }}>{section} Section:</strong>{' '}
//                     {fields.join(', ')}
//                   </li>
//                 ))
//               }
//             </ul>
//             <p style={{ margin: '8px 0 0 0' }}>
//               Please navigate back to complete these required fields before submission.
//             </p>
//           </div>
//         </div>
//       )}

//       <div style={styles.header}>
//         <FaTrophy size={20} />
//         <span>Achievements & Extra Curricular Activities</span>
//       </div>

//       <div style={styles.helpText}>
//         Share your notable achievements like competitions won, leadership roles, sports accomplishments,
//         or any recognition that showcases your talents outside academics.
//       </div>

//       {achievements.map((item, index) => (
//         <div key={index} style={styles.achievementBlock}>
//           <div style={styles.achievementHeader}>
//             <h4 style={styles.achievementTitle}>
//               <FaTrophy size={16} />
//               Achievement {index + 1}
//             </h4>

//             {achievements.length > 1 && (
//               <button
//                 type="button"
//                 onClick={() => handleRemove(index)}
//                 style={styles.removeButton}
//                 aria-label={`Remove achievement ${index + 1}`}
//                 title="Remove this achievement"
//               >
//                 <FaTrash size={14} color="#fff" />
//               </button>
//             )}
//           </div>

//           <div style={styles.formGroup}>
//             <label style={styles.label}>
//               Title *
//             </label>
//             <input
//               type="text"
//               name="title"
//               value={item.title}
//               onChange={(e) => handleChange(index, e)}
//               placeholder="e.g., Hackathon Winner, Sports Championship"
//               style={{
//                 ...styles.input,
//                 ...(validationErrors[`achievement_${index}_title`] ? styles.inputError : {})
//               }}
//               required
//               aria-invalid={validationErrors[`achievement_${index}_title`] ? "true" : "false"}
//             />
//             {validationErrors[`achievement_${index}_title`] && (
//               <div style={styles.errorText}>
//                 <FaExclamationTriangle size={12} />
//                 {validationErrors[`achievement_${index}_title`]}
//               </div>
//             )}
//           </div>

//           <div style={styles.formGroup}>
//             <label style={styles.label}>
//               Description *
//             </label>
//             <textarea
//               name="description"
//               value={item.description}
//               onChange={(e) => handleChange(index, e)}
//               rows={4}
//               placeholder="Describe your achievement, when it happened, and its significance..."
//               style={{
//                 ...styles.textarea,
//                 ...(validationErrors[`achievement_${index}_description`] ? styles.inputError : {})
//               }}
//               required
//               aria-invalid={validationErrors[`achievement_${index}_description`] ? "true" : "false"}
//             ></textarea>
//             {validationErrors[`achievement_${index}_description`] && (
//               <div style={styles.errorText}>
//                 <FaExclamationTriangle size={12} />
//                 {validationErrors[`achievement_${index}_description`]}
//               </div>
//             )}
//           </div>

//           <div style={styles.formGroup}>
//             <label style={styles.label}>
//               <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
//                 <FaLink size={14} /> Media URL (optional)
//               </div>
//             </label>
//             <input
//               type="url"
//               name="media"
//               value={item.media}
//               onChange={(e) => handleChange(index, e)}
//               placeholder="e.g., https://youtu.be/example, https://drive.google.com/file/..."
//               style={{
//                 ...styles.input,
//                 ...(validationErrors[`achievement_${index}_media`] ? styles.inputError : {})
//               }}
//               aria-invalid={validationErrors[`achievement_${index}_media`] ? "true" : "false"}
//             />
//             {validationErrors[`achievement_${index}_media`] && (
//               <div style={styles.errorText}>
//                 <FaExclamationTriangle size={12} />
//                 {validationErrors[`achievement_${index}_media`]}
//               </div>
//             )}
//             <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
//               Add links to certificates, videos, photos, or other relevant media
//             </div>
//           </div>
//         </div>
//       ))}

//       <div style={styles.buttonContainer}>
//         <button
//           onClick={handleAdd}
//           disabled={achievements.length >= 5}
//           style={{
//             ...styles.button,
//             ...styles.addButton,
//             ...(achievements.length >= 5 ? styles.disabledButton : {}),
//             flex: '1',
//             maxWidth: '220px',
//           }}
//           type="button"
//           aria-disabled={achievements.length >= 5}
//         >
//           <FaPlus size={14} /> Add Achievement
//         </button>

//         <button
//           onClick={handleSubmit}
//           disabled={isSubmitting}
//           style={{
//             ...styles.button,
//             ...styles.submitButton,
//             ...(isSubmitting ? styles.disabledButton : {}),
//             flex: '1',
//             maxWidth: '220px',
//           }}
//           type="button"
//           aria-disabled={isSubmitting}
//         >
//           {isSubmitting ? (
//             <>
//               <FaSpinner size={14} className="spinner" /> Submitting...
//             </>
//           ) : (
//             <>
//               <FaSave size={14} /> Complete Profile
//             </>
//           )}
//         </button>
//       </div>

//       {formTouched && achievements.length === 5 && (
//         <div style={{ fontSize: '14px', color: '#64748b', textAlign: 'center', marginTop: '10px' }}>
//           Maximum 5 achievements allowed
//         </div>
//       )}


//       {/* Success confirmation modal */}
//       {showConfirmation && (
//         <div style={styles.overlay}>
//           <div style={styles.confirmationBox}>
//             <FaCheckCircle style={{ color: '#22c55e', fontSize: '60px', margin: '15px 0' }} />
//             <h3>Profile Created Successfully!</h3>
//             <p>You'll be redirected to your dashboard in a moment...</p>
//           </div>
//         </div>
//       )}

//       {/* Error confirmation modal */}
//       {showErrorConfirmation && (
//         <div style={styles.overlay}>
//           <div style={styles.errorConfirmationBox}>
//             <FaExclamationTriangle style={{ color: '#ef4444', fontSize: '60px', margin: '15px 0' }} />
//             <h3>Submission Failed</h3>
//             <p>{errorDetails}</p>
//             <button
//               onClick={() => setShowErrorConfirmation(false)}
//               style={styles.closeButton}
//               onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#3b82f6'}
//               onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#1e1e3f'}
//             >
//               Close
//             </button>
//           </div>
//         </div>
//       )}

//       <style dangerouslySetInnerHTML={{
//         __html: `
//           @keyframes fadeIn {
//             from { opacity: 0; }
//             to { opacity: 1; }
//           }

//           .spinner {
//             animation: spin 1s linear infinite;
//           }

//           @keyframes spin {
//             0% { transform: rotate(0deg); }
//             100% { transform: rotate(360deg); }
//           }

//           @media (max-width: 600px) {
//             button {
//               width: 100%;
//               justify-content: center;
//             }
//           }
//         `
//       }} />
//     </div>
//   );
// };

// export default Achievements;

import React, { useState, useEffect } from 'react';
import { FaPlus, FaTrash, FaSave, FaSpinner, FaExclamationTriangle, FaCheckCircle, FaLink, FaTrophy, FaInfoCircle } from 'react-icons/fa';

const Achievements = ({ data, setData, markSectionVisited }) => {
  // State for validation and UX
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [validationErrors, setValidationErrors] = useState({});
  const [formTouched, setFormTouched] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showErrorConfirmation, setShowErrorConfirmation] = useState(false);
  const [errorDetails, setErrorDetails] = useState('');

  // Initialize achievements array or use existing one
  const achievements = data.achievements || [{ title: '', description: '', media: '' }];

  useEffect(() => {
    // Clear message after 5 seconds if it's a success message
    if (message.type === 'success') {
      const timer = setTimeout(() => {
        setMessage({ type: '', text: '' });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  // Validate form data before submission
  const validateForm = () => {
    const errors = {};
    let isValid = true;

    // Check for required fields with more specific tracking
    const requiredFieldsBySection = {
      personal: [
        { field: 'profile_url', label: 'Profile Photo' },
        { field: 'first_name', label: 'First Name' },
        { field: 'last_name', label: 'Last Name' },
        { field: 'gender', label: 'Gender' },
        { field: 'date_of_birth', label: 'Date of Birth' },
        { field: 'contact_number_primary', label: 'Primary Contact Number' },
        { field: 'email', label: 'Email' },
        { field: 'aadhaar_number', label: 'Aadhaar Number' },
      ],
      academic: [
        { field: 'student_id', label: 'Student ID' },
        { field: 'prn', label: 'PRN' },
        { field: 'current_year', label: 'Current Year' },
        { field: 'division', label: 'Division' },
        { field: 'department', label: 'Department' },
        { field: 'year_of_admission', label: 'Year of Admission' },
        { field: 'expected_graduation_year', label: 'Expected Graduation Year' },
      ],
      education: [
        { field: 'ssc_percentage', label: 'SSC Percentage' },
        { field: 'ssc_year', label: 'SSC Year' },
        { field: 'last_semester', label: 'Last Passed Semester' },
      ],
      additional: [
        { field: 'resume_url', label: 'Resume' }
      ]
    };

    const missingFields = [];

    // Check each section for missing fields
    Object.entries(requiredFieldsBySection).forEach(([section, fields]) => {
      fields.forEach(({ field, label }) => {
        if (!data[field]) {
          missingFields.push({ section, field, label });
          isValid = false;
        }
      });
    });

    if (missingFields.length > 0) {
      errors.missingRequiredFields = true;
      errors.missingFieldsList = missingFields;
    }

    // Validate achievements
    achievements.forEach((achievement, index) => {
      if (achievement.title && achievement.title.trim() === '') {
        errors[`achievement_${index}_title`] = 'Title is required';
        isValid = false;
      }
      if (achievement.description && achievement.description.trim() === '') {
        errors[`achievement_${index}_description`] = 'Description is required';
        isValid = false;
      }
      if (achievement.media && !isValidURL(achievement.media)) {
        errors[`achievement_${index}_media`] = 'Please enter a valid URL';
        isValid = false;
      }
    });

    setValidationErrors(errors);
    return isValid;
  };

  // URL validation helper with improved error handling
  const isValidURL = (url) => {
    if (!url) return true; // Optional field
    try {
      // Check for common URL format issues before attempting to create URL object
      const trimmedUrl = url.trim();
      if (!trimmedUrl.includes('.')) return false;

      // For user convenience, add protocol if missing
      const urlWithProtocol = /^(http|https):\/\//i.test(trimmedUrl)
        ? trimmedUrl
        : `https://${trimmedUrl}`;

      new URL(urlWithProtocol);
      return true;
    } catch (e) {
      return false;
    }
  };

  const handleChange = (index, e) => {
    const { name, value } = e.target;

    // Ensure array exists and has enough elements
    const updated = [...(achievements || [])];
    while (updated.length <= index) {
      updated.push({ title: '', description: '', media: '' });
    }

    // Update the specific field
    updated[index] = { ...updated[index], [name]: value };

    setData((prev) => ({ ...prev, achievements: updated }));

    // Clear specific error when field is changed
    if (validationErrors[`achievement_${index}_${name}`]) {
      const updatedErrors = { ...validationErrors };
      delete updatedErrors[`achievement_${index}_${name}`];
      setValidationErrors(updatedErrors);
    }

    setFormTouched(true);
  };

  const handleAdd = () => {
    if (achievements.length < 5) {
      setData((prev) => ({
        ...prev,
        achievements: [...(achievements || []), { title: '', description: '', media: '' }],
      }));
    }
  };

  const handleRemove = (index) => {
    try {
      // Safety check
      if (!achievements || !Array.isArray(achievements)) {
        console.error("Achievements array is invalid:", achievements);
        return;
      }

      // Make a deep copy to avoid reference issues
      const updated = JSON.parse(JSON.stringify(achievements));

      // Remove the achievement at the specified index
      updated.splice(index, 1);

      // Update the state with the new array - DON'T add empty one if all removed
      setData((prev) => {
        return { ...prev, achievements: updated };
      });

      // Clear related validation errors
      const updatedErrors = { ...validationErrors };
      Object.keys(updatedErrors).forEach(key => {
        if (key.startsWith(`achievement_${index}_`)) {
          delete updatedErrors[key];
        }
      });
      setValidationErrors(updatedErrors);

      // Show brief success notification
      setMessage({
        type: 'success',
        text: 'Achievement removed'
      });

      // Clear success message after 1 second
      setTimeout(() => {
        setMessage({ type: '', text: '' });
      }, 1000);

    } catch (error) {
      console.error("Error removing achievement:", error);
      setMessage({
        type: 'error',
        text: 'Failed to remove achievement. Please try again.'
      });
    }
  };


  // Function to check if all required fields are filled
  const areRequiredFieldsFilled = () => {
    // Check for required fields with more specific tracking
    const requiredFieldsBySection = {
      personal: [
        'first_name', 'last_name', 'gender', 'date_of_birth',
        'contact_number_primary', 'email', 'aadhaar_number'
      ],
      academic: [
        'student_id', 'prn', 'current_year', 'division',
        'department', 'year_of_admission', 'expected_graduation_year'
      ],
      education: [
        'ssc_percentage', 'ssc_year', 'last_semester', 'cgpa'
      ],
      additional: [
        'resume_url'
      ]
    };

    // Check if any section has missing fields
    for (const section in requiredFieldsBySection) {
      for (const field of requiredFieldsBySection[section]) {
        // For arrays, check if they exist and have at least one item
        if (Array.isArray(data[field])) {
          if (!data[field] || data[field].length === 0) {
            return false;
          }
        }
        // For other fields, check if they exist and aren't empty
        else if (!data[field]) {
          return false;
        }
      }
    }

    return true;
  };

  const uploadFileBinary = async (file, type) => {
    const arrayBuffer = await file.arrayBuffer();
    const response = await fetch(`https://placement-portal-backend.ramshekade20.workers.dev/api/student/profile/upload/${type}`, {
      method: 'POST',
      credentials: 'include',
      body: arrayBuffer,
      headers: {
        'Content-Type': 'application/octet-stream',
        'X-File-Name': file.name,
        'X-File-Type': file.type
      }
    });
    if (!response.ok) {
      let error = 'Unknown error';
      try {
        const errorResult = await response.json();
        error = errorResult.error || errorResult.details || error;
      } catch { }
      throw new Error(error);
    }
    const result = await response.json();
    return result.url;
  };

  const handleSubmit = async () => {
    try {
      // First validate the form
      if (!validateForm()) {
        // Better error messaging based on validation results
        if (validationErrors.missingRequiredFields) {
          setMessage({
            type: 'error',
            text: 'Required fields are missing from previous sections.'
          });
        } else {
          setMessage({
            type: 'error',
            text: 'Please fix the errors in this form before submitting.'
          });
        }
        window.scrollTo(0, 0);
        return;
      }

      // Mark section as visited
      if (markSectionVisited) {
        markSectionVisited('achievements');
      }

      setIsSubmitting(true);
      setMessage({ type: '', text: '' });
      //   let profilePhotoUrl = '';
      //       let resumeUrl = '';
      //       if (data.profile_photo instanceof File) {
      //         profilePhotoUrl = await uploadFileBinary(data.profile_photo, 'profile');
      //       }
      //       if (data.resume instanceof File) {
      //         resumeUrl = await uploadFileBinary(data.resume, 'resume');
      // }

      const formData = new FormData();

      // Append text fields from `data`
      formData.append('first_name', data.first_name);
      formData.append('middle_name', data.middle_name || '');
      formData.append('last_name', data.last_name);
      formData.append('gender', data.gender);
      formData.append('date_of_birth', data.date_of_birth);
      formData.append('contact_number_primary', data.contact_number_primary);
      formData.append('contact_number_alternate', data.contact_number_alternate || '');
      formData.append('email', data.email);
      formData.append('alternate_email', data.alternate_email || '');
      formData.append('aadhaar_number', data.aadhaar_number);
      formData.append('pan_number', data.pan_number || '');
      formData.append('student_id_number', data.student_id);
      formData.append('prn', data.prn);
      formData.append('current_year', data.current_year);
      formData.append('division', data.division);
      formData.append('department', data.department);
      formData.append('year_of_admission', data.year_of_admission);
      formData.append('expected_graduation_year', data.expected_graduation_year);
      formData.append('last_semester', data.last_semester || '');

      // Academic Percentages
      formData.append('ssc_percentage', data.ssc_percentage);
      formData.append('ssc_year', data.ssc_year);
      formData.append('hsc_percentage', data.hsc_percentage || '');
      formData.append('hsc_year', data.hsc_year || '');
      formData.append('diploma_percentage', data.diploma_percentage || '');
      formData.append('diploma_year', data.diploma_year || '');

      formData.append('profile_url', data.profile_url); // Insert the URL, not the file
      formData.append('resume_url', data.resume_url);

      // Semester CGPAs
      formData.append('cgpa', data['cgpa'] || '');
      formData.append('liveKt', data.liveKT);

      // JSON fields - with better error handling
      try {
        formData.append('programming_languages', JSON.stringify(data.programming_languages || []));
        formData.append('skills', JSON.stringify(data.skills || []));
        formData.append('certifications', JSON.stringify(data.certifications || []));
        formData.append('projects', JSON.stringify(data.projects || []));
        formData.append('achievements', JSON.stringify(data.achievements || []));
        formData.append('internships', JSON.stringify(data.experiences || []));
        formData.append('social_links', JSON.stringify(data.social_links || []));
      } catch (jsonError) {
        console.error("Error stringifying JSON data:", jsonError);
        setErrorDetails("There was an error processing your form data. Please try again.");
        setShowErrorConfirmation(true);
        setIsSubmitting(false);
        return;
      }

      // // File fields (ensure they are File objects from input[type="file"])
      // if (data.profile_photo instanceof File) {
      //   formData.append('profile_photo', data.profile_photo);
      // }

      // // similarly for resume, marksheets etc. if they are File objects
      // if (data.resume instanceof File) {
      //   formData.append('resume', data.resume);
      // }
      // if (data.ssc_marksheet instanceof File) {
      //   formData.append('ssc_marksheet', data.ssc_marksheet);
      // }
      // if (data.hsc_marksheet instanceof File) {
      //   formData.append('hsc_marksheet', data.hsc_marksheet);
      // }
      // if (data.diploma_marksheet instanceof File) {
      //   formData.append('diploma_marksheet', data.diploma_marksheet);
      // }

      try {
        const res = await fetch('https://placement-portal-backend.ramshekade20.workers.dev/api/student/profile/create', {
          method: 'POST',
          credentials: 'include',
          body: formData,
        });

        // Check for network errors
        if (!res) {
          throw new Error("Network response was not received");
        }

        let result;
        try {
          result = await res.json();
        } catch (jsonError) {
          console.error("Error parsing JSON response:", jsonError);
          throw new Error("Could not read server response");
        }

        if (res.ok) {
          setMessage({
            type: 'success',
            text: '✅ Profile created successfully!'
          });

          setShowConfirmation(true);
          console.log(result);

          // Delayed redirect to dashboard
          setTimeout(() => {
            window.location.href = '/student-dashboard';
          }, 2000);
        } else {
          // Extract error details with improved error handling
          let errorMsg = 'Something went wrong with your submission';

          if (result) {
            if (result.details) {
              errorMsg = result.details;
            } else if (result.error) {
              errorMsg = result.error;
            } else if (result.message) {
              errorMsg = result.message;
            }

            // Handle specific error cases
            if (typeof errorMsg === 'string') {
              if (errorMsg.includes('UNIQUE') || errorMsg.includes('already exists')) {
                errorMsg = 'Profile with this information already exists';
              } else if (errorMsg.includes('validation')) {
                errorMsg = 'Please check all required fields and try again';
              } else if (errorMsg.includes('file size')) {
                errorMsg = 'One or more files exceeded the maximum allowed size';
              } else if (errorMsg.includes('format') || errorMsg.includes('type')) {
                errorMsg = 'One or more files have an invalid format';
              } else if (errorMsg.includes('authentication') || errorMsg.includes('type')) {
                errorMsg = 'please check if you have logged in';
              }
            }
          }
          //vyfgohh
          // Set error message and details
          setMessage({
            type: 'error',
            text: `❌ ${errorMsg}`
          });

          setErrorDetails(errorMsg);
          setShowErrorConfirmation(true);

          // Log error for debugging
          console.error("API Error:", result);

          // Scroll to top to show the error message
          window.scrollTo(0, 0);
        }
      } catch (error) {
        // Handle network errors with better user messaging
        const errorMsg = error.message || 'Network error. Please check your internet connection and try again.';

        console.error("Submission error:", error);

        setMessage({
          type: 'error',
          text: `❌ ${errorMsg}`
        });

        setErrorDetails(`${errorMsg}. Please try again in a few moments.`);
        setShowErrorConfirmation(true);

        window.scrollTo(0, 0);
      } finally {
        setIsSubmitting(false);
      }
    } catch (globalError) {
      // Catch any other unexpected errors
      console.error("Unexpected error during submission:", globalError);
      setMessage({
        type: 'error',
        text: `❌ ${globalError}`
      });
      setErrorDetails("Something went wrong while submitting your form. Please try again.");
      setShowErrorConfirmation(true);
      setIsSubmitting(false);
      window.scrollTo(0, 0);
    }
  };

  // Styles with improved accessibility and mobile responsiveness
  const styles = {
    container: {
      background: '#fff',
      padding: '25px',
      borderRadius: '12px',
      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
      border: '1px solid #ccc',
      maxWidth: '700px',
      width: '100%',
      margin: '30px auto',
      maxHeight: 'calc(100vh - 100px)',
      overflowY: 'auto',
      position: 'relative'
    },
    header: {
      backgroundColor: '#1e1e3f',
      color: 'white',
      padding: '14px 20px',
      borderRadius: '8px 8px 0 0',
      fontSize: '18px',
      marginBottom: '25px',
      textAlign: 'center',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px'
    },
    achievementBlock: {
      marginBottom: '25px',
      paddingBottom: '20px',
      borderBottom: '1px solid #eee',
      position: 'relative'
    },
    achievementHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '15px'
    },
    achievementTitle: {
      color: '#1e3a8a',
      fontSize: '17px',
      margin: '0',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    formGroup: {
      marginBottom: '16px'
    },
    label: {
      fontWeight: 'bold',
      color: '#000',
      display: 'block',
      marginBottom: '6px'
    },
    input: {
      width: '100%',
      padding: '12px',
      borderRadius: '8px',
      border: '1px solid #ccc',
      backgroundColor: '#fff',
      color: '#000',
      fontSize: '15px',
      transition: 'border 0.2s ease'
    },
    inputError: {
      border: '1px solid #e74c3c',
      backgroundColor: '#fff5f5'
    },
    textarea: {
      width: '100%',
      padding: '12px',
      borderRadius: '8px',
      border: '1px solid #ccc',
      backgroundColor: '#fff',
      color: '#000',
      resize: 'vertical',
      minHeight: '100px',
      fontSize: '15px'
    },
    errorText: {
      color: '#e74c3c',
      fontSize: '12px',
      marginTop: '4px',
      display: 'flex',
      alignItems: 'center',
      gap: '5px'
    },
    buttonContainer: {
      display: 'flex',
      justifyContent: 'center',
      gap: '15px',
      marginTop: '20px',
      flexWrap: 'wrap'
    },
    button: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '12px 24px',
      borderRadius: '10px',
      border: 'none',
      fontWeight: 'bold',
      fontSize: '15px',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      color: 'white'
    },
    addButton: {
      backgroundColor: '#1e3a8a',
    },
    disabledButton: {
      backgroundColor: '#a0aec0',
      cursor: 'not-allowed',
      opacity: 0.7
    },
    submitButton: {
      backgroundColor: '#22c55e',
    },
    removeButton: {
      backgroundColor: '#ef4444',
      padding: '8px',
      borderRadius: '50%',
      width: '32px',
      height: '32px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      position: 'absolute',
      top: '5px',
      right: '5px'
    },
    messageContainer: {
      padding: '12px 16px',
      borderRadius: '8px',
      marginBottom: '20px',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      animation: 'fadeIn 0.3s ease'
    },
    successMessage: {
      backgroundColor: 'rgba(34, 197, 94, 0.1)',
      border: '1px solid #22c55e',
      color: '#166534'
    },
    errorMessage: {
      backgroundColor: 'rgba(239, 68, 68, 0.1)',
      border: '1px solid #ef4444',
      color: '#b91c1c'
    },
    warningMessage: {
      backgroundColor: 'rgba(245, 158, 11, 0.1)',
      border: '1px solid #f59e0b',
      color: '#92400e'
    },
    infoBox: {
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      border: '1px solid #3b82f6',
      borderRadius: '8px',
      padding: '12px',
      marginBottom: '20px',
      fontSize: '14px',
      color: '#1e40af',
      display: 'flex',
      alignItems: 'flex-start',
      gap: '10px'
    },
    overlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    },
    confirmationBox: {
      backgroundColor: 'white',
      padding: '25px',
      borderRadius: '12px',
      boxShadow: '0 5px 20px rgba(0, 0, 0, 0.2)',
      maxWidth: '400px',
      width: '90%',
      textAlign: 'center'
    },
    errorConfirmationBox: {
      backgroundColor: 'white',
      padding: '25px',
      borderRadius: '12px',
      boxShadow: '0 5px 20px rgba(0, 0, 0, 0.2)',
      maxWidth: '400px',
      width: '90%',
      textAlign: 'center'
    },
    checkIcon: {
      color: '#22c55e',
      fontSize: '60px',
      margin: '15px 0'
    },
    errorIcon: {
      color: '#ef4444',
      fontSize: '60px',
      margin: '15px 0'
    },
    closeButton: {
      backgroundColor: '#1e1e3f',
      color: 'white',
      border: 'none',
      padding: '10px 20px',
      borderRadius: '8px',
      marginTop: '15px',
      cursor: 'pointer',
      fontWeight: 'bold',
      transition: 'background-color 0.2s ease'
    },
    helpText: {
      fontSize: '13px',
      color: '#64748b',
      padding: '10px 15px',
      backgroundColor: '#f8fafc',
      borderRadius: '8px',
      marginBottom: '20px'
    },
    footerText: {
      fontSize: '12px',
      color: '#64748b',
      textAlign: 'center',
      marginTop: '25px',
      padding: '10px 0',
      borderTop: '1px solid #f1f5f9'
    }
  };

  return (
    <div style={styles.container}>
      {message.text && (
        <div
          style={{
            ...styles.messageContainer,
            ...(message.type === 'success' ? styles.successMessage :
              message.type === 'warning' ? styles.warningMessage : styles.errorMessage)
          }}
        >
          {message.type === 'success' ? (
            <FaCheckCircle size={18} />
          ) : message.type === 'warning' ? (
            <FaExclamationTriangle size={18} />
          ) : (
            <FaExclamationTriangle size={18} />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {validationErrors.missingRequiredFields && (
        <div style={styles.infoBox}>
          <FaInfoCircle size={20} style={{ marginTop: '3px' }} />
          <div>
            <p style={{ margin: '0 0 8px 0', fontWeight: 'bold' }}>
              Some required fields are missing from previous sections:
            </p>
            <ul style={{ margin: 0, paddingLeft: '20px' }}>
              {validationErrors.missingFieldsList &&
                Object.entries(
                  validationErrors.missingFieldsList.reduce((acc, item) => {
                    if (!acc[item.section]) acc[item.section] = [];
                    acc[item.section].push(item.label);
                    return acc;
                  }, {})
                ).map(([section, fields], idx) => (
                  <li key={idx}>
                    <strong style={{ textTransform: 'capitalize' }}>{section} Section:</strong>{' '}
                    {fields.join(', ')}
                  </li>
                ))
              }
            </ul>
            <p style={{ margin: '8px 0 0 0' }}>
              Please navigate back to complete these required fields before submission.
            </p>
          </div>
        </div>
      )}

      <div style={styles.header}>
        <FaTrophy size={20} />
        <span>Achievements & Extra Curricular Activities</span>
      </div>

      <div style={styles.helpText}>
        Share your notable achievements like competitions won, leadership roles, sports accomplishments,
        or any recognition that showcases your talents outside academics.
      </div>

      {achievements.map((item, index) => (
        <div key={index} style={styles.achievementBlock}>
          <div style={styles.achievementHeader}>
            <h4 style={styles.achievementTitle}>
              <FaTrophy size={16} />
              Achievement {index + 1}
            </h4>

            {/* Remove button now available for all achievements, even if there's just one */}
            <button
              type="button"
              onClick={() => handleRemove(index)}
              style={styles.removeButton}
              aria-label={`Remove achievement ${index + 1}`}
              title="Remove this achievement"
            >
              <FaTrash size={14} color="#fff" />
            </button>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>
              Title *
            </label>
            <input
              type="text"
              name="title"
              value={item.title || ''}
              onChange={(e) => handleChange(index, e)}
              placeholder="e.g., Hackathon Winner, Sports Championship"
              style={{
                ...styles.input,
                ...(validationErrors[`achievement_${index}_title`] ? styles.inputError : {})
              }}
              required
              aria-invalid={validationErrors[`achievement_${index}_title`] ? "true" : "false"}
            />
            {validationErrors[`achievement_${index}_title`] && (
              <div style={styles.errorText}>
                <FaExclamationTriangle size={12} />
                {validationErrors[`achievement_${index}_title`]}
              </div>
            )}
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>
              Description *
            </label>
            <textarea
              name="description"
              value={item.description || ''}
              onChange={(e) => handleChange(index, e)}
              rows={4}
              placeholder="Describe your achievement, when it happened, and its significance..."
              style={{
                ...styles.textarea,
                ...(validationErrors[`achievement_${index}_description`] ? styles.inputError : {})
              }}
              required
              aria-invalid={validationErrors[`achievement_${index}_description`] ? "true" : "false"}
            ></textarea>
            {validationErrors[`achievement_${index}_description`] && (
              <div style={styles.errorText}>
                <FaExclamationTriangle size={12} />
                {validationErrors[`achievement_${index}_description`]}
              </div>
            )}
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FaLink size={14} /> Media URL (optional)
              </div>
            </label>
            <input
              type="url"
              name="media"
              value={item.media || ''}
              onChange={(e) => handleChange(index, e)}
              placeholder="e.g., https://youtu.be/example, https://drive.google.com/file/..."
              style={{
                ...styles.input,
                ...(validationErrors[`achievement_${index}_media`] ? styles.inputError : {})
              }}
              aria-invalid={validationErrors[`achievement_${index}_media`] ? "true" : "false"}
            />
            {validationErrors[`achievement_${index}_media`] && (
              <div style={styles.errorText}>
                <FaExclamationTriangle size={12} />
                {validationErrors[`achievement_${index}_media`]}
              </div>
            )}
            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
              Add links to certificates, videos, photos, or other relevant media
            </div>
          </div>
        </div>
      ))}

      <div style={styles.buttonContainer}>
        <button
          onClick={handleAdd}
          disabled={achievements.length >= 5}
          style={{
            ...styles.button,
            ...styles.addButton,
            ...(achievements.length >= 5 ? styles.disabledButton : {}),
            flex: '1',
            maxWidth: '220px',
          }}
          type="button"
          aria-disabled={achievements.length >= 5}
        >
          <FaPlus size={14} /> Add Achievement
        </button>

        <button
          onClick={handleSubmit}
          disabled={isSubmitting || !areRequiredFieldsFilled()}
          style={{
            ...styles.button,
            ...styles.submitButton,
            ...(isSubmitting || !areRequiredFieldsFilled() ? styles.disabledButton : {}),
            flex: '1',
            maxWidth: '220px',
          }}
          type="button"
          aria-disabled={isSubmitting || !areRequiredFieldsFilled()}
          title={!areRequiredFieldsFilled() ? "Complete all required fields in previous sections first" : ""}
        >
          {isSubmitting ? (
            <>
              <FaSpinner size={14} className="spinner" /> Submitting...
            </>
          ) : (
            <>
              <FaSave size={14} /> {!areRequiredFieldsFilled() ? "Missing Required Fields" : "Complete Profile"}
            </>
          )}
        </button>
      </div>

      {formTouched && achievements.length === 5 && (
        <div style={{ fontSize: '14px', color: '#64748b', textAlign: 'center', marginTop: '10px' }}>
          Maximum 5 achievements allowed
        </div>
      )}

      {/* Success confirmation modal */}
      {showConfirmation && (
        <div style={styles.overlay}>
          <div style={styles.confirmationBox}>
            <FaCheckCircle style={{ color: '#22c55e', fontSize: '60px', margin: '15px 0' }} />
            <h3>Profile Created Successfully!</h3>
            <p>You'll be redirected to your dashboard in a moment...</p>
          </div>
        </div>
      )}

      {/* Error confirmation modal */}
      {showErrorConfirmation && (
        <div style={styles.overlay}>
          <div style={styles.errorConfirmationBox}>
            <FaExclamationTriangle style={{ color: '#ef4444', fontSize: '60px', margin: '15px 0' }} />
            <h3>Submission Failed</h3>
            <p>{errorDetails}</p>
            <button
              onClick={() => setShowErrorConfirmation(false)}
              style={styles.closeButton}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#3b82f6'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#1e1e3f'}
            >
              Close
            </button>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          
          .spinner {
            animation: spin 1s linear infinite;
          }
          
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          @media (max-width: 600px) {
            button {
              width: 100%;
              justify-content: center;
            }
          }
        `
      }} />
    </div>
  );
};

export default Achievements;