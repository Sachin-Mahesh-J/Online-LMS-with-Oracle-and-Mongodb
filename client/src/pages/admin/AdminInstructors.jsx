import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAllInstructors, deleteInstructor } from "../../api/oracleInstructorsApi";
import useToast from "../../hooks/useToast";
import Spinner from "../../components/ui/Spinner";

export default function AdminInstructors() {
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const { addToast } = useToast();

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getAllInstructors();
      setInstructors(data || []);
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || "Failed to load";
      setError(msg);
      setInstructors([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete instructor "${name}"? This cannot be undone.`)) return;
    setDeletingId(id);
    try {
      await deleteInstructor(id);
      addToast({ title: "Deleted", message: "Instructor removed.", variant: "success" });
      load();
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || "Delete failed";
      addToast({ title: "Error", message: msg, variant: "error" });
    } finally {
      setDeletingId(null);
    }
  };

  const row = (i) => ({
    id: i.INSTRUCTOR_ID ?? i.instructor_id,
    firstName: i.FIRST_NAME ?? i.first_name,
    lastName: i.LAST_NAME ?? i.last_name,
    email: i.EMAIL ?? i.email,
    specialization: i.SPECIALIZATION ?? i.specialization,
    hiredDate: i.HIRED_DATE ?? i.hired_date,
    status: i.STATUS ?? i.status,
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-slate-800">Instructors</h2>
        <Link
          to="/admin/instructors/create"
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
        >
          Add instructor
        </Link>
      </div>

      {error && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="mt-6 overflow-hidden rounded-xl border bg-white shadow-sm">
        {instructors.length === 0 ? (
          <div className="p-8 text-center text-slate-600">No instructors found.</div>
        ) : (
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-600">ID</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-600">Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-600">Email</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-600">Specialization</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-600">Hire date</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-600">Status</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {instructors.map((i) => {
                const r = row(i);
                return (
                  <tr key={r.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-sm text-slate-900">{r.id}</td>
                    <td className="px-4 py-3 text-sm text-slate-900">{r.firstName} {r.lastName}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{r.email}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{r.specialization ?? "-"}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">
                      {r.hiredDate ? new Date(r.hiredDate).toLocaleDateString() : "-"}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">{r.status ?? "-"}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/admin/instructors/${r.id}`}
                          className="rounded-lg border border-slate-200 px-3 py-1 text-sm font-medium text-slate-700 hover:bg-slate-50"
                        >
                          View
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDelete(r.id, `${r.firstName} ${r.lastName}`)}
                          disabled={deletingId === r.id}
                          className="rounded-lg border border-red-200 px-3 py-1 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
                        >
                          {deletingId === r.id ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
