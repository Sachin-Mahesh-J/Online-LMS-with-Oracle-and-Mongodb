import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getStudentById } from "../../api/oracleStudentsApi";
import Spinner from "../../components/ui/Spinner";

export default function AdminStudentDetail() {
  const { id } = useParams();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      setLoading(true);
      setError("");
      try {
        const data = await getStudentById(id);
        setStudent(data);
      } catch (err) {
        const msg = err?.response?.data?.message || err?.message || "Failed to load";
        setError(msg);
        setStudent(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (error || !student) {
    return (
      <div>
        <div className="mb-4 flex items-center gap-2 text-sm text-slate-600">
          <Link to="/admin/dashboard" className="hover:underline">Admin</Link>
          <span>/</span>
          <Link to="/admin/students" className="hover:underline">Students</Link>
          <span>/</span>
          <span className="text-slate-900">Details</span>
        </div>
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error || "Student not found."}
        </div>
        <Link to="/admin/students" className="mt-4 inline-block text-sm font-medium text-slate-600 hover:underline">
          ← Back to students
        </Link>
      </div>
    );
  }

  const r = {
    id: student.STUDENT_ID ?? student.student_id,
    firstName: student.FIRST_NAME ?? student.first_name,
    lastName: student.LAST_NAME ?? student.last_name,
    email: student.EMAIL ?? student.email,
    phone: student.PHONE ?? student.phone,
    dateOfBirth: student.DATE_OF_BIRTH ?? student.date_of_birth,
    registeredAt: student.REGISTERED_AT ?? student.registered_at,
    status: student.STATUS ?? student.status,
  };

  return (
    <div>
      <div className="mb-4 flex items-center gap-2 text-sm text-slate-600">
        <Link to="/admin/dashboard" className="hover:underline">Admin</Link>
        <span>/</span>
        <Link to="/admin/students" className="hover:underline">Students</Link>
        <span>/</span>
        <span className="text-slate-900">{r.firstName} {r.lastName}</span>
      </div>

      <div className="flex items-start justify-between gap-4">
        <h2 className="text-2xl font-bold text-slate-800">Student Details</h2>
        <Link
          to="/admin/students"
          className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          ← Back to list
        </Link>
      </div>

      <div className="mt-6 max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <dl className="grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-sm font-medium text-slate-500">Student ID</dt>
            <dd className="mt-1 text-slate-900">{r.id}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-slate-500">First name</dt>
            <dd className="mt-1 text-slate-900">{r.firstName}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-slate-500">Last name</dt>
            <dd className="mt-1 text-slate-900">{r.lastName}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-slate-500">Email</dt>
            <dd className="mt-1 text-slate-900">{r.email}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-slate-500">Phone</dt>
            <dd className="mt-1 text-slate-900">{r.phone ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-slate-500">Date of birth</dt>
            <dd className="mt-1 text-slate-900">
              {r.dateOfBirth ? new Date(r.dateOfBirth).toLocaleDateString() : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-slate-500">Registered at</dt>
            <dd className="mt-1 text-slate-900">
              {r.registeredAt ? new Date(r.registeredAt).toLocaleDateString() : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-slate-500">Status</dt>
            <dd className="mt-1">
              <span
                className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  r.status === "ACTIVE" ? "bg-green-100 text-green-800" : "bg-slate-100 text-slate-800"
                }`}
              >
                {r.status ?? "-"}
              </span>
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
