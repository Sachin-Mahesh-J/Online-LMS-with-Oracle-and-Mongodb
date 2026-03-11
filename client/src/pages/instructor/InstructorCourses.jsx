import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getCourses } from "../../api/oracleApi";
import useAuth from "../../hooks/useAuth";

export default function InstructorCourses() {
  const { user } = useAuth();
  const role = String(user?.role || "").toUpperCase();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");

      try {
        const data = await getCourses();
        setCourses(data || []);
      } catch (err) {
        const msg =
          err?.response?.data?.message || err?.message || "Failed to load";
        setError(msg);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const visibleCourses = useMemo(() => {
    const instructorId = user?.instructor_id;

    if (role === "ADMIN" || !instructorId) {
      return courses || [];
    }

    return (courses || []).filter(
      (c) => Number(c.INSTRUCTOR_ID ?? c.instructor_id) === Number(instructorId),
    );
  }, [courses, role, user?.instructor_id]);

  if (loading) {
    return <div className="py-10 text-center text-slate-600">Loading...</div>;
  }

  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">My Courses</h2>
          <p className="mt-2 text-slate-600">
            Courses you teach (Oracle). Click into a course to manage modules,
            announcements, and monitoring.
          </p>
        </div>
        <Link
          to="/instructor/dashboard"
          className="rounded-lg border bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Back to dashboard
        </Link>
      </div>

      {error ? (
        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {visibleCourses.length === 0 ? (
        <div className="mt-6 rounded-2xl border bg-white p-6 text-slate-600 shadow-sm">
          No courses found.
        </div>
      ) : (
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {visibleCourses.map((c) => {
            const id = c.COURSE_ID ?? c.course_id;
            const title = c.COURSE_TITLE ?? c.course_title;
            const category = c.CATEGORY ?? c.category;
            const status = c.STATUS ?? c.status;

            return (
              <div
                key={id}
                className="rounded-2xl border bg-white p-5 shadow-sm"
              >
                <div className="text-lg font-semibold text-slate-800">{title}</div>
                <div className="mt-2 text-sm text-slate-600">
                  Course ID: {id}
                  {category ? ` | ${category}` : ""}
                  {status ? ` | ${status}` : ""}
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <Link
                    to={`/instructor/courses/${id}`}
                    className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white"
                  >
                    Open
                  </Link>
                  <Link
                    to={`/courses/${id}`}
                    className="rounded-lg border bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Public view
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
