import React, { useMemo, useState, useEffect } from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
} from "recharts";

import "./ViewAnalytics.css";
import CollegeHeader from "../../../shared/CollegeHeader";

const COLORS = ["#2563eb", "#16a34a", "#f97316", "#dc2626", "#7c3aed"];

/* 🔵 Department Full Forms */
const DEPT_FULL_FORM = {
    IT: "Information Technology",
    CS: "Computer Science",
    AI: "Artificial Intelligence",
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

    /* ================================
        Fetch Data from Backend
    ================================= */
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

                // 3. If neither returned data, fall back to /api/placement-data
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
                                    },
                                    company: {
                                        company_name: p.company_name,
                                        company_title: p.company_name,
                                    },
                                }));
                            }
                        }
                    } catch (e) {
                        console.warn("Failed fetching /placement-data:", e);
                    }
                }

                // Create a map of placed student IDs for quick lookup
                const placedIds = new Set(placedStudents.map(p => p.student?.student_id || p.student_id));

                // Merge data: combine student profiles with placement status
                const mergedStudents = allStudents.map((student) => {
                    const sId = student.student_id || student.id;
                    const placedStudent = placedStudents.find(
                        p => (p.student?.student_id || p.student_id) === sId
                    );
                    const name =
                        student.full_name ||
                        `${student.first_name || ""} ${student.middle_name || ""} ${student.last_name || ""}`.trim();

                    return {
                        id: sId,
                        name: name || sId,
                        department: student.department || "Unknown",
                        passoutYear: student.expected_graduation_year || student.year_of_admission || student.passoutYear,
                        placedStatus: placedStudent ? "Selected" : (student.status === "selected" || student.status === "placed" ? "Selected" : "Not Placed"),
                        companyName:
                            placedStudent?.company?.company_title ||
                            placedStudent?.company?.company_name ||
                            student.company_name ||
                            null,
                    };
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

    /* ================================
        Department List (Dynamic)
    ================================= */
    const departments = useMemo(() => {
        const deptList = students.map((s) => s.department);
        return ["All", ...new Set(deptList)];
    }, [students]);

    /* ================================
        Department Filter
    ================================= */
    const filteredStudents = useMemo(() => {
        if (selectedDept === "All") return students;
        return students.filter((s) => s.department === selectedDept);
    }, [selectedDept, students]);

    /* ================================
        STUDENT-WISE
    ================================= */
    const studentWiseStats = useMemo(() => {
        const placed = filteredStudents.filter(
            (s) => s.placedStatus === "Selected"
        ).length;

        return [
            { name: "Placed", value: placed },
            { name: "Not Placed", value: filteredStudents.length - placed },
        ];
    }, [filteredStudents]);

    /* ================================
        COMPANY-WISE
    ================================= */
    const companyWiseStats = useMemo(() => {
        const map = {};
        filteredStudents.forEach((s) => {
            if (s.placedStatus === "Selected" && s.companyName) {
                map[s.companyName] = (map[s.companyName] || 0) + 1;
            }
        });

        return Object.entries(map)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value);
    }, [filteredStudents]);

    /* ================================
        YEAR-WISE
    ================================= */
    const yearWiseStats = useMemo(() => {
        const map = {};
        filteredStudents.forEach((s) => {
            if (s.placedStatus === "Selected") {
                map[s.passoutYear] = (map[s.passoutYear] || 0) + 1;
            }
        });

        return Object.entries(map)
            .sort((a, b) => a[0] - b[0])
            .map(([year, value]) => ({
                name: year.toString(),
                value,
            }));
    }, [filteredStudents]);

    const activeData =
        mode === "company"
            ? companyWiseStats
            : mode === "year"
                ? yearWiseStats
                : studentWiseStats;

    const totalCount = activeData.reduce((sum, item) => sum + item.value, 0);

    if (loading) {
        return (
            <>
                <CollegeHeader />
                <div className="view-analytics-container">
                    <h2 className="view-analytics-title">Placement Analytics</h2>
                    <div style={{ textAlign: "center", padding: "2rem" }}>
                        <p>Loading analytics data...</p>
                    </div>
                </div>
            </>
        );
    }

    if (error) {
        return (
            <>
                <CollegeHeader />
                <div className="view-analytics-container">
                    <h2 className="view-analytics-title">Placement Analytics</h2>
                    <div style={{ textAlign: "center", padding: "2rem", color: "red" }}>
                        <p>Error loading data: {error}</p>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <CollegeHeader />

            <div className="view-analytics-container">
                <h2 className="view-analytics-title">Placement Analytics</h2>

                {/* 🔵 Department Filter */}
                <div className="department-filter">
                    <label>Department:</label>
                    <select
                        value={selectedDept}
                        onChange={(e) => setSelectedDept(e.target.value)}
                    >
                        {departments.map((dept, index) => (
                            <option key={index} value={dept}>
                                {dept === "All"
                                    ? "All Departments"
                                    : DEPT_FULL_FORM[dept] || dept}
                            </option>
                        ))}
                    </select>
                </div>

                {/* FILTER BUTTONS */}
                <div className="analytics-filter-buttons">
                    <button
                        className={mode === "student" ? "active" : ""}
                        onClick={() => setMode("student")}
                    >
                        Student-wise
                    </button>

                    <button
                        className={mode === "company" ? "active" : ""}
                        onClick={() => setMode("company")}
                    >
                        Company-wise
                    </button>

                    <button
                        className={mode === "year" ? "active" : ""}
                        onClick={() => setMode("year")}
                    >
                        Year-wise
                    </button>
                </div>

                <div className="stats-wrapper">
                    {/* BAR CHART */}
                    <div className="stats-card">
                        <h3 className="stats-title">Placement Count</h3>

                        <div className="chart-with-count">
                            <div className="chart-container">
                                <ResponsiveContainer width="100%" height={320}>
                                    <BarChart data={activeData}>
                                        <XAxis dataKey="name" />
                                        <YAxis allowDecimals={false} />
                                        <Tooltip />
                                        <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                                            {activeData.map((_, index) => (
                                                <Cell
                                                    key={index}
                                                    fill={COLORS[index % COLORS.length]}
                                                />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>

                            <div className="count-panel">
                                <h4>Total</h4>
                                <div className="count-number">{totalCount}</div>

                                <ul>
                                    {activeData.map((item, index) => (
                                        <li key={index}>
                                            <span
                                                className="dot"
                                                style={{
                                                    backgroundColor:
                                                        COLORS[index % COLORS.length],
                                                }}
                                            />
                                            {item.name}: <strong>{item.value}</strong>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* PIE CHART */}
                    <div className="stats-card pie-section">
                        <h3 className="stats-title">Distribution</h3>

                        <div className="chart-with-count">
                            <div className="pie-wrapper">
                                <ResponsiveContainer width="100%" height={360}>
                                    <PieChart>
                                        <Pie
                                            data={activeData}
                                            dataKey="value"
                                            nameKey="name"
                                            innerRadius={70}
                                            outerRadius={120}
                                        >
                                            {activeData.map((_, index) => (
                                                <Cell
                                                    key={index}
                                                    fill={COLORS[index % COLORS.length]}
                                                />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>

                            <div className="count-panel">
                                <h4>Breakdown</h4>
                                <ul>
                                    {activeData.map((item, index) => (
                                        <li key={index}>
                                            <span
                                                className="dot"
                                                style={{
                                                    backgroundColor:
                                                        COLORS[index % COLORS.length],
                                                }}
                                            />
                                            {item.name}: <strong>{item.value}</strong>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ViewAnalytics;
