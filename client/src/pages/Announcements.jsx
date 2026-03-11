import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  getAllAnnouncements,
  getAnnouncementsByCourse,
  getAnnouncementsByModule,
} from "../api/announcementsApi";
import {
  getCourses,
  getEnrollmentsByStudentId,
  getModulesByCourse,
} from "../api/oracleApi";
import useAuth from "../hooks/useAuth";

export default function Announcements() {
  const { user } = useAuth();
  const role = String(user?.role || "").toUpperCase();

  const [searchParams, setSearchParams] = useSearchParams();
  const initialCourseId = searchParams.get("courseId") || "";
  const initialModuleId = searchParams.get("moduleId") || "";

  const [items, setItems] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [modules, setModules] = useState([]);

  const [courseId, setCourseId] = useState(initialCourseId);
  const [moduleId, setModuleId] = useState(initialModuleId);

  useEffect(() => {
    const loadMeta = async () => {
      try {
        const data = await getCourses();
        setCourses(data || []);

        if (role === "STUDENT" && user?.student_id) {
          const enrollmentData = await getEnrollmentsByStudentId(
            user.student_id,
          );
          setEnrollments(enrollmentData || []);
        } else {
          setEnrollments([]);
        }
      } catch {
        setCourses([]);
        setEnrollments([]);
      }
    };

    loadMeta();
  }, [role, user?.student_id]);

  const allowedCourseIds = useMemo(() => {
    if (role === "ADMIN") {
      return null;
    }

    if (role === "INSTRUCTOR") {
      const myInstructorId = user?.instructor_id;
      if (!myInstructorId) return new Set();
      const ids = new Set(
        (courses || [])
          .filter(
            (c) =>
              Number(c.INSTRUCTOR_ID ?? c.instructor_id) ===
              Number(myInstructorId),
          )
          .map((c) => Number(c.COURSE_ID ?? c.course_id)),
      );
      return ids;
    }

    if (role === "STUDENT") {
      const ids = new Set(
        (enrollments || []).map((e) => Number(e.COURSE_ID ?? e.course_id)),
      );
      return ids;
    }

    return new Set();
  }, [courses, enrollments, role, user?.instructor_id]);

  const courseOptions = useMemo(() => {
    const list = (courses || [])
      .filter((c) => {
        if (allowedCourseIds === null) return true;
        const id = Number(c.COURSE_ID ?? c.course_id);
        return allowedCourseIds.has(id);
      })
      .map((c) => ({
        id: String(c.COURSE_ID ?? c.course_id),
        title: c.COURSE_TITLE ?? c.course_title,
      }));
    list.sort((a, b) => a.title.localeCompare(b.title));
    return list;
  }, [allowedCourseIds, courses]);

  useEffect(() => {
    const loadModules = async () => {
      if (!courseId) {
        setModules([]);
        setModuleId("");
        return;
      }

      try {
        const data = await getModulesByCourse(courseId);
        setModules(data || []);
      } catch {
        setModules([]);
      }
    };

    loadModules();
  }, [courseId]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError("");

      try {
        const data = moduleId
          ? await getAnnouncementsByModule(moduleId)
          : courseId
            ? await getAnnouncementsByCourse(courseId)
            : await getAllAnnouncements();

        let list = data || [];

        if (allowedCourseIds && allowedCourseIds !== null) {
          list = list.filter((a) => allowedCourseIds.has(Number(a.course_id)));
        }

        if (courseId) {
          list = list.filter((a) => String(a.course_id) === String(courseId));
        }

        if (moduleId) {
          list = list.filter((a) => String(a.module_id) === String(moduleId));
        }

        list.sort((a, b) => new Date(b.posted_at) - new Date(a.posted_at));
        setItems(list);
      } catch (err) {
        console.error(err);
        const msg =
          err?.response?.data?.message ||
          err?.message ||
          "Failed to load announcements";
        setError(msg);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [allowedCourseIds, courseId, moduleId]);

  const normalizedModules = useMemo(() => {
    return (modules || []).map((m) => ({
      id: String(m.MODULE_ID ?? m.module_id),
      title: m.MODULE_TITLE ?? m.module_title,
      order: m.MODULE_ORDER ?? m.module_order,
    }));
  }, [modules]);

  const updateQueryParams = (nextCourseId, nextModuleId) => {
    const nextParams = new URLSearchParams(searchParams);
    if (nextCourseId) nextParams.set("courseId", nextCourseId);
    else nextParams.delete("courseId");
    if (nextModuleId) nextParams.set("moduleId", nextModuleId);
    else nextParams.delete("moduleId");
    setSearchParams(nextParams, { replace: true });
  };

  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="mb-2 text-2xl font-bold text-slate-800">
            Announcements
          </h2>
          <p className="text-sm text-slate-600">
            {role === "INSTRUCTOR" || role === "ADMIN"
              ? "Filter announcements by course/module and create new announcements."
              : "Announcements for your courses."}
          </p>
        </div>
        {role === "INSTRUCTOR" || role === "ADMIN" ? (
          <Link
            to={
              courseId
                ? `/instructor/announcements/new?courseId=${encodeURIComponent(
                    String(courseId),
                  )}`
                : "/instructor/announcements/new"
            }
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
          >
            Create announcement
          </Link>
        ) : null}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-800">Filter</h3>

            <label className="mt-4 block text-sm font-medium text-slate-700">
              Course
            </label>
            <select
              value={courseId}
              onChange={(e) => {
                setCourseId(e.target.value);
                setModuleId("");
                updateQueryParams(e.target.value, "");
              }}
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900"
            >
              <option value="">All courses</option>
              {courseOptions.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title} (ID: {c.id})
                </option>
              ))}
            </select>

            <label className="mt-4 block text-sm font-medium text-slate-700">
              Module
            </label>
            <select
              value={moduleId}
              onChange={(e) => {
                setModuleId(e.target.value);
                updateQueryParams(courseId, e.target.value);
              }}
              disabled={!courseId}
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900"
            >
              <option value="">All modules</option>
              {normalizedModules.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.order ? `Module ${m.order}: ` : ""}
                  {m.title} (ID: {m.id})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="lg:col-span-3">
          {error ? (
            <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          {loading ? (
            <div className="py-10 text-center text-slate-600">Loading...</div>
          ) : items.length === 0 ? (
            <div className="rounded-2xl border bg-white p-6 text-slate-600 shadow-sm">
              No announcements found.
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item._id}
                  className="rounded-2xl border bg-white p-5 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="text-lg font-semibold text-slate-800">
                      {item.title}
                    </h3>
                    <div className="text-xs text-slate-500">
                      {item.posted_at
                        ? new Date(item.posted_at).toLocaleString()
                        : ""}
                    </div>
                  </div>
                  <p className="mt-2 text-slate-600">{item.message}</p>
                  <p className="mt-3 text-sm text-slate-500">
                    Course ID: {item.course_id}
                    {item.module_id ? ` | Module ID: ${item.module_id}` : ""}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
