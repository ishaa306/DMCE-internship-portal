import React, { useState, useEffect, useMemo } from 'react';
import CollegeHeader from '../../shared/CollegeHeader';
import { internshipApi } from '../../services/internshipApi';
import InternshipTable from './InternshipTable';
import InternshipReview from './InternshipReview';
import './InternshipVerification.css';

const InternshipVerification = () => {
  // State for raw data
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(null);

  // State for filtering/searching
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // State for review view
  const [selectedInternship, setSelectedInternship] = useState(null);
  const [reviewLoading, setReviewLoading] = useState(false);

  useEffect(() => {
    fetchInternships();
  }, []);

  const fetchInternships = async () => {
    setLoading(true);
    setApiError(null);
    try {
      const response = await internshipApi.getAllInternships();
      setInternships(response.data || []);
    } catch (error) {
      console.error('API Error:', error);
      if (error.status === 401) {
        setApiError('Your session has expired. Please log in again.');
      } else if (error.status === 403) {
        setApiError('You do not have permission to access internship verification.');
      } else {
        setApiError('Unable to load internship records. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Compute summary stats
  const stats = useMemo(() => {
    const total = internships.length;
    const pending = internships.filter(i => i.status === 'pending').length;
    const verified = internships.filter(i => i.status === 'verified').length;
    const rejected = internships.filter(i => i.status === 'rejected').length;
    return { total, pending, verified, rejected };
  }, [internships]);

  // Apply filters
  const filteredInternships = useMemo(() => {
    return internships.filter((internship) => {
      // Status filter
      if (statusFilter !== 'All' && internship.status !== statusFilter.toLowerCase()) {
        return false;
      }
      
      // Search filter
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const studentName = (internship.student_name || '').toLowerCase();
        const studentId = (internship.student_id || '').toLowerCase();
        const companyName = (internship.company_name || '').toLowerCase();
        
        if (!studentName.includes(term) && !studentId.includes(term) && !companyName.includes(term)) {
          return false;
        }
      }
      
      return true;
    });
  }, [internships, searchTerm, statusFilter]);

  const handleReview = async (internshipSummary) => {
    setReviewLoading(true);
    setApiError(null);
    try {
      // Temporarily set partial data in case loading takes time
      setSelectedInternship(internshipSummary);
      const response = await internshipApi.getInternshipDetails(internshipSummary.id);
      setSelectedInternship(response.data);
    } catch (error) {
      console.error('Error fetching details:', error);
      alert("Unable to load internship details.");
      setSelectedInternship(null); // Fallback to list view on fail
    } finally {
      setReviewLoading(false);
    }
  };

  const handleBack = () => {
    setSelectedInternship(null);
  };

  const handleUpdate = () => {
    fetchInternships(); // Refreshes the background list & counters
    if (selectedInternship) {
      handleReview(selectedInternship); // Refreshes the currently open detail view
    }
  };

  const handleDownloadCSV = () => {
    if (filteredInternships.length === 0) {
      alert("No data available to download.");
      return;
    }

    const headers = [
      "Student",
      "GR Number",
      "Company",
      "Role",
      "Start Date",
      "Work Mode",
      "Status"
    ];

    const escapeCSV = (value) => {
      if (value === null || value === undefined) return '""';
      const str = String(value).replace(/"/g, '""');
      return `"${str}"`;
    };

    const csvRows = [headers.join(',')];
    
    filteredInternships.forEach(internship => {
      const row = [
        escapeCSV(internship.student_name || 'N/A'),
        escapeCSV(internship.student_id),
        escapeCSV(internship.company_name),
        escapeCSV(internship.role),
        escapeCSV(internship.start_date),
        escapeCSV(internship.work_mode),
        escapeCSV(internship.status)
      ];
      csvRows.push(row.join(','));
    });

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'internship-verification.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="internship-verification-page">
      <CollegeHeader />
      
      <div className="announcement-strip">
        📢 Internship Verification — Review and verify student internship records
      </div>

      <div className="verification-container">
        {selectedInternship ? (
          reviewLoading ? (
            <div className="loading-state">Loading internship details...</div>
          ) : (
            <InternshipReview 
              internship={selectedInternship} 
              onBack={handleBack}
              onUpdate={handleUpdate}
            />
          )
        ) : (
          <>
            <div className="page-header">
              <h2>Internship Verification</h2>
              <p>Review and verify student internship submissions.</p>
            </div>

            {/* Error Message */}
            {apiError && (
              <div className="rejection-reason-box" style={{ marginBottom: '1.5rem' }}>
                {apiError}
              </div>
            )}

            {/* Summary Cards */}
            <div className="summary-cards">
              <div className="summary-card pending-card">
                <div className="card-title">Pending</div>
                <div className="card-value">{stats.pending}</div>
              </div>
              <div className="summary-card verified-card">
                <div className="card-title">Verified</div>
                <div className="card-value">{stats.verified}</div>
              </div>
              <div className="summary-card rejected-card">
                <div className="card-title">Rejected</div>
                <div className="card-value">{stats.rejected}</div>
              </div>
              <div className="summary-card total-card">
                <div className="card-title">Total</div>
                <div className="card-value">{stats.total}</div>
              </div>
            </div>

            {/* Filters and Search */}
            <div className="filters-section">
              <div className="search-box">
                <input 
                  type="text" 
                  placeholder="🔍 Search student, GR number or company" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="filter-box">
                <select 
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="All">All Statuses</option>
                  <option value="Pending">Pending</option>
                  <option value="Verified">Verified</option>
                  <option value="Rejected">Rejected</option>
                </select>
                <button 
                  className="btn-download" 
                  onClick={handleDownloadCSV}
                  disabled={filteredInternships.length === 0}
                >
                  ⬇ Download CSV
                </button>
              </div>
            </div>

            {/* Main Table */}
            <div className="table-section">
              {loading ? (
                <div className="loading-state">Loading internship records...</div>
              ) : apiError ? null : internships.length === 0 ? (
                <div className="empty-state">No internship records found.</div>
              ) : (
                <InternshipTable 
                  internships={filteredInternships} 
                  onReview={handleReview}
                />
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default InternshipVerification;
