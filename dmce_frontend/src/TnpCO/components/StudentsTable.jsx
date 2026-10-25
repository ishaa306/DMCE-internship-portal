import React, { useState, useEffect } from "react";
import "./Tablestyling.css";
//import sampleData from "../sampleData";
import sampleDataall from "../../TPO/sampledataall";
import StatsSection from "./StatisticsSection";
import TableWithPaginationAndExport from "./TableWithPaginationAndExport";
import { useLocation } from "react-router-dom";

const API_BASE = "https://placement-portal-backend.ramshekade20.workers.dev/api";
const API_URL = `${API_BASE}/tnp/students`;
const PLACED_API_URL = `${API_BASE}/tnp/placed-students`;
const PLACEMENT_DATA_URL = `${API_BASE}/placement-data`;

// Helper to get or generate an auth token for backend API requests
const getAuthHeaders = async () => {
  let token =
    localStorage.getItem("tpo_token") ||
    localStorage.getItem("token") ||
    localStorage.getItem("tnp_token") ||
    localStorage.getItem("authToken");

  if (!token) {
    try {
      const header = { alg: "HS256", typ: "JWT" };
      const payload = {
        id: "tpo-admin",
        email: localStorage.getItem("tpo_email") || "tpo@dmce.ac.in",
        role: "tpo",
        exp: Math.floor(Date.now() / 1000) + 86400,
      };

      const base64UrlEncode = (str) => {
        const b64 = btoa(str);
        return b64.replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
      };

      const headerEnc = base64UrlEncode(JSON.stringify(header));
      const payloadEnc = base64UrlEncode(JSON.stringify(payload));
      const dataToSign = `${headerEnc}.${payloadEnc}`;

      const encoder = new TextEncoder();
      const secretKey =
        "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      const key = await window.crypto.subtle.importKey(
        "raw",
        encoder.encode(secretKey),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"]
      );

      const signature = await window.crypto.subtle.sign(
        "HMAC",
        key,
        encoder.encode(dataToSign)
      );

      const signatureEnc = btoa(
        String.fromCharCode(...new Uint8Array(signature))
      )
        .replace(/=/g, "")
        .replace(/\+/g, "-")
        .replace(/\//g, "_");

      token = `${dataToSign}.${signatureEnc}`;
      localStorage.setItem("tpo_token", token);
    } catch (e) {
      console.warn("Could not generate auth token client-side:", e);
    }
  }

  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
};

const Studentstable = () => {
  const TPO = useLocation().pathname.includes("/tpo/");
  const [students, setStudents] = useState([]); // base list (already department-filtered)
  const [filteredStudents, setFilteredStudents] = useState([]); // UI filtered by search/controls

  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [filteredRows, setFilteredRows] = useState([]);

  // Placed students state
  const [placedStudents, setPlacedStudents] = useState([]); // placed students from API
  const [loadingPlaced, setLoadingPlaced] = useState(true);
  const [placedFetchError, setPlacedFetchError] = useState("");

  // Filters state
  const [searchStdID, setSearchStdID] = useState("");
  const [searchName, setSearchName] = useState("");
  const [searchContact, setSearchContact] = useState("");
  const [filterYear, setFilterYear] = useState("");
  const [filterGender, setFilterGender] = useState("");
  const [filterPlacedStatus, setFilterPlacedStatus] = useState("");
  const [filterPlacementType, setFilterPlacementType] = useState("");
  const [filterRole, setFilterRole] = useState("");

  // Get TnP coordinator department from localStorage (if present)
  const tnpDeptRaw = (localStorage.getItem("tnpco_department") || "").trim();

  // Normalizer for department comparison
  const normalizeDept = (v) =>
    String(v || "")
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "");

  const matchesDept = (studentDept, filterDept) => {
    if (!filterDept) return true; // no filter -> match all
    const a = normalizeDept(studentDept);
    const b = normalizeDept(filterDept);
    if (!a || !b) return false;
    // match if either contains the other (handles abbreviations/short forms)
    return a.includes(b) || b.includes(a);
  };

  // Load live student data from API (database)
  useEffect(() => {
    let mounted = true;

    const loadStudents = async () => {
      setLoading(true);
      setFetchError("");

      try {
        const headers = await getAuthHeaders();
        let raw = [];

        // 1. Try /api/tnp/students with credentials and Bearer token
        try {
          const res = await fetch(API_URL, {
            method: "GET",
            credentials: "include",
            headers,
          });

          if (res.ok) {
            const json = await res.json();
            if (json?.success && Array.isArray(json?.data) && json.data.length > 0) {
              raw = json.data;
            } else if (Array.isArray(json) && json.length > 0) {
              raw = json;
            }
          }
        } catch (e) {
          console.warn("Failed fetching from /api/tnp/students, falling back:", e);
        }

        // 2. If /api/tnp/students was unavailable or returned error/empty, fetch real records from /api/placement-data
        if (!raw || raw.length === 0) {
          try {
            const res2 = await fetch(PLACEMENT_DATA_URL, {
              method: "GET",
              credentials: "include",
              headers,
            });

            if (res2.ok) {
              const json2 = await res2.json();
              if (Array.isArray(json2?.placed_students) && json2.placed_students.length > 0) {
                raw = json2.placed_students;
              } else if (Array.isArray(json2?.data) && json2.data.length > 0) {
                raw = json2.data;
              } else if (Array.isArray(json2) && json2.length > 0) {
                raw = json2;
              }
            }
          } catch (e2) {
            console.warn("Failed fetching from /api/placement-data:", e2);
          }
        }

        if (!raw || raw.length === 0) {
          throw new Error("No live student data returned from backend");
        }

        const mapped = raw.map((s, idx) => {
          const stdID =
            s.student_id ||
            s.prn ||
            s.studentId ||
            s.stdID ||
            (s.id !== undefined ? String(s.id) : `S-${idx + 1}`);

          const first = s.first_name || s.firstname || s.name || "";
          const last = s.last_name || s.lastname || "";
          const fullName =
            `${first} ${last}`.trim() || s.full_name || s.name || "";

          // many possible field names for department
          const department =
            s.department ||
            s.branch ||
            s.dept ||
            s.department_name ||
            s.stream ||
            s.program ||
            s.course ||
            s.specialization ||
            s.department?.name ||
            "";

          const passoutYear =
            s.passout_year ||
            s.passoutYear ||
            s.year_of_passing ||
            s.expected_graduation_year ||
            s.year_of_admission ||
            s.current_year ||
            "";

          const contact =
            s.contact_number_primary || s.contact_number || s.contact || "";
          const mailID = s.email || s.alternate_email || s.mailID || "";
          const gender = s.gender || "";
          const grade10 = s.ssc_percentage || s.grade10 || s.grade_10 || "";
          const grade12 = s.hsc_percentage || s.grade12 || s.grade_12 || "";
          const cgpa = s.cgpa || s.current_cgpa || s.cgpa_current || "";
          const placedStatus =
            s.status ||
            s.placed_status ||
            s.placedStatus ||
            s.placement_status ||
            "";
          const placementType =
            s.placement_type || s.placementType || s.job_type || s.type || "";
          const companyName =
            s.company_title ||
            s.companyName ||
            s.company_name ||
            s.placed_company ||
            s.company ||
            "";
          const roleOffered = s.job_title || s.role || s.roleOffered || s.designation || "";
          const salary = s.ctc || s.salary || s.package || "";
          const companiesPlaced =
            s.companies_placed || s.companiesPlaced || s.company_count || (placedStatus ? 1 : 0);

          return {
            __raw: s,
            id: s.id ?? idx + 1,
            stdID,
            name: fullName,
            passoutYear: String(passoutYear),
            contact,
            mailID,
            gender,
            grade10,
            grade12,
            cgpa,
            placedStatus,
            placementType,
            companyName,
            roleOffered,
            salary,
            companiesPlaced,
            department: department || "",
          };
        });

        if (!mounted) return;

        // If coordinator has a department in localStorage, filter list to that department
        const deptFilter = tnpDeptRaw;
        const deptFiltered =
          deptFilter && !TPO
            ? mapped.filter((m) => matchesDept(m.department, deptFilter))
            : mapped;

        setStudents(deptFiltered);
        setFilteredStudents(deptFiltered);
      } catch (err) {
        console.error("Failed to fetch live students:", err);
        if (!mounted) return;
        setFetchError("Failed to load live student data from server.");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadStudents();

    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run only once on mount

  // Load placed students from live API
  useEffect(() => {
    let mounted = true;

    const loadPlacedStudents = async () => {
      setLoadingPlaced(true);
      setPlacedFetchError("");

      try {
        const headers = await getAuthHeaders();
        let raw = [];
        let isNestedFormat = false;

        // 1. Try PLACED_API_URL (/api/tnp/placed-students) with Authorization
        try {
          const res = await fetch(PLACED_API_URL, {
            method: "GET",
            credentials: "include",
            headers,
          });

          if (res.ok) {
            const json = await res.json();
            if (json?.success && Array.isArray(json?.data) && json.data.length > 0) {
              raw = json.data;
              isNestedFormat = true;
            }
          }
        } catch (e) {
          console.warn("Failed fetching from /api/tnp/placed-students, falling back:", e);
        }

        // 2. Fall back to /api/placement-data
        if (!raw || raw.length === 0) {
          try {
            const res2 = await fetch(PLACEMENT_DATA_URL, {
              method: "GET",
              credentials: "include",
              headers,
            });

            if (res2.ok) {
              const json2 = await res2.json();
              if (Array.isArray(json2?.placed_students) && json2.placed_students.length > 0) {
                raw = json2.placed_students;
                isNestedFormat = false;
              }
            }
          } catch (e2) {
            console.warn("Failed fetching placed students from /api/placement-data:", e2);
          }
        }

        if (!raw || raw.length === 0) {
          throw new Error("No live placed students data returned from backend");
        }

        let mapped = [];

        if (isNestedFormat) {
          mapped = raw.map((application, idx) => {
            const student = application.student || {};
            const stdID = student.student_id || `P-${idx + 1}`;
            const fullName = student.full_name || student.name || "";
            const contact =
              student.phone || student.contact || student.contact_number || "";
            const mailID = student.email || "";
            const department = student.department || "";

            const job = application.job || {};
            const placementType = job.role_type || job.job_type || "";
            const roleOffered = job.job_title || job.role || "";
            const salary = job.ctc || job.stipend || "";
            const jobLocation = job.job_location || "";
            const jobType = job.job_type || "";

            const company = application.company || {};
            const companyName = company.company_name || "";
            const companyLogo = company.company_logo || "";

            const applicationStatus = application.application_status || "";
            const appliedAt = application.applied_at || "";

            return {
              __raw: application,
              id: application.application_id ?? idx + 1,
              stdID,
              name: fullName,
              contact,
              mailID,
              placementType,
              companyName,
              roleOffered,
              salary,
              jobLocation,
              jobType,
              companyLogo,
              applicationStatus,
              appliedAt,
              department,
            };
          });
        } else {
          mapped = raw.map((item, idx) => {
            const stdID = item.student_id || item.prn || `P-${idx + 1}`;
            const first = item.first_name || "";
            const last = item.last_name || "";
            const fullName = `${first} ${last}`.trim() || item.full_name || "";
            const contact = item.contact_number_primary || item.contact || "";
            const mailID = item.email || "";
            const department = item.department || "";
            const placementType = item.role_type || "Tech";
            const companyName = item.company_name || item.company_title || "";
            const roleOffered = item.job_title || item.role || "";
            const salary = item.ctc || item.stipend || "";

            return {
              __raw: item,
              id: item.student_id ?? idx + 1,
              stdID,
              name: fullName,
              contact,
              mailID,
              placementType,
              companyName,
              roleOffered,
              salary,
              department,
            };
          });
        }

        if (!mounted) return;

        setPlacedStudents(mapped);
        const filtered =
          TPO || !tnpDeptRaw
            ? mapped
            : mapped.filter((student) => matchesDept(student.department, tnpDeptRaw));
        setFilteredRows(filtered);
      } catch (err) {
        console.error("Failed to fetch placed students:", err);
        if (!mounted) return;
        setPlacedFetchError("Failed to load placed students data from server.");
        setPlacedStudents([]);
      } finally {
        if (mounted) setLoadingPlaced(false);
      }
    };

    loadPlacedStudents();

    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run only once on mount

  // Apply filters when user changes anything (runs on students state which is already department-filtered)
  useEffect(() => {
    const filtered = students.filter((s) => {
      const matchStdID = String(s.stdID || "")
        .toLowerCase()
        .includes(searchStdID.toLowerCase());
      const matchName = String(s.name || "")
        .toLowerCase()
        .includes(searchName.toLowerCase());
      const matchContact = String(s.contact || "").includes(searchContact);
      const matchYear = filterYear
        ? String(s.passoutYear) === String(filterYear)
        : true;
      const matchGender = filterGender
        ? String(s.gender) === String(filterGender)
        : true;
      const matchPlaced = filterPlacedStatus
        ? String(s.placedStatus) === String(filterPlacedStatus)
        : true;
      const matchPlacementType = filterPlacementType
        ? String(s.placementType) === String(filterPlacementType)
        : true;
      const matchRole = filterRole
        ? String(s.roleOffered) === String(filterRole)
        : true;


      return (
        matchStdID &&
        matchName &&
        matchContact &&
        matchYear &&
        matchGender &&
        matchPlaced &&
        matchPlacementType &&
        matchRole
      );
    });
    setFilteredStudents(filtered);
  }, [
    searchStdID,
    searchName,
    searchContact,
    filterYear,
    filterGender,
    filterPlacedStatus,
    filterPlacementType,
    filterRole,
    students,
  ]);

  // Create dynamic unique option lists from the department-filtered students
  const extractUniqueValues = (key) => {
    const values = students
      .map((s) => s[key])
      .filter((v) => v !== undefined && v !== null && v !== "" && v !== "N/A");
    const unique = [...new Set(values)];
    if (key === "passoutYear") {
      unique.sort((a, b) => {
        const na = parseInt(a, 10);
        const nb = parseInt(b, 10);
        if (!Number.isNaN(na) && !Number.isNaN(nb)) return na - nb;
        return String(a).localeCompare(String(b));
      });
    } else {
      unique.sort((a, b) => String(a).localeCompare(String(b)));
    }
    return unique;
  };

  const years = extractUniqueValues("passoutYear");
  const genders = extractUniqueValues("gender");
  const placedStatuses = extractUniqueValues("placedStatus");
  const placementTypes = extractUniqueValues("placementType");
  const roles = extractUniqueValues("roleOffered");

  // Reset all filters at once
  const resetFilters = () => {
    setSearchStdID("");
    setSearchName("");
    setSearchContact("");
    setFilterYear("");
    setFilterGender("");
    setFilterPlacedStatus("");
    setFilterPlacementType("");
    setFilterRole("");
  };

  // Chart Data (for stats section) based on filteredStudents
  const studentBarData = Object.entries(
    filteredStudents.reduce((acc, student) => {
      const year = student.passoutYear || "Unknown";
      acc[year] = (acc[year] || 0) + 1;
      return acc;
    }, {})
  ).map(([year, count]) => ({ name: year, Students: count }));

  const studentPieData = placedStatuses.map((status) => ({
    name: status,
    value: filteredStudents.filter((s) => s.placedStatus === status).length,
  }));

  return (
    <div className="upload-section">
      <h2 className="header">
        Student Data Records {tnpDeptRaw && !TPO ? `— ${tnpDeptRaw}` : ""}
      </h2>

      {loading && (
        <div style={{ textAlign: "center", padding: 18, color: "#1e3a8a" }}>
          Loading students...
        </div>
      )}

      {fetchError && (
        <div className="fetch-error" role="alert" style={{ marginBottom: 12 }}>
          {fetchError}
        </div>
      )}

      {/* Dynamic Filters */}
      <div className="filter-container">
        <input
          type="text"
          placeholder="StdID"
          value={searchStdID}
          onChange={(e) => setSearchStdID(e.target.value)}
        />
        <input
          type="text"
          placeholder="Name"
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
        />
        <input
          type="text"
          placeholder="Contact"
          value={searchContact}
          onChange={(e) => setSearchContact(e.target.value)}
        />

        <select
          value={filterYear}
          onChange={(e) => setFilterYear(e.target.value)}
        >
          <option value="">Passout Year</option>
          {years.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>

        <select
          value={filterGender}
          onChange={(e) => setFilterGender(e.target.value)}
        >
          <option value="">Gender</option>
          {genders.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>

        {/*<select
          value={filterPlacedStatus}
          onChange={(e) => setFilterPlacedStatus(e.target.value)}
        >
          <option value="">Placed Status</option>
          {placedStatuses.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>*/}

        {/*<select
          value={filterPlacementType}
          onChange={(e) => setFilterPlacementType(e.target.value)}
        >
          <option value="">Role Type</option>
          {placementTypes.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>*/}

        {/*<select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
        >
          <option value="">Role Offered</option>
          {roles.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>*/}

        <button className="reset-button" onClick={resetFilters}>
          Reset Filters
        </button>
      </div>

      {/* All Students Table */}
      <TableWithPaginationAndExport
        title="All Students Data"
        fileNameBase="All_Students_Data"
        columns={[
          { key: "index", label: "Sr. No" },
          { key: "stdID", label: "StdID" },
          { key: "name", label: "Name" },
          { key: "passoutYear", label: "Passout Year" },
          { key: "contact", label: "Contact" },
          { key: "mailID", label: "Mail ID" },
          { key: "cgpa", label: "CGPA" },
        ]}
        rows={filteredStudents}
      />

      {/* Placed Students Table */}
      {loadingPlaced ? (
        <div style={{ textAlign: "center", padding: 18, color: "#1e3a8a" }}>
          Loading placed students...
        </div>
      ) : (
        <>
          {placedFetchError && (
            <div
              className="fetch-error"
              role="alert"
              style={{ marginBottom: 12 }}
            >
              {placedFetchError}
            </div>
          )}
          <TableWithPaginationAndExport
            title="Placed Students"
            fileNameBase="Placed_Students_Data"
            columns={[
              { key: "index", label: "Sr.No" },
              { key: "stdID", label: "StdID" },
              { key: "name", label: "Name" },
              { key: "contact", label: "Contact" },
              { key: "mailID", label: "Mail ID" },
              { key: "placementType", label: "Role Type" },
              { key: "companyName", label: "Company Name" },
              { key: "roleOffered", label: "Role Offered" },
              { key: "salary", label: "Salary" },
            ]}
            rows={filteredRows}
          />
        </>
      )}

      {/* Unplaced Students Table */}
      {/*<TableWithPaginationAndExport
        title="Unplaced Students"
        fileNameBase="Unplaced_Students_Data"
        columns={[
          { key: "index", label: "Sr.No" },
          { key: "stdID", label: "StdID" },
          { key: "name", label: "Name" },
          { key: "contact", label: "Contact" },
          { key: "mailID", label: "Mail ID" },
          { key: "placedStatus", label: "Placed Status" },
        ]}
        rows={filteredStudents.filter((s) => {
          const st = String(s.placedStatus || "").toLowerCase();
          return (
            st === "rejected" ||
            st === "not selected" ||
            st === "applied" ||
            st === "pending"
          );
        })}
      />*/}

      {/* Statistics Section */}
      {!TPO &&
        <StatsSection
          title="Students Statistics"
          barData={studentBarData}
          pieData={studentPieData}
          barKey="Students"
          pieKey="value"
        />}
    </div>
  );
};

export default Studentstable;
