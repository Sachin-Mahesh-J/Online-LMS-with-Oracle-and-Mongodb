import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import { getStudentCertificates } from "../../api/oracleCertificationsApi";

const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString();
};

export default function StudentCertificateDetail() {
  const { certificateId } = useParams();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [certificates, setCertificates] = useState([]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");

      try {
        const studentId = user?.student_id;
        if (!studentId) {
          setCertificates([]);
          return;
        }

        const rows = await getStudentCertificates(studentId);
        setCertificates(rows || []);
      } catch (err) {
        const message =
          err?.response?.data?.message ||
          err?.message ||
          "Failed to load certificate";
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [user?.student_id]);

  const certificate = useMemo(() => {
    const id = Number(certificateId);
    return (certificates || []).find((c) => Number(c.certificate_id) === id);
  }, [certificates, certificateId]);

  const printableTitle = certificate?.course_title
    ? `Certificate - ${certificate.course_title}`
    : "Certificate";

  if (loading) {
    return <div className="py-10 text-center text-slate-600">Loading...</div>;
  }

  if (error) {
    return (
      <div>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">
              Certificate Details
            </h2>
            <p className="mt-2 text-slate-600">View your certificate.</p>
          </div>
          <Link
            to="/student/certificates"
            className="rounded-lg border bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Back
          </Link>
        </div>

        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      </div>
    );
  }

  if (!certificate) {
    return (
      <div>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">
              Certificate Details
            </h2>
            <p className="mt-2 text-slate-600">Certificate not found.</p>
          </div>
          <Link
            to="/student/certificates"
            className="rounded-lg border bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Back
          </Link>
        </div>

        <div className="mt-6 rounded-2xl border bg-white p-6 text-slate-600 shadow-sm">
          This certificate does not exist or you do not have access.
        </div>
      </div>
    );
  }

  const fullName = [certificate.first_name, certificate.last_name]
    .filter(Boolean)
    .join(" ");

  const handlePrint = () => {
    window.print();
  };

  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">
            Certificate Details
          </h2>
          <p className="mt-2 text-slate-600">{printableTitle}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/student/certificates"
            className="rounded-lg border bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Back
          </Link>
          <button
            type="button"
            onClick={handlePrint}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
          >
            Print
          </button>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-800">
            Certificate Overview
          </h3>

          <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-slate-500">Certificate ID</div>
              <div className="font-semibold text-slate-800">
                {certificate.certificate_id}
              </div>
            </div>
            <div>
              <div className="text-slate-500">Certificate Code</div>
              <div className="font-semibold text-slate-800">
                {certificate.certificate_code || "-"}
              </div>
            </div>
            <div>
              <div className="text-slate-500">Issued</div>
              <div className="font-semibold text-slate-800">
                {formatDate(certificate.issue_date)}
              </div>
            </div>
            <div>
              <div className="text-slate-500">Status</div>
              <div>
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                  {certificate.certificate_status || "ISSUED"}
                </span>
              </div>
            </div>
            <div>
              <div className="text-slate-500">Grade</div>
              <div className="font-semibold text-slate-800">
                {certificate.grade || "-"}
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-800">Student</h3>

          <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-slate-500">Student ID</div>
              <div className="font-semibold text-slate-800">
                {certificate.student_id ?? user?.student_id ?? "-"}
              </div>
            </div>
            <div>
              <div className="text-slate-500">Name</div>
              <div className="font-semibold text-slate-800">
                {fullName || "-"}
              </div>
            </div>
          </div>

          <div className="mt-6 border-t pt-6">
            <h3 className="text-lg font-semibold text-slate-800">Course</h3>

            <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-slate-500">Course ID</div>
                <div className="font-semibold text-slate-800">
                  {certificate.course_id ?? "-"}
                </div>
              </div>
              <div>
                <div className="text-slate-500">Course Title</div>
                <div className="font-semibold text-slate-800">
                  {certificate.course_title || "-"}
                </div>
              </div>
              <div>
                <div className="text-slate-500">Completion Status</div>
                <div className="font-semibold text-slate-800">
                  {certificate.completion_status || "-"}
                </div>
              </div>
              <div>
                <div className="text-slate-500">Progress</div>
                <div className="font-semibold text-slate-800">
                  {certificate.progress_percent !== null &&
                  certificate.progress_percent !== undefined
                    ? `${certificate.progress_percent}%`
                    : "-"}
                </div>
              </div>
            </div>

            <div className="mt-4">
              <Link
                to={`/courses/${certificate.course_id}`}
                className="text-sm font-semibold text-slate-900 underline"
              >
                View course
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border bg-white p-10 text-center shadow-sm">
        <div className="text-xs font-semibold tracking-widest text-slate-500">
          CERTIFICATE OF COMPLETION
        </div>
        <div className="mt-3 text-2xl font-bold text-slate-900">
          {certificate.course_title || "Course"}
        </div>
        <div className="mt-4 text-sm text-slate-600">
          Issued on {formatDate(certificate.issue_date)}
        </div>
        <div className="mt-6 text-sm text-slate-700">
          Certificate Code: {certificate.certificate_code || "-"}
        </div>
      </div>
    </div>
  );
}
