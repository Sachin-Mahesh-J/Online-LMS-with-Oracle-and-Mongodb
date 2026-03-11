import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getInstructorById } from "../../api/oracleInstructorsApi";
import Spinner from "../../components/ui/Spinner";

export default function AdminInstructorDetail() {
  const { id } = useParams();
  const [instructor, setInstructor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      setLoading(true);
      setError("");
      try {
        const data = await getInstructorById(id);
        setInstructor(data);
      } catch (err) {
        const msg = err?.response?.data?.message || err?.message || "Failed to load";
        setError(msg);
        setInstructor(null);
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

  if (error || !instructor) {
    return (
      <div>
        <div className="mb-4 flex items-center gap-2 text-sm text-slate-600">
          <Link to="/admin/dashboard" className="hover:underline">Admin</Link>
          <span>/</span>
          <Link to="/admin/instructors" className="hover:underline">Instructors</Link>
          <span>/</span>
          <span className="text-slate-900">Details</span>
        </div>
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error || "Instructor not found."}
        </div>
        <Link to="/admin/instructors" className="mt-4 inline-block text-sm font-medium text-slate-600 hover:underline">
          ← Back to instructors
        </Link>
      </div>
    );
  }

  const r = {
    id: instructor.INSTRUCTOR_ID ?? instructor.instructor_id,
    firstName: instructor.FIRST_NAME ?? instructor.first_name,
    lastName: instructor.LAST_NAME ?? instructor.last_name,
    email: instructor.EMAIL ?? instructor.email,
    phone: instructor.PHONE ?? instructor.phone,
    specialization: instructor.SPECIALIZATION ?? instructor.specialization,
    hiredDate: instructor.HIRED_DATE ?? instructor.hired_date,
    status: instructor.STATUS ?? instructor.status,
  };

  return (
    <div>
      <div className="mb-4 flex items-center gap-2 text-sm text-slate-600">
        <Link to="/admin/dashboard" className="hover:underline">Admin</Link>
        <span>/</span>
        <Link to="/admin/instructors" className="hover:underline">Instructors</Link>
        <span>/</span>
        <span className="text-slate-900">{r.firstName} {r.lastName}</span>
      </div>

      <div className="flex items-start justify-between gap-4">
        <h2 className="text-2xl font-bold text-slate-800">Instructor Details</h2>
        <Link
          to="/admin/instructors"
          className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          ← Back to list
        </Link>
      </div>

      <div className="mt-6 max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <dl className="grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-sm font-medium text-slate-500">Instructor ID</dt>
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
            <dt className="text-sm font-medium text-slate-500">Specialization</dt>
            <dd className="mt-1 text-slate-900">{r.specialization ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-slate-500">Hire date</dt>
            <dd className="mt-1 text-slate-900">
              {r.hiredDate ? new Date(r.hiredDate).toLocaleDateString() : "-"}
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
