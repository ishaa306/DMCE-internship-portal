import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

/* ---------------------------------------------------------------------------
   OPTION B: Company routes WITHOUT ProtectedRoute wrapper
   
   Route groups (organized imports for readability):
   - Home / Landing
   - Student (protected with ProtectedRoute)
   - Company (NO ProtectedRoute - temporary solution)
   - TPO (protected with ProtectedRoute)
   - TnPCO (protected with ProtectedRoute)
   - Admin (protected with ProtectedRoute)
   
   ⚠️ IMPORTANT SECURITY NOTE:
   Company routes are currently NOT protected by ProtectedRoute to avoid the 
   redirect-to-home issue. This is a TEMPORARY solution and NOT secure for production.
   
   Long-term fix: Implement separate verify endpoints for each user type (Option A)
   ---------------------------------------------------------------------------*/

/* -------------------- Home / Landing -------------------- */
import RoleHome from "./Home/RoleHome";

/* -------------------- Student -------------------- */
import Login from "./student/components/Login";
import Register from "./student/components/Register";
import ForgotPassword from "./student/components/forgotPassword";
import ChangePassword from "./student/components/ChangePassword";
import StudentDashboard from "./student/pages/StudentDashboard";
import Dashboard from "./student/components/Dashboard";
import ViewProfile from "./student/pages/ViewProfile";
import UpdateViewProfile from "./student/pages/EditProfile/UpdateViewProfile";
import ViewOpportunities from "./student/pages/ViewOpportunities";
import FullViewOpportunities from "./student/pages/FullViewOpportunities";
import ViewApplicationStatus from "./student/pages/ViewApplicationStatus";
import StudentTerms from "./student/components/StudentTerms";
import UnderDevelopmentPage from "./student/pages/UnderDevelopmentPage";
import StudentViewAnnouncement from "./student/components/StudentViewAnnouncement";
import InternshipUpdates from "./student/pages/InternshipUpdates/InternshipUpdates";

/* -------------------- Company -------------------- */
import CompanyLogin from "./company/Login/CompanyLogin";
import CompanyRegister from "./company/CompanyRegister";
import CompanyChangePassword from "./company/Login/ChangePassword";
import CompanyForgotPassword from "./company/Login/forgotPassword";
import CompanyDashboard from "./company/CompanyDashboard";
import CompanySidebar from "./company/Jobposting/CompanySidebar";
import ViewApplicants from "./company/ViewApplicants/ViewApplicants";
import ViewJobListings from "./company/ViewJobListing/ViewJobListings";
import ViewSinglePosting from "./company/SinglePosting/ViewSinglePosting";
import UploadResult from "./company/Result/UploadResult";
import CompanyEditProfile from "./company/Profile/CompanyEditProfile";
import CompanyViewProfile from "./company/Profile/CompanyViewProfile";

/* -------------------- TPO (Training & Placement Officer) -------------------- */
import TpOLogin from "./tnp/Login/TpOLogin";
import TpoDashboard from "./tnp/Dashboard/TpoDashboard";
import TpOUpdatePassword from "./tnp/Login/TpOUpdatePassword";
import CreateAnnouncement from "./tnp/Announcements/CreateAnnouncement";
import ViewAnnouncements from "./tnp/Announcements/ViewAnnouncements";
import CompanyInvite from "./tnp/CompanyInvite/CompanyInvite";
import PlacementRecords from "./tnp/Records/Students/ViewPlacementRecord";
import ViewAnalytics from "./tnp/Records/Students/ViewAnalytics";

/* -------------------- TnPCO (TPO Coordinator) -------------------- */
import TnPCOLogin from "./TnpCO/components/TnPCOLogin";
import TnpCoordinator from "./TnpCO/pages/TnpCoordinator";
import TnPCODashboard from "./TnpCO/dashboard/TnPCODashboard";
import TnPCOUpdatepassword from "./TnpCO/components/TnPCOUpdatepassword";
import StudentUpload from "./TnpCO/components/StudentUpload";
import FilterTable from "./TnpCO/components/FilterTable";
import TnpCoordinatorRegister from "./TnpCO/Register/TnpCoordinatorRegister";
import TnpCoordinatorProfile from "./TnpCO/components/TnPCOProfile";
import TnpCoordinatorEditV2 from "./TnpCO/components/EditProfile";
import InternshipVerification from "./TnpCO/InternshipVerification/InternshipVerification";

/* -------------------- Admin -------------------- */
import AdminLogin from "./admin/Login/AdminLogin";
import AdminDashboard from "./admin/Dashboard/AdminDashboard";
import TpoInvite from "./admin/Invitation/TpO/TpOInvite";
import TpoCoordinatorInvite from "./admin/Invitation/Tnpco/TpoCoordinatorInvite";

/* ---------------------------------------------------------------------------
  App Component - Option B Implementation
  
  PUBLIC ROUTES: No authentication required
  STUDENT ROUTES: Protected with ProtectedRoute
  COMPANY ROUTES: NOT protected (temporary - allows immediate access after login)
  TPO/TnPCO/ADMIN ROUTES: Protected with ProtectedRoute
  ---------------------------------------------------------------------------*/
function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* ============================================================
              PUBLIC ROUTES (No authentication required)
              ============================================================ */}

          {/* Landing page */}
          <Route path="/" element={<RoleHome />} />

          {/* Student authentication */}
          <Route path="/student-login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/student-terms" element={<StudentTerms />} />
          <Route
            path="/student-view-announcements"
            element={<StudentViewAnnouncement />}
          />

          {/* Company authentication */}
          <Route path="/company-login" element={<CompanyLogin />} />
          <Route path="/company-register" element={<CompanyRegister />} />
          <Route
            path="/company/forgot-password"
            element={<CompanyForgotPassword />}
          />

          {/* TPO authentication */}
          <Route path="/tpo-login" element={<TpOLogin />} />
          <Route path="/tpo/update-password" element={<TpOUpdatePassword />} />

          {/* TnPCO authentication */}
          <Route path="/tnpco-login" element={<TnPCOLogin />} />
          <Route
            path="/tnpco/update-password"
            element={<TnPCOUpdatepassword />}
          />

          {/* Admin authentication */}
          <Route path="/admin-login" element={<AdminLogin />} />

          {/* Semi-protected password update routes */}
          <Route
            path="/company/update-pass"
            element={<CompanyChangePassword />}
          />
          <Route path="/update-pass" element={<ChangePassword />} />

          {/* TPO placement records (currently public - can be protected later) */}
          <Route
            path="/tpo/student-placement-records"
            element={<PlacementRecords />}
          />

          {/* ============================================================
              STUDENT PROTECTED ROUTES
              ============================================================ */}

          <Route
            path="/student-dashboard"
            element={
              <ProtectedRoute>
                <StudentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/internships"
            element={
              <ProtectedRoute>
                <InternshipUpdates />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ViewProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile/update"
            element={
              <ProtectedRoute>
                <UpdateViewProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/view-opportunities"
            element={
              <ProtectedRoute>
                <ViewOpportunities />
              </ProtectedRoute>
            }
          />
          <Route
            path="/opportunity/:id"
            element={
              <ProtectedRoute>
                <FullViewOpportunities />
              </ProtectedRoute>
            }
          />
          <Route
            path="/view-application-status"
            element={
              <ProtectedRoute>
                <ViewApplicationStatus />
              </ProtectedRoute>
            }
          />
          <Route
            path="/under-development"
            element={
              <ProtectedRoute>
                <UnderDevelopmentPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/change-password"
            element={
              <ProtectedRoute>
                <ChangePassword />
              </ProtectedRoute>
            }
          />

          {/* ============================================================
              COMPANY ROUTES - NO PROTECTEDROUTE (Option B - Temporary)
              ⚠️ NOT SECURE - Add proper authentication later
              ============================================================ */}

          <Route path="/company-dashboard" element={<CompanyDashboard />} />
          <Route path="/company/create-job" element={<CompanySidebar />} />
          <Route path="/company/view-applicants" element={<ViewApplicants />} />
          <Route
            path="/company/view-job-listings"
            element={<ViewJobListings />}
          />
          <Route path="/company/job/:jobId" element={<ViewSinglePosting />} />
          <Route
            path="/company/view-posting/:id"
            element={<ViewSinglePosting />}
          />
          <Route path="/company/upload-result" element={<UploadResult />} />
          <Route
            path="/company/edit-profile"
            element={<CompanyEditProfile />}
          />
          <Route
            path="/company/view-profile"
            element={<CompanyViewProfile />}
          />
          <Route
            path="/company/change-password"
            element={<CompanyChangePassword />}
          />

          {/* ============================================================
              TPO PROTECTED ROUTES
              ============================================================ */}

          <Route
            path="/tpo/dashboard"
            element={
              <ProtectedRoute>
                <TpoDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tpo/create-announcement"
            element={
              <ProtectedRoute>
                <CreateAnnouncement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tpo/view-announcements"
            element={
              <ProtectedRoute>
                <ViewAnnouncements />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tpo/company-invite"
            element={
              <ProtectedRoute>
                <CompanyInvite />
              </ProtectedRoute>
            }
          />

          <Route path="/tpo/view-analytics" element={<ViewAnalytics />} />

          {/* ============================================================
              TnPCO PROTECTED ROUTES
              ============================================================ */}

          <Route
            path="/tnpco/dashboard"
            element={
              <ProtectedRoute>
                <TnPCODashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tnpco/student-upload"
            element={
              <ProtectedRoute>
                <StudentUpload />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tnpco/analytics"
            element={
              <ProtectedRoute>
                <FilterTable />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tnpco/create-profile"
            element={
              <ProtectedRoute>
                <TnpCoordinatorRegister />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tnpco/profile"
            element={
              <ProtectedRoute>
                <TnpCoordinatorProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tnpco/edit-profile"
            element={
              <ProtectedRoute>
                <TnpCoordinatorEditV2 />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tnpco/coordinators"
            element={
              <ProtectedRoute>
                <TnpCoordinator />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tnpco/internships"
            element={
              <ProtectedRoute>
                <InternshipVerification />
              </ProtectedRoute>
            }
          />

          {/* ============================================================
              ADMIN PROTECTED ROUTES
              ============================================================ */}

          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/tpo-invite"
            element={
              <ProtectedRoute>
                <TpoInvite />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/tnpco-invite"
            element={
              <ProtectedRoute>
                <TpoCoordinatorInvite />
              </ProtectedRoute>
            }
          />

          {/* Catch-all: redirect unknown routes to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
