import React, { useState, useEffect } from "react";
import { FaArrowRight } from "react-icons/fa";
import "./JobRole.css";

const JobRole = ({ formData, setFormData, onNext }) => {
  const programmingLanguages = [
    "JavaScript",
    "TypeScript",
    "HTML",
    "CSS",
    "Dart",
    "Elm",
    "CoffeeScript",
    "ClojureScript",
    "JSX",
    "EJS",
    "Pug",
    "LESS",
    "SASS",
    "Stylus",
    "Python",
    "Java",
    "Ruby",
    "PHP",
    "Go",
    "C#",
    "Rust",
    "Node.js",
    "Kotlin",
    "Scala",
    "Groovy",
    "Perl",
    "Haskell",
    "Elixir",
    "Clojure",
    "Erlang",
    "Swift",
    "Objective-C",
    "React Native",
    "Flutter",
    "Xamarin",
    "C",
    "C++",
    "Assembly",
    "Fortran",
    "COBOL",
    "Ada",
    "R",
    "Julia",
    "MATLAB",
    "SQL",
    "MongoDB",
    "PostgreSQL",
    "React",
    "Angular",
    "Vue.js",
    "Express",
    "Django",
    "Flask",
    "Spring Boot",
    "Laravel",
    "ASP.NET",
  ].sort();

  const allSkills = [
    "Data Structures",
    "Algorithms",
    "Object-Oriented Programming",
    "System Design",
    "Microservices",
    "RESTful Services",
    "Machine Learning",
    "Deep Learning",
    "Cloud Services",
    "CI/CD",
    "Docker",
    "Kubernetes",
    "Git",
    "Problem Solving",
    "Communication",
    "Teamwork",
    "Leadership",
    "Agile Methodology",
    "Project Management",
  ].sort();

  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    if (!formData.skills_required) {
      setFormData((prev) => ({ ...prev, skills_required: "" }));
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "skills_required") {
      fetchSuggestions(value);
    }
  };

  const getLastTypedWord = (value) => {
    const skills = value.split(",").map((skill) => skill.trim());
    return skills[skills.length - 1] || "";
  };

  const fetchSuggestions = (value) => {
    const lastWord = getLastTypedWord(value);

    if (lastWord.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const combined = [...new Set([...programmingLanguages, ...allSkills])];

    const filtered = combined
      .filter((skill) => skill.toLowerCase().includes(lastWord.toLowerCase()))
      .slice(0, 15);

    setSuggestions(filtered);
    setShowSuggestions(filtered.length > 0);
  };

  const handleSelectSuggestion = (selectedSkill) => {
    const currentValue = formData.skills_required || "";
    const skills = currentValue
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    skills.pop();
    skills.push(selectedSkill);

    const newValue = skills.join(", ") + ", ";

    setFormData((prev) => ({ ...prev, skills_required: newValue }));
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const handleSaveNext = () => {
    if (
      !formData.company_title ||
      !formData.job_title ||
      !formData.job_description ||
      !formData.jobLocation ||
      !formData.openings ||
      !formData.jobType ||
      !formData.roleType ||
      !formData.skills_required?.trim()
    ) {
      alert("Please fill all required fields before proceeding.");
      return;
    }

    if (onNext) onNext();
  };

  const processCsvToArray = (csvString) => {
    if (!csvString) return [];
    return csvString
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  };

  return (
    <div className="job-role-container">
      <div className="job-role-header">💼 Job Role & Description</div>

      <form className="job-role-form">
        {/* 🔥 NEW ROW: Company Title + Job Title */}
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Company Name *</label>
            <input
              className="form-input"
              name="company_title"
              placeholder="e.g. Google, TCS, Infosys"
              value={formData.company_title || ""}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Job Title / Role *</label>
            <input
              className="form-input"
              name="job_title"
              placeholder="e.g. Software Engineer Intern"
              value={formData.job_title || ""}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="form-group full-width">
          <label className="form-label">Job Description *</label>
          <textarea
            className="form-textarea"
            name="job_description"
            placeholder="Brief about responsibilities, skills required, etc."
            value={formData.job_description || ""}
            onChange={handleChange}
            rows={4}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Job Location *</label>
          <select
            className="form-select"
            name="jobLocation"
            value={formData.jobLocation || ""}
            onChange={handleChange}
            required
          >
            <option value="">Select</option>
            <option value="Onsite">Onsite</option>
            <option value="Remote">Remote</option>
            <option value="Hybrid">Hybrid</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Number of Openings *</label>
          <input
            className="form-input"
            type="number"
            name="openings"
            placeholder="e.g. 5"
            value={formData.openings || ""}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Job Type *</label>
          <select
            className="form-select"
            name="jobType"
            value={formData.jobType || ""}
            onChange={handleChange}
            required
          >
            <option value="">Select</option>
            <option value="Full-time">Full-time</option>
            <option value="Internship">Internship</option>
            <option value="PPO">PPO</option>
            <option value="Part-time">Part-time</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Role *</label>
          <select
            className="form-select"
            name="roleType"
            value={formData.roleType || ""}
            onChange={handleChange}
            required
          >
            <option value="">Select</option>
            <option value="Tech">Tech</option>
            <option value="Non-Tech">Non-Tech</option>
          </select>
        </div>

        <div className="form-group full-width">
          <label className="form-label">Skills Required *</label>
          <input
            className="form-input"
            name="skills_required"
            placeholder="e.g. JavaScript, Python, Communication"
            value={formData.skills_required || ""}
            onChange={handleChange}
            autoComplete="off"
            required
          />

          {showSuggestions && (
            <div className="suggestions-dropdown">
              {suggestions.map((suggestion, idx) => (
                <div
                  key={idx}
                  className="suggestion-item"
                  onClick={() => handleSelectSuggestion(suggestion)}
                >
                  {suggestion}
                </div>
              ))}
            </div>
          )}

          <div className="skills-tags">
            {processCsvToArray(formData.skills_required).map((skill, idx) => (
              <div key={idx} className="skill-tag">
                {skill}
              </div>
            ))}
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="save-next-btn"
            onClick={handleSaveNext}
          >
            Save and Next <FaArrowRight size={16} />
          </button>
        </div>
      </form>
    </div>
  );
};

export default JobRole;
