import React, { useState } from "react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const TableWithPaginationAndExport = ({
  title,
  columns,
  rows,
  fileNameBase,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Pagination logic
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = rows.slice(indexOfFirstRow, indexOfLastRow);
  const totalPages = Math.ceil(rows.length / rowsPerPage);
  const paginationOptions = [10, 20, 50, 100].filter(
    (num) => num < rows.length || num === 10
  );

  // Excel export
  const exportToExcel = () => {
    if (rows.length === 0) {
      alert("No data to export!");
      return;
    }

    const flattenedData = rows.map((r, i) => {
      const rowData = {};
      columns.forEach((col, idx) => {
        rowData[col.label] = idx === 0 ? i + 1 : r[col.key];
      });
      return rowData;
    });

    const worksheet = XLSX.utils.json_to_sheet(flattenedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data");
    XLSX.writeFile(
      workbook,
      `${fileNameBase}_${new Date().toISOString().split("T")[0]}.xlsx`
    );
  };

  // PDF export
  const exportToPDF = () => {
    if (rows.length === 0) {
      alert("No data to export!");
      return;
    }

    const doc = new jsPDF("landscape");
    doc.text(`${title} Report`, 14, 10);

    autoTable(doc, {
      head: [columns.map((col) => col.label)],
      body: rows.map((r, i) =>
        columns.map((col, idx) => (idx === 0 ? i + 1 : r[col.key]))
      ),
      startY: 20,
      theme: "grid",
      styles: { fontSize: 8 },
      headStyles: { fillColor: [22, 160, 133] },
    });

    doc.save(`${fileNameBase}_${new Date().toISOString().split("T")[0]}.pdf`);
  };

  return (
    <div className="table-section">
      <h3>{title}</h3>

      <div className="export-buttons" style={{ marginBottom: "10px" }}>
        <button onClick={exportToExcel} className="export-btn">
          Export to Excel
        </button>
        <button onClick={exportToPDF} className="export-btn">
          Export to PDF
        </button>
      </div>

      <div className="table-wrapper">
        <table className="student-table">
          <thead>
            <tr>
              {columns.map((col, idx) => (
                <th key={idx}>{col.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {currentRows.length > 0 ? (
              currentRows.map((row, idx) => (
                <tr key={idx}>
                  {columns.map((col, cIdx) => (
                    <td key={cIdx}>
                      {col.key === "index"
                        ? indexOfFirstRow + idx + 1
                        : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length}>No data found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="pagination-controls">
        <button
          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          disabled={currentPage === 1}
        >
          Prev
        </button>
        <span>
          Page {currentPage} of {totalPages || 1}
        </span>
        <button
          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          disabled={currentPage === totalPages}
        >
          Next
        </button>

        <select
          className="rows-per-page"
          value={rowsPerPage}
          onChange={(e) => {
            setRowsPerPage(Number(e.target.value));
            setCurrentPage(1);
          }}
        >
          {paginationOptions.map((num) => (
            <option key={num} value={num}>
              {num} / page
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default TableWithPaginationAndExport;
