import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getAllAnnouncements } from "../../api/announcementsApi";
import { getCourses, getModulesByCourse } from "../../api/oracleApi";
import { getAllSubmissions } from "../../api/submissionsApi";
import { getAllReviews } from "../../api/reviewsApi";
import useAuth from "../../hooks/useAuth";

export default function InstructorDashboard() {
  const { user } = useAuth();
  const role = String(user?.role || "").toUpperCase();
  const instructorId = user?.instructor_id;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [courses, setCourses] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [modules, setModules] = useState([]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");

      try {
        const courseData = await getCourses();

        const myCourses =
          role === "ADMIN" || !instructorId
            ? courseData || []
            : (courseData || []).filter(
                (c) =>
                  Number(c.INSTRUCTOR_ID ?? c.instructor_id) ===
                  Number(instructorId),
              );

        const allowedCourseIds = new Set(
          myCourses.map((c) => Number(c.COURSE_ID ?? c.course_id)),
        );

        const [allAnnouncements, allSubmissions, allReviews] =
          await Promise.all([
            getAllAnnouncements(),
            getAllSubmissions(),
            getAllReviews(),
          ]);

        const filteredAnnouncements = (allAnnouncements || [])
          .filter((a) => allowedCourseIds.has(Number(a.course_id)))
          .sort((a, b) => new Date(b.posted_at) - new Date(a.posted_at));

        const filteredSubmissions = (allSubmissions || [])
          .filter((s) => allowedCourseIds.has(Number(s.course_id)))
          .sort((a, b) => new Date(b.submitted_at) - new Date(a.submitted_at));

        const filteredReviews = (allReviews || [])
          .filter((r) => allowedCourseIds.has(Number(r.course_id)))
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        const modulePromises = myCourses.slice(0, 10).map((c) => {
          const id = c.COURSE_ID ?? c.course_id;
          return getModulesByCourse(id);
        });

        const moduleResults = await Promise.all(modulePromises);
        const flattenedModules = moduleResults
          .flatMap((list) => list || [])
          .map((m) => ({
            course_id: m.COURSE_ID ?? m.course_id,
            module_id: m.MODULE_ID ?? m.module_id,
            module_title: m.MODULE_TITLE ?? m.module_title,
            module_order: m.MODULE_ORDER ?? m.module_order,
          }))
          .sort((a, b) => Number(b.module_id) - Number(a.module_id));

        setCourses(myCourses);
        setAnnouncements(filteredAnnouncements);
        setSubmissions(filteredSubmissions);
        setReviews(filteredReviews);
        setModules(flattenedModules);
      } catch (err) {
        const msg =
          err?.response?.data?.message || err?.message || "Failed to load";
        setError(msg);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [instructorId, role]);

  const courseCount = courses.length;

  const latestAnnouncements = useMemo(
    () => announcements.slice(0, 5),
    [announcements],
  );

  const latestSubmissions = useMemo(
    () => submissions.slice(0, 5),
    [submissions],
  );

  const reviewSnapshot = useMemo(() => {
    if (reviews.length === 0) return { count: 0, avg: null };
    const sum = reviews.reduce((acc, r) => acc + Number(r.rating || 0), 0);
    return {
      count: reviews.length,
      avg: Math.round((sum / reviews.length) * 10) / 10,
    };
  }, [reviews]);

  const recentModules = useMemo(() => modules.slice(0, 5), [modules]);

  if (loading) {
    return <div className="py-10 text-center text-slate-600">Loading...</div>;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-800">
        Instructor Dashboard
      </h2>
      <p className="mt-2 text-slate-600">Welcome back, {user?.email}.</p>

      {error ? (
        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="text-sm text-slate-500">Courses taught</div>
          <div className="mt-2 text-3xl font-bold text-slate-900">
            {courseCount}
          </div>
          <Link
            to="/instructor/courses"
            className="mt-4 inline-block text-sm font-semibold text-slate-900 underline"
          >
            View my courses
          </Link>
        </div>

        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="text-sm text-slate-500">Latest submissions</div>
          <div className="mt-2 text-3xl font-bold text-slate-900">
            {submissions.length}
          </div>
          <Link
            to="/instructor/submissions"
            className="mt-4 inline-block text-sm font-semibold text-slate-900 underline"
          >
            View submissions
          </Link>
        </div>

        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="text-sm text-slate-500">Reviews snapshot</div>
          <div className="mt-2 text-3xl font-bold text-slate-900">
            {reviewSnapshot.count === 0 ? "-" : `${reviewSnapshot.avg}/5`}
          </div>
          <div className="mt-1 text-sm text-slate-600">
            {reviewSnapshot.count} reviews
          </div>
          <Link
            to="/instructor/reviews"
            className="mt-4 inline-block text-sm font-semibold text-slate-900 underline"
          >
            View reviews
          </Link>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <h3 className="text-lg font-semibold text-slate-800">
              Recent announcements
            </h3>
            <Link
              to="/instructor/announcements"
              className="text-sm font-semibold text-slate-900 underline"
            >
              View all
            </Link>
          </div>

          {latestAnnouncements.length === 0 ? (
            <div className="mt-4 text-sm text-slate-600">
              No announcements yet.
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              {latestAnnouncements.map((a) => (
                <div
                  key={a._id}
                  className="rounded-xl border bg-white px-4 py-3"
                >
                  <div className="text-sm font-semibold text-slate-800">
                    {a.title}
                  </div>
                  <div className="mt-1 text-sm text-slate-600 line-clamp-2">
                    {a.message}
                  </div>
                  <div className="mt-2 text-xs text-slate-500">
                    Course ID: {a.course_id}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <h3 className="text-lg font-semibold text-slate-800">
              Latest student submissions
            </h3>
            <Link
              to="/instructor/submissions"
              className="text-sm font-semibold text-slate-900 underline"
            >
              View all
            </Link>
          </div>

          {latestSubmissions.length === 0 ? (
            <div className="mt-4 text-sm text-slate-600">
              No submissions yet.
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              {latestSubmissions.map((s) => (
                <div
                  key={s._id}
                  className="flex items-start justify-between gap-4 rounded-xl border bg-white px-4 py-3"
                >
                  <div>
                    <div className="text-sm font-semibold text-slate-800">
                      {s.submission_title}
                    </div>
                    <div className="mt-1 text-xs text-slate-500">
                      Course ID: {s.course_id} | Module ID: {s.module_id}
                    </div>
                    <div className="mt-1 text-xs text-slate-500">
                      Student ID: {s.student_id}
                    </div>
                  </div>
                  <Link
                    to={`/instructor/submissions/${s._id}`}
                    className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white"
                  >
                    View
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 rounded-2xl border bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-lg font-semibold text-slate-800">
            Recent assignments (modules)
          </h3>
          <Link
            to="/instructor/courses"
            className="text-sm font-semibold text-slate-900 underline"
          >
            Open courses
          </Link>
        </div>

        {recentModules.length === 0 ? (
          <div className="mt-4 text-sm text-slate-600">No modules found.</div>
        ) : (
          <div className="mt-4 space-y-2">
            {recentModules.map((m) => (
              <div
                key={`${m.course_id}-${m.module_id}`}
                className="flex items-center justify-between gap-4 rounded-xl border bg-white px-4 py-3"
              >
                <div>
                  <div className="text-sm font-semibold text-slate-800">
                    {m.module_title}
                  </div>
                  <div className="mt-1 text-xs text-slate-500">
                    Course ID: {m.course_id} | Module ID: {m.module_id}
                  </div>
                </div>
                <Link
                  to={`/instructor/courses/${m.course_id}`}
                  className="rounded-lg border bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Open
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-6 rounded-2xl border bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-800">Your profile</h3>
        <dl className="mt-4 grid gap-3 text-sm">
          <div className="flex items-center justify-between">
            <dt className="text-slate-600">Role</dt>
            <dd className="font-medium text-slate-800">{user?.role}</dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-slate-600">Instructor ID</dt>
            <dd className="font-medium text-slate-800">
              {user?.instructor_id ?? "-"}
            </dd>
          </div>
        </dl>

        <div className="mt-6 flex flex-wrap gap-2">
          <Link
            to="/instructor/courses"
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
          >
            My Courses
          </Link>
          <Link
            to="/instructor/manage-courses"
            className="rounded-lg border bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Manage Courses
          </Link>
          <Link
            to="/instructor/announcements/new"
            className="rounded-lg border bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Post Announcement
          </Link>
        </div>
      </div>
    </div>
  );
}
