import React, { useState } from "react";
import CollegeHeader from "../../shared/CollegeHeader";
import "./CompanyInvite.css"; // you can reuse TnpCoordinator.css if preferred

const CompanyInvite = () => {
  const [companyDetails, setCompanyDetails] = useState({
    companyName: "",
    companyEmail: "",
  });
  const [companyError, setCompanyError] = useState("");
  const [companySuccess, setCompanySuccess] = useState("");
  const [sendingMail, setSendingMail] = useState(false);

  // Handle input changes
  const handleCompanyInputChange = (e) => {
    const { name, value } = e.target;
    setCompanyDetails((prev) => ({
      ...prev,
      [name]: value,
    }));
    setCompanyError("");
    setCompanySuccess("");
  };

  // Email validation
  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  // Send invitation mail
  const handleSendMail = async () => {
    setCompanyError("");
    setCompanySuccess("");

    if (!companyDetails.companyName.trim()) {
      setCompanyError("Company name is required.");
      return;
    }

    if (!companyDetails.companyEmail.trim()) {
      setCompanyError("Company email is required.");
      return;
    }

    if (!validateEmail(companyDetails.companyEmail)) {
      setCompanyError("Please enter a valid email address.");
      return;
    }

    try {
      setSendingMail(true);

      const mailPayload = {
        company_name: companyDetails.companyName.trim(),
        email: companyDetails.companyEmail.trim(),
      };

      console.log("📧 Sending mail with payload:", mailPayload);

      const response = await fetch(
        "https://placement-portal-backend.ramshekade20.workers.dev/api/list-company",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(mailPayload),
        }
      );

      const responseData = await response.json();
      console.log("📧 Mail response:", responseData);

      if (!response.ok) {
        throw new Error(
          responseData.message || `Failed to send mail: ${response.status}`
        );
      }

      setCompanySuccess(
        `✅ Invitation email sent successfully to ${companyDetails.companyEmail}`
      );

      // Clear form
      setCompanyDetails({ companyName: "", companyEmail: "" });
    } catch (error) {
      console.error("❌ Mail sending failed:", error);
      setCompanyError(`Failed to send email: ${error.message}`);
    } finally {
      setSendingMail(false);
    }
  };

  return (
    <div className="tnp-container">
      <CollegeHeader />

      <div className="upload-section">
        <h1 className="page-title">Invite Company</h1>
        <br />
        <p className="page-subtitle">
          Send invitations and manage company participation for placements.
        </p>
        <br />

        <div className="company-form">
          <div className="form-group">
            <label htmlFor="companyName" className="form-label">
              <div>
                🏢 Company Name <span style={{ color: "red" }}>*</span>
              </div>
            </label>
            <input
              id="companyName"
              name="companyName"
              type="text"
              placeholder="Enter company name"
              value={companyDetails.companyName}
              onChange={handleCompanyInputChange}
              className="form-input"
              disabled={sendingMail}
            />
          </div>

          <div className="form-group">
            <label htmlFor="companyEmail" className="form-label">
              <div>
                📧 Company Email <span style={{ color: "red" }}>*</span>
              </div>
            </label>
            <input
              id="companyEmail"
              name="companyEmail"
              type="email"
              placeholder="Enter company email address"
              value={companyDetails.companyEmail}
              onChange={handleCompanyInputChange}
              className="form-input"
              disabled={sendingMail}
            />
          </div>

          {companyError && <p className="error-msg">{companyError}</p>}
          {companySuccess && (
            <p className="success-msg-text">{companySuccess}</p>
          )}

          <button
            onClick={handleSendMail}
            disabled={
              sendingMail ||
              !companyDetails.companyName.trim() ||
              !companyDetails.companyEmail.trim()
            }
            className={`send-mail-btn ${sendingMail ||
              !companyDetails.companyName.trim() ||
              !companyDetails.companyEmail.trim()
              ? "disabled"
              : ""
              }`}
          >
            {sendingMail ? "📧 Sending..." : "📨 Send Invitation"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CompanyInvite;
