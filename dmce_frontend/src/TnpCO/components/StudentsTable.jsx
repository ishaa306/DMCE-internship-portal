import React, { useState, useEffect } from "react";
import "./Tablestyling.css";
//import sampleData from "../sampleData";
//import sampleDataall from "../../TPO/sampledataall";
import StatsSection from "./StatisticsSection";
import TableWithPaginationAndExport from "./TableWithPaginationAndExport";
import { useLocation } from "react-router-dom";
// import { set } from "react-datepicker/dist/dist/date_utils.js";

const API_URL = "https://placement-portal-backend.ramshekade20.workers.dev/api/tnp/students";
const PLACED_API_URL = "https://placement-portal-backend.ramshekade20.workers.dev/api/tnp/placed-students";

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

  // Load data from API (fallback to sampleData)
  useEffect(() => {
    let mounted = true;

    const loadStudents = async () => {
      setLoading(true);
      setFetchError("");


      try {

        const res = await fetch(API_URL, {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        });

        if (res.status === 401) {
          // If unauthorized, redirect to login
          window.location.href = "/";
          return;
        }

        if (!res.ok) {
          throw new Error(`API returned ${res.status}`);
        }
        const json = await res.json();

        // The API response uses { success: true, data: [ ... ] }
        const raw = Array.isArray(json?.data)
          ? json.data
          : Array.isArray(json)
            ? json
            : [];

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
            s.placed_status ||
            s.placedStatus ||
            s.status ||
            s.placement_status ||
            "";
          const placementType =
            s.placement_type || s.placementType || s.job_type || s.type || "";
          const companyName =
            s.company_title ||
            s.companyName ||
            s.placed_company ||
            s.company ||
            "";
          const roleOffered = s.role || s.roleOffered || s.designation || "";
          const salary = s.salary || s.ctc || s.package || "";
          const companiesPlaced =
            s.companies_placed || s.companiesPlaced || s.company_count || 0;

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
        const deptFiltered = deptFilter && !TPO
          ? mapped.filter((m) => matchesDept(m.department, deptFilter))
          : mapped;

        setStudents(deptFiltered);
        setFilteredStudents(deptFiltered);
      } catch (err) {
        console.error("Failed to fetch students:", err);
        setFetchError("Failed to load live data — showing sample data.");

        // fallback to sample data (map to same shape)
        const source = TPO ? sampleDataall.students : sampleData.students;
        console.log("source", source)


        const fallback = (source || []).map((s, idx) => {
          const department =
            s.department ||
            s.branch ||
            s.dept ||
            s.department_name ||
            s.stream ||
            s.program ||
            s.course ||
            s.specialization ||
            "";
          return {
            __raw: s,
            id: s.id ?? idx + 1,
            stdID: s.stdID || s.student_id || s.prn || `S-${idx + 1}`,
            name: s.name || `${s.first_name || ""} ${s.last_name || ""}`.trim(),
            passoutYear:
              s.passoutYear || s.passout_year || s.current_year || "",
            contact: s.contact || s.contact_number || "",
            mailID: s.mailID || s.email || "",
            gender: s.gender || "",
            grade10: s.grade10 || s.ssc_percentage || "",
            grade12: s.grade12 || s.hsc_percentage || "",
            cgpa: s.cgpa || "",
            placedStatus: s.placedStatus || "",
            placementType: s.placementType || "",
            companyName: s.company_name || s.companyName || "",
            roleOffered: s.roleOffered || "",
            salary: s.salary || "",
            companiesPlaced: s.companiesPlaced || 0,
            department: department || "",
          };
        });

        const deptFilter = tnpDeptRaw;
        const deptFiltered = deptFilter && !TPO
          ? fallback.filter((m) => matchesDept(m.department, deptFilter))
          : fallback;

        if (!mounted) return;
        setStudents(deptFiltered);
        setFilteredStudents(deptFiltered);
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

  // Load placed students from separate API
  useEffect(() => {
    let mounted = true;

    const loadPlacedStudents = async () => {
      setLoadingPlaced(true);
      setPlacedFetchError("");

      try {
        const res = await fetch(PLACED_API_URL, {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        });

        if (res.status === 401) {
          window.location.href = "/";
          return;
        }

        if (!res.ok) {
          throw new Error(`Placed API returned ${res.status}`);
        }

        const json = await res.json();

        // API returns array of application objects with nested student, job, company
        const raw = Array.isArray(json?.data)
          ? json.data
          : Array.isArray(json)
            ? json
            : [];

        // Map the nested structure to flat table rows
        const mapped = raw.map((application, idx) => {
          // Extract student info
          const student = application.student || {};
          const stdID = student.student_id || `P-${idx + 1}`;
          const fullName = student.full_name || student.name || "";
          const contact =
            student.phone || student.contact || student.contact_number || "";
          const mailID = student.email || "";
          const department = student.department;

          // Extract job info
          const job = application.job || {};
          const placementType = job.role_type || job.job_type || "";
          const roleOffered = job.job_title || job.role || "";
          const salary = job.ctc || job.stipend || "";
          const jobLocation = job.job_location || "";
          const jobType = job.job_type || "";

          // Extract company info
          const company = application.company || {};
          const companyName = company.company_name || "";
          const companyLogo = company.company_logo || "";

          // Extract application info
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
            department, // Placed API doesn't return department, would need to join with students API
          };
        });

        if (!mounted) return;

        // Note: Department filtering is not possible with this API structure
        // unless we fetch the full student profile separately
        // For now, showing all placed students
        console.log("✅ Loaded placed students:", mapped.length);
        setPlacedStudents(mapped);

        const filtered = TPO ? mapped : mapped.filter((student) => matchesDept(student.department, tnpDeptRaw));
        setFilteredRows(filtered);

      } catch (err) {
        console.error("Failed to fetch placed students:", err);
        if (!mounted) return;
        setPlacedFetchError("Failed to load placed students data.");
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
