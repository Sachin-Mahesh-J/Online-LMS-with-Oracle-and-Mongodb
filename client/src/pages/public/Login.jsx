import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import useToast from "../../hooks/useToast";
import Alert from "../../components/ui/Alert";

function getRedirectForRole(user, from) {
  const role = String(user?.role || "").toUpperCase();
  if (role === "ADMIN" && (from.startsWith("/student") || from.startsWith("/instructor"))) {
    return "/admin/dashboard";
  }
  if (role === "STUDENT" && (from.startsWith("/admin") || from.startsWith("/instructor"))) {
    return "/student/dashboard";
  }
  if (role === "INSTRUCTOR" && (from.startsWith("/admin") || from.startsWith("/student"))) {
    return "/instructor/dashboard";
  }
  return from;
}

export default function Login() {
  const { user, login, isAuthenticated, loading } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/";
  const redirectTo = getRedirectForRole(user, from);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!loading && isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const loggedInUser = await login({ email: email.trim(), password });
      addToast({
        title: "Signed in",
        message: "Welcome back.",
        variant: "success",
      });
      const target = getRedirectForRole(loggedInUser, from);
      navigate(target, { replace: true });
    } catch (err) {
      const message =
        err?.response?.data?.message || err?.message || "Login failed";
      setError(message);
      addToast({
        title: "Login failed",
        message,
        variant: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-md py-12">
      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-bold text-slate-800">Login</h2>
        <p className="mt-2 text-sm text-slate-600">
          Use your Oracle user account (student, instructor, or admin).
        </p>

        <Alert variant="error" className="mt-4">
          {error}
        </Alert>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900"
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {submitting ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
