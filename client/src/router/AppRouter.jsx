import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Dashboard from "../pages/Dashboard";
import Courses from "../pages/Courses";
import CourseDetails from "../pages/CourseDetails";
import Forum from "../pages/Forum";
import Announcements from "../pages/Announcements";
import Submissions from "../pages/Submissions";
import Reviews from "../pages/Reviews";
import Login from "../pages/public/Login";
import NotFound from "../pages/public/NotFound";
import Navbar from "../components/layout/Navbar";
import ProtectedRoute from "../routes/ProtectedRoute";
import RoleProtectedRoute from "../routes/RoleProtectedRoute";
import useAuth from "../hooks/useAuth";
import AdminLayout from "../components/layout/AdminLayout";
import AdminDashboard from "../pages/admin/AdminDashboard";
import AdminInstructors from "../pages/admin/AdminInstructors";
import AdminInstructorDetail from "../pages/admin/AdminInstructorDetail";
import AdminInstructorsCreate from "../pages/admin/AdminInstructorsCreate";
import AdminStudents from "../pages/admin/AdminStudents";
import AdminStudentDetail from "../pages/admin/AdminStudentDetail";
import AdminStudentsCreate from "../pages/admin/AdminStudentsCreate";
import StudentDashboard from "../pages/student/StudentDashboard";
import StudentMyCourses from "../pages/student/StudentMyCourses";
import StudentCertificates from "../pages/student/StudentCertificates";
import StudentCertificateDetail from "../pages/student/StudentCertificateDetail";
import StudentSubmitAssignment from "../pages/student/StudentSubmitAssignment";
import StudentCourseAssignments from "../pages/student/StudentCourseAssignments";
import StudentAssignmentDetail from "../pages/student/StudentAssignmentDetail";
import StudentPayments from "../pages/student/StudentPayments";
import StudentPaymentDetail from "../pages/student/StudentPaymentDetail";
import InstructorDashboard from "../pages/instructor/InstructorDashboard";
import InstructorCourses from "../pages/instructor/InstructorCourses";
import InstructorManageCourses from "../pages/instructor/InstructorManageCourses";
import InstructorCourseDetail from "../pages/instructor/InstructorCourseDetail";
import InstructorPostAnnouncement from "../pages/instructor/InstructorPostAnnouncement";
import InstructorSubmissionDetail from "../pages/instructor/InstructorSubmissionDetail";

function RootRoute() {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div className="py-10 text-center text-slate-600">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Dashboard />;
  }

  const role = String(user?.role || "").toUpperCase();
  const target =
    role === "ADMIN"
      ? "/admin/dashboard"
      : role === "STUDENT"
        ? "/student/dashboard"
        : "/instructor/dashboard";

  return <Navigate to={target} replace />;
}

function LegacyProtectedRedirect({ studentTo, instructorTo, adminTo }) {
  const { user } = useAuth();
  const role = String(user?.role || "").toUpperCase();
  const target =
    role === "ADMIN"
      ? adminTo ?? "/admin/dashboard"
      : role === "STUDENT"
        ? studentTo
        : instructorTo;
  return <Navigate to={target} replace />;
}

function AppContent() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");

  return (
    <div className="min-h-screen bg-slate-50">
      {!isAdminRoute && <Navbar />}
      {isAdminRoute ? (
        <Routes>
          <Route path="/admin" element={<RoleProtectedRoute allowedRoles={["ADMIN"]} />}>
            <Route element={<AdminLayout />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="instructors" element={<AdminInstructors />} />
              <Route path="instructors/create" element={<AdminInstructorsCreate />} />
              <Route path="instructors/:id" element={<AdminInstructorDetail />} />
              <Route path="students" element={<AdminStudents />} />
              <Route path="students/create" element={<AdminStudentsCreate />} />
              <Route path="students/:id" element={<AdminStudentDetail />} />
              <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
            </Route>
          </Route>
        </Routes>
      ) : (
        <main className="mx-auto max-w-7xl px-4 py-6">
          <Routes>
            <Route path="/" element={<RootRoute />} />
            <Route path="/login" element={<Login />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/courses/:courseId" element={<CourseDetails />} />

            <Route element={<RoleProtectedRoute allowedRoles={["STUDENT"]} />}>
              <Route
                path="/student"
                element={<Navigate to="/student/dashboard" replace />}
              />
              <Route path="/student/dashboard" element={<StudentDashboard />} />
              <Route
                path="/student/my-courses"
                element={<StudentMyCourses />}
              />
              <Route
                path="/student/certificates"
                element={<StudentCertificates />}
              />
              <Route
                path="/student/certificates/:certificateId"
                element={<StudentCertificateDetail />}
              />
              <Route
                path="/student/submit-assignment"
                element={<StudentSubmitAssignment />}
              />
              <Route
                path="/student/courses/:courseId/assignments"
                element={<StudentCourseAssignments />}
              />
              <Route
                path="/student/courses/:courseId/assignments/:moduleId"
                element={<StudentAssignmentDetail />}
              />
              <Route path="/student/forum" element={<Forum />} />
              <Route
                path="/student/announcements"
                element={<Announcements />}
              />
              <Route path="/student/submissions" element={<Submissions />} />
              <Route path="/student/reviews" element={<Reviews />} />
              <Route path="/student/payments" element={<StudentPayments />} />
              <Route
                path="/student/payments/:enrollmentId"
                element={<StudentPaymentDetail />}
              />
            </Route>

            <Route element={<RoleProtectedRoute allowedRoles={["INSTRUCTOR"]} />}>
              <Route
                path="/instructor"
                element={<Navigate to="/instructor/dashboard" replace />}
              />
              <Route
                path="/instructor/dashboard"
                element={<InstructorDashboard />}
              />
              <Route
                path="/instructor/courses"
                element={<InstructorCourses />}
              />
              <Route
                path="/instructor/courses/:courseId"
                element={<InstructorCourseDetail />}
              />
              <Route
                path="/instructor/manage-courses"
                element={<InstructorManageCourses />}
              />
              <Route
                path="/instructor/announcements/new"
                element={<InstructorPostAnnouncement />}
              />
              <Route path="/instructor/forum" element={<Forum />} />
              <Route
                path="/instructor/announcements"
                element={<Announcements />}
              />
              <Route path="/instructor/submissions" element={<Submissions />} />
              <Route
                path="/instructor/submissions/:id"
                element={<InstructorSubmissionDetail />}
              />
              <Route path="/instructor/reviews" element={<Reviews />} />
            </Route>

            <Route element={<ProtectedRoute />}>
              <Route
                path="/forum"
                element={
                  <LegacyProtectedRedirect
                    studentTo="/student/forum"
                    instructorTo="/instructor/forum"
                    adminTo="/admin/dashboard"
                  />
                }
              />
              <Route
                path="/announcements"
                element={
                  <LegacyProtectedRedirect
                    studentTo="/student/announcements"
                    instructorTo="/instructor/announcements"
                    adminTo="/admin/dashboard"
                  />
                }
              />
              <Route
                path="/submissions"
                element={
                  <LegacyProtectedRedirect
                    studentTo="/student/submissions"
                    instructorTo="/instructor/submissions"
                    adminTo="/admin/dashboard"
                  />
                }
              />
              <Route
                path="/reviews"
                element={
                  <LegacyProtectedRedirect
                    studentTo="/student/reviews"
                    instructorTo="/instructor/reviews"
                    adminTo="/admin/dashboard"
                  />
                }
              />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      )}
    </div>
  );
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
