import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  createReview,
  getAllReviews,
  getReviewsByCourse,
} from "../api/reviewsApi";
import { getCourses, getEnrollmentsByStudentId } from "../api/oracleApi";
import useAuth from "../hooks/useAuth";

export default function Reviews() {
  const { user } = useAuth();
  const role = String(user?.role || "").toUpperCase();

  const [searchParams, setSearchParams] = useSearchParams();
  const initialCourseId = searchParams.get("courseId") || "";

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);

  const [selectedCourseId, setSelectedCourseId] = useState(initialCourseId);

  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const [createSuccess, setCreateSuccess] = useState("");
  const [courseId, setCourseId] = useState(initialCourseId);
  const [rating, setRating] = useState("5");
  const [reviewText, setReviewText] = useState("");

  useEffect(() => {
    const loadMeta = async () => {
      try {
        const courseData = await getCourses();
        setCourses(courseData || []);

        if (role === "STUDENT") {
          const studentId = user?.student_id;
          if (!studentId) {
            setEnrollments([]);
            return;
          }

          const enrollmentData = await getEnrollmentsByStudentId(studentId);
          setEnrollments(enrollmentData || []);
        } else {
          setEnrollments([]);
        }
      } catch (err) {
        console.error(err);
        setCourses([]);
        setEnrollments([]);
      }
    };

    loadMeta();
  }, [role, user?.student_id]);

  const enrolledCourseIds = useMemo(() => {
    if (role !== "STUDENT") return null;
    return new Set(
      (enrollments || []).map((e) => Number(e.COURSE_ID ?? e.course_id)),
    );
  }, [enrollments, role]);

  const taughtCourseIds = useMemo(() => {
    if (role === "ADMIN") return null;
    if (role !== "INSTRUCTOR") return null;

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
  }, [courses, role, user?.instructor_id]);

  const courseOptions = useMemo(() => {
    const list = (courses || [])
      .filter((c) => {
        const id = Number(c.COURSE_ID ?? c.course_id);
        if (role === "STUDENT") return enrolledCourseIds?.has(id);
        if (role === "INSTRUCTOR") return taughtCourseIds?.has(id);
        return true;
      })
      .map((c) => ({
        id: String(c.COURSE_ID ?? c.course_id),
        title: c.COURSE_TITLE ?? c.course_title,
      }));
    list.sort((a, b) => a.title.localeCompare(b.title));
    return list;
  }, [courses, enrolledCourseIds, role, taughtCourseIds]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError("");

      try {
        const data = selectedCourseId
          ? await getReviewsByCourse(selectedCourseId)
          : await getAllReviews();

        let list = data || [];

        if (role === "INSTRUCTOR" && taughtCourseIds) {
          list = list.filter((r) => taughtCourseIds.has(Number(r.course_id)));
        }

        if (role === "STUDENT" && enrolledCourseIds) {
          list = list.filter((r) => enrolledCourseIds.has(Number(r.course_id)));
        }

        setReviews(list);
      } catch (err) {
        console.error(err);
        const msg =
          err?.response?.data?.message || err?.message || "Failed to load";
        setError(msg);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [enrolledCourseIds, role, selectedCourseId, taughtCourseIds]);

  const onCourseFilterChange = (nextCourseId) => {
    setSelectedCourseId(nextCourseId);
    const nextParams = new URLSearchParams(searchParams);
    if (nextCourseId) nextParams.set("courseId", nextCourseId);
    else nextParams.delete("courseId");
    setSearchParams(nextParams, { replace: true });
  };

  const alreadyReviewed = useMemo(() => {
    if (role !== "STUDENT") return false;
    if (!courseId) return false;
    const studentId = user?.student_id;
    if (!studentId) return false;

    return (reviews || []).some(
      (r) =>
        String(r.course_id) === String(courseId) &&
        Number(r.student_id) === Number(studentId),
    );
  }, [courseId, reviews, role, user?.student_id]);

  const handleCreateReview = async (e) => {
    e.preventDefault();
    setCreateError("");
    setCreateSuccess("");

    if (role !== "STUDENT") {
      setCreateError("Only students can create reviews");
      return;
    }

    if (!courseId) {
      setCreateError("Course is required");
      return;
    }

    if (!enrolledCourseIds.has(Number(courseId))) {
      setCreateError("You can only review courses you are enrolled in");
      return;
    }

    if (alreadyReviewed) {
      setCreateError("You have already reviewed this course");
      return;
    }

    const numericRating = Number(rating);
    if (Number.isNaN(numericRating) || numericRating < 1 || numericRating > 5) {
      setCreateError("Rating must be between 1 and 5");
      return;
    }

    setCreating(true);

    try {
      await createReview({
        course_id: Number(courseId),
        rating: numericRating,
        review_text: reviewText.trim(),
      });

      setCreateSuccess("Review submitted successfully");
      setReviewText("");
      setRating("5");

      onCourseFilterChange(String(courseId));
      const updated = await getReviewsByCourse(courseId);
      setReviews(updated || []);
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to submit review";
      setCreateError(msg);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="mb-2 text-2xl font-bold text-slate-800">
            Course Reviews
          </h2>
          <p className="text-sm text-slate-600">
            {role === "STUDENT"
              ? "View reviews and leave your own review for enrolled courses."
              : "View all course reviews."}
          </p>
        </div>
        {role === "STUDENT" ? (
          <Link
            to="/student/dashboard"
            className="rounded-lg border bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Back
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
              value={selectedCourseId}
              onChange={(e) => onCourseFilterChange(e.target.value)}
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900"
            >
              <option value="">All courses</option>
              {courseOptions.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title} (ID: {c.id})
                </option>
              ))}
            </select>
          </div>

          {role === "STUDENT" ? (
            <div className="mt-6 rounded-2xl border bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-800">
                Leave a review
              </h3>

              {createSuccess ? (
                <div className="mt-4 rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-800">
                  {createSuccess}
                </div>
              ) : null}

              {createError ? (
                <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  {createError}
                </div>
              ) : null}

              <form onSubmit={handleCreateReview} className="mt-4 space-y-3">
                <div>
                  <label className="text-sm font-medium text-slate-700">
                    Course
                  </label>
                  <select
                    value={courseId}
                    onChange={(e) => {
                      setCourseId(e.target.value);
                      setCreateError("");
                      setCreateSuccess("");
                    }}
                    className="mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900"
                    required
                  >
                    <option value="">Select course</option>
                    {courseOptions.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title} (ID: {c.id})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700">
                    Rating
                  </label>
                  <select
                    value={rating}
                    onChange={(e) => setRating(e.target.value)}
                    className="mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900"
                  >
                    <option value="5">5</option>
                    <option value="4">4</option>
                    <option value="3">3</option>
                    <option value="2">2</option>
                    <option value="1">1</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700">
                    Review
                  </label>
                  <textarea
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    className="mt-1 min-h-24 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900"
                    placeholder="Optional feedback"
                  />
                </div>

                <button
                  type="submit"
                  disabled={creating || alreadyReviewed}
                  className="w-full rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                >
                  {alreadyReviewed
                    ? "Already reviewed"
                    : creating
                      ? "Submitting..."
                      : "Submit review"}
                </button>
              </form>
            </div>
          ) : null}
        </div>

        <div className="lg:col-span-3">
          {error ? (
            <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          {loading ? (
            <div className="py-10 text-center text-slate-600">Loading...</div>
          ) : reviews.length === 0 ? (
            <div className="rounded-2xl border bg-white p-6 text-slate-600 shadow-sm">
              No reviews found.
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((item) => (
                <div
                  key={item._id}
                  className="rounded-2xl border bg-white p-5 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="text-lg font-semibold text-slate-800">
                      Course ID: {item.course_id}
                    </h3>
                    <div className="text-xs text-slate-500">
                      {item.created_at
                        ? new Date(item.created_at).toLocaleDateString()
                        : ""}
                    </div>
                  </div>
                  <p className="mt-2 text-slate-600">Rating: {item.rating}/5</p>
                  {item.review_text ? (
                    <p className="mt-2 text-slate-600">{item.review_text}</p>
                  ) : null}
                  <p className="mt-2 text-sm text-slate-500">
                    Student ID: {item.student_id}
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
