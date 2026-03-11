import { useEffect, useMemo, useState } from "react";
import {
  createEnrollment,
  getCourses,
  getEnrollmentsByStudentId,
} from "../api/oracleApi";
import { Link } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import useToast from "../hooks/useToast";
import PageLoader from "../components/ui/PageLoader";
import Alert from "../components/ui/Alert";

export default function Courses() {
  const { user, isAuthenticated } = useAuth();
  const { addToast } = useToast();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [enrollingCourseId, setEnrollingCourseId] = useState(null);

  const [enrollments, setEnrollments] = useState([]);
  const role = String(user?.role || "").toUpperCase();

  useEffect(() => {
    const loadCourses = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await getCourses();
        setCourses(data || []);

        if (isAuthenticated && role === "STUDENT" && user?.student_id) {
          const enrollmentData = await getEnrollmentsByStudentId(
            user.student_id,
          );
          setEnrollments(enrollmentData || []);
        } else {
          setEnrollments([]);
        }
      } catch (error) {
        console.error("Failed to load courses", error);
        const msg =
          error?.response?.data?.message || error?.message || "Failed to load";
        setError(msg);
      } finally {
        setLoading(false);
      }
    };

    loadCourses();
  }, [isAuthenticated, role, user?.student_id]);

  const enrolledCourseIds = useMemo(() => {
    return new Set(
      (enrollments || []).map((e) => Number(e.COURSE_ID ?? e.course_id)),
    );
  }, [enrollments]);

  const handleEnroll = async (courseId) => {
    if (!user?.student_id) return;
    setEnrollingCourseId(courseId);
    setError("");

    try {
      const res = await createEnrollment({
        student_id: Number(user.student_id),
        course_id: Number(courseId),
      });

      const enrollment = res?.enrollment;
      if (enrollment) {
        setEnrollments((prev) => [enrollment, ...(prev || [])]);
      } else {
        const refreshed = await getEnrollmentsByStudentId(user.student_id);
        setEnrollments(refreshed || []);
      }

      addToast({
        title: "Enrolled",
        message: `You enrolled in course ${courseId}.`,
        variant: "success",
      });
    } catch (err) {
      const msg =
        err?.response?.data?.message || err?.message || "Enroll failed";
      setError(msg);
      addToast({ title: "Enroll failed", message: msg, variant: "error" });
    } finally {
      setEnrollingCourseId(null);
    }
  };

  if (loading) return <PageLoader label="Loading courses..." />;

  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="mb-2 text-2xl font-bold text-slate-800">Courses</h2>
          <p className="text-sm text-slate-600">
            Browse all courses.{" "}
            {isAuthenticated && role === "STUDENT"
              ? "You can enroll directly."
              : ""}
          </p>
        </div>
        {isAuthenticated && role === "STUDENT" ? (
          <Link
            to="/student/my-courses"
            className="rounded-lg border bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            My courses
          </Link>
        ) : null}
      </div>

      <Alert variant="error" className="mt-6">
        {error}
      </Alert>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {courses.map((course) => {
          const courseId = course.COURSE_ID ?? course.course_id;
          const title = course.COURSE_TITLE ?? course.course_title;
          const category = course.CATEGORY ?? course.category;
          const isEnrolled = enrolledCourseIds.has(Number(courseId));
          const canEnroll =
            isAuthenticated && role === "STUDENT" && !isEnrolled;

          return (
            <div
              key={courseId}
              className="rounded-2xl border bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-slate-800">
                    {title}
                  </h3>
                  <p className="mt-2 text-sm text-slate-600">{category}</p>
                  <p className="mt-2 text-xs text-slate-500">
                    Course ID: {courseId}
                  </p>
                </div>
                {isEnrolled ? (
                  <span className="shrink-0 rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                    Enrolled
                  </span>
                ) : null}
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <Link
                  to={`/courses/${courseId}`}
                  className="rounded-lg border bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  View details
                </Link>

                {canEnroll ? (
                  <button
                    type="button"
                    onClick={() => handleEnroll(courseId)}
                    disabled={enrollingCourseId === courseId}
                    className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white disabled:opacity-60"
                  >
                    {enrollingCourseId === courseId ? "Enrolling..." : "Enroll"}
                  </button>
                ) : null}

                {!isAuthenticated ? (
                  <Link
                    to="/login"
                    className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white"
                  >
                    Login to enroll
                  </Link>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
