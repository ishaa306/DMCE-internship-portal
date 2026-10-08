import React, { useState, useEffect } from "react";
import "./Tablestyling.css";
import StatsSection from "../components/StatisticsSection";
import TableWithPaginationAndExport from "./TableWithPaginationAndExport";

const JOBS_API = "https://placement-portal-backend.ramshekade20.workers.dev/api/tnp/jobs";


const Companytable = () => {
  // Data and UI state
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filter state (same keys used by UI)
  const [filters, setFilters] = useState({
    name: "",
    field: "",
    role: "",
    eligibleStudents: "",
    placedStudents: "",
    location: "",
    salary: "",
    driveMonth: "",
    driveYear: "",
    rounds: "",
    tenth: "",
    twelfth: "",
    cgpa: "",
    ktsAllowed: "",
  });

  // refreshKey allows manual re-fetch in future if needed
  const [refreshKey, setRefreshKey] = useState(0);

  // -------------------------
  // Filtering logic (runs every render when filters or data changes)
  // -------------------------
  useEffect(() => {
    let temp = data;

    if (filters.name)
      temp = temp.filter((d) =>
        (d.name || "").toLowerCase().includes(filters.name.toLowerCase())
      );

    if (filters.field) temp = temp.filter((d) => d.field === filters.field);

    if (filters.role)
      temp = temp.filter((d) =>
        (d.role || "").toLowerCase().includes(filters.role.toLowerCase())
      );

    if (filters.location)
      temp = temp.filter((d) =>
        (d.location || "").toLowerCase().includes(filters.location.toLowerCase())
      );

    if (filters.eligibleStudents) {
      const [min, max] = filters.eligibleStudents.split("-").map(Number);
      temp = temp.filter(
        (d) =>
          (d.eligibleStudents ?? 0) >= min && (max ? (d.eligibleStudents ?? 0) <= max : true)
      );
    }

    if (filters.placedStudents) {
      const [min, max] = filters.placedStudents.split("-").map(Number);
      temp = temp.filter(
        (d) => (d.placedStudents ?? 0) >= min && (max ? (d.placedStudents ?? 0) <= max : true)
      );
    }

    if (filters.salary) {
      const [min, max] = filters.salary.split("-").map(Number);
      temp = temp.filter((d) => {
        const salNumeric = parseFloat(String(d.salary).replace(/[^\d.]/g, "")) || 0;
        if (isNaN(min)) return true;
        if (!max || isNaN(max)) return salNumeric >= min;
        return salNumeric >= min && salNumeric <= max;
      });
    }

    if (filters.driveMonth)
      temp = temp.filter(
        (d) =>
          d.driveDate && new Date(d.driveDate).getMonth() + 1 === Number(filters.driveMonth)
      );

    if (filters.driveYear)
      temp = temp.filter(
        (d) => d.driveDate && new Date(d.driveDate).getFullYear() === Number(filters.driveYear)
      );

    if (filters.rounds)
      temp = temp.filter((d) => d.rounds === Number(filters.rounds));

    // eligibility filters
    if (filters.tenth)
      temp = temp.filter((d) => (d.eligibility?.tenth ?? 0) >= Number(filters.tenth));

    if (filters.twelfth)
      temp = temp.filter(
        (d) => (d.eligibility?.twelfth ?? 0) >= Number(filters.twelfth)
      );

    if (filters.cgpa)
      temp = temp.filter((d) => (d.eligibility?.cgpa ?? 0) >= Number(filters.cgpa));

    if (filters.ktsAllowed)
      temp = temp.filter(
        (d) => {
          // ktsAllowed might be "No"/"Yes" in backend. Normalize compare by number of allowed KTs.
          const allowed = Number.isFinite(Number(d.eligibility?.ktsAllowed))
            ? Number(d.eligibility.ktsAllowed)
            : (String(d.ktsAllowed || d.eligibility?.ktsAllowed || "No").toLowerCase() === "no" ? 0 : 1);
          return allowed <= Number(filters.ktsAllowed);
        }
      );

    setFilteredData(temp);
  }, [filters, data]);
  const formatToIST = (input) => {
    if (!input) return "";
    const d = input instanceof Date ? input : new Date(input);
    if (isNaN(d.getTime())) return String(input);
    const datePart = d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      timeZone: "Asia/Kolkata",
    });
    const timePart = d.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      // hour12: true,
      timeZone: "Asia/Kolkata",
    });
    return `${datePart} ${timePart}`;
  };
  // -------------------------
  // Fetching jobs from API and normalizing using your actual backend fields
  // Backend fields you provided include:
  // batch, company_id, ctc, drive_date, eligible_branches, interview_mode,
  // job_description, job_id, job_location, job_title, job_type, kt_allowed,
  // min_cgpa, min_tenth, min_twelfth, openings, perks, role_type, selection_rounds,
  // skills_required, status, stipend, created_at, updated_at
  // -------------------------
  useEffect(() => {
    let mounted = true;
    const controller = new AbortController();

    const fetchJobs = async () => {
      setLoading(true);
      setError("");
      try {
        const resp = await fetch(JOBS_API, {
          method: "GET",
          credentials: "include",
          headers: { Accept: "application/json" },
          signal: controller.signal,
        });

        if (!mounted) return;

        if (!resp.ok) {
          const txt = await resp.text().catch(() => "");
          throw new Error(txt ? `Server error: ${txt}` : `Failed to fetch jobs (${resp.status})`);
        }

        const contentType = resp.headers.get("content-type") || "";
        let payload = null;
        if (contentType.includes("application/json")) {
          payload = await resp.json();
        } else {
          const txt = await resp.text();
          try {
            payload = JSON.parse(txt);
          } catch {
            payload = null;
          }
        }

        // Find array of jobs in payload
        let jobsArray = [];
        if (Array.isArray(payload)) {
          jobsArray = payload;
        } else if (payload && Array.isArray(payload.jobs)) {
          jobsArray = payload.jobs;
        } else if (payload && Array.isArray(payload.data)) {
          jobsArray = payload.data;
        } else if (payload && typeof payload === "object") {
          const arr = Object.values(payload).find((v) => Array.isArray(v));
          if (arr) jobsArray = arr;
        }

        // Normalize each job using the provided backend field names
        const normalized = jobsArray.map((j, idx) => {
          // Convert backend values to fields used by the UI
          const driveDateRaw = j.drive_date ?? j.driveDate ?? j.driveDateRaw ?? "";
          const driveDateFormatted = driveDateRaw ? formatToIST(driveDateRaw) : "";

          // Determine ktsAllowed numeric value:
          // backend has kt_allowed: "No" or maybe "Yes" or numeric
          let ktsAllowedNumeric = 0;
          if (j.kt_allowed !== undefined && j.kt_allowed !== null) {
            const kt = String(j.kt_allowed).trim();
            if (/^\d+$/.test(kt)) ktsAllowedNumeric = Number(kt);
            else ktsAllowedNumeric = kt.toLowerCase() === "no" ? 0 : 1;
          } else if (j.ktsAllowed !== undefined) {
            if (typeof j.ktsAllowed === "number") ktsAllowedNumeric = j.ktsAllowed;
            else ktsAllowedNumeric = String(j.ktsAllowed).toLowerCase() === "no" ? 0 : 1;
          }

          // min cgpa might be null — fallback to 0
          const minCgpaNumeric = j.min_cgpa ? Number(j.min_cgpa) : 0;


          // salary: backend uses ctc or stipend for stipend/internship. Use ctc when present else stipend.
          const stipendVal = j.stipend ?? "";
          const ctcVal = j.ctc ?? "";


          // eligibleStudents / placedStudents: derive if not provided
          const eligibleStudents = Number(j.applied_count ?? j.openings ?? 0); // show applied if available
          const placedStudents = Number(j.selected_count ?? j.placed_count ?? j.placedStudents ?? 0);

          return {
            id: j.job_id ?? j.jobId ?? j.id ?? idx,
            // show company name when available, otherwise fallback to company_id (as before)
            name: j.company_name ?? j.companyName ?? (j.company_id ? `Company ${j.company_id}` : "Unknown Company"),
            // 'field' can be derived from role_type or industry
            field: j.role_type ?? j.industry ?? j.field ?? "",
            // prefer company email if provided
            mail: j.company_email ?? j.contact_email ?? j.email ?? j.mail ?? "",
            role: j.job_title ?? j.jobTitle ?? j.role ?? "",
            eligibleStudents,
            placedStudents,
            location: j.job_location ?? j.jobLocation ?? j.job_location ?? "",
            // store both stipend and ctc as separate fields; for the "salary" / displayed column we'll use stipend only
            stipend: stipendVal,
            ctc: ctcVal,
            salary: stipendVal, // keep existing 'salary' key if other code expects it, set to stipend per your request
            driveDate: driveDateFormatted,
            rounds: Number(j.selection_rounds ? 1 : (j.selection_rounds ?? 0)) || (j.selection_rounds ? 1 : 0),
            selection_rounds: j.selection_rounds ?? j.selection_rounds ?? "",
            eligibility: {
              tenth: Number(j.min_tenth ?? j.minTenth ?? 0) || 0,
              twelfth: Number(j.min_twelfth ?? j.minTwelfth ?? 0) || 0,
              cgpa: Number(j.min_cgpa ?? j.minCgpa ?? minCgpaNumeric) || 0,
              ktsAllowed: ktsAllowedNumeric,
            },
            raw: j,
            job_type: j.job_type ?? j.jobType ?? "",
            interview_mode: j.interview_mode ?? j.interviewMode ?? "",
            perks: j.perks ?? "",
            skills_required: j.skills_required ?? j.skillsRequired ?? "",
            status: j.status ?? "active",
            batch: j.batch ?? "",
            created_at: j.created_at ?? j.createdAt ?? "",
            updated_at: j.updated_at ?? j.updatedAt ?? "",
            openings: Number(j.openings ?? 0),
          };
        });

        if (mounted) {
          console.info("Fetched jobs (normalized):", normalized); // print to console as requested
          setData(normalized);
          setFilteredData(normalized);
        }
      } catch (err) {
        if (mounted) {
          console.error("Failed to load jobs:", err);
          setError(err.message || "Unable to fetch company/job data");
          setData([]);
          setFilteredData([]);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchJobs();

    return () => {
      mounted = false;
      controller.abort();
    };
  }, [refreshKey]);

  // -------------------------
  // UI helpers & handlers
  // -------------------------
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const resetFilters = () => {
    setFilters({
      name: "",
      field: "",
      role: "",
      eligibleStudents: "",
      placedStudents: "",
      location: "",
      salary: "",
      driveMonth: "",
      driveYear: "",
      rounds: "",
      tenth: "",
      twelfth: "",
      cgpa: "",
      ktsAllowed: "",
    });
  };

  // extract unique values for filter selects
  const extractUniqueValues = (key, useSubField = false) => {
    const values = useSubField ? data.map((d) => d.eligibility[key]) : data.map((d) => d[key]);
    return [...new Set(values.filter((v) => v !== undefined && v !== ""))].sort((a, b) => {
      if (typeof a === "number" && typeof b === "number") return a - b;
      return String(a).localeCompare(String(b));
    });
  };

  const uniqueFields = extractUniqueValues("field");
  const uniqueRoles = extractUniqueValues("role");
  const uniqueLocations = extractUniqueValues("location");
  const uniqueRounds = extractUniqueValues("rounds");

  // -------------------------
  // Early UI states
  // -------------------------
  if (loading) {
    return <div style={{ padding: 24, textAlign: "center" }}>Loading company records...</div>;
  }

  if (error) {
    return <div style={{ padding: 24, textAlign: "center", color: "crimson" }}>{error}</div>;
  }

  // -------------------------
  // Prepare rows and stats for display
  // -------------------------
  const flattenedRows = filteredData.map((item, index) => ({
    index: index + 1,
    ...item,
    "eligibility.tenth": item.eligibility?.tenth ?? "-",
    "eligibility.twelfth": item.eligibility?.twelfth ?? "-",
    "eligibility.cgpa": item.eligibility?.cgpa ?? "-",
    "eligibility.ktsAllowed": item.eligibility?.ktsAllowed ?? "-",
  }));

  const barData = filteredData.map((c) => ({
    name: c.name,
    placed: c.placedStudents,
  }));

  const fieldCount = Object.values(
    filteredData.reduce((acc, company) => {
      const key = company.field || "Other";
      acc[key] = acc[key] ? { name: key, value: acc[key].value + 1 } : { name: key, value: 1 };
      return acc;
    }, {})
  );

  // -------------------------
  // Render
  // -------------------------
  return (
    <div className="upload-section">
      <h2 className="header">Company Data Records</h2>

      {/* Filters */}
      <div className="filter-container">
        <input type="text" placeholder="Company Name" name="name" value={filters.name} onChange={handleFilterChange} />

        <select name="field" value={filters.field} onChange={handleFilterChange}>
          <option value="">Field</option>
          {uniqueFields.map((f) => (
            <option key={String(f)} value={f}>
              {f}
            </option>
          ))}
        </select>

        <select name="role" value={filters.role} onChange={handleFilterChange}>
          <option value="">Role Offered</option>
          {uniqueRoles.map((r) => (
            <option key={String(r)} value={r}>
              {r}
            </option>
          ))}
        </select>

        <select name="location" value={filters.location} onChange={handleFilterChange}>
          <option value="">Location</option>
          {uniqueLocations.map((loc) => (
            <option key={String(loc)} value={loc}>
              {loc}
            </option>
          ))}
        </select>

        <select name="eligibleStudents" value={filters.eligibleStudents} onChange={handleFilterChange}>
          <option value="">Eligible Students</option>
          {["0-50", "51-100", "101-200", "201-500"].map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>

        <select name="placedStudents" value={filters.placedStudents} onChange={handleFilterChange}>
          <option value="">Placed Students</option>
          {["0-20", "21-50", "51-100"].map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>

        <select name="salary" value={filters.salary} onChange={handleFilterChange}>
          <option value="">Salary (LPA)</option>
          <option value="0-5">0 - 5 LPA</option>
          <option value="5-10">5 - 10 LPA</option>
          <option value="10-20">10 - 20 LPA</option>
          <option value="20-50">20+ LPA</option>
        </select>

        <select name="driveMonth" value={filters.driveMonth} onChange={handleFilterChange}>
          <option value="">Drive Month</option>
          {[...Array(12)].map((_, i) => (
            <option key={i + 1} value={i + 1}>
              {new Date(0, i).toLocaleString("default", { month: "long" })}
            </option>
          ))}
        </select>

        <input type="number" placeholder="Drive Year" name="driveYear" value={filters.driveYear} onChange={handleFilterChange} />

        <select name="rounds" value={filters.rounds} onChange={handleFilterChange}>
          <option value="">Rounds</option>
          {uniqueRounds.map((r) => (
            <option key={String(r)} value={r}>
              {r}
            </option>
          ))}
        </select>

        <input type="number" placeholder="10th %" name="tenth" value={filters.tenth} onChange={handleFilterChange} />
        <input type="number" placeholder="12th %" name="twelfth" value={filters.twelfth} onChange={handleFilterChange} />
        <input type="number" placeholder="CGPA" name="cgpa" value={filters.cgpa} onChange={handleFilterChange} step="0.1" />

        <select name="ktsAllowed" value={filters.ktsAllowed} onChange={handleFilterChange}>
          <option value="">KT's Allowed</option>
          {[0, 1, 2].map((k) => (
            <option key={k} value={k}>
              {k}
            </option>
          ))}
        </select>

        <button className="reset-button" onClick={resetFilters}>
          Reset Filters
        </button>
      </div>

      {/* Table */}
      <TableWithPaginationAndExport
        title="Company Records Table"
        fileNameBase="Company_Data"
        columns={[
          { key: "index", label: "Sr.No" },
          { key: "name", label: "Company Name" },        // changed label
          { key: "field", label: "Role Type" },
          { key: "mail", label: "Mail ID" },
          { key: "role", label: "Role Offered" },
          { key: "job_type", label: "Job Type" },
          { key: "eligibleStudents", label: "Applied Students" },
          { key: "placedStudents", label: "Students Placed" },
          { key: "location", label: "Job Location" },
          { key: "stipend", label: "Stipend" },           // show stipend only
          { key: "ctc", label: "CTC" },                   // show CTC in its own column (replaces rounds column)
          { key: "driveDate", label: "Drive Date" },
          // removed the previous rounds column from the visible table
          { key: "eligibility.tenth", label: "10th %" },
          { key: "eligibility.twelfth", label: "12th %" },
          { key: "eligibility.cgpa", label: "CGPA" },
          { key: "eligibility.ktsAllowed", label: "KT's Allowed" },
        ]}
        rows={flattenedRows}
      />

      {/* Stats */}
      <StatsSection title="Company Placement Statistics" barData={barData} barKey="placed" pieData={fieldCount} pieKey="value" />
    </div>
  );
};

export default Companytable;