import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import { getCourses, getEnrollmentsByStudentId } from "../../api/oracleApi";
import {
  createPayment,
  getEnrollmentPayments,
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

export default function StudentPaymentDetail() {
  const { user } = useAuth();
  const { enrollmentId: enrollmentIdParam } = useParams();

  const enrollmentIdNumber = useMemo(() => {
    const n = Number(enrollmentIdParam);
    return Number.isNaN(n) ? null : n;
  }, [enrollmentIdParam]);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [enrollment, setEnrollment] = useState(null);
  const [course, setCourse] = useState(null);
  const [payments, setPayments] = useState([]);
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      setSuccess("");

      try {
        const studentId = user?.student_id;

        if (!studentId || !enrollmentIdNumber) {
          setError("Invalid enrollment or student.");
          setEnrollment(null);
          setCourse(null);
          setPayments([]);
          return;
        }

        const [enrollmentData, courseData, enrollmentPayments] =
          await Promise.all([
            getEnrollmentsByStudentId(studentId),
            getCourses(),
            getEnrollmentPayments(enrollmentIdNumber),
          ]);

        const enrollments = enrollmentData || [];
        const enrollmentMatch = enrollments.find((e) => {
          const id = e.ENROLLMENT_ID ?? e.enrollment_id;
          return Number(id) === enrollmentIdNumber;
        });

        if (!enrollmentMatch) {
          setError("Enrollment not found for this student.");
          setEnrollment(null);
          setCourse(null);
          setPayments([]);
          return;
        }

        const courseId =
          enrollmentMatch.COURSE_ID ?? enrollmentMatch.course_id ?? null;
        const courses = courseData || [];
        const courseMatch =
          courses.find((c) => {
            const id = c.COURSE_ID ?? c.course_id;
            return Number(id) === Number(courseId);
          }) || null;

        const feeRaw = courseMatch?.FEE ?? courseMatch?.fee;
        const fee =
          feeRaw !== undefined && feeRaw !== null ? Number(feeRaw) : null;

        setEnrollment(enrollmentMatch);
        setCourse(courseMatch);
        setAmount(
          fee !== null && !Number.isNaN(fee) && fee >= 0 ? String(fee) : "",
        );

        const normalizedPayments = (enrollmentPayments || []).map((p) => {
          const paymentId = p.payment_id ?? p.PAYMENT_ID;
          const amountValue = p.amount ?? p.AMOUNT;
          const method = p.payment_method ?? p.PAYMENT_METHOD;
          const statusRaw = p.payment_status ?? p.PAYMENT_STATUS;
          const status = String(statusRaw || "").toUpperCase();
          const date = p.payment_date ?? p.PAYMENT_DATE;

          return {
            paymentId,
            amount: amountValue,
            paymentMethod: method,
            paymentStatus: status,
            paymentDate: date,
          };
        });

        setPayments(
          normalizedPayments.sort((a, b) => {
            const aDate = new Date(a.paymentDate || 0).getTime();
            const bDate = new Date(b.paymentDate || 0).getTime();
            return bDate - aDate;
          }),
        );
      } catch (err) {
        const message =
          err?.response?.data?.message ||
          err?.message ||
          "Failed to load payment details";
        setError(message);
        setEnrollment(null);
        setCourse(null);
        setPayments([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [user?.student_id, enrollmentIdNumber]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!enrollmentIdNumber) return;

    setError("");
    setSuccess("");

    const amountNumber = Number(amount);
    if (Number.isNaN(amountNumber) || amountNumber <= 0) {
      setError("Amount must be greater than 0.");
      return;
    }

    if (!paymentMethod) {
      setError("Please select a payment method.");
      return;
    }

    setSubmitting(true);
    try {
      await createPayment({
        enrollment_id: enrollmentIdNumber,
        amount: amountNumber,
        payment_method: paymentMethod,
        payment_status: "PAID",
      });

      setSuccess("Payment recorded successfully.");

      const enrollmentPayments = await getEnrollmentPayments(
        enrollmentIdNumber,
      );

      const normalizedPayments = (enrollmentPayments || []).map((p) => {
        const paymentId = p.payment_id ?? p.PAYMENT_ID;
        const amountValue = p.amount ?? p.AMOUNT;
        const method = p.payment_method ?? p.PAYMENT_METHOD;
        const statusRaw = p.payment_status ?? p.PAYMENT_STATUS;
        const status = String(statusRaw || "").toUpperCase();
        const date = p.payment_date ?? p.PAYMENT_DATE;

        return {
          paymentId,
          amount: amountValue,
          paymentMethod: method,
          paymentStatus: status,
          paymentDate: date,
        };
      });

      setPayments(
        normalizedPayments.sort((a, b) => {
          const aDate = new Date(a.paymentDate || 0).getTime();
          const bDate = new Date(b.paymentDate || 0).getTime();
          return bDate - aDate;
        }),
      );
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to record payment";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-slate-600">
        <Spinner className="mb-3" />
        <div>Loading payment details...</div>
      </div>
    );
  }

  const courseId = course?.COURSE_ID ?? course?.course_id;
  const courseTitle =
    course?.COURSE_TITLE ?? course?.course_title ?? "Course details";
  const feeRaw = course?.FEE ?? course?.fee;

  const enrollmentStatus =
    enrollment?.COMPLETION_STATUS ?? enrollment?.completion_status;

  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">
            Record Payment for Enrollment
          </h2>
          <p className="mt-2 text-slate-600">
            Create a payment tied to this enrollment. Oracle will keep this as
            the source of truth.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            to="/student/payments"
            className="rounded-lg border bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Back to payments
          </Link>
          {courseId ? (
            <Link
              to={`/courses/${courseId}`}
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
            >
              View course
            </Link>
          ) : null}
        </div>
      </div>

      {error ? (
        <Alert variant="error" className="mt-6">
          {error}
        </Alert>
      ) : null}

      {success ? (
        <Alert variant="success" className="mt-4">
          {success}
        </Alert>
      ) : null}

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-800">
              Payment details
            </h3>
            <p className="mt-1 text-sm text-slate-600">
              Fill in the payment information and submit to record a payment in
              Oracle.
            </p>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Enrollment ID
                </label>
                <div className="mt-1 rounded-lg border bg-slate-50 px-3 py-2 text-sm text-slate-800">
                  {enrollmentIdNumber ?? "-"}
                </div>
              </div>

              <div>
                <label
                  htmlFor="amount"
                  className="block text-sm font-medium text-slate-700"
                >
                  Amount
                </label>
                <input
                  id="amount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/5"
                  placeholder="Enter amount"
                />
                {feeRaw !== undefined && feeRaw !== null ? (
                  <p className="mt-1 text-xs text-slate-500">
                    Course fee: {formatCurrency(feeRaw)}. You can adjust the
                    amount if needed.
                  </p>
                ) : null}
              </div>

              <div>
                <label
                  htmlFor="paymentMethod"
                  className="block text-sm font-medium text-slate-700"
                >
                  Payment method
                </label>
                <select
                  id="paymentMethod"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/5"
                >
                  <option value="">Select a method</option>
                  <option value="CARD">Card</option>
                  <option value="BANK_TRANSFER">Bank transfer</option>
                  <option value="CASH">Cash</option>
                </select>
                <p className="mt-1 text-xs text-slate-500">
                  Only use methods supported by your institution&apos;s payment
                  policy.
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {submitting ? (
                    <>
                      <Spinner className="mr-2 h-4 w-4" />
                      Saving...
                    </>
                  ) : (
                    "Record payment"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        <div>
          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-800">
              Enrollment summary
            </h3>

            <div className="mt-3 space-y-2 text-sm text-slate-700">
              <div>
                <div className="text-slate-500">Course</div>
                <div className="font-medium text-slate-900">{courseTitle}</div>
                {courseId ? (
                  <div className="text-xs text-slate-500">
                    Course ID: {courseId}
                  </div>
                ) : null}
              </div>

              <div>
                <div className="text-slate-500">Course fee</div>
                <div className="font-medium text-slate-900">
                  {feeRaw !== undefined && feeRaw !== null
                    ? formatCurrency(feeRaw)
                    : "-"}
                </div>
              </div>

              <div>
                <div className="text-slate-500">Enrollment status</div>
                <div className="font-medium text-slate-900">
                  {enrollmentStatus || "-"}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 rounded-2xl border bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-800">
              Payments for this enrollment
            </h3>

            {payments.length === 0 ? (
              <div className="mt-3 text-sm text-slate-600">
                No payments recorded for this enrollment yet.
              </div>
            ) : (
              <div className="mt-3 space-y-3 text-sm">
                {payments.map((p) => (
                  <div
                    key={p.paymentId || p.paymentDate}
                    className="flex items-center justify-between gap-3 rounded-xl border bg-white px-4 py-3"
                  >
                    <div>
                      <div className="text-slate-900">
                        {formatCurrency(p.amount)}
                      </div>
                      <div className="text-xs text-slate-500">
                        {formatDate(p.paymentDate)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-slate-500">
                        {p.paymentMethod || "-"}
                      </div>
                      <span
                        className={`mt-1 inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${getStatusBadgeClasses(
                          p.paymentStatus,
                        )}`}
                      >
                        {p.paymentStatus || "-"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

