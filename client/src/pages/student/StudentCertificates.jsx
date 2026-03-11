import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import { getStudentCertificates } from "../../api/oracleCertificationsApi";

const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString();
};

export default function StudentCertificates() {
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
          "Failed to load certificates";
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [user?.student_id]);

  const sorted = useMemo(() => {
    return [...(certificates || [])].sort((a, b) => {
      const da = a?.issue_date ? new Date(a.issue_date).getTime() : 0;
      const db = b?.issue_date ? new Date(b.issue_date).getTime() : 0;
      return db - da;
    });
  }, [certificates]);

  if (loading) {
    return <div className="py-10 text-center text-slate-600">Loading...</div>;
  }

  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Certificates</h2>
          <p className="mt-2 text-slate-600">
            Certificates issued for your completed courses.
          </p>
        </div>
        <Link
          to="/student/dashboard"
          className="rounded-lg border bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Back to dashboard
        </Link>
      </div>

      {error ? (
        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {sorted.length === 0 ? (
        <div className="mt-6 rounded-2xl border bg-white p-6 text-slate-600 shadow-sm">
          No certificates earned yet.
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-2xl border bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3 font-semibold">Certificate</th>
                <th className="px-4 py-3 font-semibold">Course</th>
                <th className="px-4 py-3 font-semibold">Issued</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Grade</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((c) => (
                <tr key={c.certificate_id} className="border-t last:border-b-0">
                  <td className="px-4 py-3">
                    <Link
                      to={`/student/certificates/${c.certificate_id}`}
                      className="font-semibold text-slate-800 underline"
                    >
                      {c.certificate_code || `#${c.certificate_id}`}
                    </Link>
                    <div className="text-xs text-slate-500">
                      ID: {c.certificate_id}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    <div className="font-medium text-slate-800">
                      {c.course_title || "-"}
                    </div>
                    <div className="text-xs text-slate-500">
                      Course ID: {c.course_id ?? "-"}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    {formatDate(c.issue_date)}
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                      {c.certificate_status || "ISSUED"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-700">{c.grade || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
