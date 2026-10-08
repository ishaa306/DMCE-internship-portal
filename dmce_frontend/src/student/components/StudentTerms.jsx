import React, { useState, useEffect } from 'react';
import './StudentTerms.css';
import { useNavigate } from 'react-router-dom';
import dmceLogo from '../../assets/images/dmce.png';
import { FaCheckCircle, FaInfoCircle, FaArrowRight, FaClock, FaCheck } from 'react-icons/fa';

const StudentTerms = () => {
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(20);
  const [timerActive, setTimerActive] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if student has already agreed
    const hasAgreed = localStorage.getItem('studentAgreed') === 'true';
    if (hasAgreed) {
      // If already agreed, prepare to redirect
      const redirectTimer = setTimeout(() => {
        navigate('/dashboard');
      }, 500);
      return () => clearTimeout(redirectTimer);
    }

    // Start the countdown timer
    const countdownInterval = setInterval(() => {
      setTimer(prevTime => {
        if (prevTime <= 1) {
          clearInterval(countdownInterval);
          setTimerActive(false);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    // Cleanup function
    return () => clearInterval(countdownInterval);
  }, [navigate]);

  const handleAccept = async () => {
    if (!agreed || timerActive) return;
    
    setLoading(true);
    
    try {
      // Record agreement with timestamp and user info
      localStorage.setItem('studentAgreed', 'true');
      
      
      // Show success animation
      setShowSuccess(true);
      
      // Wait for animation to complete before redirecting
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
      
    } catch (error) {
      console.error('Error processing agreement:', error);
      setLoading(false);
      setShowSuccess(false);
    }
  };

  if (showSuccess) {
    return (
      <div className="terms-auth-container">
        <div className="terms-success-animation">
          <div className="terms-success-checkmark">
            <FaCheck />
          </div>
          <h2>Terms Accepted!</h2>
          <p>Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="terms-auth-container">
      <div className="terms-auth-card">
        <div className="terms-auth-logo">
          <img src={dmceLogo} alt="DMCE Logo" />
        </div>
        
        <div className="terms-auth-header">
          <h2>Student Terms & Conditions</h2>
          <p className="terms-auth-subheading">
            Please read and accept the following terms before proceeding
          </p>
        </div>
        
        <div className="terms-auth-content">
          <ul className="terms-auth-list">
            <li>
              <FaCheckCircle className="terms-auth-icon" />
              <span>Students must enter accurate and truthful information during registration and profile updates.</span>
            </li>
            <li>
              <FaCheckCircle className="terms-auth-icon" />
              <span>If any incorrect or misleading information is found, the student will be solely responsible for the consequences.</span>
            </li>
            <li>
              <FaCheckCircle className="terms-auth-icon" />
              <span>Profile details must be filled carefully and completely in one attempt to avoid errors or delays.</span>
            </li>
            <li>
              <FaCheckCircle className="terms-auth-icon" />
              <span>Students should regularly check the portal for updates, announcements, and important notifications.</span>
            </li>
            <li>
              <FaCheckCircle className="terms-auth-icon" />
              <span>Never share your login credentials with anyone. You are responsible for all activities done through your account.</span>
            </li>
            <li>
              <FaCheckCircle className="terms-auth-icon" />
              <span>If your details change (e.g., email, contact number), update them immediately on the portal.</span>
            </li>
            <li>
              <FaCheckCircle className="terms-auth-icon" />
              <span>Any misuse of the portal or violation of rules may lead to suspension of access or disciplinary action.</span>
            </li>
            <li>
              <FaCheckCircle className="terms-auth-icon" />
              <span>By using this portal, you acknowledge that all uploaded documents and information may be verified and shared with potential employers.</span>
            </li>
            <li>
              <FaCheckCircle className="terms-auth-icon" />
              <span>The portal administrators reserve the right to modify these terms and conditions at any time with appropriate notification.</span>
            </li>
          </ul>
        </div>
        
        <div className="terms-auth-info-box">
          <FaInfoCircle className="terms-auth-info-icon" />
          <p>By accepting these terms, you confirm that you have read and understood all conditions and agree to abide by them.</p>
        </div>

        <div className="terms-auth-agreement">
          <input
            type="checkbox"
            id="agree"
            checked={agreed}
            onChange={() => setAgreed(!agreed)}
            disabled={timerActive}
          />
          <label htmlFor="agree" className={timerActive ? "disabled-label" : ""}>
            I have read and agree to the terms and conditions
          </label>
        </div>
        
        {timerActive && (
          <div className="terms-auth-timer">
            <FaClock className="timer-icon" />
            <span>Please read carefully. Button will be enabled in <span className="countdown">{timer}</span> seconds</span>
          </div>
        )}

        <button 
          onClick={handleAccept} 
          disabled={!agreed || loading || timerActive} 
          className="terms-auth-btn"
        >
          {loading ? 'Processing...' : timerActive ? (
            <>Wait {timer} seconds</>
          ) : (
            <>
              Proceed to Dashboard <FaArrowRight className="btn-icon" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default StudentTerms;
