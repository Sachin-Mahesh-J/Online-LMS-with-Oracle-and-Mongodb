import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import { getCourses, getEnrollmentsByStudentId } from "../../api/oracleApi";
import { getStudentCertificates } from "../../api/oracleCertificationsApi";
import { getEnrollmentPayments } from "../../api/oraclePaymentsApi";

export default function StudentMyCourses() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [enrollments, setEnrollments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [paymentsByEnrollmentId, setPaymentsByEnrollmentId] = useState({});

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");

      try {
        const studentId = user?.student_id;
        if (!studentId) {
          setEnrollments([]);
          setCourses([]);
          setCertificates([]);
          return;
        }

        const [enrollmentData, courseData, certificateData] = await Promise.all(
          [
            getEnrollmentsByStudentId(studentId),
            getCourses(),
            getStudentCertificates(studentId),
          ],
        );

        const normalizedEnrollments = enrollmentData || [];
        setEnrollments(normalizedEnrollments);
        setCourses(courseData || []);
        setCertificates(certificateData || []);

        const paymentResults = await Promise.all(
          normalizedEnrollments.map(async (enrollment) => {
            const enrollmentId =
              enrollment.ENROLLMENT_ID ?? enrollment.enrollment_id;
            if (enrollmentId === undefined || enrollmentId === null) {
              return { enrollmentId: null, payments: [] };
            }

            try {
              const data = await getEnrollmentPayments(enrollmentId);
              return { enrollmentId: Number(enrollmentId), payments: data || [] };
            } catch (err) {
              console.error("Failed to load payments for enrollment", {
                enrollmentId,
                err,
              });
              return { enrollmentId: Number(enrollmentId), payments: [] };
            }
          }),
        );

        const paymentsMap = {};
        paymentResults.forEach(({ enrollmentId, payments }) => {
          if (enrollmentId !== null && enrollmentId !== undefined) {
            paymentsMap[enrollmentId] = payments;
          }
        });
        setPaymentsByEnrollmentId(paymentsMap);
      } catch (err) {
        const message =
          err?.response?.data?.message || err?.message || "Failed to load data";
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [user?.student_id]);

  const coursesById = useMemo(() => {
    const map = new Map();
    (courses || []).forEach((c) => {
      const id = c.COURSE_ID ?? c.course_id;
      if (id !== undefined && id !== null) {
        map.set(Number(id), c);
      }
    });
    return map;
  }, [courses]);

  const certificateByEnrollmentId = useMemo(() => {
    const map = new Map();
    (certificates || []).forEach((c) => {
      const enrollmentId = c.enrollment_id ?? c.ENROLLMENT_ID;
      if (enrollmentId !== undefined && enrollmentId !== null) {
        map.set(Number(enrollmentId), c);
      }
    });
    return map;
  }, [certificates]);

  if (loading) {
    return <div className="py-10 text-center text-slate-600">Loading...</div>;
  }

  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">My Courses</h2>
          <p className="mt-2 text-slate-600">
            Courses you are enrolled in (Oracle enrollments).
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

      {enrollments.length === 0 ? (
        <div className="mt-6 rounded-2xl border bg-white p-6 text-slate-600 shadow-sm">
          No enrollments found.
        </div>
      ) : (
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {enrollments.map((enrollment) => {
            const courseId = enrollment.COURSE_ID ?? enrollment.course_id;
            const course = coursesById.get(Number(courseId));
            const title =
              course?.COURSE_TITLE ?? course?.course_title ?? "Course";
            const category = course?.CATEGORY ?? course?.category;
            const progress =
              enrollment.PROGRESS_PERCENT ??
              enrollment.progress_percent ??
              null;
            const status =
              enrollment.COMPLETION_STATUS ??
              enrollment.completion_status ??
              null;

            const enrollmentId =
              enrollment.ENROLLMENT_ID ?? enrollment.enrollment_id;
                const rawPayments =
                  (enrollmentId &&
                    paymentsByEnrollmentId[Number(enrollmentId)]) ||
                  [];
                const normalizedPayments = (rawPayments || []).map((p) => {
                  const statusRaw = p.payment_status ?? p.PAYMENT_STATUS;
                  return String(statusRaw || "").toUpperCase();
                });
                const hasPaid = normalizedPayments.includes("PAID");
                const hasPending =
                  !hasPaid && normalizedPayments.includes("PENDING");
            const certificate = enrollmentId
              ? certificateByEnrollmentId.get(Number(enrollmentId))
              : null;
            const isCompleted =
              String(status || "").toUpperCase() === "COMPLETED";

            return (
              <div
                key={enrollment.ENROLLMENT_ID ?? enrollment.enrollment_id}
                className="rounded-2xl border bg-white p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-800">
                      {title}
                    </h3>
                    <p className="mt-1 text-sm text-slate-600">
                      Course ID: {courseId}
                    </p>
                    {category ? (
                      <p className="mt-1 text-sm text-slate-500">
                        Category: {category}
                      </p>
                    ) : null}
                  </div>
                  <Link
                    to={`/courses/${courseId}`}
                    className="shrink-0 rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white"
                  >
                    View
                  </Link>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  <Link
                    to={`/student/courses/${courseId}/assignments`}
                    className="rounded-lg border bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Assignments
                  </Link>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <div className="text-slate-500">Progress</div>
                    <div className="font-medium text-slate-800">
                      {progress !== null && progress !== undefined
                        ? `${progress}%`
                        : "-"}
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-500">Status</div>
                    <div className="font-medium text-slate-800">
                      {status || "-"}
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  {certificate ? (
                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                      Certificate Earned
                    </span>
                  ) : isCompleted ? (
                    <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                      Eligible for Certificate
                    </span>
                  ) : null}

                  {certificate ? (
                    <Link
                      to="/student/certificates"
                      className="text-xs font-semibold text-slate-900 underline"
                    >
                      View certificate
                    </Link>
                  ) : null}

                  {hasPaid ? (
                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                      Payment Complete
                    </span>
                  ) : hasPending ? (
                    <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                      Payment Pending
                    </span>
                  ) : (
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                      No Payments
                    </span>
                  )}

                  {!hasPaid && enrollmentId ? (
                    <Link
                      to={`/student/payments/${encodeURIComponent(
                        String(enrollmentId),
                      )}`}
                      className="text-xs font-semibold text-slate-900 underline"
                    >
                      Record payment
                    </Link>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
