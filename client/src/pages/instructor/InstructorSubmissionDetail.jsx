import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getSubmissionById } from "../../api/submissionsApi";
import {
  getEnrollmentByStudentAndCourse,
  updateEnrollmentProgress,
} from "../../api/oracleApi";
import useToast from "../../hooks/useToast";

export default function InstructorSubmissionDetail() {
  const { id } = useParams();
  const { addToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submission, setSubmission] = useState(null);

  const [enrollmentLoading, setEnrollmentLoading] = useState(false);
  const [enrollmentError, setEnrollmentError] = useState("");
  const [enrollment, setEnrollment] = useState(null);

  const [progressPercent, setProgressPercent] = useState("");
  const [savingProgress, setSavingProgress] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");

      try {
        const data = await getSubmissionById(id);
        setSubmission(data);
      } catch (err) {
        const msg =
          err?.response?.data?.message || err?.message || "Failed to load";
        setError(msg);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      load();
    }
  }, [id]);

  useEffect(() => {
    const loadEnrollment = async () => {
      setEnrollmentLoading(true);
      setEnrollmentError("");
      setEnrollment(null);
      setProgressPercent("");
      setSaveError("");
      setSaveSuccess("");

      try {
        const studentId = submission?.student_id;
        const courseId = submission?.course_id;
        if (!studentId || !courseId) {
          return;
        }

        const data = await getEnrollmentByStudentAndCourse(studentId, courseId);
        setEnrollment(data);

        const initial = data?.PROGRESS_PERCENT ?? data?.progress_percent;
        setProgressPercent(
          initial === null || initial === undefined ? "" : String(initial),
        );
      } catch (err) {
        const msg =
          err?.response?.data?.message ||
          err?.message ||
          "Failed to load enrollment";
        setEnrollmentError(msg);
      } finally {
        setEnrollmentLoading(false);
      }
    };

    if (submission) {
      loadEnrollment();
    }
  }, [submission]);

  const downloadUrl = useMemo(() => {
    if (!submission?.file_url) return "";
    return `http://localhost:5000${submission.file_url}`;
  }, [submission?.file_url]);

  const enrollmentId = useMemo(() => {
    return enrollment?.ENROLLMENT_ID ?? enrollment?.enrollment_id ?? null;
  }, [enrollment]);

  const currentProgress = useMemo(() => {
    const value = progressPercent === "" ? null : Number(progressPercent);
    if (value === null || Number.isNaN(value)) return null;
    return Math.min(100, Math.max(0, value));
  }, [progressPercent]);

  const derivedStatus = useMemo(() => {
    if (currentProgress === null) return "-";
    if (currentProgress <= 0) return "ENROLLED";
    if (currentProgress >= 100) return "COMPLETED";
    return "IN_PROGRESS";
  }, [currentProgress]);

  const statusBadgeStyles = useMemo(() => {
    const status = derivedStatus;
    if (status === "COMPLETED") return "bg-green-50 text-green-700";
    if (status === "IN_PROGRESS") return "bg-blue-50 text-blue-700";
    if (status === "ENROLLED") return "bg-slate-100 text-slate-700";
    return "bg-slate-100 text-slate-700";
  }, [derivedStatus]);

  const handleUpdateProgress = async () => {
    setSaveError("");
    setSaveSuccess("");

    if (!enrollmentId) {
      setSaveError("Enrollment not found for this student in this course");
      return;
    }

    if (currentProgress === null) {
      setSaveError("Progress percent is required");
      return;
    }

    if (currentProgress < 0 || currentProgress > 100) {
      setSaveError("progress_percent must be between 0 and 100");
      return;
    }

    setSavingProgress(true);

    try {
      const res = await updateEnrollmentProgress(enrollmentId, {
        progress_percent: currentProgress,
        completion_status: derivedStatus,
      });

      const updated = res?.enrollment;
      if (updated) {
        setEnrollment(updated);
        const nextProgress =
          updated?.PROGRESS_PERCENT ??
          updated?.progress_percent ??
          currentProgress;
        setProgressPercent(
          nextProgress === null || nextProgress === undefined
            ? ""
            : String(nextProgress),
        );
      }

      const msg = res?.message || "Progress updated successfully";
      setSaveSuccess(msg);
      addToast({
        title: "Progress updated",
        message: msg,
        variant: "success",
      });
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to update progress";
      setSaveError(msg);
      addToast({ title: "Update failed", message: msg, variant: "error" });
    } finally {
      setSavingProgress(false);
    }
  };

  if (loading) {
    return <div className="py-10 text-center text-slate-600">Loading...</div>;
  }

  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Submission</h2>
          <p className="mt-2 text-slate-600">ID: {id}</p>
        </div>
        <Link
          to="/instructor/submissions"
          className="rounded-lg border bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Back
        </Link>
      </div>

      {error ? (
        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {submission ? (
        <div className="mt-6 grid gap-6 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <div className="rounded-2xl border bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-800">
                {submission.submission_title}
              </h3>

              <dl className="mt-4 grid gap-3 text-sm">
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-slate-600">Student ID</dt>
                  <dd className="font-medium text-slate-800">
                    {submission.student_id}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-slate-600">Course ID</dt>
                  <dd className="font-medium text-slate-800">
                    {submission.course_id}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-slate-600">Module ID</dt>
                  <dd className="font-medium text-slate-800">
                    {submission.module_id}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-slate-600">Status</dt>
                  <dd className="font-medium text-slate-800">
                    {submission.status}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-slate-600">Submitted at</dt>
                  <dd className="font-medium text-slate-800">
                    {submission.submitted_at
                      ? new Date(submission.submitted_at).toLocaleString()
                      : "-"}
                  </dd>
                </div>
              </dl>

              <div className="mt-6 rounded-xl border bg-slate-50 p-4">
                <div className="text-sm font-semibold text-slate-800">File</div>
                <div className="mt-2 text-sm text-slate-700">
                  {submission.file_name} ({submission.file_type}) —{" "}
                  {submission.file_size} bytes
                </div>
                {downloadUrl ? (
                  <a
                    href={downloadUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 inline-block text-sm font-medium text-slate-900 underline"
                  >
                    Download file
                  </a>
                ) : null}
              </div>

              {submission.remarks ? (
                <div className="mt-6">
                  <div className="text-sm font-semibold text-slate-800">
                    Remarks
                  </div>
                  <div className="mt-2 whitespace-pre-wrap text-sm text-slate-700">
                    {submission.remarks}
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-2xl border bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-800">
                Student progress
              </h3>

              {enrollmentError ? (
                <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  {enrollmentError}
                </div>
              ) : null}

              {enrollmentLoading ? (
                <div className="mt-4 text-sm text-slate-600">Loading...</div>
              ) : !enrollmentId ? (
                <div className="mt-4 rounded-xl border bg-slate-50 p-4 text-sm text-slate-700">
                  Enrollment not found for this student in this course.
                </div>
              ) : (
                <div className="mt-4 space-y-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <div className="text-sm font-medium text-slate-700">
                        Progress
                      </div>
                      <div className="mt-1 text-2xl font-bold text-slate-900">
                        {currentProgress !== null ? `${currentProgress}%` : "-"}
                      </div>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${statusBadgeStyles}`}
                    >
                      {derivedStatus}
                    </span>
                  </div>

                  <div className="h-3 w-full rounded-full bg-slate-100">
                    <div
                      className="h-3 rounded-full bg-slate-900"
                      style={{ width: `${currentProgress ?? 0}%` }}
                    />
                  </div>

                  <div className="text-xs text-slate-500">
                    Enrollment ID: {enrollmentId}
                  </div>
                </div>
              )}
            </div>

            <div className="rounded-2xl border bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-800">
                Update progress
              </h3>

              {saveSuccess ? (
                <div className="mt-4 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800">
                  {saveSuccess}
                </div>
              ) : null}

              {saveError ? (
                <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  {saveError}
                </div>
              ) : null}

              <div className="mt-4 space-y-3">
                <div>
                  <label className="text-sm font-medium text-slate-700">
                    Progress percent (0-100)
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={currentProgress ?? 0}
                    onChange={(e) => setProgressPercent(e.target.value)}
                    disabled={
                      !enrollmentId || enrollmentLoading || savingProgress
                    }
                    className="mt-2 w-full"
                  />
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={progressPercent}
                    onChange={(e) => setProgressPercent(e.target.value)}
                    disabled={
                      !enrollmentId || enrollmentLoading || savingProgress
                    }
                    className="mt-2 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900"
                    placeholder="e.g. 25"
                  />
                </div>

                <div className="flex items-center justify-between gap-4 rounded-xl border bg-slate-50 px-4 py-3">
                  <div className="text-sm text-slate-600">Status</div>
                  <div className="text-sm font-semibold text-slate-900">
                    {derivedStatus}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleUpdateProgress}
                  disabled={
                    !enrollmentId || enrollmentLoading || savingProgress
                  }
                  className="w-full rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                >
                  {savingProgress ? "Updating..." : "Update progress"}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
