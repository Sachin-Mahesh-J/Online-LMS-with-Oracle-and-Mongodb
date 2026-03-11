import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import { getCourses, getEnrollmentsByStudentId } from "../../api/oracleApi";
import {
  getEnrollmentPayments,
  getStudentTotalPayments,
} from "../../api/oraclePaymentsApi";
import Alert from "../../components/ui/Alert";
import Spinner from "../../components/ui/Spinner";

function formatCurrency(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return "-";
  }

  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number(value));
  } catch {
    return String(value);
  }
}

function formatDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString();
}

function getStatusBadgeClasses(status) {
  switch (status) {
    case "PAID":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "FAILED":
      return "bg-red-50 text-red-700 border-red-200";
    case "PENDING":
    default:
      return "bg-amber-50 text-amber-700 border-amber-200";
  }
}

export default function StudentPayments() {
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [payments, setPayments] = useState([]);
  const [totalPaidFromBackend, setTotalPaidFromBackend] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");

      try {
        const studentId = user?.student_id;

        if (!studentId) {
          setPayments([]);
          setTotalPaidFromBackend(null);
          return;
        }

        const [enrollmentData, coursesData, totalPaidData] = await Promise.all([
          getEnrollmentsByStudentId(studentId),
          getCourses(),
          getStudentTotalPayments(studentId),
        ]);

        const enrollments = enrollmentData || [];
        const courses = coursesData || [];

        const coursesById = new Map();
        (courses || []).forEach((course) => {
          const id = course.COURSE_ID ?? course.course_id;
          if (id !== undefined && id !== null) {
            coursesById.set(Number(id), course);
          }
        });

        const enrollmentPaymentsResults = await Promise.all(
          enrollments.map(async (enrollment) => {
            const enrollmentId =
              enrollment.ENROLLMENT_ID ?? enrollment.enrollment_id;
            const courseId = enrollment.COURSE_ID ?? enrollment.course_id;

            if (
              enrollmentId === undefined ||
              enrollmentId === null ||
              courseId === undefined ||
              courseId === null
            ) {
              return [];
            }

            try {
              const enrollmentPayments = await getEnrollmentPayments(
                enrollmentId,
              );
              const course = coursesById.get(Number(courseId));
              const courseTitle =
                course?.COURSE_TITLE ?? course?.course_title ?? "Course";

              return (enrollmentPayments || []).map((p) => {
                const paymentId = p.payment_id ?? p.PAYMENT_ID;
                const enrollmentIdValue =
                  p.enrollment_id ?? p.ENROLLMENT_ID ?? enrollmentId;
                const amount = p.amount ?? p.AMOUNT;
                const method = p.payment_method ?? p.PAYMENT_METHOD;
                const statusRaw = p.payment_status ?? p.PAYMENT_STATUS;
                const status = String(statusRaw || "").toUpperCase();
                const date = p.payment_date ?? p.PAYMENT_DATE;

                return {
                  paymentId,
                  enrollmentId: enrollmentIdValue,
                  courseId,
                  courseTitle,
                  amount,
                  paymentMethod: method,
                  paymentStatus: status,
                  paymentDate: date,
                };
              });
            } catch (err) {
              console.error("Failed to load payments for enrollment", {
                enrollmentId,
                err,
              });
              return [];
            }
          }),
        );

        const flattenedPayments = enrollmentPaymentsResults.flat();

        setPayments(
          flattenedPayments.sort((a, b) => {
            const aDate = new Date(a.paymentDate || 0).getTime();
            const bDate = new Date(b.paymentDate || 0).getTime();
            return bDate - aDate;
          }),
        );

        const totalPaid =
          totalPaidData?.total_paid ??
          totalPaidData?.TOTAL_PAID ??
          totalPaidData?.total ??
          null;
        setTotalPaidFromBackend(
          totalPaid !== undefined && totalPaid !== null
            ? Number(totalPaid)
            : null,
        );
      } catch (err) {
        const message =
          err?.response?.data?.message ||
          err?.message ||
          "Failed to load payments";
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [user?.student_id]);

  const summary = useMemo(() => {
    const totalCount = payments.length;
    let pendingCount = 0;
    let computedPaidTotal = 0;

    payments.forEach((p) => {
      const status = String(p.paymentStatus || "").toUpperCase();
      const amountNum = Number(p.amount);

      if (status === "PENDING") {
        pendingCount += 1;
      }
      if (status === "PAID" && !Number.isNaN(amountNum)) {
        computedPaidTotal += amountNum;
      }
    });

    return {
      totalCount,
      pendingCount,
      computedPaidTotal,
    };
  }, [payments]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-slate-600">
        <Spinner className="mb-3" />
        <div>Loading payments...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Payments</h2>
          <p className="mt-2 text-slate-600">
            Payment history for your Oracle enrollments.
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
        <Alert variant="error" className="mt-6">
          {error}
        </Alert>
      ) : null}

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="text-sm text-slate-500">Total payments</div>
          <div className="mt-2 text-3xl font-bold text-slate-900">
            {summary.totalCount}
          </div>
        </div>

        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="text-sm text-slate-500">Total paid amount</div>
          <div className="mt-2 text-2xl font-bold text-slate-900">
            {formatCurrency(
              totalPaidFromBackend ?? summary.computedPaidTotal ?? 0,
            )}
          </div>
          {totalPaidFromBackend !== null ? (
            <div className="mt-1 text-xs text-slate-500">
              Based on Oracle&apos;s total paid calculation.
            </div>
          ) : null}
        </div>

        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="text-sm text-slate-500">Pending payments</div>
          <div className="mt-2 text-3xl font-bold text-slate-900">
            {summary.pendingCount}
          </div>
        </div>
      </div>

      {payments.length === 0 ? (
        <div className="mt-6 rounded-2xl border bg-white p-6 text-slate-600 shadow-sm">
          No payments found yet. Once you or an administrator records a payment
          for one of your enrollments, it will appear here.
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-2xl border bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Course
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Enrollment
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Amount
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Method
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {payments.map((p) => (
                  <tr key={p.paymentId || `${p.enrollmentId}-${p.paymentDate}`}>
                    <td className="whitespace-nowrap px-4 py-3">
                      <div className="font-medium text-slate-900">
                        {p.courseTitle}
                      </div>
                      <div className="text-xs text-slate-500">
                        Course ID: {p.courseId}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-700">
                      {p.enrollmentId}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-900">
                      {formatCurrency(p.amount)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-700">
                      {p.paymentMethod || "-"}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <span
                        className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${getStatusBadgeClasses(
                          p.paymentStatus,
                        )}`}
                      >
                        {p.paymentStatus || "-"}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-700">
                      {formatDate(p.paymentDate)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

