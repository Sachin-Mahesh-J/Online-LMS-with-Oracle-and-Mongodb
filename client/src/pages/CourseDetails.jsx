import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getAnnouncementsByCourse } from "../api/announcementsApi";
import { getCourseById, getModulesByCourse } from "../api/oracleApi";
import { getReviewsByCourse } from "../api/reviewsApi";
import useAuth from "../hooks/useAuth";

export default function CourseDetails() {
  const { courseId } = useParams();

  const { isAuthenticated, user } = useAuth();
  const role = String(user?.role || "").toUpperCase();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);

  const [loadingAnnouncements, setLoadingAnnouncements] = useState(false);
  const [announcementError, setAnnouncementError] = useState("");
  const [announcements, setAnnouncements] = useState([]);

  const [loadingReviews, setLoadingReviews] = useState(false);
  const [reviewsError, setReviewsError] = useState("");
  const [reviews, setReviews] = useState([]);

  const [copiedModuleId, setCopiedModuleId] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");

      try {
        const [courseData, moduleData] = await Promise.all([
          getCourseById(courseId),
          getModulesByCourse(courseId),
        ]);

        setCourse(courseData);
        setModules(moduleData || []);
      } catch (err) {
        const msg =
          err?.response?.data?.message ||
          err?.message ||
          "Failed to load course";
        setError(msg);
      } finally {
        setLoading(false);
      }
    };

    if (courseId) {
      load();
    }
  }, [courseId]);

  useEffect(() => {
    const loadAnnouncements = async () => {
      if (!isAuthenticated) {
        setAnnouncements([]);
        setAnnouncementError("");
        return;
      }

      setLoadingAnnouncements(true);
      setAnnouncementError("");

      try {
        const data = await getAnnouncementsByCourse(courseId);
        setAnnouncements(data || []);
      } catch (err) {
        const msg =
          err?.response?.data?.message ||
          err?.message ||
          "Failed to load announcements";
        setAnnouncementError(msg);
      } finally {
        setLoadingAnnouncements(false);
      }
    };

    if (courseId) {
      loadAnnouncements();
    }
  }, [courseId, isAuthenticated]);

  useEffect(() => {
    const loadReviews = async () => {
      if (!isAuthenticated) {
        setReviews([]);
        setReviewsError("");
        return;
      }

      setLoadingReviews(true);
      setReviewsError("");

      try {
        const data = await getReviewsByCourse(courseId);
        setReviews(data || []);
      } catch (err) {
        const msg =
          err?.response?.data?.message ||
          err?.message ||
          "Failed to load reviews";
        setReviewsError(msg);
      } finally {
        setLoadingReviews(false);
      }
    };

    if (courseId) {
      loadReviews();
    }
  }, [courseId, isAuthenticated]);

  const courseTitle =
    course?.COURSE_TITLE ?? course?.course_title ?? `Course ${courseId}`;
  const courseCategory = course?.CATEGORY ?? course?.category;
  const courseFee = course?.FEE ?? course?.fee;
  const courseLevel = course?.LEVEL_NAME ?? course?.level_name;
  const courseStatus = course?.STATUS ?? course?.status;
  const instructorId = course?.INSTRUCTOR_ID ?? course?.instructor_id;

  const normalizedModules = useMemo(() => {
    return (modules || []).map((m) => ({
      id: m.MODULE_ID ?? m.module_id,
      order: m.MODULE_ORDER ?? m.module_order,
      title: m.MODULE_TITLE ?? m.module_title,
      description: m.MODULE_DESCRIPTION ?? m.module_description,
      duration: m.DURATION_HOURS ?? m.duration_hours,
    }));
  }, [modules]);

  const reviewSummary = useMemo(() => {
    const list = reviews || [];
    if (list.length === 0) {
      return { count: 0, avg: null };
    }

    const sum = list.reduce((acc, r) => acc + Number(r.rating || 0), 0);
    return {
      count: list.length,
      avg: Math.round((sum / list.length) * 10) / 10,
    };
  }, [reviews]);

  const latestReviews = useMemo(() => {
    return (reviews || [])
      .slice()
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 3);
  }, [reviews]);

  const buildSubmissionPath = (moduleId) => {
    const params = new URLSearchParams({
      courseId: String(courseId),
      moduleId: String(moduleId),
    });
    return `/student/submit-assignment?${params.toString()}`;
  };

  const buildSubmissionUrl = (moduleId) => {
    const path = buildSubmissionPath(moduleId);
    if (typeof window === "undefined") return path;
    return `${window.location.origin}${path}`;
  };

  const copySubmissionLink = async (moduleId) => {
    const url = buildSubmissionUrl(moduleId);

    try {
      await navigator.clipboard.writeText(url);
      setCopiedModuleId(moduleId);
      window.setTimeout(() => setCopiedModuleId(null), 1500);
    } catch {
      window.prompt("Copy submission link:", url);
    }
  };

  if (loading) {
    return <div className="py-10 text-center text-slate-600">Loading...</div>;
  }

  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">{courseTitle}</h2>
          <p className="mt-2 text-slate-600">Course ID: {courseId}</p>
        </div>
        <Link
          to="/courses"
          className="rounded-lg border bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Back to courses
        </Link>
      </div>

      {error ? (
        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="mt-6 grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-800">
              Course info
            </h3>
            <dl className="mt-4 grid gap-3 text-sm">
              {courseCategory ? (
                <div className="flex items-center justify-between">
                  <dt className="text-slate-600">Category</dt>
                  <dd className="font-medium text-slate-800">
                    {courseCategory}
                  </dd>
                </div>
              ) : null}
              {courseFee !== undefined && courseFee !== null ? (
                <div className="flex items-center justify-between">
                  <dt className="text-slate-600">Fee</dt>
                  <dd className="font-medium text-slate-800">{courseFee}</dd>
                </div>
              ) : null}
              {courseLevel ? (
                <div className="flex items-center justify-between">
                  <dt className="text-slate-600">Level</dt>
                  <dd className="font-medium text-slate-800">{courseLevel}</dd>
                </div>
              ) : null}
              {courseStatus ? (
                <div className="flex items-center justify-between">
                  <dt className="text-slate-600">Status</dt>
                  <dd className="font-medium text-slate-800">{courseStatus}</dd>
                </div>
              ) : null}
              {instructorId ? (
                <div className="flex items-center justify-between">
                  <dt className="text-slate-600">Instructor ID</dt>
                  <dd className="font-medium text-slate-800">{instructorId}</dd>
                </div>
              ) : null}
            </dl>
          </div>

          {isAuthenticated && (role === "INSTRUCTOR" || role === "ADMIN") ? (
            <div className="mt-6 rounded-2xl border bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-800">
                Instructor actions
              </h3>
              <Link
                to={`/instructor/announcements/new?courseId=${encodeURIComponent(
                  String(courseId),
                )}`}
                className="mt-4 inline-block rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
              >
                Post announcement for this course
              </Link>
            </div>
          ) : null}

          {isAuthenticated && role === "STUDENT" ? (
            <div className="mt-6 rounded-2xl border bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-800">
                Student actions
              </h3>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link
                  to={`/student/courses/${encodeURIComponent(
                    String(courseId),
                  )}/assignments`}
                  className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
                >
                  View assignments
                </Link>
                <Link
                  to={`/student/forum?courseId=${encodeURIComponent(
                    String(courseId),
                  )}`}
                  className="rounded-lg border bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Open course forum
                </Link>
              </div>
            </div>
          ) : null}
        </div>

        <div className="lg:col-span-3">
          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-800">Modules</h3>
            <p className="mt-2 text-sm text-slate-600">
              {normalizedModules.length} modules
            </p>

            {normalizedModules.length === 0 ? (
              <div className="mt-4 text-sm text-slate-600">
                No modules found for this course.
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                {normalizedModules.map((m) => (
                  <div
                    key={m.id}
                    className="flex flex-col gap-3 rounded-xl border bg-white px-4 py-4 sm:flex-row sm:items-start sm:justify-between"
                  >
                    <div>
                      <div className="font-medium text-slate-800">
                        {m.order ? `Module ${m.order}: ` : ""}
                        {m.title}
                      </div>
                      {m.description ? (
                        <div className="mt-1 text-sm text-slate-600">
                          {m.description}
                        </div>
                      ) : null}
                      <div className="mt-2 text-xs text-slate-500">
                        Module ID: {m.id}
                        {m.duration !== null && m.duration !== undefined
                          ? ` | ${m.duration} hours`
                          : ""}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 sm:justify-end">
                      {isAuthenticated && role === "STUDENT" ? (
                        <Link
                          to={buildSubmissionPath(m.id)}
                          className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white"
                        >
                          Submit assignment
                        </Link>
                      ) : null}

                      {isAuthenticated &&
                      (role === "INSTRUCTOR" || role === "ADMIN") ? (
                        <button
                          type="button"
                          onClick={() => copySubmissionLink(m.id)}
                          className="rounded-lg border bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                        >
                          {copiedModuleId === m.id
                            ? "Copied"
                            : "Copy submission link"}
                        </button>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-6 rounded-2xl border bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <h3 className="text-lg font-semibold text-slate-800">Reviews</h3>
              <Link
                to={`/student/reviews?courseId=${encodeURIComponent(
                  String(courseId),
                )}`}
                className="text-sm font-semibold text-slate-900 underline"
              >
                View all
              </Link>
            </div>

            {!isAuthenticated ? (
              <div className="mt-3 text-sm text-slate-600">
                Login to view reviews.
              </div>
            ) : loadingReviews ? (
              <div className="mt-3 text-sm text-slate-600">Loading...</div>
            ) : reviewsError ? (
              <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {reviewsError}
              </div>
            ) : reviewSummary.count === 0 ? (
              <div className="mt-3 text-sm text-slate-600">No reviews yet.</div>
            ) : (
              <div className="mt-4">
                <div className="text-sm text-slate-600">
                  Average rating:{" "}
                  <span className="font-semibold text-slate-900">
                    {reviewSummary.avg}
                  </span>{" "}
                  / 5<span className="text-slate-400"> · </span>
                  {reviewSummary.count} reviews
                </div>

                <div className="mt-4 space-y-3">
                  {latestReviews.map((r) => (
                    <div
                      key={r._id}
                      className="rounded-xl border bg-white px-4 py-3"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="text-sm font-semibold text-slate-800">
                          Rating: {r.rating}/5
                        </div>
                        <div className="text-xs text-slate-500">
                          {r.created_at
                            ? new Date(r.created_at).toLocaleDateString()
                            : ""}
                        </div>
                      </div>
                      {r.review_text ? (
                        <div className="mt-2 text-sm text-slate-600">
                          {r.review_text}
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 rounded-2xl border bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-800">
              Announcements
            </h3>

            {!isAuthenticated ? (
              <div className="mt-3 text-sm text-slate-600">
                Login to view announcements.
              </div>
            ) : loadingAnnouncements ? (
              <div className="mt-3 text-sm text-slate-600">Loading...</div>
            ) : announcementError ? (
              <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {announcementError}
              </div>
            ) : announcements.length === 0 ? (
              <div className="mt-3 text-sm text-slate-600">
                No announcements for this course.
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                {announcements.map((a) => (
                  <div
                    key={a._id}
                    className="rounded-xl border bg-white px-4 py-3"
                  >
                    <div className="font-medium text-slate-800">{a.title}</div>
                    <div className="mt-1 text-sm text-slate-600">
                      {a.message}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
