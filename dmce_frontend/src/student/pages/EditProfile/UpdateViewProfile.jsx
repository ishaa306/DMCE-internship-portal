import React, { useEffect, useState } from "react";
import axios from "axios";
import CollegeHeader from "../../../shared/CollegeHeader";
import {
  FaUser, FaGraduationCap, FaCode, FaCertificate,
  FaTrophy, FaBuilding, FaLink
} from 'react-icons/fa';
import "./UpdateViewProfile.css";

import EditBasicInfo from "./EditBasicInfo";
import EditAcademicInfo from "./EditAcademicInfo";
import EditSkills from "./EditSkills";
import EditProjects from "./EditProjects";
import EditExperience from "./EditExperience";
import EditAchievements from "./EditAchievements";
import EditCertifications from "./EditCertifications";

const TABS = [
  { id: 'basic', label: 'Basic', icon: <FaUser /> },
  { id: 'academic', label: 'Academics', icon: <FaGraduationCap /> },
  { id: 'skills', label: 'Skills', icon: <FaCode /> },
  { id: 'projects', label: 'Projects', icon: <FaCode /> },
  { id: 'experience', label: 'Experience', icon: <FaBuilding /> },
  { id: 'achievements', label: 'Awards', icon: <FaTrophy /> },
  { id: 'certifications', label: 'Links', icon: <FaLink /> }
];

const UpdateViewProfile = () => {
  const [activeTab, setActiveTab] = useState('basic');
  const [editData, setEditData] = useState({});
  const [loading, setLoading] = useState(true);

  // Fetch the data only once when the component mounts
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(
          "https://placement-portal-backend.ramshekade20.workers.dev/api/student/profile/view",
          { withCredentials: true }
        );
        setEditData(res.data.profile);
      } catch (err) {
        // Handle errors as needed
        setEditData({});
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const renderSection = () => {
    // Pass editData and setEditData to every section
    switch (activeTab) {
      case 'basic': return <EditBasicInfo editData={editData} setEditData={setEditData} />;
      case 'academic': return <EditAcademicInfo editData={editData} setEditData={setEditData} />;
      case 'skills': return <EditSkills editData={editData} setEditData={setEditData} />;
      case 'projects': return <EditProjects editData={editData} setEditData={setEditData} />;
      case 'experience': return <EditExperience editData={editData} setEditData={setEditData} />;
      case 'achievements': return <EditAchievements editData={editData} setEditData={setEditData} />;
      case 'certifications': return <EditCertifications editData={editData} setEditData={setEditData} />;
      default: return null;
    }
  };

  return (
    <div className="uvp-profile-container">
      <CollegeHeader />
      <div className="uvp-profile-card">
        <div className="uvp-profile-header">
          <h2>Edit Student Profile</h2>
        </div>
        <div className="uvp-nav-tabs">
          {TABS.map(tab => (
            <button
              key={tab.id}
              className={`uvp-nav-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
        <div className="uvp-profile-content fade-in">
          {loading ? (
            <div style={{ textAlign: "center", fontSize: "1.1rem", color: "#888" }}>Loading profile...</div>
          ) : (
            renderSection()
          )}
        </div>
      </div>
    </div>
  );
};

export default UpdateViewProfile;