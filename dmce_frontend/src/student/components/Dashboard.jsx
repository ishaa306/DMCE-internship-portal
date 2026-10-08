
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CollegeHeader from '../../shared/CollegeHeader';
import Profile from "../sections/profile";
import PersonalDetails from "../sections/PersonalDetails";
import AcademicDetails from '../sections/AcademicDetails';
import EducationalQualification from '../sections/EducationalQualification';
import SkillsAndCertificates from '../sections/SkillsAndCertificates';
import InternshipAndWorkExperience from '../sections/InternshipAndWorkExperience';
import ResumeUpload from "../sections/ResumeUpload";
import Achievements from "../sections/Achievements";
import SocialLinks from "../sections/SocialLinks";
import { FaCheckCircle } from 'react-icons/fa';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const [activePage, setActivePage] = useState('profile');
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [formData, setFormData] = useState({
    profile_url: "",
    resume_url: "",
    ssc_marksheet: null,
    hsc_marksheet: null,
    diploma_marksheet: null,
    first_name: "",
    middle_name: "",
    last_name: "",
    gender: "",
    date_of_birth: "",
    contact_number_primary: "",
    contact_number_alternate: "",
    email: localStorage.getItem("email"),
    alternate_email: "",
    aadhaar_number: "",
    pan_number: "",
    student_id: localStorage.getItem("gr_number"),
    prn: "",
    current_year: "",
    division: "",
    department: "",
    year_of_admission: "",
    expected_graduation_year: "",
    ssc_percentage: "",
    ssc_year: "",
    hsc_percentage: "",
    hsc_year: "",
    diploma_percentage: "",
    diploma_year: "",
    cgpa: "",
    programming_languages: [],
    soft_skills: [],
    certifications: [],
    projects: [],
    achievements: [],
    social_links: [],
    internships: [],
    linkedin: "",
    github: "",
    competitive: "",
    portfolio: ""
  });
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Track visited optional sections
  const [visitedSections, setVisitedSections] = useState({
    social: false,
    internship: false,
    achievements: false
  });

  // Getting gr_no and token from localStorage for authentication
  const gr_no = localStorage.getItem('gr_number');
  const token = localStorage.getItem('token');

  // Responsive check
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch user and pre-fill details
  useEffect(() => {
    const fetchUserData = async () => {
      if (!gr_no) {
        console.warn("No gr_number found in localStorage");
        setLoading(false);
        navigate('/');
        return;
      }
       setLoading(false);


    };

    fetchUserData();
  }, [gr_no, navigate]);

  // Section menu with required fields for each section
  const menuItems = [
    {
      key: 'profile',
      label: 'Profile Photo',
      requiredFields: ['profile_url']
    },
    {
      key: 'personal',
      label: 'Personal Details',
      requiredFields: ['first_name', 'last_name', 'gender', 'date_of_birth', 'contact_number_primary', 'email','aadhaar_number']
    },
    {
      key: 'academic',
      label: 'Academic Details',
      requiredFields: ['student_id', 'current_year', 'department', 'year_of_admission', 'expected_graduation_year','prn', 'division']
    },
    {
      key: 'qualification',
      label: 'Educational Qualification',
      requiredFields: ['ssc_percentage', 'ssc_year','liveKT', 'cgpa','last_semester']
    },
    {
      key: 'skills',
      label: 'Skills & Certificates',
      requiredFields: ['programming_languages', 'skills']
    },
    {
      key: 'internship',
      label: 'Internship & Work Experience',
      // Internships are optional, but if added must be complete
      requiredFields: []
    },
    {
      key: 'resume',
      label: 'Resume',
      requiredFields: ['resume_url']
    },
    {
      key: 'social',
      label: 'Social Links',
      // Social links are optional but recommended
      requiredFields: []
    },
    {
      key: 'achievements',
      label: 'Achievement & Extra-Curriculars',
      // Achievements are optional, but encouraged
      requiredFields: []
    },
  ];

  // Updated section validation to check required fields or visited status for optional sections
  const isSectionFilled = (section) => {
    const item = menuItems.find(item => item.key === section);
    if (!item) return false;
    
    // Check if it's an optional section that has been visited
    if (['social', 'internship', 'achievements'].includes(section)) {
      return visitedSections[section];
    }
    
    // For required sections, check if all required fields are filled
    if (item.requiredFields.length === 0) return false;

    // Check if ALL required fields are filled
    return item.requiredFields.every(field => {
      const value = formData[field];

      // Handle arrays (check if they have items)
      if (Array.isArray(value)) return value.length > 0;

      // Handle file uploads and other non-empty values
      return value !== "" && value !== null && value !== undefined;
    });
  };

  // Function to mark a section as visited
  const markSectionVisited = (section) => {
    if (['social', 'internship', 'achievements'].includes(section)) {
      setVisitedSections(prev => ({
        ...prev,
        [section]: true
      }));
    }
  };

  // Section render logic
  const renderPage = () => {
    // Common props for all components
    const commonProps = {
      data: formData,
      setData: setFormData,
      onNext: goToNextPage,
      markSectionVisited: markSectionVisited
    };

    switch (activePage) {
      case 'profile':
        return <Profile {...commonProps} />;
      case 'personal':
        return <PersonalDetails {...commonProps} />;
      case 'academic':
        return <AcademicDetails {...commonProps} />;
      case 'qualification':
        return <EducationalQualification {...commonProps} />;
      case 'skills':
        return <SkillsAndCertificates {...commonProps} />;
      case 'internship':
        return <InternshipAndWorkExperience {...commonProps} sectionKey="internship" />;
      case 'resume':
        return <ResumeUpload {...commonProps} />;
      case 'achievements':
        return <Achievements {...commonProps} sectionKey="achievements" />;
      case 'social':
        return <SocialLinks {...commonProps} sectionKey="social" />;
      default:
        return <Profile {...commonProps} />;
    }
  };

  const goToNextPage = () => {
    const currentIndex = menuItems.findIndex(item => item.key === activePage);
    if (currentIndex < menuItems.length - 1) {
      setActivePage(menuItems[currentIndex + 1].key);
    }
  };

  const goToPrevPage = () => {
    const currentIndex = menuItems.findIndex(item => item.key === activePage);
    if (currentIndex > 0) {
      setActivePage(menuItems[currentIndex - 1].key);
    }
  };

  // Logout logic
  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="dashboardContainer">
      <CollegeHeader />
      <div className="contentWrapper">
        {!isMobile && (
          <aside className="sidebar">
            <h3 className="sidebarTitle">Student Portal</h3>
            <ul className="menuList">
              {menuItems.map(item => (
                <li
                  key={item.key}
                  onClick={() => setActivePage(item.key)}
                  className={`menuItem ${activePage === item.key ? 'activeMenuItem' : ''}`}
                >
                  <span>{item.label}</span>
                  {isSectionFilled(item.key) && (
                    <FaCheckCircle className="checkIcon" />
                  )}
                </li>
              ))}
            </ul>
            <button onClick={handleLogout} className="logoutButton">
              Logout
            </button>
          </aside>
        )}

        <main className="mainContent">
          <div className="contentContainer">
            {renderPage()}
          </div>

          {isMobile && (
            <div className="mobileNavigation">
              <button
                onClick={goToPrevPage}
                disabled={menuItems.findIndex(item => item.key === activePage) === 0}
                className={`navigationButton ${menuItems.findIndex(item => item.key === activePage) === 0 ? 'disabledButton' : ''}`}
              >
                Back
              </button>
              <button
                onClick={goToNextPage}
                disabled={menuItems.findIndex(item => item.key === activePage) === menuItems.length - 1}
                className={`navigationButton ${menuItems.findIndex(item => item.key === activePage) === menuItems.length - 1 ? 'disabledButton' : ''}`}
              >
                Next
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;