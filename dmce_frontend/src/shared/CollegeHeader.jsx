import React from 'react';
import dmceLogo from '../assets/images/dmce.png';
import { useLocation } from 'react-router-dom';

// You can use a simple SVG for the back arrow for easy styling and no extra dependencies
const BackIcon = ({ onClick }) => (
  <button
    aria-label="Go Back"
    onClick={onClick}
    style={{
      background: 'none',
      border: 'none',
      outline: 'none',
      cursor: 'pointer',
      marginRight: '15px',
      display: 'flex',
      alignItems: 'center',
      padding: 0,
      color: 'white',
      height: 50,
      width: 40,
    }}
  >
    <svg
      width="28"
      height="28"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.3"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ display: 'block' }}
    >
      <polyline points="14 18 6 10 14 2" />
    </svg>
  </button>
);

const CollegeHeader = () => {
  const location = useLocation();
  
  // Check if we are on the main landing page (RoleHome)
  const isMainLandingPage = location.pathname === '/';
  
  // Use navigate(-1) to go back
  const handleBack = () => {
    window.history.back();
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center', // centers the logo/text block horizontally
      alignItems: 'center',
      backgroundColor: '#1e1e3f',
      color: 'white',
      padding: '10px 20px',
      position: 'relative',
      minHeight: '70px'
    }}>
      {/* Back icon - only show if not on the main landing page */}
      {!isMainLandingPage && (
        <div style={{
          position: 'absolute',
          left: 16,
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 2,
        }}>
          <BackIcon onClick={handleBack} />
        </div>
      )}
      
      {/* Centered logo and text */}
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <img src={dmceLogo} alt="DMCE Logo" style={{ width: '50px', marginRight: '15px' }} />
        <div>
          <div style={{ fontSize: '14px', opacity: 0.8 }}>Nagar Yuvak Shikshan Sanstha, Airoli</div>
          <div style={{ fontSize: '20px', fontWeight: 'bold' }}>Datta Meghe College of Engineering</div>
        </div>
      </div>
    </div>
  );
};

export default CollegeHeader;