import React, { useMemo, useState, useEffect } from "react";
import {
    BarChart,
    Bar,
    Line,
    ComposedChart,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    CartesianGrid,
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
} from "recharts";
import {
    FaUserGraduate,
    FaUserCheck,
    FaUserTimes,
    FaPercentage,
    FaBuilding,
    FaBriefcase,
    FaTrophy,
    FaChartPie,
    FaChartBar,
    FaChartLine,
    FaFilter,
    FaCalendarAlt,
    FaMoneyBillWave,
    FaCheckCircle,
} from "react-icons/fa";

import "./ViewAnalytics.css";
import CollegeHeader from "../../../shared/CollegeHeader";

/* Curated color palette */
const BRAND_COLORS = [
    "#2563eb", // Primary Royal Blue
    "#10b981", // Emerald Green
    "#f59e0b", // Warm Amber
    "#8b5cf6", // Purple
    "#06b6d4", // Cyan
    "#ec4899", // Pink
    "#f97316", // Orange
    "#6366f1", // Indigo
];

/* Department full forms dictionary */
const DEPT_FULL_FORM = {
    IT: "Information Technology",
    CS: "Computer Science & Engineering",
    CO: "Computer Engineering",
    AI: "Artificial Intelligence",
    AIDS: "AI & Data Science",
    EXTC: "Electronics & Telecommunication",
    CIVIL: "Civil Engineering",
    MECH: "Mechanical Engineering",
    CHEM: "Chemical Engineering",
};

const getDeptFullName = (dept) => {
    if (!dept) return "Unknown";
    return DEPT_FULL_FORM[dept] || dept;
};

const getDeptShortName = (dept) => {
    if (!dept) return "Other";
    if (dept.length <= 6) return dept;
    const lower = dept.toLowerCase();
    if (lower.includes("artificial intelligence") || lower.includes("ai &")) return "AI & DS";
    if (lower.includes("computer")) return "Computer";
    if (lower.includes("information technology")) return "IT";
    if (lower.includes("mechanical")) return "Mech";
    if (lower.includes("civil")) return "Civil";
    if (lower.includes("chemical")) return "Chem";
    if (lower.includes("telecommunication")) return "EXTC";
    return dept.length > 14 ? dept.substring(0, 12) + "…" : dept;
};

/* Custom Recharts Tooltip for ERP Design */
const CustomERPTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="erp-tooltip-card">
                {label && <div className="erp-tooltip-title">{label}</div>}
                {payload.map((entry, index) => {
                    const color = entry.color || entry.fill || "#2563eb";
                    return (
                        <div key={`tooltip-item-${index}`} className="erp-tooltip-row">
                            <span
                                className="erp-tooltip-dot"
                                style={{ backgroundColor: color }}
                            />
                            <span>
                                {entry.name}: <strong>{entry.value}</strong>
                            </span>
                        </div>
                    );
                })}
            </div>
        );
    }
    return null;
};

const API_BASE_URL = "https://placement-portal-backend.ramshekade20.workers.dev/api";

const getAuthToken = () => {
    return (
        localStorage.getItem("tpo_token") ||
        localStorage.getItem("token") ||
        localStorage.getItem("tnp_token") ||
        localStorage.getItem("authToken") ||
        ""
    );
};

const ViewAnalytics = () => {
    const [mode, setMode] = useState("student");
    const [selectedDept, setSelectedDept] = useState("All");
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    /* ================================================================
       Fetch Data from Backend (Preserves existing API and database logic)
       ================================================================ */
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const token = getAuthToken();
                const headers = {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                };
                if (token) headers["Authorization"] = `Bearer ${token}`;

                let placedStudents = [];
                // 1. Fetch placed students
                try {
                    const placedResponse = await fetch(`${API_BASE_URL}/tnp/placed-students?limit=10000`, {
                        credentials: "include",
                        headers,
                    });
                    if (placedResponse.ok) {
                        const placedData = await placedResponse.json();
                        placedStudents = placedData.data || [];
                    }
                } catch (e) {
                    console.warn("Failed fetching /tnp/placed-students:", e);
                }

                let allStudents = [];
                // 2. Fetch all student profiles
                try {
                    const studentsResponse = await fetch(`${API_BASE_URL}/tnp/students?limit=10000`, {
                        credentials: "include",
                        headers,
                    });
                    if (studentsResponse.ok) {
                        const studentData = await studentsResponse.json();
                        allStudents = studentData.data || [];
                    }
                } catch (e) {
                    console.warn("Failed fetching /tnp/students:", e);
                }

                // 3. Fall back to /api/placement-data if empty
                if (allStudents.length === 0 || placedStudents.length === 0) {
                    try {
                        const placementRes = await fetch(`${API_BASE_URL}/placement-data`, {
                            credentials: "include",
                            headers,
                        });
                        if (placementRes.ok) {
                            const pData = await placementRes.json();
                            const pList = pData.placed_students || [];
                            if (allStudents.length === 0) {
                                allStudents = pList;
                            }
                            if (placedStudents.length === 0) {
                                placedStudents = pList.map((p, idx) => ({
                                    application_id: idx + 1,
                                    student: {
                                        student_id: p.student_id,
                                        full_name: `${p.first_name || ""} ${p.last_name || ""}`.trim(),
                                        email: p.email,
                                        phone: p.contact_number_primary,
                                        department: p.department,
                                        expected_graduation_year: p.expected_graduation_year,
                                    },
                                    company: {
                                        company_name: p.company_name,
                                        company_title: p.company_name,
                                    },
                                    job: {
                                        ctc: p.ctc,
                                        stipend: p.stipend,
                                        job_title: p.job_title,
                                        batch: p.expected_graduation_year,
                                    },
                                    ctc: p.ctc,
                                }));
                            }
                        }
                    } catch (e) {
                        console.warn("Failed fetching /placement-data:", e);
                    }
                }

                // Merge data: combine student profiles with placement status & company info
                const mergedStudents = allStudents.map((student) => {
                    const sId = student.student_id || student.id;
                    const placedStudent = placedStudents.find(
                        (p) => (p.student?.student_id || p.student_id) === sId
                    );
                    const name =
                        student.full_name ||
                        `${student.first_name || ""} ${student.middle_name || ""} ${student.last_name || ""}`.trim();

                    const passoutYear =
                        student.expected_graduation_year ||
                        student.year_of_admission ||
                        student.passoutYear ||
                        placedStudent?.job?.batch ||
                        student.batch ||
                        "2026";

                    // Safely parse CTC numeric value if available in backend response
                    let rawCtc = placedStudent?.job?.ctc ?? placedStudent?.ctc ?? student.ctc ?? null;
                    let numericCtc = null;
                    if (rawCtc !== null && rawCtc !== undefined && rawCtc !== "") {
                        const parsed = parseFloat(String(rawCtc).replace(/[^\d.]/g, ""));
                        if (!isNaN(parsed) && parsed > 0) numericCtc = parsed;
                    }

                    return {
                        id: sId,
                        name: name || sId,
                        department: student.department || placedStudent?.student?.department || "Unknown",
                        passoutYear: String(passoutYear),
                        placedStatus:
                            placedStudent ||
                                student.status === "selected" ||
                                student.status === "placed"
                                ? "Selected"
                                : "Not Placed",
                        companyName:
                            placedStudent?.company?.company_title ||
                            placedStudent?.company?.company_name ||
                            student.company_name ||
                            placedStudent?.job?.company_title ||
                            null,
                        ctc: numericCtc,
                        jobTitle:
                            placedStudent?.job?.job_title ||
                            placedStudent?.job_title ||
                            student.job_title ||
                            null,
                    };
                });

                // Ensure any placed student not present in allStudents profile is also included
                const existingIds = new Set(mergedStudents.map((s) => s.id));
                placedStudents.forEach((p) => {
                    const sId = p.student?.student_id || p.student_id || p.id;
                    if (sId && !existingIds.has(sId)) {
                        const name =
                            p.student?.full_name ||
                            `${p.first_name || ""} ${p.last_name || ""}`.trim() ||
                            sId;
                        const passoutYear =
                            p.expected_graduation_year ||
                            p.job?.batch ||
                            p.student?.expected_graduation_year ||
                            "2026";
                        let rawCtc = p.job?.ctc ?? p.ctc ?? null;
                        let numericCtc = null;
                        if (rawCtc) {
                            const parsed = parseFloat(String(rawCtc).replace(/[^\d.]/g, ""));
                            if (!isNaN(parsed) && parsed > 0) numericCtc = parsed;
                        }

                        mergedStudents.push({
                            id: sId,
                            name,
                            department: p.student?.department || p.department || "Unknown",
                            passoutYear: String(passoutYear),
                            placedStatus: "Selected",
                            companyName:
                                p.company?.company_title ||
                                p.company?.company_name ||
                                p.company_name ||
                                null,
                            ctc: numericCtc,
                            jobTitle: p.job?.job_title || p.job_title || null,
                        });
                        existingIds.add(sId);
                    }
                });

                setStudents(mergedStudents);
                setError(null);
            } catch (err) {
                console.error("Error fetching analytics data:", err);
                setError(err.message);
                setStudents([]);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    /* ================================================================
       Department List (Dynamic)
       ================================================================ */
    const departments = useMemo(() => {
        const deptList = students.map((s) => s.department).filter(Boolean);
        return ["All", ...new Set(deptList)];
    }, [students]);

    /* ================================================================
       Department Filtered Dataset
       ================================================================ */
    const filteredStudents = useMemo(() => {
        if (selectedDept === "All") return students;
        return students.filter((s) => s.department === selectedDept);
    }, [selectedDept, students]);

    /* ================================================================
       STUDENT-WISE METRICS & CHARTS
       ================================================================ */
    const studentKPIs = useMemo(() => {
        const total = filteredStudents.length;
        const placed = filteredStudents.filter((s) => s.placedStatus === "Selected").length;
        const notPlaced = total - placed;
        const percent = total > 0 ? ((placed / total) * 100).toFixed(1) : "0.0";
        return { total, placed, notPlaced, percent };
    }, [filteredStudents]);

    // Donut chart: Placed vs Not Placed
    const donutData = useMemo(() => {
        return [
            { name: "Placed", value: studentKPIs.placed, color: "#10b981" },
            { name: "Not Placed", value: studentKPIs.notPlaced, color: "#f59e0b" },
        ];
    }, [studentKPIs]);

    // Department-wise placement performance for Bar Chart & Summary Table
    const deptWiseData = useMemo(() => {
        const map = {};
        filteredStudents.forEach((s) => {
            const d = s.department || "Other";
            if (!map[d]) {
                map[d] = { department: d, total: 0, placed: 0, notPlaced: 0 };
            }
            map[d].total += 1;
            if (s.placedStatus === "Selected") {
                map[d].placed += 1;
            } else {
                map[d].notPlaced += 1;
            }
        });

        return Object.values(map)
            .map((item) => ({
                ...item,
                shortName: getDeptShortName(item.department),
                placementRate: item.total > 0 ? Number(((item.placed / item.total) * 100).toFixed(1)) : 0,
            }))
            .sort((a, b) => b.placed - a.placed);
    }, [filteredStudents]);

    /* ================================================================
       COMPANY-WISE METRICS & CHARTS
       ================================================================ */
    const companyStats = useMemo(() => {
        const placedWithCompany = filteredStudents.filter(
            (s) => s.placedStatus === "Selected" && s.companyName
        );

        const companyMap = {};
        const ctcList = [];

        placedWithCompany.forEach((s) => {
            const comp = s.companyName.trim();
            if (!companyMap[comp]) {
                companyMap[comp] = {
                    name: comp,
                    offers: 0,
                    departments: new Set(),
                    ctcs: [],
                };
            }
            companyMap[comp].offers += 1;
            if (s.department) companyMap[comp].departments.add(s.department);
            if (s.ctc) {
                companyMap[comp].ctcs.push(s.ctc);
                ctcList.push(s.ctc);
            }
        });

        const companyList = Object.values(companyMap)
            .map((c) => {
                const avgCtc =
                    c.ctcs.length > 0
                        ? (c.ctcs.reduce((a, b) => a + b, 0) / c.ctcs.length).toFixed(2)
                        : null;
                const maxCtc =
                    c.ctcs.length > 0 ? Math.max(...c.ctcs).toFixed(2) : null;
                return {
                    name: c.name,
                    offers: c.offers,
                    deptCount: c.departments.size,
                    topDepts: Array.from(c.departments).slice(0, 2).map(getDeptShortName).join(", "),
                    avgCtc: avgCtc ? `${avgCtc} LPA` : "N/A",
                    maxCtc: maxCtc ? `${maxCtc} LPA` : "N/A",
                    numericCtc: maxCtc ? parseFloat(maxCtc) : 0,
                };
            })
            .sort((a, b) => b.offers - a.offers);

        const totalCompanies = companyList.length;
        const totalOffers = placedWithCompany.length;
        const topCompany = companyList.length > 0 ? companyList[0] : { name: "N/A", offers: 0 };
        const avgOffers = totalCompanies > 0 ? (totalOffers / totalCompanies).toFixed(1) : "0.0";
        const maxOverallCtc = ctcList.length > 0 ? Math.max(...ctcList).toFixed(2) : null;
        const avgOverallCtc =
            ctcList.length > 0
                ? (ctcList.reduce((a, b) => a + b, 0) / ctcList.length).toFixed(2)
                : null;

        // CTC Tier breakdown if package data exists
        const ctcTiers = [
            { range: "< 4 LPA", count: 0 },
            { range: "4 - 6 LPA", count: 0 },
            { range: "6 - 10 LPA", count: 0 },
            { range: "10+ LPA", count: 0 },
        ];
        ctcList.forEach((val) => {
            if (val < 4) ctcTiers[0].count += 1;
            else if (val <= 6) ctcTiers[1].count += 1;
            else if (val <= 10) ctcTiers[2].count += 1;
            else ctcTiers[3].count += 1;
        });
        const hasPackageData = ctcList.length > 0;

        return {
            companyList,
            totalCompanies,
            totalOffers,
            topCompany,
            avgOffers,
            maxOverallCtc,
            avgOverallCtc,
            hasPackageData,
            ctcTiers,
        };
    }, [filteredStudents]);

    /* ================================================================
       YEAR-WISE METRICS & CHARTS
       ================================================================ */
    const yearWiseData = useMemo(() => {
        const yearMap = {};

        filteredStudents.forEach((s) => {
            const yr = s.passoutYear || "Unknown";
            if (!yearMap[yr]) {
                yearMap[yr] = {
                    year: String(yr),
                    totalStudents: 0,
                    placedStudents: 0,
                    notPlacedStudents: 0,
                    companies: new Set(),
                    ctcs: [],
                };
            }
            yearMap[yr].totalStudents += 1;
            if (s.placedStatus === "Selected") {
                yearMap[yr].placedStudents += 1;
                if (s.companyName) yearMap[yr].companies.add(s.companyName);
                if (s.ctc) yearMap[yr].ctcs.push(s.ctc);
            } else {
                yearMap[yr].notPlacedStudents += 1;
            }
        });

        return Object.values(yearMap)
            .map((y) => {
                const placementRate =
                    y.totalStudents > 0
                        ? Number(((y.placedStudents / y.totalStudents) * 100).toFixed(1))
                        : 0;
                const avgCtc =
                    y.ctcs.length > 0
                        ? (y.ctcs.reduce((a, b) => a + b, 0) / y.ctcs.length).toFixed(2)
                        : null;
                return {
                    name: y.year,
                    year: y.year,
                    totalStudents: y.totalStudents,
                    placedStudents: y.placedStudents,
                    notPlacedStudents: y.notPlacedStudents,
                    placementRate,
                    companiesCount: y.companies.size,
                    avgCtc: avgCtc ? `${avgCtc} LPA` : "N/A",
                };
            })
            .sort((a, b) => String(a.year).localeCompare(String(b.year)));
    }, [filteredStudents]);

    const yearKPIs = useMemo(() => {
        const total = filteredStudents.length;
        const placed = filteredStudents.filter((s) => s.placedStatus === "Selected").length;
        const rate = total > 0 ? ((placed / total) * 100).toFixed(1) : "0.0";
        const distinctCompanies = new Set(
            filteredStudents
                .filter((s) => s.placedStatus === "Selected" && s.companyName)
                .map((s) => s.companyName)
        );

        return {
            total,
            placed,
            rate,
            companies: distinctCompanies.size,
        };
    }, [filteredStudents]);

    /* ================================================================
       LOADING & ERROR UI
       ================================================================ */
    if (loading) {
        return (
            <div className="view-analytics-page">
                <CollegeHeader />
                <div className="erp-analytics-container">
                    <div className="erp-loading-state">
                        <div className="erp-spinner" />
                        <h3>Loading Placement Analytics</h3>
                        <p>Syncing verified records and institutional placement statistics...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="view-analytics-page">
                <CollegeHeader />
                <div className="erp-analytics-container">
                    <div className="erp-error-state">
                        <h3>Error Loading Analytics</h3>
                        <p>{error}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="view-analytics-page">
            <CollegeHeader />

            <div className="erp-analytics-container">
                {/* ============================================================
                    TOP CONTROL BAR & FILTERS
                    ============================================================ */}
                <div className="erp-top-bar">
                    <div className="erp-title-group">

                        <h2 className="erp-page-title">Placement Analytics</h2>
                        <p className="erp-page-subtitle">
                            Comprehensive recruitment metrics, student outcomes, and recruiter trends
                        </p>
                    </div>

                    <div className="erp-control-group">
                        {/* Department Filter */}
                        <div className="erp-dept-select-wrap">
                            <label htmlFor="erp-dept-filter">
                                <FaFilter style={{ color: "#2563eb" }} /> Department:
                            </label>
                            <select
                                id="erp-dept-filter"
                                className="erp-dept-select"
                                value={selectedDept}
                                onChange={(e) => setSelectedDept(e.target.value)}
                            >
                                {departments.map((dept, index) => (
                                    <option key={index} value={dept}>
                                        {dept === "All"
                                            ? "All Departments"
                                            : getDeptFullName(dept)}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Live Sync Status */}

                    </div>
                </div>

                {/* ============================================================
                    ERP TAB SWITCHER
                    ============================================================ */}
                <div className="erp-tabs-bar">
                    <button
                        className={`erp-tab-btn ${mode === "student" ? "active" : ""}`}
                        onClick={() => setMode("student")}
                    >
                        <FaUserGraduate className="tab-icon" /> Student-wise
                    </button>
                    <button
                        className={`erp-tab-btn ${mode === "company" ? "active" : ""}`}
                        onClick={() => setMode("company")}
                    >
                        <FaBuilding className="tab-icon" /> Company-wise
                    </button>
                    <button
                        className={`erp-tab-btn ${mode === "year" ? "active" : ""}`}
                        onClick={() => setMode("year")}
                    >
                        <FaCalendarAlt className="tab-icon" /> Year-wise Trends
                    </button>
                </div>

                {/* ============================================================
                    1. STUDENT-WISE ANALYTICS TAB
                    ============================================================ */}
                {mode === "student" && (
                    <>
                        {/* 4 KPI CARDS */}
                        <div className="erp-kpi-grid">
                            {/* Total Students */}
                            <div className="erp-kpi-card blue">
                                <div className="erp-kpi-top">
                                    <span className="erp-kpi-label">Total Students</span>
                                    <div className="erp-kpi-icon-wrap">
                                        <FaUserGraduate />
                                    </div>
                                </div>
                                <div className="erp-kpi-value">{studentKPIs.total}</div>
                                <p className="erp-kpi-caption">
                                    Enrolled in scope <strong>({selectedDept === "All" ? "All Branches" : selectedDept})</strong>
                                </p>
                            </div>

                            {/* Placed Students */}
                            <div className="erp-kpi-card green">
                                <div className="erp-kpi-top">
                                    <span className="erp-kpi-label">Placed Students</span>
                                    <div className="erp-kpi-icon-wrap">
                                        <FaUserCheck />
                                    </div>
                                </div>
                                <div className="erp-kpi-value">{studentKPIs.placed}</div>
                                <p className="erp-kpi-caption">
                                    Offers secured <strong>({studentKPIs.percent}% of batch)</strong>
                                </p>
                            </div>

                            {/* Not Placed Students */}
                            <div className="erp-kpi-card amber">
                                <div className="erp-kpi-top">
                                    <span className="erp-kpi-label">Not Placed Students</span>
                                    <div className="erp-kpi-icon-wrap">
                                        <FaUserTimes />
                                    </div>
                                </div>
                                <div className="erp-kpi-value">{studentKPIs.notPlaced}</div>
                                <p className="erp-kpi-caption">
                                    Active candidates <strong>({(100 - parseFloat(studentKPIs.percent)).toFixed(1)}% pending)</strong>
                                </p>
                            </div>

                            {/* Placement Percentage */}
                            <div className="erp-kpi-card indigo">
                                <div className="erp-kpi-top">
                                    <span className="erp-kpi-label">Placement Percentage</span>
                                    <div className="erp-kpi-icon-wrap">
                                        <FaPercentage />
                                    </div>
                                </div>
                                <div className="erp-kpi-value">{studentKPIs.percent}%</div>
                                <div className="erp-mini-progress-track">
                                    <div
                                        className="erp-mini-progress-fill"
                                        style={{
                                            width: `${Math.min(parseFloat(studentKPIs.percent), 100)}%`,
                                            background: "linear-gradient(90deg, #6366f1, #2563eb)",
                                        }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* CHARTS: Donut & Department Bar Chart */}
                        <div className="erp-charts-grid">
                            {/* Placed vs Not Placed Donut */}
                            <div className="erp-chart-card">
                                <div className="erp-chart-header">
                                    <div>
                                        <h3 className="erp-chart-title">Placement Status Distribution</h3>
                                        <p className="erp-chart-subtitle">
                                            Proportion of placed vs unplaced candidates
                                        </p>
                                    </div>
                                    <span className="erp-chart-badge">{studentKPIs.total} Candidates</span>
                                </div>
                                <div className="erp-chart-body">
                                    <div className="erp-donut-layout">
                                        <div className="erp-donut-graphic">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <PieChart>
                                                    <Pie
                                                        data={donutData}
                                                        dataKey="value"
                                                        nameKey="name"
                                                        cx="50%"
                                                        cy="50%"
                                                        innerRadius={68}
                                                        outerRadius={105}
                                                        paddingAngle={4}
                                                    >
                                                        {donutData.map((entry, index) => (
                                                            <Cell
                                                                key={`donut-cell-${index}`}
                                                                fill={entry.color}
                                                                stroke="#ffffff"
                                                                strokeWidth={2}
                                                            />
                                                        ))}
                                                    </Pie>
                                                    <Tooltip content={<CustomERPTooltip />} />
                                                </PieChart>
                                            </ResponsiveContainer>
                                            <div className="erp-donut-center-stat">
                                                <span className="erp-donut-center-val">
                                                    {studentKPIs.percent}%
                                                </span>
                                                <span className="erp-donut-center-lbl">Placed</span>
                                            </div>
                                        </div>

                                        <div className="erp-donut-legend-panel">
                                            <div className="erp-legend-item">
                                                <div className="erp-legend-left">
                                                    <span
                                                        className="erp-legend-dot"
                                                        style={{ backgroundColor: "#10b981" }}
                                                    />
                                                    Placed
                                                </div>
                                                <div className="erp-legend-right">
                                                    <div className="erp-legend-val">{studentKPIs.placed}</div>
                                                    <div className="erp-legend-pct">{studentKPIs.percent}%</div>
                                                </div>
                                            </div>

                                            <div className="erp-legend-item">
                                                <div className="erp-legend-left">
                                                    <span
                                                        className="erp-legend-dot"
                                                        style={{ backgroundColor: "#f59e0b" }}
                                                    />
                                                    Not Placed
                                                </div>
                                                <div className="erp-legend-right">
                                                    <div className="erp-legend-val">{studentKPIs.notPlaced}</div>
                                                    <div className="erp-legend-pct">
                                                        {(100 - parseFloat(studentKPIs.percent)).toFixed(1)}%
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Department-wise Placement Bar Chart */}
                            <div className="erp-chart-card">
                                <div className="erp-chart-header">
                                    <div>
                                        <h3 className="erp-chart-title">Department-wise Placement</h3>
                                        <p className="erp-chart-subtitle">
                                            Placed vs pending students across departments
                                        </p>
                                    </div>
                                    <span className="erp-chart-badge">{deptWiseData.length} Departments</span>
                                </div>
                                <div className="erp-chart-body">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart
                                            data={deptWiseData}
                                            margin={{ top: 15, right: 20, left: -10, bottom: 25 }}
                                        >
                                            <CartesianGrid
                                                strokeDasharray="3 3"
                                                vertical={false}
                                                stroke="#f1f5f9"
                                            />
                                            <XAxis
                                                dataKey="shortName"
                                                tick={{ fill: "#64748b", fontSize: 12 }}
                                                interval={0}
                                            />
                                            <YAxis
                                                allowDecimals={false}
                                                tick={{ fill: "#64748b", fontSize: 12 }}
                                            />
                                            <Tooltip content={<CustomERPTooltip />} />
                                            <Legend
                                                verticalAlign="top"
                                                align="right"
                                                wrapperStyle={{ paddingBottom: 10, fontSize: 12 }}
                                            />
                                            <Bar
                                                dataKey="placed"
                                                name="Placed"
                                                fill="#10b981"
                                                radius={[4, 4, 0, 0]}
                                            />
                                            <Bar
                                                dataKey="notPlaced"
                                                name="Not Placed"
                                                fill="#f59e0b"
                                                radius={[4, 4, 0, 0]}
                                            />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>

                        {/* CLEAN PLACEMENT SUMMARY SECTION */}
                        <div className="erp-summary-section">
                            <div className="erp-section-header">
                                <div>
                                    <h3 className="erp-section-title">Department Placement Summary</h3>
                                    <p className="erp-section-subtitle">
                                        Detailed breakdown of placement statistics by academic discipline
                                    </p>
                                </div>
                            </div>

                            <div className="erp-table-responsive">
                                <table className="erp-table">
                                    <thead>
                                        <tr>
                                            <th>Department</th>
                                            <th>Total Enrolled</th>
                                            <th>Placed</th>
                                            <th>Not Placed</th>
                                            <th>Placement Rate</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {deptWiseData.map((d, index) => (
                                            <tr key={index}>
                                                <td className="erp-table-cell-bold">
                                                    {getDeptFullName(d.department)}
                                                </td>
                                                <td>{d.total}</td>
                                                <td style={{ color: "#059669", fontWeight: 600 }}>
                                                    {d.placed}
                                                </td>
                                                <td style={{ color: "#d97706" }}>{d.notPlaced}</td>
                                                <td>
                                                    <div className="erp-rate-cell">
                                                        <div className="erp-rate-bar-track">
                                                            <div
                                                                className="erp-rate-bar-fill"
                                                                style={{
                                                                    width: `${Math.min(d.placementRate, 100)}%`,
                                                                    backgroundColor:
                                                                        d.placementRate >= 70
                                                                            ? "#10b981"
                                                                            : d.placementRate >= 40
                                                                                ? "#2563eb"
                                                                                : "#f59e0b",
                                                                }}
                                                            />
                                                        </div>
                                                        <span className="erp-rate-text">
                                                            {d.placementRate}%
                                                        </span>
                                                    </div>
                                                </td>
                                                <td>
                                                    {d.placementRate >= 75 ? (
                                                        <span className="erp-badge success">High</span>
                                                    ) : d.placementRate >= 40 ? (
                                                        <span className="erp-badge info">Moderate</span>
                                                    ) : (
                                                        <span className="erp-badge warning">In Progress</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                )}

                {/* ============================================================
                    2. COMPANY-WISE ANALYTICS TAB
                    ============================================================ */}
                {mode === "company" && (
                    <>
                        {/* 4 KPI CARDS */}
                        <div className="erp-kpi-grid">
                            {/* Total Companies */}
                            <div className="erp-kpi-card blue">
                                <div className="erp-kpi-top">
                                    <span className="erp-kpi-label">Total Companies</span>
                                    <div className="erp-kpi-icon-wrap">
                                        <FaBuilding />
                                    </div>
                                </div>
                                <div className="erp-kpi-value">{companyStats.totalCompanies}</div>
                                <p className="erp-kpi-caption">
                                    Active campus recruitment partners
                                </p>
                            </div>

                            {/* Total Offers */}
                            <div className="erp-kpi-card green">
                                <div className="erp-kpi-top">
                                    <span className="erp-kpi-label">Total Offers</span>
                                    <div className="erp-kpi-icon-wrap">
                                        <FaBriefcase />
                                    </div>
                                </div>
                                <div className="erp-kpi-value">{companyStats.totalOffers}</div>
                                <p className="erp-kpi-caption">
                                    Verified placement offers generated
                                </p>
                            </div>

                            {/* Top Recruiting Company */}
                            <div className="erp-kpi-card amber">
                                <div className="erp-kpi-top">
                                    <span className="erp-kpi-label">Top Recruiting Company</span>
                                    <div className="erp-kpi-icon-wrap">
                                        <FaTrophy />
                                    </div>
                                </div>
                                <div
                                    className="erp-kpi-value"
                                    style={{
                                        fontSize:
                                            companyStats.topCompany.name.length > 15 ? "20px" : "26px",
                                    }}
                                >
                                    {companyStats.topCompany.name}
                                </div>
                                <p className="erp-kpi-caption">
                                    Highest hires <strong>({companyStats.topCompany.offers} offers)</strong>
                                </p>
                            </div>

                            {/* Average Offers per Company */}
                            <div className="erp-kpi-card purple">
                                <div className="erp-kpi-top">
                                    <span className="erp-kpi-label">Average Offers / Company</span>
                                    <div className="erp-kpi-icon-wrap">
                                        <FaChartPie />
                                    </div>
                                </div>
                                <div className="erp-kpi-value">{companyStats.avgOffers}</div>
                                <p className="erp-kpi-caption">
                                    Offers per participating company
                                </p>
                            </div>
                        </div>

                        {/* CHARTS: Company-wise Bar Chart & Package Analysis */}
                        <div className="erp-charts-grid">
                            {/* Company-wise Placement Bar Chart */}
                            <div className="erp-chart-card">
                                <div className="erp-chart-header">
                                    <div>
                                        <h3 className="erp-chart-title">Company-wise Placement Count</h3>
                                        <p className="erp-chart-subtitle">
                                            Number of offers made by recruiting partners
                                        </p>
                                    </div>
                                    <span className="erp-chart-badge">
                                        {companyStats.companyList.length} Companies
                                    </span>
                                </div>
                                <div className="erp-chart-body">
                                    {companyStats.companyList.length > 0 ? (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart
                                                data={companyStats.companyList.slice(0, 8)}
                                                margin={{ top: 15, right: 20, left: -10, bottom: 25 }}
                                            >
                                                <CartesianGrid
                                                    strokeDasharray="3 3"
                                                    vertical={false}
                                                    stroke="#f1f5f9"
                                                />
                                                <XAxis
                                                    dataKey="name"
                                                    tick={{ fill: "#64748b", fontSize: 12 }}
                                                    interval={0}
                                                    tickFormatter={(name) =>
                                                        name.length > 12 ? name.substring(0, 10) + "…" : name
                                                    }
                                                />
                                                <YAxis
                                                    allowDecimals={false}
                                                    tick={{ fill: "#64748b", fontSize: 12 }}
                                                />
                                                <Tooltip content={<CustomERPTooltip />} />
                                                <Bar
                                                    dataKey="offers"
                                                    name="Offers"
                                                    fill="#2563eb"
                                                    radius={[6, 6, 0, 0]}
                                                >
                                                    {companyStats.companyList
                                                        .slice(0, 8)
                                                        .map((_, index) => (
                                                            <Cell
                                                                key={`comp-bar-${index}`}
                                                                fill={
                                                                    BRAND_COLORS[
                                                                    index % BRAND_COLORS.length
                                                                    ]
                                                                }
                                                            />
                                                        ))}
                                                </Bar>
                                            </BarChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <div
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                height: "100%",
                                                color: "#94a3b8",
                                            }}
                                        >
                                            No company placement data available for this filter.
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Package / Company Analysis */}
                            <div className="erp-chart-card">
                                <div className="erp-chart-header">
                                    <div>
                                        <h3 className="erp-chart-title">Package & CTC Analysis</h3>
                                        <p className="erp-chart-subtitle">
                                            {companyStats.hasPackageData
                                                ? "Salary tier distribution & remuneration insights"
                                                : "Recruitment share across organizations"}
                                        </p>
                                    </div>
                                    {companyStats.maxOverallCtc && (
                                        <span className="erp-chart-badge" style={{ color: "#059669" }}>
                                            Highest: ₹{companyStats.maxOverallCtc} LPA
                                        </span>
                                    )}
                                </div>
                                <div className="erp-chart-body">
                                    {companyStats.hasPackageData ? (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart
                                                data={companyStats.ctcTiers}
                                                margin={{ top: 15, right: 20, left: -10, bottom: 25 }}
                                            >
                                                <CartesianGrid
                                                    strokeDasharray="3 3"
                                                    vertical={false}
                                                    stroke="#f1f5f9"
                                                />
                                                <XAxis
                                                    dataKey="range"
                                                    tick={{ fill: "#64748b", fontSize: 12 }}
                                                />
                                                <YAxis
                                                    allowDecimals={false}
                                                    tick={{ fill: "#64748b", fontSize: 12 }}
                                                />
                                                <Tooltip content={<CustomERPTooltip />} />
                                                <Bar
                                                    dataKey="count"
                                                    name="Offers in Bracket"
                                                    fill="#10b981"
                                                    radius={[6, 6, 0, 0]}
                                                />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        /* Share of offers donut if no CTC */
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={companyStats.companyList.slice(0, 6)}
                                                    dataKey="offers"
                                                    nameKey="name"
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={60}
                                                    outerRadius={100}
                                                    paddingAngle={3}
                                                >
                                                    {companyStats.companyList
                                                        .slice(0, 6)
                                                        .map((_, index) => (
                                                            <Cell
                                                                key={`comp-pie-${index}`}
                                                                fill={
                                                                    BRAND_COLORS[
                                                                    index % BRAND_COLORS.length
                                                                    ]
                                                                }
                                                            />
                                                        ))}
                                                </Pie>
                                                <Tooltip content={<CustomERPTooltip />} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* COMPANY SUMMARY TABLE */}
                        <div className="erp-summary-section">
                            <div className="erp-section-header">
                                <div>
                                    <h3 className="erp-section-title">Recruiting Partners Overview</h3>
                                    <p className="erp-section-subtitle">
                                        Company-level placement outcomes, packages, and branch hiring
                                    </p>
                                </div>
                            </div>

                            <div className="erp-table-responsive">
                                <table className="erp-table">
                                    <thead>
                                        <tr>
                                            <th>#</th>
                                            <th>Company Name</th>
                                            <th>Total Offers</th>
                                            <th>Share of Total</th>
                                            <th>Package / CTC</th>
                                            <th>Branches Hired</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {companyStats.companyList.map((comp, idx) => {
                                            const share =
                                                companyStats.totalOffers > 0
                                                    ? (
                                                        (comp.offers /
                                                            companyStats.totalOffers) *
                                                        100
                                                    ).toFixed(1)
                                                    : "0.0";
                                            return (
                                                <tr key={idx}>
                                                    <td style={{ color: "#64748b" }}>{idx + 1}</td>
                                                    <td className="erp-table-cell-bold">
                                                        {comp.name}
                                                    </td>
                                                    <td style={{ color: "#2563eb", fontWeight: 700 }}>
                                                        {comp.offers}
                                                    </td>
                                                    <td>
                                                        <div className="erp-rate-cell">
                                                            <div className="erp-rate-bar-track">
                                                                <div
                                                                    className="erp-rate-bar-fill"
                                                                    style={{
                                                                        width: `${Math.min(parseFloat(share), 100)}%`,
                                                                        backgroundColor: "#2563eb",
                                                                    }}
                                                                />
                                                            </div>
                                                            <span className="erp-rate-text">{share}%</span>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        {comp.maxCtc !== "N/A" ? (
                                                            <span className="erp-badge success">
                                                                ₹{comp.maxCtc}
                                                            </span>
                                                        ) : (
                                                            <span className="erp-badge neutral">
                                                                Standard
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td>
                                                        <span style={{ color: "#475569" }}>
                                                            {comp.topDepts || "Multiple"}
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                )}

                {/* ============================================================
                    3. YEAR-WISE ANALYTICS TAB
                    ============================================================ */}
                {mode === "year" && (
                    <>
                        {/* 4 KPI CARDS */}
                        <div className="erp-kpi-grid">
                            {/* Total Students by Year */}
                            <div className="erp-kpi-card blue">
                                <div className="erp-kpi-top">
                                    <span className="erp-kpi-label">Total Students</span>
                                    <div className="erp-kpi-icon-wrap">
                                        <FaUserGraduate />
                                    </div>
                                </div>
                                <div className="erp-kpi-value">{yearKPIs.total}</div>
                                <p className="erp-kpi-caption">Across tracked graduation batches</p>
                            </div>

                            {/* Placed Students by Year */}
                            <div className="erp-kpi-card green">
                                <div className="erp-kpi-top">
                                    <span className="erp-kpi-label">Placed Students</span>
                                    <div className="erp-kpi-icon-wrap">
                                        <FaUserCheck />
                                    </div>
                                </div>
                                <div className="erp-kpi-value">{yearKPIs.placed}</div>
                                <p className="erp-kpi-caption">
                                    Cumulative students successfully placed
                                </p>
                            </div>

                            {/* Placement Percentage by Year */}
                            <div className="erp-kpi-card indigo">
                                <div className="erp-kpi-top">
                                    <span className="erp-kpi-label">Placement Percentage</span>
                                    <div className="erp-kpi-icon-wrap">
                                        <FaPercentage />
                                    </div>
                                </div>
                                <div className="erp-kpi-value">{yearKPIs.rate}%</div>
                                <div className="erp-mini-progress-track">
                                    <div
                                        className="erp-mini-progress-fill"
                                        style={{
                                            width: `${Math.min(parseFloat(yearKPIs.rate), 100)}%`,
                                            background: "linear-gradient(90deg, #6366f1, #2563eb)",
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Companies by Year */}
                            <div className="erp-kpi-card purple">
                                <div className="erp-kpi-top">
                                    <span className="erp-kpi-label">Companies Participating</span>
                                    <div className="erp-kpi-icon-wrap">
                                        <FaBuilding />
                                    </div>
                                </div>
                                <div className="erp-kpi-value">{yearKPIs.companies}</div>
                                <p className="erp-kpi-caption">
                                    Unique organizations hiring across years
                                </p>
                            </div>
                        </div>

                        {/* CHARTS: Multi-Year Trends & Companies by Year */}
                        <div className="erp-charts-grid">
                            {/* Year-on-Year Placement Volume & Rate (Composed Chart) */}
                            <div className="erp-chart-card">
                                <div className="erp-chart-header">
                                    <div>
                                        <h3 className="erp-chart-title">Placement Trends Over Years</h3>
                                        <p className="erp-chart-subtitle">
                                            Cohort size, placed students, and placement rate (%)
                                        </p>
                                    </div>
                                    <span className="erp-chart-badge">
                                        {yearWiseData.length} Batch{yearWiseData.length === 1 ? "" : "es"}
                                    </span>
                                </div>
                                <div className="erp-chart-body">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <ComposedChart
                                            data={yearWiseData}
                                            margin={{ top: 15, right: 20, left: -10, bottom: 25 }}
                                        >
                                            <CartesianGrid
                                                strokeDasharray="3 3"
                                                vertical={false}
                                                stroke="#f1f5f9"
                                            />
                                            <XAxis
                                                dataKey="year"
                                                tick={{ fill: "#64748b", fontSize: 12 }}
                                            />
                                            <YAxis
                                                yAxisId="left"
                                                allowDecimals={false}
                                                tick={{ fill: "#64748b", fontSize: 12 }}
                                            />
                                            <YAxis
                                                yAxisId="right"
                                                orientation="right"
                                                unit="%"
                                                domain={[0, 100]}
                                                tick={{ fill: "#10b981", fontSize: 12 }}
                                            />
                                            <Tooltip content={<CustomERPTooltip />} />
                                            <Legend
                                                verticalAlign="top"
                                                align="right"
                                                wrapperStyle={{ paddingBottom: 10, fontSize: 12 }}
                                            />
                                            <Bar
                                                yAxisId="left"
                                                dataKey="totalStudents"
                                                name="Total Students"
                                                fill="#bfdbfe"
                                                radius={[4, 4, 0, 0]}
                                            />
                                            <Bar
                                                yAxisId="left"
                                                dataKey="placedStudents"
                                                name="Placed Students"
                                                fill="#2563eb"
                                                radius={[4, 4, 0, 0]}
                                            />
                                            <Line
                                                yAxisId="right"
                                                type="monotone"
                                                dataKey="placementRate"
                                                name="Placement Rate (%)"
                                                stroke="#10b981"
                                                strokeWidth={3}
                                                dot={{ r: 5, fill: "#10b981" }}
                                            />
                                        </ComposedChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Companies by Year */}
                            <div className="erp-chart-card">
                                <div className="erp-chart-header">
                                    <div>
                                        <h3 className="erp-chart-title">Companies by Year</h3>
                                        <p className="erp-chart-subtitle">
                                            Visiting corporate recruiters and employment volume
                                        </p>
                                    </div>
                                </div>
                                <div className="erp-chart-body">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart
                                            data={yearWiseData}
                                            margin={{ top: 15, right: 20, left: -10, bottom: 25 }}
                                        >
                                            <CartesianGrid
                                                strokeDasharray="3 3"
                                                vertical={false}
                                                stroke="#f1f5f9"
                                            />
                                            <XAxis
                                                dataKey="year"
                                                tick={{ fill: "#64748b", fontSize: 12 }}
                                            />
                                            <YAxis
                                                allowDecimals={false}
                                                tick={{ fill: "#64748b", fontSize: 12 }}
                                            />
                                            <Tooltip content={<CustomERPTooltip />} />
                                            <Bar
                                                dataKey="companiesCount"
                                                name="Companies Visited"
                                                fill="#8b5cf6"
                                                radius={[6, 6, 0, 0]}
                                            />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>

                        {/* YEAR-WISE SUMMARY TABLE */}
                        <div className="erp-summary-section">
                            <div className="erp-section-header">
                                <div>
                                    <h3 className="erp-section-title">Batch-wise Performance Summary</h3>
                                    <p className="erp-section-subtitle">
                                        Multi-year historical placement benchmarks
                                    </p>
                                </div>
                            </div>

                            <div className="erp-table-responsive">
                                <table className="erp-table">
                                    <thead>
                                        <tr>
                                            <th>Graduation Year</th>
                                            <th>Total Candidates</th>
                                            <th>Placed</th>
                                            <th>Not Placed</th>
                                            <th>Placement Rate</th>
                                            <th>Recruiters</th>
                                            <th>Average Package</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {yearWiseData.map((y, idx) => (
                                            <tr key={idx}>
                                                <td className="erp-table-cell-bold">
                                                    Batch {y.year}
                                                </td>
                                                <td>{y.totalStudents}</td>
                                                <td style={{ color: "#059669", fontWeight: 700 }}>
                                                    {y.placedStudents}
                                                </td>
                                                <td style={{ color: "#d97706" }}>
                                                    {y.notPlacedStudents}
                                                </td>
                                                <td>
                                                    <div className="erp-rate-cell">
                                                        <div className="erp-rate-bar-track">
                                                            <div
                                                                className="erp-rate-bar-fill"
                                                                style={{
                                                                    width: `${Math.min(y.placementRate, 100)}%`,
                                                                    backgroundColor:
                                                                        y.placementRate >= 70
                                                                            ? "#10b981"
                                                                            : "#2563eb",
                                                                }}
                                                            />
                                                        </div>
                                                        <span className="erp-rate-text">
                                                            {y.placementRate}%
                                                        </span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className="erp-badge info">
                                                        {y.companiesCount} Companies
                                                    </span>
                                                </td>
                                                <td>
                                                    {y.avgCtc !== "N/A" ? (
                                                        <span className="erp-badge success">
                                                            ₹{y.avgCtc}
                                                        </span>
                                                    ) : (
                                                        <span className="erp-badge neutral">
                                                            N/A
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default ViewAnalytics;
