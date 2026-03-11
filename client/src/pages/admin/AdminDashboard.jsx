import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import { getAllInstructors } from "../../api/oracleInstructorsApi";
import { getAllStudents } from "../../api/oracleStudentsApi";
import Spinner from "../../components/ui/Spinner";

const RECENT_LIMIT = 5;

export default function AdminDashboard() {
  const { user } = useAuth();
  const [instructors, setInstructors] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const [instructorData, studentData] = await Promise.all([
          getAllInstructors(),
          getAllStudents(),
        ]);
        setInstructors(instructorData || []);
        setStudents(studentData || []);
      } catch {
        setError("Failed to load dashboard data.");
        setInstructors([]);
        setStudents([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const recentInstructors = instructors.slice(-RECENT_LIMIT).reverse();
  const recentStudents = students.slice(-RECENT_LIMIT).reverse();
  const row = (r, type) => ({
    id: r[type === "instructor" ? "INSTRUCTOR_ID" : "STUDENT_ID"] ?? r[type === "instructor" ? "instructor_id" : "student_id"],
    name: `${r.FIRST_NAME ?? r.first_name ?? ""} ${r.LAST_NAME ?? r.last_name ?? ""}`.trim(),
    email: r.EMAIL ?? r.email,
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Admin Dashboard</h2>
        <p className="mt-1 text-slate-600">Welcome, {user?.email}.</p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Summary cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="text-sm font-medium text-slate-500">Total Instructors</div>
          <div className="mt-2 text-3xl font-bold text-slate-900">{instructors.length}</div>
          <Link
            to="/admin/instructors"
            className="mt-4 inline-flex items-center text-sm font-semibold text-slate-900 hover:underline"
          >
            Manage instructors →
          </Link>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="text-sm font-medium text-slate-500">Total Students</div>
          <div className="mt-2 text-3xl font-bold text-slate-900">{students.length}</div>
          <Link
            to="/admin/students"
            className="mt-4 inline-flex items-center text-sm font-semibold text-slate-900 hover:underline"
          >
            Manage students →
          </Link>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="text-sm font-medium text-slate-500">Quick Actions</div>
          <div className="mt-4 flex flex-col gap-3">
            <Link
              to="/admin/instructors/create"
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
            >
              Create instructor
            </Link>
            <Link
              to="/admin/students/create"
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Create student
            </Link>
          </div>
        </div>
      </div>

      {/* Quick links */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-800">Quick Links</h3>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            to="/admin/instructors/create"
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Create instructor
          </Link>
          <Link
            to="/admin/instructors"
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Manage instructors
          </Link>
          <Link
            to="/admin/students/create"
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Create student
          </Link>
          <Link
            to="/admin/students"
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Manage students
          </Link>
          <Link
            to="/courses"
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            View courses
          </Link>
        </div>
      </div>

      {/* Recent overview */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-800">Recent Instructors</h3>
            <Link to="/admin/instructors" className="text-sm font-medium text-slate-600 hover:underline">
              View all
            </Link>
          </div>
          {recentInstructors.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">No instructors yet.</p>
          ) : (
            <ul className="mt-4 space-y-2">
              {recentInstructors.map((i) => {
                const r = row(i, "instructor");
                return (
                  <li
                    key={r.id}
                    className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2"
                  >
                    <div>
                      <span className="font-medium text-slate-800">{r.name}</span>
                      <span className="ml-2 text-xs text-slate-500">#{r.id}</span>
                    </div>
                    <span className="text-sm text-slate-600">{r.email}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-800">Recent Students</h3>
            <Link to="/admin/students" className="text-sm font-medium text-slate-600 hover:underline">
              View all
            </Link>
          </div>
          {recentStudents.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">No students yet.</p>
          ) : (
            <ul className="mt-4 space-y-2">
              {recentStudents.map((s) => {
                const r = row(s, "student");
                return (
                  <li
                    key={r.id}
                    className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2"
                  >
                    <div>
                      <span className="font-medium text-slate-800">{r.name}</span>
                      <span className="ml-2 text-xs text-slate-500">#{r.id}</span>
                    </div>
                    <span className="text-sm text-slate-600">{r.email}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
