import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getSubmissionsByStudent } from "../../api/submissionsApi";
import {
  getCourseById,
  getEnrollmentsByStudentId,
  getModulesByCourse,
} from "../../api/oracleApi";
import useAuth from "../../hooks/useAuth";

export default function StudentAssignmentDetail() {
  const { courseId, moduleId } = useParams();
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
          "Failed to load assignment";
        setError(msg);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [courseId, moduleId, user?.student_id]);

  const module = useMemo(() => {
    return (modules || []).find(
      (m) => Number(m.MODULE_ID ?? m.module_id) === Number(moduleId),
    );
  }, [moduleId, modules]);

  const moduleTitle = module?.MODULE_TITLE ?? module?.module_title;
  const moduleDescription =
    module?.MODULE_DESCRIPTION ?? module?.module_description;
  const moduleOrder = module?.MODULE_ORDER ?? module?.module_order;

  const matchingSubmissions = useMemo(() => {
    return (submissions || [])
      .filter(
        (s) =>
          Number(s.course_id) === Number(courseId) &&
          Number(s.module_id) === Number(moduleId),
      )
      .sort((a, b) => new Date(b.submitted_at) - new Date(a.submitted_at));
  }, [courseId, moduleId, submissions]);

  const latest = matchingSubmissions[0] || null;
  const courseTitle =
    course?.COURSE_TITLE ?? course?.course_title ?? `Course ${courseId}`;

  const submitLink = useMemo(() => {
    const params = new URLSearchParams({
      courseId: String(courseId),
      moduleId: String(moduleId),
    });
    return `/student/submit-assignment?${params.toString()}`;
  }, [courseId, moduleId]);

  if (loading) {
    return <div className="py-10 text-center text-slate-600">Loading...</div>;
  }

  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Assignment</h2>
          <p className="mt-2 text-slate-600">
            {courseTitle} (Course ID: {courseId})
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            to={`/student/courses/${courseId}/assignments`}
            className="rounded-lg border bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Back to assignments
          </Link>
          <Link
            to={`/courses/${courseId}`}
            className="rounded-lg border bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Course details
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
          You need to enroll in this course to view and submit assignments.
          <div className="mt-4">
            <Link
              to="/courses"
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
            >
              Browse courses
            </Link>
          </div>
        </div>
      ) : (
        <div className="mt-6 grid gap-6 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <div className="rounded-2xl border bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-800">
                {moduleOrder ? `Module ${moduleOrder}: ` : ""}
                {moduleTitle || `Module ${moduleId}`}
              </h3>
              {moduleDescription ? (
                <p className="mt-2 text-sm text-slate-600">{moduleDescription}</p>
              ) : null}

              <div className="mt-4 flex flex-wrap gap-2">
                <Link
                  to={submitLink}
                  className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
                >
                  {latest ? "Resubmit" : "Submit"}
                </Link>
              </div>

              <div className="mt-6">
                <h4 className="text-sm font-semibold text-slate-800">
                  Latest status
                </h4>
                <div className="mt-2 rounded-xl border bg-white px-4 py-3 text-sm">
                  <div className="flex items-center justify-between gap-4">
                    <div className="text-slate-600">Status</div>
                    <div className="font-semibold text-slate-800">
                      {latest?.status || "not_submitted"}
                    </div>
                  </div>
                  <div className="mt-2 flex items-center justify-between gap-4">
                    <div className="text-slate-600">Submitted at</div>
                    <div className="font-semibold text-slate-800">
                      {latest?.submitted_at
                        ? new Date(latest.submitted_at).toLocaleString()
                        : "-"}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-800">
                Previous submissions
              </h3>

              {matchingSubmissions.length === 0 ? (
                <div className="mt-3 text-sm text-slate-600">
                  No submissions yet.
                </div>
              ) : (
                <div className="mt-4 space-y-3">
                  {matchingSubmissions.map((s) => (
                    <div
                      key={s._id}
                      className="rounded-xl border bg-white px-4 py-3"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="text-sm font-semibold text-slate-800">
                            {s.submission_title}
                          </div>
                          <div className="mt-1 text-xs text-slate-500">
                            {s.submitted_at
                              ? new Date(s.submitted_at).toLocaleString()
                              : "-"}
                          </div>
                          <div className="mt-2 text-sm text-slate-600">
                            {s.file_name} ({s.file_type})
                          </div>
                        </div>
                        <div className="text-xs font-semibold text-slate-700">
                          {s.status}
                        </div>
                      </div>

                      {s.file_url ? (
                        <a
                          href={`http://localhost:5000${s.file_url}`}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-2 inline-block text-sm font-medium text-slate-900 underline"
                        >
                          Download file
                        </a>
                      ) : null}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="rounded-2xl border bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-800">
                Assignment info
              </h3>
              <dl className="mt-4 grid gap-3 text-sm">
                <div className="flex items-center justify-between">
                  <dt className="text-slate-600">Course ID</dt>
                  <dd className="font-medium text-slate-800">{courseId}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-slate-600">Module ID</dt>
                  <dd className="font-medium text-slate-800">{moduleId}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-slate-600">Due date</dt>
                  <dd className="font-medium text-slate-800">-</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
