import { Navigate, Outlet, useLocation } from "react-router-dom";
import useAuth from "../hooks/useAuth";

export default function RoleProtectedRoute({ allowedRoles = [] }) {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="py-10 text-center text-slate-600">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  const role = String(user?.role || "").toUpperCase();
  const normalizedAllowed = allowedRoles.map((r) => String(r).toUpperCase());

  if (!normalizedAllowed.includes(role)) {
    const fallback =
      role === "ADMIN"
        ? "/admin/dashboard"
        : role === "STUDENT"
          ? "/student/dashboard"
          : "/instructor/dashboard";
    return <Navigate to={fallback} replace />;
  }

  return <Outlet />;
}
