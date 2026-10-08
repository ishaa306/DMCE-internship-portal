// import React, { useState } from 'react';
// import './Login.css';

// const ForgotPassword = () => {
//   const [email, setEmail] = useState('');
//   const [otp, setOtp] = useState('');
//   const [resetToken, setResetToken] = useState('');
//   const [showOtpField, setShowOtpField] = useState(false);
//   const [showResetFields, setShowResetFields] = useState(false);
//   const [newPassword, setNewPassword] = useState('');
//   const [confirmPassword, setConfirmPassword] = useState('');
//   const [message, setMessage] = useState('');

//   const baseUrl = '';

//   const handleEmailSubmit = async (e) => {
//     e.preventDefault();
//     setMessage('');

//     if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
//       setMessage('❌ Enter a valid email provided by placement coordinator.');
//       return;
//     }

//     try {
//       const res = await fetch(`${baseUrl}https://placement-portal-backend.ramshekade20.workers.dev/api/forgot-password`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ email }),
//       });

//       const data = await res.json();
//       if (!res.ok) throw new Error(data.error || 'Failed to send OTP');

//       setShowOtpField(true);
//       setMessage('✅ OTP sent to your email.');
//     } catch (err) {
//       setMessage(`❌ ${err.message}`);
//     }
//   };

//   const handleOtpVerify = async (e) => {
//     e.preventDefault();
//     setMessage('');

//     if (otp.length !== 6 || isNaN(otp)) {
//       setMessage('❌ Enter a valid 6-digit OTP.');
//       return;
//     }

//     try {
//       const res = await fetch(`${baseUrl}https://placement-portal-backend.ramshekade20.workers.dev/api/forgot-password/verify-otp`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ email, otp }),
//       });

//       const data = await res.json();
//       if (!res.ok) throw new Error(data.error || 'OTP verification failed');

//       setResetToken(data.reset_token);
//       setShowResetFields(true);
//       setMessage('✅ OTP verified. Set your new password.');
//     } catch (err) {
//       setMessage(`❌ ${err.message}`);
//     }
//   };

//   const handleResetPassword = async (e) => {
//   e.preventDefault();
//   setMessage('');

//   const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

//   if (!passwordRegex.test(newPassword)) {
//     setMessage("❌ Password must be 8+ chars, 1 uppercase, 1 special char, 1 number.");
//     return;
//   }

//   if (newPassword !== confirmPassword) {
//     setMessage("❌ Passwords do not match.");
//     return;
//   }

//   try {
//     const res = await fetch(`${baseUrl}https://placement-portal-backend.ramshekade20.workers.dev/api/forgot-password/reset-password`, {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({
//         email,
//         reset_token: resetToken,
//         new_password: newPassword,
//       }),
//     });

//     const rawText = await res.text();

//     let data;
//     try {
//       data = JSON.parse(rawText);
//     } catch {
//       data = { error: rawText };
//     }

//     if (!res.ok) throw new Error(data.error || 'Password reset failed');

//     setMessage("✅ Password reset successfully! You can now log in.");
//   } catch (err) {
//     setMessage(`❌ ${err.message}`);
//   }
// };


//   return (
//     <div className="login-wrapper">
//       <div className="left-panel">
//         <img src="/dmce.png" alt="DMCE Logo" className="logo" />
//         <h2>DMCE - Training & Placement Portal</h2>
//       </div>

//       <div className="right-panel">
//         <form
//           className="login-form"
//           onSubmit={
//             showResetFields
//               ? handleResetPassword
//               : showOtpField
//               ? handleOtpVerify
//               : handleEmailSubmit
//           }
//         >
//           <h2>FORGOT PASSWORD</h2>

//           {!showOtpField && (
//             <input
//               type="email"
//               placeholder="Enter college-registered email"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//             />
//           )}

//           {showOtpField && !showResetFields && (
//             <input
//               type="text"
//               placeholder="Enter 6-digit OTP"
//               value={otp}
//               onChange={(e) => setOtp(e.target.value)}
//               maxLength={6}
//             />
//           )}

//           {showResetFields && (
//             <>
//               <input
//                 type="password"
//                 placeholder="Enter New Password"
//                 value={newPassword}
//                 onChange={(e) => setNewPassword(e.target.value)}
//               />
//               <input
//                 type="password"
//                 placeholder="Re-enter New Password"
//                 value={confirmPassword}
//                 onChange={(e) => setConfirmPassword(e.target.value)}
//               />
//             </>
//           )}

//           {message && <p className="error">{message}</p>}

//           <button type="submit" className="login-btn">
//             {showResetFields ? 'Reset Password' : showOtpField ? 'Verify OTP' : 'Send OTP'}
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default ForgotPassword;

import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // For redirection
import './forgotPassword.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [resetToken, setResetToken] = useState('');
  const [showOtpField, setShowOtpField] = useState(false);
  const [showResetFields, setShowResetFields] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [timer, setTimer] = useState(0);

  // Password validation statuses
  const [pw8, setPw8] = useState(false);
  const [pwUpper, setPwUpper] = useState(false);
  const [pwLower, setPwLower] = useState(false);
  const [pwNumber, setPwNumber] = useState(false);
  const [pwSpecial, setPwSpecial] = useState(false);
  const [pwMatch, setPwMatch] = useState(false);

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const baseUrl = '';
  const otpInputs = useRef([]);
  const navigate = useNavigate();

  // Timer logic for resend
  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  // Redirect to login after success
  useEffect(() => {
    if (message.startsWith("✅ Password reset successfully")) {
      setTimeout(() => {
        navigate("/");
      }, 1400);
    }
  }, [message, navigate]);

  // Password validation triggers
  useEffect(() => {
    setPw8(newPassword.length >= 8);
    setPwUpper(/[A-Z]/.test(newPassword));
    setPwLower(/[a-z]/.test(newPassword));
    setPwNumber(/[0-9]/.test(newPassword));
    setPwSpecial(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword));
    setPwMatch(newPassword && confirmPassword && newPassword === confirmPassword);
  }, [newPassword, confirmPassword]);

  // Error message formatter for backend
  const extractErrorMessage = (data, fallback = "Unknown error") => {
    if (typeof data === "string") return data;
    if (data?.error) return data.error;
    if (data?.message) return data.message;
    if (data?.errors && Array.isArray(data.errors) && data.errors.length > 0) {
      return data.errors.map(e => e.message || e).join(', ');
    }
    return fallback;
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setMessage('❌ Enter a valid email provided by placement coordinator.');
      return;
    }
    try {
      const res = await fetch(`${baseUrl}https://placement-portal-backend.ramshekade20.workers.dev/api/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(extractErrorMessage(data, 'Failed to send OTP'));
      setShowOtpField(true);
      setMessage('✅ OTP sent to your email.');
      setTimer(60);
      setOtp(['', '', '', '', '', '']);
      if (otpInputs.current[0]) otpInputs.current[0].focus();
    } catch (err) {
      setMessage(`❌ ${err.message || "Could not send OTP."}`);
    }
  };

  const handleResendOtp = async () => {
    setMessage('');
    try {
      const res = await fetch(`${baseUrl}https://placement-portal-backend.ramshekade20.workers.dev/api/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(extractErrorMessage(data, 'Failed to resend OTP'));
      setMessage('✅ OTP resent to your email.');
      setTimer(60);
      setOtp(['', '', '', '', '', '']);
      if (otpInputs.current[0]) otpInputs.current[0].focus();
    } catch (err) {
      setMessage(`❌ ${err.message || "Could not resend OTP."}`);
    }
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;
    let newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) {
      otpInputs.current[index + 1].focus();
    }
    if (!value && index > 0) {
      otpInputs.current[index - 1].focus();
    }
  };

  const handleOtpPaste = (e) => {
    const paste = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (paste.length === 6) {
      setOtp(paste.split(''));
      setTimeout(() => otpInputs.current[5].focus(), 0);
      e.preventDefault();
    }
  };

  const handleOtpVerify = async (e) => {
    e.preventDefault();
    setMessage('');
    const otpString = otp.join('');
    if (otpString.length !== 6 || isNaN(otpString)) {
      setMessage('❌ Enter a valid 6-digit OTP.');
      return;
    }
    try {
      const res = await fetch(`${baseUrl}https://placement-portal-backend.ramshekade20.workers.dev/api/forgot-password/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: otpString }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(extractErrorMessage(data, 'OTP verification failed'));
      setResetToken(data.reset_token);
      setShowResetFields(true);
      setMessage('✅ OTP verified. Set your new password.');
    } catch (err) {
      setMessage(`❌ ${err.message || "Could not verify OTP."}`);
    }
  };

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setMessage('');
    if (!pw8 || !pwUpper || !pwLower || !pwNumber || !pwSpecial) {
      setMessage(
        "❌ Password does not meet all requirements."
      );
      return;
    }
    if (!pwMatch) {
      setMessage("❌ Passwords do not match.");
      return;
    }
    try {
      const res = await fetch(`${baseUrl}https://placement-portal-backend.ramshekade20.workers.dev/api/forgot-password/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          reset_token: resetToken,
          new_password: newPassword,
        }),
      });
      const rawText = await res.text();
      let data;
      try {
        data = JSON.parse(rawText);
      } catch {
        data = { error: rawText };
      }
      if (!res.ok) throw new Error(extractErrorMessage(data, 'Password reset failed'));
      setMessage("✅ Password reset successfully! You can now log in.");
    } catch (err) {
      setMessage(`❌ ${err.message || "Could not reset password."}`);
    }
  };

  // Helper for tick/cross icons
  const validationIcon = (status) =>
    status
      ? <span className="tick" aria-label="ok">&#10004;</span>
      : <span className="cross" aria-label="not-ok">&#10006;</span>;

  return (
    <div className="login-wrapper">
      <div className="left-panel">
        <img src="/dmce.png" alt="DMCE Logo" className="logo" />
        <h2>DMCE - Training & Placement Portal</h2>
      </div>
      <div className="right-panel">
        <form
          className="login-form"
          onSubmit={
            showResetFields
              ? handleResetPassword
              : showOtpField
                ? handleOtpVerify
                : handleEmailSubmit
          }
        >
          <h2>FORGOT PASSWORD</h2>
          {!showOtpField && (
            <input
              type="email"
              placeholder="Enter college-registered email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
          )}
          {showOtpField && !showResetFields && (
            <div className="otp-section">
              <div
                className="otp-input-container"
                onPaste={handleOtpPaste}
                tabIndex={-1}
              >
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    className="otp-box"
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    ref={(el) => (otpInputs.current[idx] = el)}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onFocus={(e) => e.target.select()}
                  />
                ))}
              </div>
              <div className="otp-timer-row">
                <button
                  type="button"
                  className="otp-resend-btn"
                  disabled={timer > 0}
                  onClick={handleResendOtp}
                >
                  Resend Code {timer > 0 ? `(${timer}s)` : ""}
                </button>
              </div>
            </div>
          )}
          {showResetFields && (
            <>
              <div className="password-field">
                <input
                  type={showNewPassword ? "text" : "password"}
                  placeholder="Enter New Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  autoFocus
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowNewPassword((prev) => !prev)}
                  tabIndex={-1}
                  aria-label={showNewPassword ? "Hide password" : "Show password"}
                >
                  {showNewPassword ? (
                    <span role="img" aria-label="Hide">&#128065;</span>
                  ) : (
                    <span role="img" aria-label="Show">&#128065;&#xFE0E;</span>
                  )}
                </button>
              </div>
              <div className="password-field">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Re-enter New Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  tabIndex={-1}
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? (
                    <span role="img" aria-label="Hide">&#128065;</span>
                  ) : (
                    <span role="img" aria-label="Show">&#128065;&#xFE0E;</span>
                  )}
                </button>
              </div>
              <div className="password-validation-hint">
                <ul>
                  <li>
                    {validationIcon(pw8)} Minimum 8 characters
                  </li>
                  <li>
                    {validationIcon(pwUpper)} At least 1 uppercase
                  </li>
                  <li>
                    {validationIcon(pwLower)} At least 1 lowercase
                  </li>
                  <li>
                    {validationIcon(pwNumber)} At least 1 number
                  </li>
                  <li>
                    {validationIcon(pwSpecial)} At least 1 special character
                  </li>
                  <li>
                    {validationIcon(pwMatch)} Passwords match
                  </li>
                </ul>
              </div>
            </>
          )}
          {message && (
            <p className={`error ${message.startsWith("✅") ? "success" : ""}`}>
              {message}
            </p>
          )}
          <button
            type="submit"
            className="login-btn"
            disabled={
              (!email && !showOtpField && !showResetFields) ||
              (showOtpField &&
                !showResetFields &&
                otp.join("").length !== 6) ||
              (showResetFields &&
                (
                  !newPassword ||
                  !confirmPassword ||
                  !pw8 ||
                  !pwUpper ||
                  !pwLower ||
                  !pwNumber ||
                  !pwSpecial ||
                  !pwMatch
                )
              )
            }
          >
            {showResetFields
              ? 'Reset Password'
              : showOtpField
                ? 'Verify OTP'
                : 'Send OTP'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;