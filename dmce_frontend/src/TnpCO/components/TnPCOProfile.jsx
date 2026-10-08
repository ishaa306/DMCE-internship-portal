import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaEnvelope,
  FaUniversity,
  FaPhoneAlt,
  FaEdit,
} from "react-icons/fa";
import CollegeHeader from "../../shared/CollegeHeader";

import "../Register/TnpCoordinatorRegister.css";
import "./TnPCOProfile.css";

const PROFILE_API =
  "https://placement-portal-backend.ramshekade20.workers.dev/api/tnp/profile/view";

export default function TnpCoordinatorProfile() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState({
    name: localStorage.getItem("tnpco_name") || "",
    email: localStorage.getItem("tnpco_email") || "",
    department: localStorage.getItem("tnpco_department") || "",
    contact_primary: localStorage.getItem("tnpco_contact_primary") || "",
    contact_alternate: localStorage.getItem("tnpco_contact_alternate") || "",
    alternate_email: localStorage.getItem("tnpco_alternate_email") || "",
    created_at: localStorage.getItem("tnpco_created_at") || "",
    updated_at: localStorage.getItem("tnpco_updated_at") || "",
    avatar_url: localStorage.getItem("tnpco_avatar_url") || "",
    is_active: localStorage.getItem("tnpco_is_active") === "true",
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    const fetchProfile = async () => {
      setLoading(true);
      setError("");

      const isAuthenticated = localStorage.getItem("tnpcoAuthenticated");
      if (!isAuthenticated) {
        navigate("/tnpco-login");
        return;
      }

      const token =
        localStorage.getItem("tnpco_token") ||
        localStorage.getItem("token") ||
        localStorage.getItem("accessToken") ||
        null;

      const headers = { Accept: "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      try {
        const resp = await fetch(PROFILE_API, {
          method: "GET",
          credentials: "include",
          headers,
        });

        if (resp.status === 401) {
          localStorage.removeItem("tnpcoAuthenticated");
          navigate("/tnpco-login");
          return;
        }

        if (!resp.ok) {
          throw new Error(`Failed to fetch profile (${resp.status})`);
        }

        let data = null;
        const contentType = resp.headers.get("content-type") || "";
        if (contentType.includes("application/json")) {
          data = await resp.json();
        } else {
          const txt = await resp.text();
          try {
            data = JSON.parse(txt);
          } catch {
            data = null;
          }
        }

        let profileData = null;
        if (data) {
          if (data.profile && typeof data.profile === "object") profileData = data.profile;
          else if (data.data && typeof data.data === "object" && !Array.isArray(data.data))
            profileData = data.data;
          else if (typeof data === "object" && !Array.isArray(data)) {
            if (data.name || data.email || data.department) profileData = data;
            else {
              const nested = Object.values(data).find(
                (v) => v && typeof v === "object" && !Array.isArray(v) && (v.name || v.email)
              );
              if (nested) profileData = nested;
            }
          }
        }

        if (mounted && profileData) {
          const mapped = {
            name: profileData.name ?? profile.name,
            email: profileData.email ?? profile.email,
            department: profileData.department ?? profile.department,
            contact_primary: profileData.contact_primary ?? profile.contact_primary,
            contact_alternate: profileData.contact_alternate ?? profile.contact_alternate,
            alternate_email: profileData.alternate_email ?? profile.alternate_email,
            created_at: profileData.created_at ?? profile.created_at,
            updated_at: profileData.updated_at ?? profile.updated_at ?? "",
            avatar_url: profileData.avatar_url ?? profile.avatar_url ?? "",
            is_active:
              typeof profileData.is_active === "boolean"
                ? profileData.is_active
                : profile.is_active,
          };

          setProfile((prev) => ({ ...prev, ...mapped }));

          try {
            Object.entries(mapped).forEach(([key, value]) => {
              if (value !== undefined && value !== null) {
                localStorage.setItem(`tnpco_${key}`, String(value));
              }
            });
          } catch {
            // ignore
          }
        } else if (mounted && !profileData) {
          setError("No profile data returned from server — showing saved details.");
        }
      } catch (err) {
        console.error("Failed to load TnP profile:", err);
        if (mounted) setError("Unable to fetch profile — showing saved details.");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchProfile();
    return () => {
      mounted = false;
    };
  }, [navigate]);

  return (
    <div className="tnpco-register-page tnpco-profile-page">
      <CollegeHeader />

      <div className="tnpco-register-container">
        <div className="tnpco-register-card profile-card">
          <header className="tnpco-register-header profile-header">
            <div className="profile-header-left">
              <div className="profile-avatar">
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} alt="Coordinator avatar" />
                ) : (
                  <div className="profile-initials" aria-hidden>
                    {profile.name
                      ? profile.name
                        .split(" ")
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join("")
                      : "TN"}
                  </div>
                )}
              </div>

              <div className="profile-title">
                <h1 className="tnpco-register-title profile-name">{profile.name || "Not provided"}</h1>
                <div className="profile-department">{profile.department || "Department not set"}</div>
              </div>
            </div>

            <div className="profile-actions header-actions">
              <button
                type="button"
                className="tnpco-submit-btn small edit-btn"
                onClick={() => navigate("/tnpco/edit-profile")}
                aria-label="Edit profile"
              >
                <FaEdit /> Edit
              </button>
            </div>
          </header>

          {loading ? (
            <div className="profile-loading">Loading profile...</div>
          ) : (
            <>
              {error && <div className="tnpco-status tnpco-status-error" role="alert">{error}</div>}

              <div className="profile-grid">
                <div className="profile-section">
                  <div className="section-title">Contact Information</div>

                  <div className="field">
                    <div className="field-label">Email</div>
                    <div className="field-value">
                      <FaEnvelope className="field-icon" />
                      <span>{profile.email || "Not provided"}</span>
                    </div>
                  </div>

                  <div className="field">
                    <div className="field-label">Primary Contact</div>
                    <div className="field-value">
                      <FaPhoneAlt className="field-icon" />
                      <span>{profile.contact_primary || "Not provided"}</span>
                    </div>
                  </div>

                  <div className="field">
                    <div className="field-label">Alternate Contact</div>
                    <div className="field-value">
                      <FaPhoneAlt className="field-icon" />
                      <span>{profile.contact_alternate || "Not provided"}</span>
                    </div>
                  </div>

                  <div className="field">
                    <div className="field-label">Alternate Email</div>
                    <div className="field-value">
                      <FaEnvelope className="field-icon" />
                      <span>{profile.alternate_email || "Not provided"}</span>
                    </div>
                  </div>

                  <div className="field">
                    <div className="field-label">Department</div>
                    <div className="field-value">
                      <FaUniversity className="field-icon" />
                      <span>{profile.department || "Not provided"}</span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}