import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaGraduationCap, FaBuilding, FaUserTie, FaChevronDown, FaLinkedin, FaUserCog } from "react-icons/fa";
import { MdSupervisorAccount } from "react-icons/md";
import CollegeHeader from "../shared/CollegeHeader";
import aurionpro from "../assets/images/auri.jpeg";
import cap from "../assets/images/cap.png";
import tcs from "../assets/images/tcs.png";
import delo from "../assets/images/delo.png";
import ibm from "../assets/images/ibm.png";
import backgroundImgLaptop from "../assets/images/DMCELAP.png";
import backgroundImgMobile from "../assets/images/DMCEMOB.png";
import "./RoleHome.css"; // Import separate CSS file

const RoleHome = () => {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [deviceType, setDeviceType] = useState('desktop');
  
  // Handle scroll effect for header
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    
    // Determine device type based on screen width
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setDeviceType('mobile');
      } else if (width < 1024) {
        setDeviceType('tablet');
      } else {
        setDeviceType('desktop');
      }
    };
    
    // Initial calls
    handleResize();
    
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleHover = (e, isHovering) => {
    if (isHovering) {
      e.currentTarget.style.transform = 'translateY(-10px)';
    } else {
      e.currentTarget.style.transform = 'translateY(0)';
    }
  };
  
  const scrollDown = () => {
    window.scrollTo({
      top: window.innerHeight,
      behavior: 'smooth'
    });
  };

  const backgroundImage = deviceType === 'mobile' ? backgroundImgMobile : backgroundImgLaptop;

  return (
    <div className="role-home">
      <CollegeHeader />

      {/* Hero Section with Background Image */}
      <div className="hero" style={{ backgroundImage: `url(${backgroundImage})` }}>
        <div className="hero-overlay"></div>
        
        <div className="hero-content">
          {/* Role Selection Cards */}
          <div className={`role-card-container ${deviceType}`} style={{ color: 'black' }}>
            <div
              className="role-card"
              onMouseEnter={(e) => handleHover(e, true)}
              onMouseLeave={(e) => handleHover(e, false)}
              onClick={() => navigate('/student-login')}
            >
              <FaGraduationCap className="card-icon" />
              <div className="card-title">Student</div>
              
            </div>

            <div
              className="role-card"
              onMouseEnter={(e) => handleHover(e, true)}
              onMouseLeave={(e) => handleHover(e, false)}
              onClick={() => navigate('/company-login')}
            >
              <FaBuilding className="card-icon" />
              <div className="card-title">Company</div>
              
            </div>

            <div
              className="role-card"
              onMouseEnter={(e) => handleHover(e, true)}
              onMouseLeave={(e) => handleHover(e, false)}
              onClick={() => navigate('/tnpco-login')}
            >
              <MdSupervisorAccount className="card-icon" />
              <div className="card-title">TnP Co</div>
          
            </div>

            <div
              className="role-card"
              onMouseEnter={(e) => handleHover(e, true)}
              onMouseLeave={(e) => handleHover(e, false)}
              onClick={() => navigate('/tpo-login')}
            >
              <FaUserTie className="card-icon" />
              <div className="card-title">TPO</div>
             
            </div>

            <div
              className="role-card"
              onMouseEnter={(e) => handleHover(e, true)}
              onMouseLeave={(e) => handleHover(e, false)}
              onClick={() => navigate('/admin-login')}
            >
              <FaUserCog className="card-icon" />
              <div className="card-title">Admin</div>
              
            </div>
          </div>
        </div>
        
        {/* Scroll Down Prompt */}
        <div className={`scroll-prompt ${scrolled ? 'hidden' : ''}`} onClick={scrollDown}>
          <span>Scroll to explore</span>
          <FaChevronDown className="bounce-icon" />
        </div>
      </div>

      {/* Recruiters Section */}
      <div className="recruiters-section">
        <div className="section-container">
          <h2 className="section-title">Our Esteemed Recruiters</h2>
          <p className="section-description">
            We're proud to partner with leading companies across industries to provide 
            exceptional opportunities to our students.
          </p>
          <div className="logos-marquee">
            <div className="logos-marquee-track">
              {[aurionpro, cap, tcs, delo, ibm].map((logo, i) => (
                <img
                  key={i}
                  src={logo}
                  alt="Recruiter Logo"
                  className="recruiter-logo"
                  loading="lazy"
                />
              ))}
              {/* Duplicate for smoother looping */}
              {[aurionpro, cap, tcs, delo, ibm].map((logo, i) => (
                <img
                  key={i + 10}
                  src={logo}
                  alt="Recruiter Logo"
                  className="recruiter-logo"
                  loading="lazy"
                />
              ))}
              {[aurionpro, cap, tcs, delo, ibm].map((logo, i) => (
                <img
                  key={i + 20}
                  src={logo}
                  alt="Recruiter Logo"
                  className="recruiter-logo"
                  loading="lazy"
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-column">
            <h3 className="footer-title">DMCE Placements Cell</h3>
            <p className="footer-text">
              Providing career opportunities and industry connections to help students excel in their professional journey.
            </p>
          </div>
          
          <div className="footer-column">
            <h3 className="footer-title">Contact Us</h3>
            <p className="footer-text">
              Email: placements@dmce.ac.in<br />
              Phone: +91 8879470506 <br />
              <a 
                href="https://www.linkedin.com/school/datta-meghe-college-of-engineering-dmce-airoli/posts/?feedView=all" 
                target="_blank" 
                rel="noreferrer"
                className="linkedin-link"
              >
                <FaLinkedin /> Follow us on LinkedIn
              </a>
            </p>
          </div>
        </div>
        
        <div className="footer-copyright">
          &copy; {new Date().getFullYear()} DMCE Placements Portal. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default RoleHome;