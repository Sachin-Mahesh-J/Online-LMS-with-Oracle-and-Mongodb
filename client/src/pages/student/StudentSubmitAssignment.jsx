import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { createSubmission } from "../../api/submissionsApi";
import { getEnrollmentsByStudentId } from "../../api/oracleApi";
import useAuth from "../../hooks/useAuth";

export default function StudentSubmitAssignment() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const courseId = searchParams.get("courseId") || "";
  const moduleId = searchParams.get("moduleId") || "";

  const [submissionTitle, setSubmissionTitle] = useState("");
  const [file, setFile] = useState(null);
  const [remarks, setRemarks] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [checkingEnrollment, setCheckingEnrollment] = useState(true);
  const [isEnrolled, setIsEnrolled] = useState(false);

  useEffect(() => {
    const check = async () => {
      setCheckingEnrollment(true);
      setIsEnrolled(false);

      try {
        const studentId = user?.student_id;
        if (!studentId || !courseId) {
          return;
        }

        const enrollments = await getEnrollmentsByStudentId(studentId);
        const enrolled = (enrollments || []).some(
          (e) => Number(e.COURSE_ID ?? e.course_id) === Number(courseId),
        );
        setIsEnrolled(enrolled);

        if (!enrolled) {
          setError("You are not enrolled in this course");
        }
      } catch (err) {
        const msg =
          err?.response?.data?.message ||
          err?.message ||
          "Failed to validate enrollment";
        setError(msg);
      } finally {
        setCheckingEnrollment(false);
      }
    };

    check();
  }, [courseId, user?.student_id]);

  const backToCourseLink = useMemo(() => {
    if (!courseId) return "/student/dashboard";
    return `/courses/${courseId}`;
  }, [courseId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!courseId || !moduleId) {
      setError("Missing courseId or moduleId in the link");
      return;
    }

    if (!submissionTitle.trim()) {
      setError("Submission title is required");
      return;
    }

    if (!isEnrolled) {
      setError("You must be enrolled in this course to submit");
      return;
    }

    if (!file) {
      setError("Please choose a file to upload");
      return;
    }

    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("course_id", String(courseId));
      formData.append("module_id", String(moduleId));
      formData.append("submission_title", submissionTitle.trim());
      formData.append("remarks", remarks.trim());
      formData.append("file", file);

      await createSubmission(formData);

      setSuccess("Submission created successfully");
      setSubmissionTitle("");
      setFile(null);
      setRemarks("");

      navigate("/student/submissions", { replace: false });
    } catch (err) {
      const msg =
        err?.response?.data?.message || err?.message || "Failed to submit";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">
            Submit Assignment
          </h2>
          <p className="mt-2 text-slate-600">
            Course ID: {courseId || "-"} | Module ID: {moduleId || "-"}
          </p>
        </div>
        <Link
          to={backToCourseLink}
          className="rounded-lg border bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Back
        </Link>
      </div>

      {success ? (
        <div className="mt-6 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm text-green-800">
          {success}
        </div>
      ) : null}

      {error ? (
        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {checkingEnrollment ? (
        <div className="mt-6 rounded-2xl border bg-white p-4 text-sm text-slate-600 shadow-sm">
          Validating enrollment...
        </div>
      ) : null}

      <div className="mt-6 max-w-2xl rounded-2xl border bg-white p-6 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700">
              Submission title
            </label>
            <input
              value={submissionTitle}
              onChange={(e) => setSubmissionTitle(e.target.value)}
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900"
              placeholder="e.g. Module 1 Assignment"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">File</label>
            <input
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900"
              required
            />
            {file ? (
              <div className="mt-2 text-xs text-slate-500">
                Selected: {file.name} ({file.type || "unknown"}, {file.size}{" "}
                bytes)
              </div>
            ) : null}
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">
              Remarks
            </label>
            <textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="mt-1 min-h-24 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900"
              placeholder="Optional notes"
            />
          </div>

          <button
            type="submit"
            disabled={submitting || checkingEnrollment || !isEnrolled}
            className="w-full rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {submitting ? "Submitting..." : "Submit"}
          </button>
        </form>
      </div>
    </div>
  );
}
