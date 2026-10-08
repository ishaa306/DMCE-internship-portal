import React, { useState } from "react";
import Companytable from "../../../TnpCO/components/CompanyTable";
import Studentstable from "../../../TnpCO/components/StudentsTable";
import YearwiseTable from "../../../TnpCO/components/YearwiseTable";
import CollegeHeader from "../../../shared/CollegeHeader";

const FilterTable = () => {
  const [selectedTable, setSelectedTable] = useState("StudentsTable"); // default table

  // Table options
  const tableOptions = [
    { label: "Students Table", value: "StudentsTable" },
    { label: "Company Table", value: "CompanyTable" },
    { label: "Yearwise Table", value: "YearwiseTable" },
  ];

  // Map table values to components
  const tableComponents = {
    StudentsTable: <Studentstable />,
    CompanyTable: <Companytable />,
    YearwiseTable: <YearwiseTable />,
  };

  return (
    <>
      <CollegeHeader />
      <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
        {/* Navbar */}
        <div style={{ display: "flex", gap: "15px", marginBottom: "20px" }}>
          {tableOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setSelectedTable(opt.value)}
              style={{
                padding: "8px 16px",
                borderRadius: "6px",
                border:
                  selectedTable === opt.value
                    ? "2px solid #007bff"
                    : "1px solid #ccc",
                backgroundColor:
                  selectedTable === opt.value ? "#007bff" : "#f9f9f9",
                color: selectedTable === opt.value ? "white" : "black",
                cursor: "pointer",
                fontWeight: "bold",
                transition: "all 0.2s",
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Render only the selected table */}
        <div>{tableComponents[selectedTable]}</div>
      </div>
    </>
  );
};

export default FilterTable;
