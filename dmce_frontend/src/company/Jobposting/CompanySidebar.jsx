import React, { useState, useEffect } from "react";
import CollegeHeader from "../../shared/CollegeHeader";
import JobRole from "./sections/JobRole";
import Requirements from "./sections/Requirements";
import { useNavigate } from "react-router-dom";
import Hiring from "./sections/Hiring";
import SalaryDetails from "./sections/SalaryDetails";
import { FaCheckCircle } from "react-icons/fa";

const CompanySidebar = () => {
  const navigate = useNavigate();
  const [activePage, setActivePage] = useState("jobrole");
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [formData, setFormData] = useState({
    // Job Role data
    company_title: "",
    job_title: "",
    job_description: "",
    jobLocation: "",
    openings: "",
    jobType: "",
    industry: "",

    // Requirements data
    minTenth: "",
    minTwelfth: "",
    minDiploma: "",
    minCGPA: "",
    ktAllowed: "",
    eligibleBranches: [],
    batch: "",

    // Hiring data
    selectionRounds: "",
    driveDate: "",
    interviewMode: "",

    // Salary data
    stipend: "",
    ctc: "",
    perks: "",
  });

  const menuItems = [
    {
      key: "jobrole",
      label: "Job Role",
      checkField: [
        "company_title",
        "job_title",
        "job_description",
        "jobLocation",
        "openings",
        "jobType",
      ],
    },
    {
      key: "requirements",
      label: "Eligibility Criteria",
      checkField: ["batch", "eligibleBranches"],
    },
    {
      key: "hiring",
      label: "Hiring Process",
      checkField: ["selectionRounds", "driveDate", "interviewMode"],
    },
    { key: "salary", label: "Salary Details", checkField: ["stipend"] },
  ];

  const currentIndex = menuItems.findIndex((item) => item.key === activePage);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isSectionFilled = (fields) => {
    if (Array.isArray(fields)) {
      return fields.every((field) => {
        const value = formData[field];
        if (field === "eligibleBranches") {
          return Array.isArray(value) && value.length > 0;
        }
        return value !== undefined && value !== null && value !== "";
      });
    } else {
      const value = formData[fields];
      return Array.isArray(value) ? value.length > 0 : value?.trim?.() !== "";
    }
  };

  const handleNext = () => {
    // Check if current section is filled before proceeding
    const currentSection = menuItems[currentIndex];
    if (!isSectionFilled(currentSection.checkField)) {
      alert("Please fill all required fields before proceeding.");
      return;
    }

    // Log data for the current section
    console.log(`${currentSection.label} Data:`, formData);

    // Not last step → move ahead
    if (currentIndex < menuItems.length - 1) {
      setActivePage(menuItems[currentIndex + 1].key);
      return;
    }

    // ✅ FINAL STEP COMPLETED
    alert("Job posted successfully!");
    console.log("Final Job Data:", formData);

    // 🔁 REDIRECT HERE
    navigate("/company-dashboard");
  };

  const renderPage = () => {
    switch (activePage) {
      case "jobrole":
        return (
          <JobRole
            formData={formData}
            setFormData={setFormData}
            onNext={handleNext}
          />
        );
      case "requirements":
        return (
          <Requirements
            formData={formData}
            setFormData={setFormData}
            onNext={handleNext}
          />
        );
      case "hiring":
        return (
          <Hiring data={formData} setData={setFormData} onNext={handleNext} />
        );
      case "salary":
        return (
          <SalaryDetails
            data={formData}
            setData={setFormData}
            onNext={handleNext}
          />
        );
      default:
        return (
          <JobRole
            formData={formData}
            setFormData={setFormData}
            onNext={handleNext}
          />
        );
    }
  };

  return (
    <div
      style={{
        fontFamily: "Arial, sans-serif",
        background: "#f9f9f9",
        minHeight: "100vh",
      }}
    >
      <CollegeHeader />
      <div
        style={{
          display: "flex",
          height: "calc(100vh - 80px)",
          overflow: "hidden",
          flexDirection: "column",
        }}
      >
        <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
          {!isMobile && (
            <aside
              style={{
                width: "270px",
                backgroundColor: "#fff",
                padding: "20px",
                borderRight: "1px solid #ccc",
                boxSizing: "border-box",
                color: "#333",
              }}
            >
              <h3
                style={{
                  marginBottom: "20px",
                  fontSize: "18px",
                  color: "#000",
                }}
              >
                Company Form
              </h3>
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {menuItems.map((item) => (
                  <li
                    key={item.key}
                    onClick={() => setActivePage(item.key)}
                    style={{
                      cursor: "pointer",
                      margin: "10px 0",
                      padding: "10px",
                      backgroundColor:
                        activePage === item.key ? "#1e1e3f" : "transparent",
                      color: activePage === item.key ? "#fff" : "#333",
                      borderRadius: "6px",
                      fontSize: "14px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <span>{item.label}</span>
                    {isSectionFilled(item.checkField) && (
                      <FaCheckCircle
                        style={{ color: "green", marginLeft: "10px" }}
                      />
                    )}
                  </li>
                ))}
              </ul>
            </aside>
          )}

          <main style={{ flex: 1, padding: "20px", overflowY: "auto" }}>
            <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
              {renderPage()}
            </div>
          </main>
        </div>

        {isMobile && (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "10px 20px",
              borderTop: "1px solid #ccc",
              backgroundColor: "#fff",
            }}
          >
            <button
              onClick={() =>
                currentIndex > 0 &&
                setActivePage(menuItems[currentIndex - 1].key)
              }
              disabled={currentIndex === 0}
              style={{
                padding: "10px 20px",
                backgroundColor: currentIndex === 0 ? "#ccc" : "#1e1e3f",
                color: "#fff",
                border: "none",
                borderRadius: "4px",
              }}
            >
              Previous
            </button>
            <button
              onClick={handleNext}
              style={{
                padding: "10px 20px",
                backgroundColor:
                  currentIndex === menuItems.length - 1 ? "#4caf50" : "#1e1e3f",
                color: "#fff",
                border: "none",
                borderRadius: "4px",
              }}
            >
              {currentIndex === menuItems.length - 1 ? "Submit" : "Next"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompanySidebar;
