import React from 'react';
import './InternshipVerification.css';

const InternshipTable = ({ internships, onReview }) => {
  if (!internships || internships.length === 0) {
    return (
      <div className="empty-state">
        <p>No internships found matching the current criteria.</p>
      </div>
    );
  }

  return (
    <div className="table-responsive">
      <table className="internship-table">
        <thead>
          <tr>
            <th>Student</th>
            <th>GR Number</th>
            <th>Company</th>
            <th>Role</th>
            <th>Start Date</th>
            <th>Work Mode</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {internships.map((internship) => (
            <tr key={internship.id}>
              <td>{internship.student_name || 'N/A'}</td>
              <td>{internship.student_id}</td>
              <td>{internship.company_name}</td>
              <td>{internship.role}</td>
              <td>{internship.start_date}</td>
              <td style={{ textTransform: 'capitalize' }}>{internship.work_mode}</td>
              <td>
                <span className={`status-badge status-${internship.status}`}>
                  {internship.status}
                </span>
              </td>
              <td>
                <button 
                  className="btn-review" 
                  onClick={() => onReview(internship)}
                >
                  Review
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default InternshipTable;
