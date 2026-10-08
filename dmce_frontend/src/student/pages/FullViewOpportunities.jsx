import React, { useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import CollegeHeader from "../../shared/CollegeHeader";
import "./FullViewOpportunities.css";
import { FaPaperPlane, FaCheck } from "react-icons/fa";
import axios from "axios";

const FullViewOpportunities = () => {
    const location = useLocation();
    const job = location.state?.job;
    const [studentProfile, setStudentProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [applying, setApplying] = useState(false);
    const [eligibilityMessage, setEligibilityMessage] = useState("");
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState("");
    const [isEligible, setIsEligible] = useState(false);
    const [hasApplied, setHasApplied] = useState(false);

    useEffect(() => {
        // Fetch student profile data when component mounts
        fetchStudentProfile();
    }, []);

    const fetchStudentProfile = async () => {
        try {
            setLoading(true);
            const response = await axios.get(
                'https://placement-portal-backend.ramshekade20.workers.dev/api/student/profile/view',
                { withCredentials: true }
            );

            if (response.data && response.data.profile) {
                setStudentProfile(response.data.profile);
                setError(null);
            } else {
                throw new Error(response.data?.message || 'Failed to fetch student profile');
            }
        } catch (error) {
            console.error('Error fetching student profile:', error);
            setError("Unable to fetch your profile data. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    // Check if student is eligible for this job
    const checkEligibility = useCallback(() => {
        if (!studentProfile || !job) return { eligible: false, message: "" };

        const reasons = [];

        // Check branch eligibility
        if (job.eligible_branches && job.eligible_branches.length > 0) {
            const isEligibleBranch = job.eligible_branches.some(
                branch => studentProfile.department?.toLowerCase().includes(branch.toLowerCase())
            );
            if (!isEligibleBranch) {
                reasons.push(`Your department (${studentProfile.department}) is not eligible. Eligible branches: ${job.eligible_branches.join(', ')}`);
            }
        }

        // Check CGPA
        if (job.min_cgpa && parseFloat(studentProfile.cgpa) < parseFloat(job.min_cgpa)) {
            reasons.push(`Your CGPA (${studentProfile.cgpa}) is below the required minimum (${job.min_cgpa})`);
        }

        // Check 10th percentage
        if (job.min_tenth && parseFloat(studentProfile.ssc_percentage) < parseFloat(job.min_tenth)) {
            reasons.push(`Your 10th percentage (${studentProfile.ssc_percentage}%) is below the required minimum (${job.min_tenth}%)`);
        }

        // Check 12th percentage
        if (job.min_twelfth && parseFloat(studentProfile.hsc_percentage) < parseFloat(job.min_twelfth)) {
            reasons.push(`Your 12th percentage (${studentProfile.hsc_percentage}%) is below the required minimum (${job.min_twelfth}%)`);
        }

        // Check diploma percentage
        if (job.min_diploma && studentProfile.diploma_percentage &&
            parseFloat(studentProfile.diploma_percentage) < parseFloat(job.min_diploma)) {
            reasons.push(`Your diploma percentage (${studentProfile.diploma_percentage}%) is below the required minimum (${job.min_diploma}%)`);
        }

        // Check backlog status
        if (job.kt_allowed === "no" && studentProfile.backlogs > 0) {
            reasons.push("This job doesn't allow backlogs, but you have active backlogs");
        }

        // Check batch eligibility
        if (job.batch && studentProfile.expected_graduation_year != job.batch) {
            reasons.push(`This job is for batch ${job.batch}, but your graduation year is ${studentProfile.expected_graduation_year}`);
        }

        return { eligible: reasons.length === 0, message: reasons.join(". ") };
    }, [studentProfile, job]);

    // Update eligibility when student profile changes
    useEffect(() => {
        if (!loading && studentProfile) {
            const { eligible, message } = checkEligibility();
            setIsEligible(eligible);
            setEligibilityMessage(message);
        }
    }, [loading, studentProfile, checkEligibility]);

    // Handle apply button click with proper error handling
    // Handle apply button click with proper error handling
    // Handle apply button click with proper error handling
    const handleApply = async () => {
        try {
            setApplying(true);
            setError(null);
            setSuccessMessage("");

            const response = await axios.post(
                'https://placement-portal-backend.ramshekade20.workers.dev/api/student/apply',
                { job_id: job.job_id },
                { withCredentials: true }
            );

            // If we successfully applied
            if (response.data && response.data.success) {
                setSuccessMessage("Application submitted successfully!");
                // Use a nicer notification instead of alert
                const notification = document.createElement('div');
                notification.className = 'fv-notification fv-notification-success';
                notification.innerHTML = `
                        <div class="fv-notification-icon">✓</div>
                        <div class="fv-notification-content">
                            <h4>Success!</h4>
                            <p>Application submitted successfully!</p>
                        </div>
                    `;
                document.body.appendChild(notification);
                setTimeout(() => {
                    notification.classList.add('fv-notification-show');
                }, 100);
                setTimeout(() => {
                    notification.classList.remove('fv-notification-show');
                    setTimeout(() => document.body.removeChild(notification), 300);
                }, 3000);
            } else {
                throw new Error(response.data?.message || "Failed to submit application");
            }
        } catch (error) {
            console.error('Error applying for job:', error);

            // Check specifically for 409 status code (Conflict - Already Applied)
            if (error.response?.status === 409) {
                setHasApplied(true);
                setSuccessMessage("You have already applied for this position.");
                // Use a nicer notification instead of alert
                const notification = document.createElement('div');
                notification.className = 'fv-notification fv-notification-info';
                notification.innerHTML = `
                        <div class="fv-notification-icon">ℹ</div>
                        <div class="fv-notification-content">
                            <h4>Information</h4>
                            <p>You have already applied for this position.</p>
                        </div>
                    `;
                document.body.appendChild(notification);
                setTimeout(() => {
                    notification.classList.add('fv-notification-show');
                }, 100);
                setTimeout(() => {
                    notification.classList.remove('fv-notification-show');
                    setTimeout(() => document.body.removeChild(notification), 300);
                }, 3000);
            } else {
                setError(error.response?.data?.message || "Failed to submit application. Please try again.");
                // Use a nicer notification instead of alert
                const notification = document.createElement('div');
                notification.className = 'fv-notification fv-notification-error';
                notification.innerHTML = `
                        <div class="fv-notification-icon">⚠</div>
                        <div class="fv-notification-content">
                            <h4>Error</h4>
                            <p>${error.response?.data?.message || "Failed to submit application. Please try again."}</p>
                        </div>
                    `;
                document.body.appendChild(notification);
                setTimeout(() => {
                    notification.classList.add('fv-notification-show');
                }, 100);
                setTimeout(() => {
                    notification.classList.remove('fv-notification-show');
                    setTimeout(() => document.body.removeChild(notification), 300);
                }, 3000);
            }
        } finally {
            setApplying(false);
        }
    };

    if (!job) {
        return (
            <div className="fullview-bg">
                <CollegeHeader />
                <div className="fv-container">
                    <h2 style={{ margin: "2rem" }}>Job details not found.</h2>
                </div>
            </div>
        );
    }

    return (
        <div className="fullview-bg">
            <CollegeHeader />

            <div className="fv-container">
                {/* Company Header */}
                <header className="fv-header">
                    <h1>
                        {job.company_title} - {job.company_title}
                    </h1>
                    <p>
                        📍 {job.job_location || "-"} | 💼 {job.job_type || "-"}
                    </p>
                </header>

                <main className="fv-content">
                    {/* Error Message */}
                    {error && (
                        <div className="fv-error-message">
                            <p>{error}</p>
                        </div>
                    )}

                    {/* Success Message */}
                    {successMessage && (
                        <div className="fv-success-message">
                            <p>{successMessage}</p>
                        </div>
                    )}

                    {/* Job Description */}
                    <section className="fv-section">
                        <h2>📄 Job Description</h2>
                        <p>{job.job_description}</p>
                    </section>

                    {/* Details Grid */}
                    <section className="fv-details-grid">
                        <div className="fv-detail"><span>Location</span><span>{job.job_location || "-"}</span></div>
                        <div className="fv-detail"><span>Type</span><span>{job.job_type || "-"}</span></div>
                        <div className="fv-detail"><span>Batch</span><span>{job.batch || "-"}</span></div>
                        <div className="fv-detail"><span>10th %</span><span>{job.min_tenth || "-"}</span></div>
                        <div className="fv-detail"><span>12th %</span><span>{job.min_twelfth || "-"}</span></div>
                        <div className="fv-detail"><span>Diploma %</span><span>{job.min_diploma || "-"}</span></div>
                        <div className="fv-detail"><span>Min CGPA</span><span>{job.min_cgpa || "-"}</span></div>
                        <div className="fv-detail"><span>Backlogs</span><span>{job.kt_allowed || "-"}</span></div>
                        <div className="fv-detail"><span>Branches</span><span>{job.eligible_branches?.join(", ") || "-"}</span></div>
                        <div className="fv-detail"><span>Openings</span><span>{job.openings || "-"}</span></div>
                        <div className="fv-detail"><span>Rounds</span><span>{job.selection_rounds || "-"}</span></div>
                        <div className="fv-detail"><span>Drive Date</span><span>{job.drive_date || "-"}</span></div>
                        <div className="fv-detail"><span>Mode</span><span>{job.interview_mode || "-"}</span></div>
                        <div className="fv-detail"><span>Stipend</span><span>{job.stipend ? `₹${job.stipend}` : "-"}</span></div>
                        <div className="fv-detail"><span>CTC</span><span>{job.ctc ? `${job.ctc} LPA` : "-"}</span></div>
                        <div className="fv-detail"><span>Perks</span><span>{job.perks || "-"}</span></div>
                    </section>

                    {/* Eligibility Message */}
                    {!loading && eligibilityMessage && (
                        <div className="fv-eligibility-message">
                            <p>You are not eligible to apply for this position.</p>
                            <p>Reason: {eligibilityMessage}</p>
                        </div>
                    )}

                    {/* Apply Button */}
                    <div className="fv-apply-ctn">
                        {hasApplied ? (
                            <button className="fv-apply-btn fv-applied-btn" disabled>
                                <FaCheck style={{ marginRight: "8px" }} />
                                Already Applied
                            </button>
                        ) : (
                            <button
                                className={`fv-apply-btn ${!isEligible ? 'fv-apply-btn-disabled' : ''}`}
                                onClick={handleApply}
                                disabled={!isEligible || loading || applying}
                            >
                                {loading ? (
                                    "Loading profile..."
                                ) : applying ? (
                                    "Submitting..."
                                ) : (
                                    <>
                                        <FaPaperPlane style={{ marginRight: "8px" }} />
                                        Apply Now
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default FullViewOpportunities;