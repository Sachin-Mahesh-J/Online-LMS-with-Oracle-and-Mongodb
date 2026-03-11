import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import { createCourse, getCourses } from "../../api/oracleApi";
import useToast from "../../hooks/useToast";
import PageLoader from "../../components/ui/PageLoader";
import Alert from "../../components/ui/Alert";

export default function InstructorManageCourses() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const role = String(user?.role || "").toUpperCase();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [items, setItems] = useState([]);

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [courseTitle, setCourseTitle] = useState("");
  const [category, setCategory] = useState("");
  const [fee, setFee] = useState("0");
  const [levelName, setLevelName] = useState("BEGINNER");
  const [status, setStatus] = useState("ACTIVE");
  const [instructorId, setInstructorId] = useState(
    user?.instructor_id ? String(user.instructor_id) : "",
  );

  const load = async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getCourses();
      setItems(data || []);
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to load courses";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const visibleCourses = useMemo(() => {
    const myInstructorId = user?.instructor_id;

    if (role === "ADMIN" || !myInstructorId) {
      return items;
    }

    return (items || []).filter((c) => {
      const cid = c.INSTRUCTOR_ID ?? c.instructor_id;
      return Number(cid) === Number(myInstructorId);
    });
  }, [items, role, user?.instructor_id]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setFormError("");

    const finalInstructorId =
      role === "ADMIN" ? Number(instructorId) : Number(user?.instructor_id);

    if (!finalInstructorId || Number.isNaN(finalInstructorId)) {
      setFormError("Instructor ID is required");
      return;
    }

    if (!courseTitle.trim()) {
      setFormError("Course title is required");
      return;
    }

    setSubmitting(true);

    try {
      await createCourse({
        instructor_id: finalInstructorId,
        course_title: courseTitle.trim(),
        category: category.trim() || null,
        fee: fee === "" ? 0 : Number(fee),
        level_name: levelName,
        status,
      });

      setCourseTitle("");
      setCategory("");
      setFee("0");
      setLevelName("BEGINNER");
      setStatus("ACTIVE");

      await load();

      addToast({
        title: "Course created",
        message: "Your course was created successfully.",
        variant: "success",
      });
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to create course";
      setFormError(message);
      addToast({ title: "Create course failed", message, variant: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <PageLoader label="Loading courses..." />;
  }

  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Manage Courses</h2>
          <p className="mt-2 text-slate-600">
            View existing courses and create a new one (Oracle).
          </p>
        </div>
        <Link
          to="/instructor/dashboard"
          className="rounded-lg border bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Back to dashboard
        </Link>
      </div>

      <Alert variant="error" className="mt-6">
        {error}
      </Alert>

      <div className="mt-6 grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-800">
              Create course
            </h3>

            <Alert variant="error" className="mt-4">
              {formError}
            </Alert>

            <form onSubmit={handleCreate} className="mt-5 space-y-4">
              {role === "ADMIN" ? (
                <div>
                  <label className="text-sm font-medium text-slate-700">
                    Instructor ID
                  </label>
                  <input
                    value={instructorId}
                    onChange={(e) => setInstructorId(e.target.value)}
                    className="mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900"
                    placeholder="e.g. 101"
                    required
                  />
                </div>
              ) : null}

              <div>
                <label className="text-sm font-medium text-slate-700">
                  Course Title
                </label>
                <input
                  value={courseTitle}
                  onChange={(e) => setCourseTitle(e.target.value)}
                  className="mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900"
                  placeholder="Enter course title"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">
                  Category
                </label>
                <input
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900"
                  placeholder="e.g. Databases"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-slate-700">
                    Fee
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={fee}
                    onChange={(e) => setFee(e.target.value)}
                    className="mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700">
                    Level
                  </label>
                  <select
                    value={levelName}
                    onChange={(e) => setLevelName(e.target.value)}
                    className="mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900"
                  >
                    <option value="BEGINNER">BEGINNER</option>
                    <option value="INTERMEDIATE">INTERMEDIATE</option>
                    <option value="ADVANCED">ADVANCED</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900"
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="INACTIVE">INACTIVE</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
              >
                {submitting ? "Creating..." : "Create course"}
              </button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-3">
          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-800">Courses</h3>
            <p className="mt-2 text-sm text-slate-600">
              {role === "ADMIN"
                ? "Showing all courses"
                : "Showing your courses"}
            </p>

            {visibleCourses.length === 0 ? (
              <div className="mt-4 text-sm text-slate-600">
                No courses found.
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                {visibleCourses.map((course) => {
                  const id = course.COURSE_ID ?? course.course_id;
                  const title = course.COURSE_TITLE ?? course.course_title;
                  const cat = course.CATEGORY ?? course.category;
                  const s = course.STATUS ?? course.status;

                  return (
                    <div
                      key={id}
                      className="flex items-center justify-between gap-4 rounded-xl border bg-white px-4 py-3"
                    >
                      <div>
                        <div className="font-medium text-slate-800">
                          {title}
                        </div>
                        <div className="mt-1 text-sm text-slate-500">
                          Course ID: {id}
                          {cat ? ` | ${cat}` : ""}
                          {s ? ` | ${s}` : ""}
                        </div>
                      </div>
                      <Link
                        to={`/instructor/courses/${id}`}
                        className="shrink-0 rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white"
                      >
                        View
                      </Link>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
