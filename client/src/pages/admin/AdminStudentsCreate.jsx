import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { createStudent } from "../../api/oracleStudentsApi";
import useToast from "../../hooks/useToast";

export default function AdminStudentsCreate() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    password_confirm: "",
    phone: "",
    date_of_birth: "",
    status: "ACTIVE",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.password !== form.password_confirm) {
      setError("Passwords do not match");
      return;
    }
    if (!form.password?.trim()) {
      setError("Temporary password is required");
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        email: form.email.trim(),
        password: form.password,
        phone: form.phone?.trim() || undefined,
        date_of_birth: form.date_of_birth || undefined,
        status: form.status,
      };
      await createStudent(payload);
      addToast({ title: "Created", message: "Student and login account created successfully.", variant: "success" });
      navigate("/admin/students", { replace: true });
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || "Create failed";
      setError(msg);
      addToast({ title: "Error", message: msg, variant: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="mb-4 flex items-center gap-2 text-sm text-slate-600">
        <Link to="/admin/dashboard" className="hover:underline">Admin</Link>
        <span>/</span>
        <Link to="/admin/students" className="hover:underline">Students</Link>
        <span>/</span>
        <span className="text-slate-900">Add</span>
      </div>

      <h2 className="text-2xl font-bold text-slate-800">Add student</h2>
      <p className="mt-2 text-slate-600">Create a new student record in Oracle.</p>

      {error && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 max-w-xl space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700">First name *</label>
          <input
            type="text"
            name="first_name"
            value={form.first_name}
            onChange={handleChange}
            required
            className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Last name *</label>
          <input
            type="text"
            name="last_name"
            value={form.last_name}
            onChange={handleChange}
            required
            className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Email *</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
            className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
          />
          <p className="mt-1 text-xs text-slate-500">Also used as login account email.</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <h3 className="text-sm font-medium text-slate-700">Login account</h3>
          <p className="mt-1 text-xs text-slate-600">Create linked login credentials for this student.</p>
          <div className="mt-3 space-y-3">
            <div>
              <label className="block text-sm font-medium text-slate-700">Temporary password *</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
                autoComplete="new-password"
                className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
                placeholder="••••••••"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Confirm password *</label>
              <input
                type="password"
                name="password_confirm"
                value={form.password_confirm}
                onChange={handleChange}
                required
                autoComplete="new-password"
                className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
                placeholder="••••••••"
              />
            </div>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Phone</label>
          <input
            type="text"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Date of birth</label>
          <input
            type="date"
            name="date_of_birth"
            value={form.date_of_birth}
            onChange={handleChange}
            className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Status</label>
          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
          >
            <option value="ACTIVE">ACTIVE</option>
            <option value="INACTIVE">INACTIVE</option>
          </select>
        </div>
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {submitting ? "Creating..." : "Create student"}
          </button>
          <Link
            to="/admin/students"
            className="rounded-lg border px-4 py-2 text-sm font-medium text-slate-700"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
