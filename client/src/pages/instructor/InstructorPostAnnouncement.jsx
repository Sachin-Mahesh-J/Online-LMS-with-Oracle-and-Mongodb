import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import { createAnnouncement } from "../../api/announcementsApi";
import { getCourses, getModulesByCourse } from "../../api/oracleApi";
import useToast from "../../hooks/useToast";
import Alert from "../../components/ui/Alert";

export default function InstructorPostAnnouncement() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const role = String(user?.role || "").toUpperCase();
  const [searchParams] = useSearchParams();
  const initialCourseId = searchParams.get("courseId") || "";

  const [loadingCourses, setLoadingCourses] = useState(true);
  const [courses, setCourses] = useState([]);
  const [loadingModules, setLoadingModules] = useState(false);
  const [modules, setModules] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [courseId, setCourseId] = useState(() => initialCourseId);
  const [moduleId, setModuleId] = useState("");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [targetGroup, setTargetGroup] = useState("all_students");
  const [instructorId, setInstructorId] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoadingCourses(true);
      setError("");

      try {
        const data = await getCourses();
        setCourses(data || []);
      } catch (err) {
        const msg =
          err?.response?.data?.message ||
          err?.message ||
          "Failed to load courses";
        setError(msg);
      } finally {
        setLoadingCourses(false);
      }
    };

    load();
  }, []);

  const visibleCourses = useMemo(() => {
    const myInstructorId = user?.instructor_id;
    if (role === "ADMIN" || !myInstructorId) return courses || [];
    return (courses || []).filter(
      (c) =>
        Number(c.INSTRUCTOR_ID ?? c.instructor_id) === Number(myInstructorId),
    );
  }, [courses, role, user?.instructor_id]);

  useEffect(() => {
    const loadModules = async () => {
      if (!courseId) {
        setModules([]);
        setModuleId("");
        return;
      }

      setLoadingModules(true);

      try {
        const data = await getModulesByCourse(courseId);
        setModules(data || []);
      } catch {
        setModules([]);
      } finally {
        setLoadingModules(false);
      }
    };

    loadModules();
  }, [courseId]);

  const normalizedModules = useMemo(() => {
    return (modules || []).map((m) => ({
      id: String(m.MODULE_ID ?? m.module_id),
      title: m.MODULE_TITLE ?? m.module_title,
      order: m.MODULE_ORDER ?? m.module_order,
    }));
  }, [modules]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!courseId) {
      setError("Course is required");
      return;
    }

    if (!title.trim() || !message.trim()) {
      setError("Title and message are required");
      return;
    }

    if (targetGroup === "module_students" && !moduleId) {
      setError("Module is required when target group is module_students");
      return;
    }

    const payload = {
      course_id: Number(courseId),
      title: title.trim(),
      message: message.trim(),
      target_group: targetGroup,
    };

    if (moduleId !== "") {
      payload.module_id = Number(moduleId);
    }

    if (role === "ADMIN") {
      payload.instructor_id = Number(instructorId);
    }

    setSubmitting(true);

    try {
      await createAnnouncement(payload);
      setSuccess("Announcement created successfully");
      addToast({
        title: "Announcement created",
        message: "Your announcement was posted.",
        variant: "success",
      });
      setTitle("");
      setMessage("");
      setModuleId("");
      setTargetGroup("all_students");
      setInstructorId("");
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to create announcement";
      setError(msg);
      addToast({
        title: "Create announcement failed",
        message: msg,
        variant: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">
            Post Announcement
          </h2>
          <p className="mt-2 text-slate-600">
            Create a course announcement (MongoDB) as an instructor.
          </p>
        </div>
        <Link
          to="/instructor/dashboard"
          className="rounded-lg border bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Back to dashboard
        </Link>
      </div>

      <Alert variant="success" className="mt-6">
        {success}
      </Alert>

      <Alert variant="error" className="mt-6">
        {error}
      </Alert>

      <div className="mt-6 max-w-2xl rounded-2xl border bg-white p-6 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-4">
          {role === "ADMIN" ? (
            <div>
              <label className="text-sm font-medium text-slate-700">
                Instructor ID
              </label>
              <input
                value={instructorId}
                onChange={(e) => setInstructorId(e.target.value)}
                className="mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900"
                placeholder="Required for admin"
                required
              />
            </div>
          ) : null}

          <div>
            <label className="text-sm font-medium text-slate-700">Course</label>
            <select
              value={courseId}
              onChange={(e) => {
                setCourseId(e.target.value);
                setModuleId("");
              }}
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900"
              disabled={loadingCourses}
              required
            >
              <option value="">
                {loadingCourses ? "Loading courses..." : "Select a course"}
              </option>
              {visibleCourses.map((c) => {
                const id = c.COURSE_ID ?? c.course_id;
                const label = c.COURSE_TITLE ?? c.course_title;
                return (
                  <option key={id} value={id}>
                    {label} (ID: {id})
                  </option>
                );
              })}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">
              Module (optional)
            </label>
            <select
              value={moduleId}
              onChange={(e) => setModuleId(e.target.value)}
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900"
              disabled={!courseId || loadingModules}
            >
              <option value="">
                {!courseId
                  ? "Select a course first"
                  : loadingModules
                    ? "Loading modules..."
                    : "All modules"}
              </option>
              {normalizedModules.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.order ? `Module ${m.order}: ` : ""}
                  {m.title} (ID: {m.id})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900"
              placeholder="Announcement title"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">
              Message
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="mt-1 min-h-28 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900"
              placeholder="Write your announcement..."
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">
              Target Group
            </label>
            <select
              value={targetGroup}
              onChange={(e) => setTargetGroup(e.target.value)}
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900"
            >
              <option value="all_students">all_students</option>
              <option value="course_students">course_students</option>
              <option value="module_students">module_students</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {submitting ? "Posting..." : "Post announcement"}
          </button>
        </form>

        <p className="mt-4 text-xs text-slate-500">
          Logged in as: {user?.email}
        </p>
      </div>
    </div>
  );
}
