import { useEffect, useMemo, useState } from "react";
import {
  getAllSubmissions,
  getSubmissionsByStudent,
} from "../api/submissionsApi";
import useAuth from "../hooks/useAuth";
import { Link, useSearchParams } from "react-router-dom";
import { getCourses } from "../api/oracleApi";

export default function Submissions() {
  const { user } = useAuth();

  const [searchParams, setSearchParams] = useSearchParams();
  const initialCourseId = searchParams.get("courseId") || "";
  const initialModuleId = searchParams.get("moduleId") || "";

  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [courseFilter, setCourseFilter] = useState(initialCourseId);
  const [moduleFilter, setModuleFilter] = useState(initialModuleId);

  const [courses, setCourses] = useState([]);

  const role = useMemo(() => {
    return String(user?.role || "").toUpperCase();
  }, [user?.role]);

  useEffect(() => {
    const loadData = async () => {
      try {
        if (!user) {
          return;
        }

        setLoading(true);
        setError("");

        const [data, courseData] = await Promise.all([
          role === "STUDENT"
            ? getSubmissionsByStudent(user.student_id)
            : getAllSubmissions(),
          getCourses(),
        ]);

        setSubmissions(data || []);
        setCourses(courseData || []);
      } catch (error) {
        console.error(error);
        const msg =
          error?.response?.data?.message || error?.message || "Failed to load";
        setError(msg);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [role, user]);

  const allowedCourseIds = useMemo(() => {
    if (role === "ADMIN") return null;
    if (role === "INSTRUCTOR") {
      const myInstructorId = user?.instructor_id;
      if (!myInstructorId) return new Set();

      return new Set(
        (courses || [])
          .filter(
            (c) =>
              Number(c.INSTRUCTOR_ID ?? c.instructor_id) ===
              Number(myInstructorId),
          )
          .map((c) => Number(c.COURSE_ID ?? c.course_id)),
      );
    }

    return new Set();
  }, [courses, role, user?.instructor_id]);

  const updateQueryParams = (nextCourseId, nextModuleId) => {
    const nextParams = new URLSearchParams(searchParams);
    if (nextCourseId) nextParams.set("courseId", nextCourseId);
    else nextParams.delete("courseId");
    if (nextModuleId) nextParams.set("moduleId", nextModuleId);
    else nextParams.delete("moduleId");
    setSearchParams(nextParams, { replace: true });
  };

  const courseOptions = useMemo(() => {
    const ids = new Set(
      (submissions || []).map((s) => String(s.course_id ?? "")),
    );
    ids.delete("");
    let list = Array.from(ids);

    if (role === "INSTRUCTOR" && allowedCourseIds) {
      list = list.filter((id) => allowedCourseIds.has(Number(id)));
    }

    return list.sort((a, b) => Number(a) - Number(b));
  }, [allowedCourseIds, role, submissions]);

  const moduleOptions = useMemo(() => {
    const ids = new Set(
      (submissions || [])
        .filter((s) =>
          courseFilter ? String(s.course_id) === courseFilter : true,
        )
        .map((s) => String(s.module_id ?? "")),
    );
    ids.delete("");
    return Array.from(ids).sort((a, b) => Number(a) - Number(b));
  }, [courseFilter, submissions]);

  const filteredSubmissions = useMemo(() => {
    let list = submissions || [];

    if (role === "INSTRUCTOR" && allowedCourseIds) {
      list = list.filter((s) => allowedCourseIds.has(Number(s.course_id)));
    }

    return list.filter((s) => {
      if (courseFilter && String(s.course_id) !== courseFilter) return false;
      if (moduleFilter && String(s.module_id) !== moduleFilter) return false;
      return true;
    });
  }, [allowedCourseIds, courseFilter, moduleFilter, role, submissions]);

  return (
    <div>
      <h2 className="mb-6 text-2xl font-bold text-slate-800">
        {role === "STUDENT" ? "My Submissions" : "All Submissions"}
      </h2>

      {error ? (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {role === "STUDENT" || role === "INSTRUCTOR" || role === "ADMIN" ? (
        <div className="mb-6 grid gap-3 rounded-2xl border bg-white p-5 shadow-sm md:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-slate-700">Course</label>
            <select
              value={courseFilter}
              onChange={(e) => {
                setCourseFilter(e.target.value);
                setModuleFilter("");
                updateQueryParams(e.target.value, "");
              }}
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900"
            >
              <option value="">All courses</option>
              {courseOptions.map((id) => (
                <option key={id} value={id}>
                  Course {id}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">Module</label>
            <select
              value={moduleFilter}
              onChange={(e) => {
                setModuleFilter(e.target.value);
                updateQueryParams(courseFilter, e.target.value);
              }}
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900"
              disabled={!courseFilter}
            >
              <option value="">All modules</option>
              {moduleOptions.map((id) => (
                <option key={id} value={id}>
                  Module {id}
                </option>
              ))}
            </select>
          </div>
        </div>
      ) : null}

      {loading ? (
        <div className="py-10 text-center text-slate-600">Loading...</div>
      ) : (
        <div className="space-y-4">
          {filteredSubmissions.map((item) => (
            <div
              key={item._id}
              className="rounded-2xl border bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold">
                    {item.submission_title}
                  </h3>
                  <p className="mt-2 text-slate-600">
                    {item.file_name} ({item.file_type})
                  </p>
                </div>

                {role === "INSTRUCTOR" || role === "ADMIN" ? (
                  <Link
                    to={`/instructor/submissions/${item._id}`}
                    className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white"
                  >
                    View details
                  </Link>
                ) : null}
              </div>

              {item.file_url ? (
                <a
                  href={`http://localhost:5000${item.file_url}`}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-block text-sm font-medium text-slate-900 underline"
                >
                  Download file
                </a>
              ) : null}
              <p className="mt-2 text-sm text-slate-500">
                Status: {item.status}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Course ID: {item.course_id} | Module ID: {item.module_id}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Submitted:{" "}
                {item.submitted_at
                  ? new Date(item.submitted_at).toLocaleString()
                  : "-"}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
