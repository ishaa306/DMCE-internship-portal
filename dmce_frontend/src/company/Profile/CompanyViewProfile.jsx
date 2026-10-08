import React, { useEffect, useState } from 'react';
import CollegeHeader from '../../shared/CollegeHeader';
import { FaEdit, FaExternalLinkAlt } from "react-icons/fa";
import axios from "axios";
import CompanyEditProfile from './CompanyEditProfile';

const CompanyViewProfile = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editOpen, setEditOpen] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(
          "https://placement-portal-backend.ramshekade20.workers.dev/api/company/profile/view",
          { withCredentials: true }
        );
        setData(res.data.profile);
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [editOpen]);

  return (
    <>
      <CollegeHeader />
      <div className="company-viewprofile-container">
        <div className="company-viewprofile-header">
          <div className="company-viewprofile-header-left">
            <span className="company-viewprofile-header-title">🏢 Company Profile</span>
            <img
              src={data?.company_logo && typeof data.company_logo === "string" && data.company_logo !== "" ? data.company_logo : "/default-logo.png"}
              alt="Company Logo"
              className="company-viewprofile-logo"
              onError={e => { e.target.onerror = null; e.target.src = "/default-logo.png"; }}
            />
          </div>
          <button className="company-viewprofile-edit-btn" onClick={() => setEditOpen(true)}>
            <FaEdit style={{ marginRight: 6 }} /> Edit
          </button>
        </div>
        {loading ? (
          <div className="company-viewprofile-loading">Loading company profile...</div>
        ) : error ? (
          <div className="company-viewprofile-loading">{error}</div>
        ) : data ? (
          <div className="company-viewprofile-detailsgrid">
            <div className="company-viewprofile-detailbox">
              <div className="company-viewprofile-label">Company Name</div>
              <div className="company-viewprofile-value">{data.company_name}</div>
            </div>
            <div className="company-viewprofile-detailbox">
              <div className="company-viewprofile-label">Company Email</div>
              <div className="company-viewprofile-value">{data.email}</div>
            </div>
            <div className="company-viewprofile-detailbox">
              <div className="company-viewprofile-label">HR Contact Person</div>
              <div className="company-viewprofile-value">{data.hr_person_name}</div>
            </div>
            <div className="company-viewprofile-detailbox">
              <div className="company-viewprofile-label">HR Phone Number</div>
              <div className="company-viewprofile-value">{data.hr_person_contact}</div>
            </div>
            <div className="company-viewprofile-detailbox">
              <div className="company-viewprofile-label">Company Website</div>
              <div className="company-viewprofile-value">
                {data.company_website ? (
                  <a href={data.company_website} target="_blank" rel="noopener noreferrer" style={{ color: "#2563eb", textDecoration: "underline" }}>
                    {data.company_website} <FaExternalLinkAlt style={{ fontSize: '12px', marginLeft: 4 }} />
                  </a>
                ) : (
                  <span style={{ color: '#aaa' }}>—</span>
                )}
              </div>
            </div>


          </div>
        ) : (
          <div className="company-viewprofile-loading">Profile not found.</div>
        )}
      </div>
      {editOpen && (
        <CompanyEditProfile
          profile={data}
          onClose={() => setEditOpen(false)}
          onUpdate={() => {
            setEditOpen(false);
            setLoading(true);
          }}
        />
      )}
      <style>{`
        .company-viewprofile-container {
          max-width: 820px;
          margin: 4vw auto 0 auto;
          padding: 2vw;
          background: #fff;
          border-radius: 16px;
          box-shadow: 0 4px 16px rgba(30,30,63,0.10);
          border: 1px solid #e1e1ef;
          position: relative;
          overflow-x: auto;
        }
        .company-viewprofile-header {
          background-color: #1e1e3f;
          color: #fff;
          padding: 18px 24px;
          border-radius: 12px 12px 0 0;
          font-size: 22px;
          margin-bottom: 25px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          position: relative;
          gap: 24px;
          flex-wrap: wrap;
        }
        .company-viewprofile-header-left {
          display: flex;
          align-items: center;
          gap: 18px;
          flex-wrap: wrap;
        }
        .company-viewprofile-header-title {
          font-weight: bold;
          font-size: 1.3rem;
          word-break: break-word;
        }
        .company-viewprofile-logo {
          height: 48px;
          width: auto;
          max-width: 150px;
          border-radius: 7px;
          background: #f8fafc;
          border: 1px solid #e1e1ef;
          object-fit: contain;
        }
        .company-viewprofile-edit-btn {
          padding: 8px 18px;
          background-color: #10b981;
          color: #fff;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          font-size: 16px;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(16,185,129,0.09);
          display: flex;
          align-items: center;
          gap: 7px;
          transition: background 0.2s;
          position: relative;
        }
        .company-viewprofile-edit-btn:hover {
          background: #059669;
        }
        .company-viewprofile-detailsgrid {
          display: grid;
          gap: 28px;
          grid-template-columns: 1fr 1fr;
          padding: 16px 8px;
          background: #f7fafc;
          border-radius: 12px;
          box-shadow: 0 2px 12px rgba(30,30,63,0.09);
        }
        .company-viewprofile-detailbox {
          display: flex;
          flex-direction: column;
          padding: 10px 12px;
          border-radius: 8px;
          background: #fff;
          border: 1px solid #e1e1ef;
          box-shadow: 0 1px 5px rgba(30,30,63,0.07);
        }
        .company-viewprofile-label {
          font-weight: 600;
          font-size: 15px;
          color: #374151;
          margin-bottom: 4px;
        }
        .company-viewprofile-value {
          font-size: 16px;
          color: #101012;
          font-weight: 500;
          word-break: break-word;
        }
        .company-viewprofile-loading {
          text-align: center;
          color: #888;
          font-size: 17px;
          padding: 44px 0;
        }
        @media (max-width: 900px) {
          .company-viewprofile-container {
            padding: 3vw 1vw;
            max-width: 96vw;
          }
          .company-viewprofile-detailsgrid {
            grid-template-columns: 1fr;
            gap: 20px;
            padding: 12px 2px;
          }
          .company-viewprofile-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 14px;
            padding: 12px;
          }
          .company-viewprofile-header-left {
            gap: 12px;
          }
          .company-viewprofile-logo {
            height: 38px;
            max-width: 90px;
          }
          .company-viewprofile-edit-btn {
            width: 100%;
            font-size: 15px;
            margin-top: 7px;
          }
        }
        @media (max-width: 600px) {
          .company-viewprofile-container {
            padding: 3vw 1vw;
            max-width: 99vw;
            border-radius: 7px;
          }
          .company-viewprofile-header {
            font-size: 1rem;
            padding: 7px;
            border-radius: 7px 7px 0 0;
          }
          .company-viewprofile-detailbox {
            padding: 7px 6px;
            border-radius: 6px;
          }
          .company-viewprofile-label {
            font-size: 14px;
          }
          .company-viewprofile-value {
            font-size: 15px;
          }
        }
      `}</style>
    </>
  );
};

export default CompanyViewProfile;