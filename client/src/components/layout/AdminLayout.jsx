import { NavLink, Outlet, useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";

const adminNavItems = [
  { to: "/admin/dashboard", label: "Dashboard", end: true },
  { to: "/admin/instructors", label: "Instructors", end: false },
  { to: "/admin/instructors/create", label: "Add Instructor", end: true },
  { to: "/admin/students", label: "Students", end: false },
  { to: "/admin/students/create", label: "Add Student", end: true },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Admin sidebar */}
      <aside className="fixed inset-y-0 left-0 z-10 w-56 border-r border-slate-200 bg-white">
        <div className="flex h-full flex-col">
          <div className="border-b border-slate-200 px-4 py-5">
            <h2 className="text-lg font-bold text-slate-800">LMS Admin</h2>
            <p className="mt-1 text-xs text-slate-500">Management</p>
          </div>

          <nav className="flex-1 space-y-0.5 p-3">
            {adminNavItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `block rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
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

          <div className="border-t border-slate-200 p-3">
            <NavLink
              to="/courses"
              className="block rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100"
            >
              View Courses
            </NavLink>
          </div>
        </div>
      </aside>

      {/* Main content area */}
      <div className="ml-56 flex flex-1 flex-col">
        {/* Admin top bar */}
        <header className="sticky top-0 z-10 border-b border-slate-200 bg-white">
          <div className="flex items-center justify-between px-6 py-4">
            <h1 className="text-xl font-bold text-slate-800">LMS Portal</h1>
            <div className="flex items-center gap-3">
              <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
                ADMIN
              </span>
              <span className="text-sm text-slate-600">{user?.email}</span>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-lg px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
