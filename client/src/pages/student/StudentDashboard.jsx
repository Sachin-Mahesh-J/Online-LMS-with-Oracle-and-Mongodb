import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getAllAnnouncements } from "../../api/announcementsApi";
import { getSubmissionsByStudent } from "../../api/submissionsApi";
import { getEnrollmentsByStudentId } from "../../api/oracleApi";
import { getStudentCertificates } from "../../api/oracleCertificationsApi";
import { getStudentTotalPayments } from "../../api/oraclePaymentsApi";
import useAuth from "../../hooks/useAuth";

export default function StudentDashboard() {
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [enrollments, setEnrollments] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [totalPaid, setTotalPaid] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");

      try {
        const studentId = user?.student_id;
        if (!studentId) {
          setEnrollments([]);
          setAnnouncements([]);
          setSubmissions([]);
          return;
        }

        const [
          enrollmentData,
          allAnnouncements,
          submissionData,
          certificateData,
          totalPaidData,
        ] = await Promise.all([
          getEnrollmentsByStudentId(studentId),
          getAllAnnouncements(),
          getSubmissionsByStudent(studentId),
          getStudentCertificates(studentId),
          getStudentTotalPayments(studentId),
        ]);

        const normalizedEnrollments = enrollmentData || [];
        const enrolledCourseIds = new Set(
          normalizedEnrollments.map((e) => Number(e.COURSE_ID ?? e.course_id)),
        );

        const filteredAnnouncements = (allAnnouncements || [])
          .filter((a) => enrolledCourseIds.has(Number(a.course_id)))
          .sort((a, b) => new Date(b.posted_at) - new Date(a.posted_at));

        const sortedSubmissions = (submissionData || []).sort(
          (a, b) => new Date(b.submitted_at) - new Date(a.submitted_at),
        );

        setEnrollments(normalizedEnrollments);
        setAnnouncements(filteredAnnouncements);
        setSubmissions(sortedSubmissions);
        setCertificates(certificateData || []);
        const backendTotal =
          totalPaidData?.total_paid ??
          totalPaidData?.TOTAL_PAID ??
          totalPaidData?.total ??
          null;
        setTotalPaid(
          backendTotal !== undefined && backendTotal !== null
            ? Number(backendTotal)
            : null,
        );
      } catch (err) {
        const msg =
          err?.response?.data?.message || err?.message || "Failed to load";
        setError(msg);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [user?.student_id]);

  const enrolledCount = enrollments.length;
  const certificateCount = certificates.length;

  const formattedTotalPaid =
    totalPaid !== null && !Number.isNaN(totalPaid)
      ? new Intl.NumberFormat(undefined, {
          style: "currency",
          currency: "USD",
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(totalPaid)
      : null;

  const latestAnnouncements = useMemo(() => {
    return announcements.slice(0, 5);
  }, [announcements]);

  const recentSubmissions = useMemo(() => {
    return submissions.slice(0, 5);
  }, [submissions]);

  if (loading) {
    return <div className="py-10 text-center text-slate-600">Loading...</div>;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-800">Student Dashboard</h2>
      <p className="mt-2 text-slate-600">Welcome back, {user?.email}.</p>

      {error ? (
        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="mt-6 grid gap-4 md:grid-cols-4">
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="text-sm text-slate-500">Enrolled courses</div>
          <div className="mt-2 text-3xl font-bold text-slate-900">
            {enrolledCount}
          </div>
          <Link
            to="/student/my-courses"
            className="mt-4 inline-block text-sm font-semibold text-slate-900 underline"
          >
            View my courses
          </Link>
        </div>

        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="text-sm text-slate-500">Certificates earned</div>
          <div className="mt-2 text-3xl font-bold text-slate-900">
            {certificateCount}
          </div>
          <Link
            to="/student/certificates"
            className="mt-4 inline-block text-sm font-semibold text-slate-900 underline"
          >
            View certificates
          </Link>
        </div>

        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="text-sm text-slate-500">Recent submissions</div>
          <div className="mt-2 text-3xl font-bold text-slate-900">
            {submissions.length}
          </div>
          <Link
            to="/student/submissions"
            className="mt-4 inline-block text-sm font-semibold text-slate-900 underline"
          >
            View submissions
          </Link>
        </div>

        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="text-sm text-slate-500">Quick links</div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              to="/courses"
              className="rounded-lg border bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Browse courses
            </Link>
            <Link
              to="/student/forum"
              className="rounded-lg border bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Forum
            </Link>
            <Link
              to="/student/reviews"
              className="rounded-lg border bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Reviews
            </Link>
            <Link
              to="/student/payments"
              className="rounded-lg border bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Payments
            </Link>
          </div>
          {formattedTotalPaid ? (
            <div className="mt-4 text-xs text-slate-600">
              Total paid so far:{" "}
              <span className="font-semibold text-slate-900">
                {formattedTotalPaid}
              </span>
            </div>
          ) : null}
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <h3 className="text-lg font-semibold text-slate-800">
              Latest announcements
            </h3>
            <Link
              to="/student/announcements"
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
              Recent submissions
            </h3>
            <Link
              to="/student/submissions"
              className="text-sm font-semibold text-slate-900 underline"
            >
              View all
            </Link>
          </div>

          {recentSubmissions.length === 0 ? (
            <div className="mt-4 text-sm text-slate-600">
              No submissions yet.
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              {recentSubmissions.map((s) => (
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
                  </div>
                  <div className="text-xs font-semibold text-slate-700">
                    {s.status}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
