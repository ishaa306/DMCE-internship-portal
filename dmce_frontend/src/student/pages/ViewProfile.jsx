import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import CollegeHeader from "../../shared/CollegeHeader";
import {
  FaUser,
  FaGraduationCap,
  FaCode,
  FaCertificate,
  FaTrophy,
  FaBuilding,
  FaDownload,
  FaImage,
  FaFilePdf,
  FaExternalLinkAlt,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaEdit,
  FaLink,
  FaGithub,
  FaLinkedin,
  FaGlobe
} from 'react-icons/fa';
import { SiCodeforces } from "react-icons/si";
import './ViewProfile.css';

const TABS = [
  { id: 'basic', label: 'Basic', icon: <FaUser /> },
  { id: 'academic', label: 'Academics', icon: <FaGraduationCap /> },
  { id: 'skills', label: 'Skills', icon: <FaCode /> },
  { id: 'projects', label: 'Projects', icon: <FaCode /> },
  { id: 'experience', label: 'Experience', icon: <FaBuilding /> },
  { id: 'achievements', label: 'Awards', icon: <FaTrophy /> },
  { id: 'certifications', label: 'Links', icon: <FaLink /> }
];


const formatList = (value) => {
  if (Array.isArray(value)) return value.filter(Boolean).join(', ');
  if (typeof value === 'string') return value;
  return 'Not specified';
};

const formatDate = (dateString) => {
  if (!dateString) return 'Not specified';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch {
    return dateString;
  }
};

const renderFileLink = (url, filename, type = 'pdf') => {
  if (!url) return <span className="item-value">Not uploaded</span>;
  const isImage = type === 'image' || url.match(/\.(jpg|jpeg|png|gif|webp)$/i);
  return (
    <div className="file-display">
      {isImage ? (
        <div>
          <img
            src={url}
            alt={filename}
            className="image-preview"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'block';
            }}
          />
          <div style={{ display: 'none', color: '#dc2626', fontStyle: 'italic' }}>
            Image failed to load
          </div>
          <a href={url} target="_blank" rel="noopener noreferrer" className="file-link">
            <FaImage /> View Image
          </a>
        </div>
      ) : (
        <a href={url} target="_blank" rel="noopener noreferrer" className="file-link">
          <FaFilePdf /> {filename || 'Download'}
        </a>
      )}
    </div>
  );
};

const Section = ({ title, icon, children }) => (
  <div className="section">
    <h3 className="section-title">{icon} {title}</h3>
    {children}
  </div>
);

const Item = ({ label, value }) => (
  <div className="item">
    <div className="item-label">{label}</div>
    <div className="item-value">{value || "Not specified"}</div>
  </div>
);


const Profile = () => {
  const navigate = useNavigate(); // Add this line
  const [data, setData] = useState(null);
  const [activeTab, setActiveTab] = useState('basic');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(
          "https://placement-portal-backend.ramshekade20.workers.dev/api/student/profile/view",
          { withCredentials: true }
        );
        setData(res.data.profile);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // Render sections
  const renderBasicInfo = () => (
    <div className="content-grid">
      <Section title="Personal Information" icon={<FaUser />}>
        <Item label="Full Name" value={`${data?.first_name || ''} ${data?.middle_name || ''} ${data?.last_name || ''}`.trim()} />
        <Item label="Student ID" value={data?.student_id} />
        <Item label="Gender" value={data?.gender} />
        <Item label="Date of Birth" value={formatDate(data?.date_of_birth)} />
        {data?.profile_url && (
          <Item label="Profile Picture" value={renderFileLink(data.profile_url, "Profile Picture", "image")} />
        )}
      </Section>
      <Section title="Contact Information" icon={<FaUser />}>
        <Item label="Primary Contact" value={data?.contact_number_primary} />
        <Item label="Alternate Contact" value={data?.contact_number_alternate} />
        <Item label="Email Address" value={data?.email} />
        <Item label="Aadhaar Number" value={data?.aadhaar_number} />
        <Item label="Alternate Email" value={data?.alternate_email} />
        <Item label="PAN Number" value={data?.pan_number} />
      </Section>
    </div>
  );

  const renderAcademicInfo = () => (
    <div className="content-single">
      <Section title="Current Academic Status" icon={<FaGraduationCap />}>
        <div className="content-grid">
          <Item label="Department" value={data?.department} />
          <Item label="Current Year" value={data?.current_year} />
          <Item label="PRN Number" value={data?.prn} />
          <Item label="Division" value={data?.division} />

          <Item label="Year of Admission" value={data?.year_of_admission} />
          <Item label="Expected Graduation" value={data?.expected_graduation_year} />
          <Item label="Current CGPA" value={data?.cgpa} />
          <Item label="Last Semester" value={data?.last_semester} />
        </div>
      </Section>

      <Section title="Educational Records" icon={<FaGraduationCap />}>
        <div className="list-container">
          <div className="list-item">
            <div className="list-item-header">
              <h4 className="list-item-title">SSC (10th Grade)</h4>
              <span className="list-item-meta">{data?.ssc_year}</span>
            </div>
            <div className="list-item-content">
              <Item label="Percentage" value={data?.ssc_percentage ? `${data.ssc_percentage}%` : 'Not specified'} />
              {data?.ssc_marksheet_url && (
                <Item label="Marksheet" value={renderFileLink(data.ssc_marksheet_url, "SSC Marksheet")} />
              )}
            </div>
          </div>
          <div className="list-item">
            <div className="list-item-header">
              <h4 className="list-item-title">HSC (12th Grade)</h4>
              <span className="list-item-meta">{data?.hsc_year}</span>
            </div>
            <div className="list-item-content">
              <Item label="Percentage" value={data?.hsc_percentage ? `${data.hsc_percentage}%` : 'Not specified'} />
              {data?.hsc_marksheet_url && (
                <Item label="Marksheet" value={renderFileLink(data.hsc_marksheet_url, "HSC Marksheet")} />
              )}
            </div>
          </div>
          {(data?.diploma_percentage || data?.diploma_marksheet_url) && (
            <div className="list-item">
              <div className="list-item-header">
                <h4 className="list-item-title">Diploma</h4>
                <span className="list-item-meta">{data?.diploma_year}</span>
              </div>
              <div className="list-item-content">
                <Item label="Percentage" value={data?.diploma_percentage ? `${data.diploma_percentage}%` : 'Not specified'} />
                {data?.diploma_marksheet_url && (
                  <Item label="Marksheet" value={renderFileLink(data.diploma_marksheet_url, "Diploma Marksheet")} />
                )}
              </div>
            </div>
          )}
        </div>
      </Section>
    </div>
  );

  const renderSkills = () => (
    <div className="content-grid">
      <Section title="Technical Skills" icon={<FaCode />}>
        <Item label="Programming Languages" value={formatList(data?.programming_languages)} />
        <Item label="Technical Skills" value={formatList(data?.skills)} />
        {data?.resume_url && (
          <Item label="Resume" value={renderFileLink(data.resume_url, "Download Resume")} />
        )}
      </Section>
    </div>
  );

  const renderProjects = () => (
    <div className="content-single">
      <Section title="Projects Portfolio" icon={<FaCode />}>
        {(data?.projects || []).length > 0 ? (
          <div className="list-container">
            {data.projects.map((project, idx) => (
              <div key={idx} className="list-item">
                <div className="list-item-header">
                  <h4 className="list-item-title">{project?.title || `Project ${idx + 1}`}</h4>
                </div>
                <div className="list-item-content">
                  <Item label="Description" value={project?.description} />
                  {project?.url && (
                    <Item
                      label="Project Link"
                      value={
                        <a href={project.url} target="_blank" rel="noopener noreferrer" className="file-link">
                          <FaExternalLinkAlt /> View Project
                        </a>
                      }
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">No projects added yet.</div>
        )}
      </Section>
    </div>
  );

  const renderExperience = () => (
    <div className="content-single">
      <Section title="Work Experience" icon={<FaBuilding />}>
        {(data?.internships || []).length > 0 ? (
          <div className="list-container">
            {data.internships.map((exp, idx) => (
              <div key={idx} className="list-item">
                <div className="list-item-header">
                  <h4 className="list-item-title">{exp?.title || exp?.company || `Experience ${idx + 1}`}</h4>
                  <span className="list-item-meta">
                    <FaMapMarkerAlt /> {exp?.location || 'Remote'}
                  </span>
                </div>
                <div className="list-item-content">
                  <Item label="Company" value={exp?.company} />
                  <Item label="Employment Type" value={exp?.employmentType || 'Internship'} />
                  <Item label="Duration" value={exp?.duration} />
                  {exp?.startDate && (
                    <Item label="Start Date" value={formatDate(exp?.startDate)} />
                  )}
                  {exp?.endDate && !exp?.currentlyWorking && (
                    <Item label="End Date" value={formatDate(exp?.endDate)} />
                  )}
                  {exp?.currentlyWorking && (
                    <Item label="Status" value="Currently Working" />
                  )}
                  <Item label="Description" value={exp?.description} />
                  {exp?.mediaLink && (
                    <Item
                      label="Media"
                      value={
                        <a href={exp.mediaLink} target="_blank" rel="noopener noreferrer" className="file-link">
                          <FaExternalLinkAlt /> View Media
                        </a>
                      }
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">No work experience added yet.</div>
        )}
      </Section>
    </div>
  );

  const renderAchievements = () => (
    <div className="content-single">
      <Section title="Achievements & Awards" icon={<FaTrophy />}>
        {(data?.achievements || []).length > 0 ? (
          <div className="list-container">
            {data.achievements.map((ach, idx) => (
              <div key={idx} className="list-item">
                <div className="list-item-header">
                  <h4 className="list-item-title">{ach?.title || `Achievement ${idx + 1}`}</h4>
                  {ach?.date && (
                    <span className="list-item-meta">
                      <FaCalendarAlt /> {formatDate(ach.date)}
                    </span>
                  )}
                </div>
                <div className="list-item-content">
                  <Item label="Description" value={ach?.description} />
                  <Item label="Organization" value={ach?.organization} />
                  {ach?.media && (
                    <Item
                      label="Media"
                      value={
                        <a href={ach.media} target="_blank" rel="noopener noreferrer" className="file-link">
                          <FaExternalLinkAlt /> View Media
                        </a>
                      }
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">No achievements added yet.</div>
        )}
      </Section>
    </div>
  );

  const renderCertifications = () => {
    const socialLabels = [
      { label: 'LinkedIn', icon: <FaLinkedin color="#0077b5" /> },
      { label: 'GitHub', icon: <FaGithub color="#333" /> },
      { label: 'Competitive Coding', icon: <SiCodeforces color="#EE8208" /> },
      { label: 'Portfolio', icon: <FaGlobe color="#1e1e3f" /> }
    ];


    return (
      <div className="content-single">
        <Section title="Certifications & Licenses" icon={<FaCertificate />}>
          {(data?.certifications || []).length > 0 ? (
            <div className="list-container">
              {data.certifications.map((cert, idx) => (
                <div key={idx} className="list-item">
                  <div className="list-item-header">
                    <h4 className="list-item-title">Title :- {cert?.name || `Certification ${idx + 1}`}</h4>
                  </div>
                  <div className="list-item-content">
                    {cert?.link && (
                      <Item
                        label="Certificate"
                        value={
                          <a href={cert.link} target="_blank" rel="noopener noreferrer" className="file-link">
                            <FaExternalLinkAlt /> View Certificate
                          </a>
                        }
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">No certifications added yet.</div>
          )}

          {Array.isArray(data?.social_links) && data.social_links.length > 0 && (
            <div style={{ marginTop: '20px' }}>
              <h4
                className="section-title"
                style={{
                  fontSize: '17px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'transparent',
                  marginBottom: '12px'
                }}
              >
                <FaLink style={{ color: '#1e1e3f' }} />
                Social Links
              </h4>
              {data.social_links.map((link, idx) => {
                if (!link) return null;
                const social = socialLabels[idx] || { label: `Link ${idx + 1}`, icon: <FaLink style={{ color: '#1e1e3f' }} /> };
                return (
                  <Item
                    key={idx}
                    label={
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        {social.icon}
                        {social.label}
                      </span>
                    }
                    value={
                      <a
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="file-link"
                        style={{ wordBreak: "break-all" }}
                      >
                        <FaExternalLinkAlt /> {link}
                      </a>
                    }
                  />
                );
              })}
            </div>
          )}
        </Section>
      </div>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'basic': return renderBasicInfo();
      case 'academic': return renderAcademicInfo();
      case 'skills': return renderSkills();
      case 'projects': return renderProjects();
      case 'experience': return renderExperience();
      case 'achievements': return renderAchievements();
      case 'certifications': return renderCertifications();
      default: return renderBasicInfo();
    }
  };

  if (loading) {
    return (
      <div className="profile-container">
        <CollegeHeader />
        <div className="profile-card">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading your profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-container">
        <CollegeHeader />
        <div className="profile-card">
          <div className="error-container">
            <h3>Error Loading Profile</h3>
            <p>{error}</p>
            <button className="file-link" onClick={() => window.location.reload()}>
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <CollegeHeader />
      <div className="profile-card">
        <div className="profile-header">
          <h2>Student Profile Portal</h2>
        </div>
        <div className="nav-tabs">
          {TABS.map(tab => (
            <button
              key={tab.id}
              className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
        <div className="profile-content fade-in">
          {renderContent()}
        </div>
      </div>
      <button className="edit-button" onClick={() => navigate('/profile/update')}>
        <FaEdit /> Edit Profile
      </button>
    </div>
  );
};

export default Profile;