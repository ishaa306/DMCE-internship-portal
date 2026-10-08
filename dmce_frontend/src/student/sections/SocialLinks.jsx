import React from 'react';
import { FaLinkedin, FaGithub, FaCode, FaLaptopCode } from 'react-icons/fa';

/**
 * SocialLinks component for entering social/coding links.
 * 
 * Fixes:
 * - Handles value using data.social_links array for all four fields.
 * - When rendering, always pulls from data.social_links, never from data.linkedin etc.
 * - Ensures inputs are visible and icons show.
 */
const SocialLinks = ({ data, setData, onNext, markSectionVisited }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Use array for all links, fallback to 4 empty strings
    const updatedLinks = data.social_links ? [...data.social_links] : ["", "", "", ""];

    // Map index to field name
    const map = { linkedin: 0, github: 1, competitive: 2, portfolio: 3 };

    if (name in map) {
      updatedLinks[map[name]] = value;
    }

    setData((prev) => ({
      ...prev,
      social_links: updatedLinks,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Use social_links from the current scope
    const social_links = data.social_links || ["", "", "", ""];
    
    // Check if at least one social link is added
    const hasLinks = social_links.some(link => link && link.trim() !== '');
    
    // Record submission timestamp and user
    const submissionData = {
      ...data,
    };

    // Mark this section as visited using the destructured prop
    markSectionVisited('social');

    // Show appropriate alert based on whether links were added
    if (hasLinks) {
      alert("Social links saved successfully!");
    } else {
      alert("No social links were added. Your profile has been saved without links.");
    }
    
    if (onNext) onNext();
  };

  // Style definitions
  const formGroupStyle = {
    marginBottom: '25px',
    position: 'relative',
  };

  const labelStyle = {
    display: 'block',
    marginBottom: '6px',
    fontWeight: '600',
    fontSize: '15px',
    color: '#333',
  };

  const inputWrapperStyle = {
    position: 'relative',
  };

  const inputStyle = {
    width: '100%',
    padding: '12px 14px 12px 42px',
    backgroundColor: '#fff',
    borderRadius: '8px',
    border: '1.4px solid #ccc',
    fontSize: '15px',
    outline: 'none',
    boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.04)',
    color: '#000',
  };

  const iconStyle = {
    position: 'absolute',
    top: '50%',
    left: '12px',
    transform: 'translateY(-50%)',
    color: '#1e1e3f',
    fontSize: '18px',
    pointerEvents: 'none', // Let user click through to input
  };

  // Use data.social_links array for values. Fallback to ""
  const social_links = data.social_links || ["", "", "", ""];

  return (
    <div
      style={{
        backgroundColor: '#fff',
        padding: '30px',
        borderRadius: '12px',
        maxWidth: '700px',
        margin: '0 auto',
        boxShadow: '0 4px 18px rgba(0,0,0,0.05)',
      }}
    >
      <h2
        style={{
          color: '#1e1e3f',
          marginBottom: '25px',
          textAlign: 'center',
          fontWeight: '700',
          fontSize: '22px',
        }}
      >
        Social & Coding Profiles
      </h2>

      <form onSubmit={handleSubmit}>
        {/* LinkedIn */}
        <div style={formGroupStyle}>
          <label style={labelStyle}>LinkedIn</label>
          <div style={inputWrapperStyle}>
            <FaLinkedin style={iconStyle} />
            <input
              type="url"
              name="linkedin"
              placeholder="https://www.linkedin.com/in/your-profile"
              value={social_links[0]}
              onChange={handleChange}
              style={inputStyle}
              autoComplete="off"
            />
          </div>
        </div>

        {/* GitHub */}
        <div style={formGroupStyle}>
          <label style={labelStyle}>GitHub</label>
          <div style={inputWrapperStyle}>
            <FaGithub style={iconStyle} />
            <input
              type="url"
              name="github"
              placeholder="https://github.com/your-username"
              value={social_links[1]}
              onChange={handleChange}
              style={inputStyle}
              autoComplete="off"
            />
          </div>
        </div>

        {/* Competitive Coding Platform */}
        <div style={formGroupStyle}>
          <label style={labelStyle}>Competitive Coding Platform</label>
          <div style={inputWrapperStyle}>
            <FaCode style={iconStyle} />
            <input
              type="url"
              name="competitive"
              placeholder="https://leetcode.com/your-id"
              value={social_links[2]}
              onChange={handleChange}
              style={inputStyle}
              autoComplete="off"
            />
          </div>
        </div>

        {/* Portfolio */}
        <div style={formGroupStyle}>
          <label style={labelStyle}>Portfolio</label>
          <div style={inputWrapperStyle}>
            <FaLaptopCode style={iconStyle} />
            <input
              type="url"
              name="portfolio"
              placeholder="https://your-portfolio.com"
              value={social_links[3]}
              onChange={handleChange}
              style={inputStyle}
              autoComplete="off"
            />
          </div>
        </div>

        {/* Save Button */}
        <button
          type="submit"
          style={{
            width: '100%',
            padding: '14px',
            backgroundColor: '#1e1e3f',
            color: '#fff',
            border: 'none',
            borderRadius: '10px',
            fontWeight: '700',
            fontSize: '16px',
            cursor: 'pointer',
            transition: 'background-color 0.3s ease',
          }}
          onMouseEnter={(e) => (e.target.style.backgroundColor = '#333359')}
          onMouseLeave={(e) => (e.target.style.backgroundColor = '#1e1e3f')}
        >
          Save & Next
        </button>
      </form>
    </div>
  );
};

export default SocialLinks;