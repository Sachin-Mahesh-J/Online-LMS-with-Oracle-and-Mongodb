import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getSubmissionsByStudent } from "../../api/submissionsApi";
import {
  getCourseById,
  getEnrollmentsByStudentId,
  getModulesByCourse,
} from "../../api/oracleApi";
import useAuth from "../../hooks/useAuth";

export default function StudentCourseAssignments() {
  const { courseId } = useParams();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [isEnrolled, setIsEnrolled] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      setIsEnrolled(false);

      try {
        const studentId = user?.student_id;
        if (!studentId) {
          setCourse(null);
          setModules([]);
          setSubmissions([]);
          return;
        }

        const [courseData, moduleData, submissionData, enrollmentData] =
          await Promise.all([
            getCourseById(courseId),
            getModulesByCourse(courseId),
            getSubmissionsByStudent(studentId),
            getEnrollmentsByStudentId(studentId),
          ]);

        const enrolled = (enrollmentData || []).some(
          (e) => Number(e.COURSE_ID ?? e.course_id) === Number(courseId),
        );

        setCourse(courseData);
        setModules(moduleData || []);
        setSubmissions(submissionData || []);
        setIsEnrolled(enrolled);

        if (!enrolled) {
          setError("You are not enrolled in this course");
        }
      } catch (err) {
        const msg =
          err?.response?.data?.message ||
          err?.message ||
          "Failed to load assignments";
        setError(msg);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [courseId, user?.student_id]);

  const normalizedModules = useMemo(() => {
    return (modules || []).map((m) => ({
      id: m.MODULE_ID ?? m.module_id,
      order: m.MODULE_ORDER ?? m.module_order,
      title: m.MODULE_TITLE ?? m.module_title,
      description: m.MODULE_DESCRIPTION ?? m.module_description,
    }));
  }, [modules]);

  const submissionsByModuleId = useMemo(() => {
    const map = new Map();
    (submissions || [])
      .filter((s) => Number(s.course_id) === Number(courseId))
      .forEach((s) => {
        const moduleId = Number(s.module_id);
        const current = map.get(moduleId);
        if (!current) {
          map.set(moduleId, s);
          return;
        }
        const currentDate = new Date(current.submitted_at).getTime();
        const candidateDate = new Date(s.submitted_at).getTime();
        if (candidateDate > currentDate) {
          map.set(moduleId, s);
        }
      });
    return map;
  }, [courseId, submissions]);

  const courseTitle =
    course?.COURSE_TITLE ?? course?.course_title ?? `Course ${courseId}`;

  if (loading) {
    return <div className="py-10 text-center text-slate-600">Loading...</div>;
  }

  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Assignments</h2>
          <p className="mt-2 text-slate-600">
            {courseTitle} (Course ID: {courseId})
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            to={`/courses/${courseId}`}
            className="rounded-lg border bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Back to course
          </Link>
          <Link
            to="/student/my-courses"
            className="rounded-lg border bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            My courses
          </Link>
        </div>
      </div>

      {error ? (
        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {!isEnrolled ? (
        <div className="mt-6 rounded-2xl border bg-white p-6 text-slate-600 shadow-sm">
          <div className="font-semibold text-slate-800">
            Enrollment required
          </div>
          <div className="mt-2 text-sm">
            You need to enroll in this course to view and submit assignments.
          </div>
          <Link
            to="/courses"
            className="mt-4 inline-block rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
          >
            Browse courses
          </Link>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {normalizedModules.length === 0 ? (
            <div className="rounded-2xl border bg-white p-6 text-slate-600 shadow-sm">
              No modules found for this course.
            </div>
          ) : (
            normalizedModules.map((m) => {
              const latest = submissionsByModuleId.get(Number(m.id));
              const status = latest?.status || "not_submitted";
              const submittedAt = latest?.submitted_at
                ? new Date(latest.submitted_at).toLocaleString()
                : "-";

              return (
                <div
                  key={m.id}
                  className="rounded-2xl border bg-white p-5 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-lg font-semibold text-slate-800">
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
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          status === "not_submitted"
                            ? "bg-slate-100 text-slate-700"
                            : "bg-green-50 text-green-700"
                        }`}
                      >
                        {status}
                      </span>
                      <div className="text-xs text-slate-500">
                        Submitted: {submittedAt}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <Link
                      to={`/student/courses/${courseId}/assignments/${m.id}`}
                      className="rounded-lg border bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      View assignment
                    </Link>

                    <Link
                      to={`/student/submit-assignment?courseId=${encodeURIComponent(
                        String(courseId),
                      )}&moduleId=${encodeURIComponent(String(m.id))}`}
                      className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white"
                    >
                      {latest ? "Resubmit" : "Submit"}
                    </Link>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
