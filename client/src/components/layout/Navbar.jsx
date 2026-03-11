import { NavLink, useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";

export default function Navbar() {
  const { user, isAuthenticated, logout, loading } = useAuth();
  const navigate = useNavigate();

  const role = String(user?.role || "").toUpperCase();
  const ready = !loading;
  const showAuthed = ready && isAuthenticated;

  const roleBasePath = showAuthed
    ? role === "ADMIN"
      ? "/admin"
      : role === "STUDENT"
        ? "/student"
        : "/instructor"
    : "";

  let navItems;

  if (showAuthed && role === "ADMIN") {
    navItems = [
      { to: "/admin/dashboard", label: "Dashboard", requiresAuth: true },
      { to: "/admin/instructors", label: "Instructors", requiresAuth: true },
      { to: "/admin/instructors/create", label: "Add Instructor", requiresAuth: true },
      { to: "/admin/students", label: "Students", requiresAuth: true },
      { to: "/admin/students/create", label: "Add Student", requiresAuth: true },
      { to: "/courses", label: "Courses", requiresAuth: false },
    ];
  } else {
    navItems = [
      {
        to: showAuthed ? `${roleBasePath}/dashboard` : "/",
        label: "Dashboard",
        requiresAuth: false,
      },
      { to: "/courses", label: "Courses", requiresAuth: false },
      {
        to: `${roleBasePath}/forum`,
        label: "Forum",
        requiresAuth: true,
      },
      {
        to: `${roleBasePath}/announcements`,
        label: "Announcements",
        requiresAuth: true,
        end: true,
      },
      {
        to: `${roleBasePath}/submissions`,
        label: "Submissions",
        requiresAuth: true,
      },
      {
        to: `${roleBasePath}/reviews`,
        label: "Reviews",
        requiresAuth: true,
      },
    ];
  }

  if (showAuthed && role === "STUDENT") {
    navItems.splice(
      2,
      0,
      {
        to: "/student/my-courses",
        label: "My Courses",
        requiresAuth: true,
      },
      {
        to: "/student/certificates",
        label: "Certifications",
        requiresAuth: true,
      },
    );
  }

  if (showAuthed && role === "INSTRUCTOR") {
    navItems.splice(
      2,
      0,
      {
        to: "/instructor/courses",
        label: "My Courses",
        requiresAuth: true,
      },
      {
        to: "/instructor/manage-courses",
        label: "Manage Courses",
        requiresAuth: true,
      },
      {
        to: "/instructor/announcements/new",
        label: "Post Announcement",
        requiresAuth: true,
      },
    );
  }

  const visibleItems = navItems.filter(
    (item) => !item.requiresAuth || showAuthed,
  );

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <header className="border-b bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
        <h1 className="text-xl font-bold text-slate-800">LMS Portal</h1>

        <div className="flex items-center gap-3">
          <nav className="flex gap-2">
            {visibleItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `rounded-lg px-4 py-2 text-sm font-medium ${
                    isActive
                      ? "bg-slate-900 text-white"
                      : "text-slate-700 hover:bg-slate-100"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          {showAuthed ? (
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                {user?.role}
              </span>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-lg px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                Logout
              </button>
            </div>
          ) : ready ? (
            <NavLink
              to="/login"
              className={({ isActive }) =>
                `rounded-lg px-4 py-2 text-sm font-medium ${
                  isActive
                    ? "bg-slate-900 text-white"
                    : "text-slate-700 hover:bg-slate-100"
                }`
              }
            >
              Login
            </NavLink>
          ) : null}
        </div>
      </div>
    </header>
  );
}
