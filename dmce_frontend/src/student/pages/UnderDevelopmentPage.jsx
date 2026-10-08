import React from 'react';
import { FaTools, FaCode, FaRocket } from 'react-icons/fa';

const UnderDevelopmentPage = () => {
  const pageStyle = {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #1e1e3f, #4e54c8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: "'Segoe UI', sans-serif",
    color: '#fff',
    position: 'relative',
    overflow: 'hidden',
    textAlign: 'center',
    padding: '40px',
  };

  const cardStyle = {
    background: 'rgba(255, 255, 255, 0.05)',
    padding: '50px 40px',
    borderRadius: '20px',
    backdropFilter: 'blur(10px)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
    border: '1px solid rgba(255,255,255,0.2)',
    zIndex: 10,
  };

  const headingStyle = {
    fontSize: '36px',
    fontWeight: 'bold',
    marginBottom: '20px',
    animation: 'fadeInDown 1s ease-out',
  };

  const messageStyle = {
    fontSize: '20px',
    opacity: 0.9,
    animation: 'fadeInUp 1s ease-out',
  };

  const iconWrapperStyle = (top, left, delay) => ({
    position: 'absolute',
    top: top,
    left: left,
    fontSize: '28px',
    color: '#fff',
    opacity: 0.1,
    animation: `floatUp 6s ease-in-out ${delay}s infinite`,
  });

  return (
    <>
      <style>
        {`
          @keyframes floatUp {
            0% { transform: translateY(0px); opacity: 0.1; }
            50% { transform: translateY(-20px); opacity: 0.15; }
            100% { transform: translateY(0px); opacity: 0.1; }
          }

          @keyframes fadeInDown {
            from { opacity: 0; transform: translateY(-20px); }
            to { opacity: 1; transform: translateY(0); }
          }

          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}
      </style>

      <div style={pageStyle}>
        {/* Floating icons */}
        <FaTools style={iconWrapperStyle('10%', '10%', 0)} />
        <FaCode style={iconWrapperStyle('30%', '80%', 1)} />
        <FaRocket style={iconWrapperStyle('70%', '20%', 2)} />
        <FaTools style={iconWrapperStyle('60%', '70%', 3)} />
        <FaCode style={iconWrapperStyle('20%', '50%', 4)} />

        <div style={cardStyle}>
          <h1 style={headingStyle}>🚧 Page Under Development</h1>
          <p style={messageStyle}>We are building something amazing for you.<br />Stay tuned and remember...</p>
          <h2 style={{ marginTop: '25px', fontSize: '24px', color: '#ffd700', animation: 'fadeInUp 1.5s ease-out' }}>
            🌱 Keep Learning, Keep Growing!
          </h2>
        </div>
      </div>
    </>
  );
};

export default UnderDevelopmentPage;
