import React, { useState, useEffect } from "react";
import "./Tablestyling.css";
import sampleData from "../sampleData";
import StatsSection from "./StatisticsSection";
import TableWithPaginationAndExport from "./TableWithPaginationAndExport";

const YearwiseTable = () => {
  const [data] = useState(sampleData.yearwiseData || []);
  const [filteredData, setFilteredData] = useState(data);

  // ✅ Filter state
  const [filters, setFilters] = useState({
    year: "",
    studentsPlaced: "",
    companiesVisited: "",
    placedPercentage: "",
    totalRegistered: "",
  });

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const resetFilters = () => {
    setFilters({
      year: "",
      studentsPlaced: "",
      companiesVisited: "",
      placedPercentage: "",
      totalRegistered: "",
    });
  };

  // ✅ Dynamic helper to build simple numeric-range string options (auto-generated)
  const buildRangeOptions = (minVals, accessor) => {
    const vals = data.map((d) => d[accessor]);
    const min = Math.min(...vals);
    const max = Math.max(...vals);
    const step = Math.ceil((max - min) / 4) || 1;
    const ranges = [];
    for (let i = min; i <= max; i += step) {
      ranges.push(`${i}-${Math.min(i + step - 1, max)}`);
    }
    return ranges;
  };

  const years = [...new Set(data.map((d) => d.year))].sort();
  const studentPlacedRanges = buildRangeOptions(0, "studentsPlaced");
  const companyVisitedRanges = buildRangeOptions(0, "companiesVisited");
  const percentageRanges = buildRangeOptions(0, "placedPercentage");
  const totalRegisteredRanges = buildRangeOptions(0, "totalRegistered");

  // ✅ Filtering logic
  useEffect(() => {
    let temp = data;

    if (filters.year)
      temp = temp.filter((d) => d.year === Number(filters.year));

    const applyRange = (array, key, rangeStr) => {
      if (!rangeStr) return array;
      const [min, max] = rangeStr.split("-").map(Number);
      return array.filter((d) => d[key] >= min && d[key] <= max);
    };

    temp = applyRange(temp, "studentsPlaced", filters.studentsPlaced);
    temp = applyRange(temp, "companiesVisited", filters.companiesVisited);
    temp = applyRange(temp, "placedPercentage", filters.placedPercentage);
    temp = applyRange(temp, "totalRegistered", filters.totalRegistered);

    setFilteredData(temp);
  }, [filters, data]);

  // ✅ Chart data
  const barData1 = filteredData.map((item) => ({
    name: item.year.toString(),
    StudentsPlaced: item.studentsPlaced,
    CompaniesVisited: item.companiesVisited,
  }));

  const pieData1 = filteredData.map((item) => ({
    name: item.year.toString(),
    value: item.placedPercentage,
  }));

  const highestSalaryBarData = filteredData.map((item) => ({
    name: item.year.toString(),
    HighestSalary: Number(item.highestSalary.replace(/\D/g, "")) || 0,
  }));

  const highestSalaryPieData = filteredData.map((item) => ({
    name: item.year.toString(),
    value: Number(item.highestSalary.replace(/\D/g, "")) || 0,
  }));

  return (
    <div className="upload-section">
      <h2 className="header">Year‑wise Placement Statistics</h2>

      {/* ✅ Dynamic Filters */}
      <div className="filter-container">
        {/* Year */}
        <select name="year" value={filters.year} onChange={handleFilterChange}>
          <option value="">Year</option>
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>

        {/* Placed Students */}
        <select
          name="studentsPlaced"
          value={filters.studentsPlaced}
          onChange={handleFilterChange}
        >
          <option value="">Placed Students</option>
          {studentPlacedRanges.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>

        {/* Companies Visited */}
        <select
          name="companiesVisited"
          value={filters.companiesVisited}
          onChange={handleFilterChange}
        >
          <option value="">Companies Visited</option>
          {companyVisitedRanges.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>

        {/* Placed % */}
        <select
          name="placedPercentage"
          value={filters.placedPercentage}
          onChange={handleFilterChange}
        >
          <option value="">Placed %</option>
          {percentageRanges.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>

        {/* Total Registered */}
        <select
          name="totalRegistered"
          value={filters.totalRegistered}
          onChange={handleFilterChange}
        >
          <option value="">Registered Students</option>
          {totalRegisteredRanges.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>

        <button onClick={resetFilters} className="reset-button">
          Reset Filters
        </button>
      </div>

      {/* ✅ Table with pagination & export */}
      <TableWithPaginationAndExport
        title="Year‑wise Placement Data"
        fileNameBase="Yearwise_Placement_Data"
        columns={[
          { key: "index", label: "Sr.No" },
          { key: "year", label: "Year" },
          { key: "studentsPlaced", label: "Students Placed" },
          { key: "companiesVisited", label: "Companies Visited" },
          { key: "placedPercentage", label: "Placed %" },
          { key: "totalRegistered", label: "Total Registered" },
          { key: "highestSalary", label: "Highest Salary (LPA)" },
        ]}
        rows={filteredData}
      />

      {/* ✅ Charts */}
      <StatsSection
        title="Placement Percentage per Year"
        barData={barData1}
        pieData={pieData1}
        barKey="StudentsPlaced"
        pieKey="value"
      />

      <StatsSection
        title="Year vs Highest Salary"
        barData={highestSalaryBarData}
        barKey="HighestSalary"
        pieData={highestSalaryPieData}
        pieKey="value"
      />
    </div>
  );
};

export default YearwiseTable;
