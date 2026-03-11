import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAllStudents, deleteStudent } from "../../api/oracleStudentsApi";
import useToast from "../../hooks/useToast";
import Spinner from "../../components/ui/Spinner";

export default function AdminStudents() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [deleteError, setDeleteError] = useState("");
  const { addToast } = useToast();

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getAllStudents();
      setStudents(data || []);
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || "Failed to load";
      setError(msg);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete student "${name}"? This cannot be undone.`)) return;
    setDeletingId(id);
    setDeleteError("");
    try {
      await deleteStudent(id);
      addToast({ title: "Deleted", message: "Student removed.", variant: "success" });
      load();
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || "Delete failed";
      setDeleteError(msg);
      addToast({ title: "Delete failed", message: msg, variant: "error", durationMs: 8000 });
    } finally {
      setDeletingId(null);
    }
  };

  const row = (s) => ({
    id: s.STUDENT_ID ?? s.student_id,
    firstName: s.FIRST_NAME ?? s.first_name,
    lastName: s.LAST_NAME ?? s.last_name,
    email: s.EMAIL ?? s.email,
    status: s.STATUS ?? s.status,
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
        <h2 className="text-2xl font-bold text-slate-800">Students</h2>
        <Link
          to="/admin/students/create"
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
        >
          Add student
        </Link>
      </div>

      {error && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {deleteError && (
        <div className="mt-4 flex items-center justify-between gap-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <span>{deleteError}</span>
          <button
            type="button"
            onClick={() => setDeleteError("")}
            className="shrink-0 rounded px-2 py-1 font-medium hover:bg-red-100"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="mt-6 overflow-hidden rounded-xl border bg-white shadow-sm">
        {students.length === 0 ? (
          <div className="p-8 text-center text-slate-600">No students found.</div>
        ) : (
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-600">ID</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-600">Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-600">Email</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-600">Status</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {students.map((s) => {
                const r = row(s);
                return (
                  <tr key={r.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-sm text-slate-900">{r.id}</td>
                    <td className="px-4 py-3 text-sm text-slate-900">{r.firstName} {r.lastName}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{r.email}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{r.status ?? "-"}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/admin/students/${r.id}`}
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
