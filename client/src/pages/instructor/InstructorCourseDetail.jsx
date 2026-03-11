import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  createModule,
  getCourseById,
  getEnrollmentsByCourseId,
  getModulesByCourse,
  getStudentsByCourse,
  updateEnrollmentProgress,
} from "../../api/oracleApi";
import {
  getAnnouncementsByCourse,
  getAnnouncementsByModule,
} from "../../api/announcementsApi";
import { getReviewsByCourse } from "../../api/reviewsApi";
import { getSubmissionsByCourse } from "../../api/submissionsApi";
import {
  getCourseCertificates,
  issueCertificate,
} from "../../api/oracleCertificationsApi";
import useAuth from "../../hooks/useAuth";
import useToast from "../../hooks/useToast";
import PageLoader from "../../components/ui/PageLoader";
import Alert from "../../components/ui/Alert";

export default function InstructorCourseDetail() {
  const { courseId } = useParams();
  const { user } = useAuth();
  const { addToast } = useToast();

  const role = String(user?.role || "").toUpperCase();
  const myInstructorId = user?.instructor_id;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [studentsResponse, setStudentsResponse] = useState(null);
  const [enrollments, setEnrollments] = useState([]);

  const [courseCertificates, setCourseCertificates] = useState([]);
  const [loadingCertificates, setLoadingCertificates] = useState(false);
  const [certificateError, setCertificateError] = useState("");

  const [issuingForStudent, setIssuingForStudent] = useState(null);
  const [certificateIssueErrors, setCertificateIssueErrors] = useState({});

  const [progressEdits, setProgressEdits] = useState({});
  const [savingProgressForStudent, setSavingProgressForStudent] =
    useState(null);
  const [progressSaveErrors, setProgressSaveErrors] = useState({});

  const [announcements, setAnnouncements] = useState([]);
  const [announcementModuleFilter, setAnnouncementModuleFilter] = useState("");
  const [loadingAnnouncements, setLoadingAnnouncements] = useState(false);
  const [announcementError, setAnnouncementError] = useState("");

  const [submissions, setSubmissions] = useState([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [submissionError, setSubmissionError] = useState("");

  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [reviewsError, setReviewsError] = useState("");

  const [copiedModuleId, setCopiedModuleId] = useState(null);

  const [creatingModule, setCreatingModule] = useState(false);
  const [createModuleError, setCreateModuleError] = useState("");
  const [createModuleSuccess, setCreateModuleSuccess] = useState("");
  const [moduleTitle, setModuleTitle] = useState("");
  const [moduleDescription, setModuleDescription] = useState("");
  const [moduleOrder, setModuleOrder] = useState("");
  const [durationHours, setDurationHours] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");

      try {
        const [courseData, moduleData, studentsData, enrollmentData] =
          await Promise.all([
            getCourseById(courseId),
            getModulesByCourse(courseId),
            getStudentsByCourse(courseId),
            getEnrollmentsByCourseId(courseId),
          ]);

        const courseInstructorId =
          courseData?.INSTRUCTOR_ID ?? courseData?.instructor_id;

        if (
          role === "INSTRUCTOR" &&
          myInstructorId &&
          Number(courseInstructorId) !== Number(myInstructorId)
        ) {
          setError("You can only access courses you teach");
          setCourse(courseData);
          setModules(moduleData || []);
          setStudentsResponse(studentsData);
          setEnrollments(enrollmentData || []);
          return;
        }

        setCourse(courseData);
        setModules(moduleData || []);
        setStudentsResponse(studentsData);
        setEnrollments(enrollmentData || []);
      } catch (err) {
        const msg =
          err?.response?.data?.message || err?.message || "Failed to load";
        setError(msg);
      } finally {
        setLoading(false);
      }
    };

    if (courseId) {
      load();
    }
  }, [courseId, myInstructorId, role]);

  useEffect(() => {
    const loadCertificates = async () => {
      if (!courseId) return;

      setLoadingCertificates(true);
      setCertificateError("");

      try {
        const rows = await getCourseCertificates(courseId);
        setCourseCertificates(rows || []);
      } catch (err) {
        const msg =
          err?.response?.data?.message ||
          err?.message ||
          "Failed to load certificates";
        setCertificateError(msg);
      } finally {
        setLoadingCertificates(false);
      }
    };

    loadCertificates();
  }, [courseId]);

  useEffect(() => {
    const loadAnnouncements = async () => {
      setLoadingAnnouncements(true);
      setAnnouncementError("");

      try {
        const data = announcementModuleFilter
          ? await getAnnouncementsByModule(announcementModuleFilter)
          : await getAnnouncementsByCourse(courseId);
        const list = (data || []).filter(
          (a) => Number(a.course_id) === Number(courseId),
        );
        setAnnouncements(list);
      } catch (err) {
        const msg =
          err?.response?.data?.message ||
          err?.message ||
          "Failed to load announcements";
        setAnnouncementError(msg);
      } finally {
        setLoadingAnnouncements(false);
      }
    };

    if (courseId) {
      loadAnnouncements();
    }
  }, [announcementModuleFilter, courseId]);

  useEffect(() => {
    const loadSubmissions = async () => {
      setLoadingSubmissions(true);
      setSubmissionError("");

      try {
        const data = await getSubmissionsByCourse(courseId);
        setSubmissions(data || []);
      } catch (err) {
        const msg =
          err?.response?.data?.message ||
          err?.message ||
          "Failed to load submissions";
        setSubmissionError(msg);
      } finally {
        setLoadingSubmissions(false);
      }
    };

    if (courseId) {
      loadSubmissions();
    }
  }, [courseId]);

  useEffect(() => {
    const loadReviews = async () => {
      setLoadingReviews(true);
      setReviewsError("");

      try {
        const data = await getReviewsByCourse(courseId);
        setReviews(data || []);
      } catch (err) {
        const msg =
          err?.response?.data?.message ||
          err?.message ||
          "Failed to load reviews";
        setReviewsError(msg);
      } finally {
        setLoadingReviews(false);
      }
    };

    if (courseId) {
      loadReviews();
    }
  }, [courseId]);

  const courseTitle =
    course?.COURSE_TITLE ?? course?.course_title ?? `Course ${courseId}`;
  const courseInstructorId = course?.INSTRUCTOR_ID ?? course?.instructor_id;

  const canManageCourse = useMemo(() => {
    if (role === "ADMIN") return true;
    if (role !== "INSTRUCTOR") return false;
    if (!myInstructorId) return false;
    if (!courseInstructorId) return false;
    return Number(courseInstructorId) === Number(myInstructorId);
  }, [courseInstructorId, myInstructorId, role]);

  const handleCreateModule = useCallback(
    async (e) => {
      e.preventDefault();
      setCreateModuleError("");
      setCreateModuleSuccess("");

      if (!canManageCourse) {
        setCreateModuleError("You can only add modules to courses you teach");
        return;
      }

      if (!moduleTitle.trim()) {
        setCreateModuleError("Module title is required");
        return;
      }

      const numericOrder = Number(moduleOrder);
      if (!moduleOrder || Number.isNaN(numericOrder) || numericOrder < 1) {
        setCreateModuleError("Module order must be 1 or greater");
        return;
      }

      const numericDuration =
        durationHours === "" ? null : Number(durationHours);
      if (
        numericDuration !== null &&
        (Number.isNaN(numericDuration) || numericDuration < 0)
      ) {
        setCreateModuleError("Duration hours must be 0 or greater");
        return;
      }

      setCreatingModule(true);

      try {
        await createModule({
          course_id: Number(courseId),
          module_title: moduleTitle.trim(),
          module_description: moduleDescription.trim() || null,
          module_order: numericOrder,
          duration_hours: numericDuration,
        });

        const refreshed = await getModulesByCourse(courseId);
        setModules(refreshed || []);

        setModuleTitle("");
        setModuleDescription("");
        setModuleOrder("");
        setDurationHours("");
        setCreateModuleSuccess("Module created successfully");
        addToast({
          title: "Module created",
          message: "The module was added to the course.",
          variant: "success",
        });
      } catch (err) {
        const msg =
          err?.response?.data?.message ||
          err?.message ||
          "Failed to create module";
        setCreateModuleError(msg);
        addToast({
          title: "Create module failed",
          message: msg,
          variant: "error",
        });
      } finally {
        setCreatingModule(false);
      }
    },
    [
      addToast,
      canManageCourse,
      courseId,
      durationHours,
      moduleDescription,
      moduleOrder,
      moduleTitle,
    ],
  );

  const normalizedModules = useMemo(() => {
    return (modules || []).map((m) => ({
      id: m.MODULE_ID ?? m.module_id,
      order: m.MODULE_ORDER ?? m.module_order,
      title: m.MODULE_TITLE ?? m.module_title,
      description: m.MODULE_DESCRIPTION ?? m.module_description,
    }));
  }, [modules]);

  const students = useMemo(() => {
    return studentsResponse?.students || [];
  }, [studentsResponse?.students]);

  const enrollmentsByStudentId = useMemo(() => {
    const map = new Map();
    (enrollments || []).forEach((e) => {
      const sid = Number(e.STUDENT_ID ?? e.student_id);
      map.set(sid, e);
    });
    return map;
  }, [enrollments]);

  const certificatesByEnrollmentId = useMemo(() => {
    const map = new Map();
    (courseCertificates || []).forEach((c) => {
      const eid = c.enrollment_id ?? c.ENROLLMENT_ID;
      if (eid !== undefined && eid !== null) {
        map.set(Number(eid), c);
      }
    });
    return map;
  }, [courseCertificates]);

  const deriveStatusFromPercent = useCallback((value) => {
    if (value <= 0) return "ENROLLED";
    if (value >= 100) return "COMPLETED";
    return "IN_PROGRESS";
  }, []);

  const handleSaveStudentProgress = useCallback(
    async (studentId) => {
      setProgressSaveErrors((prev) => ({ ...(prev || {}), [studentId]: "" }));

      const enr = enrollmentsByStudentId.get(Number(studentId));
      const enrollmentId = enr?.ENROLLMENT_ID ?? enr?.enrollment_id ?? null;
      if (!enrollmentId) {
        setProgressSaveErrors((prev) => ({
          ...(prev || {}),
          [studentId]: "Enrollment not found",
        }));
        return;
      }

      const raw =
        progressEdits?.[studentId] ??
        String(enr?.PROGRESS_PERCENT ?? enr?.progress_percent ?? "");
      const numeric = raw === "" ? NaN : Number(raw);
      if (Number.isNaN(numeric)) {
        setProgressSaveErrors((prev) => ({
          ...(prev || {}),
          [studentId]: "Progress percent is required",
        }));
        return;
      }

      if (numeric < 0 || numeric > 100) {
        setProgressSaveErrors((prev) => ({
          ...(prev || {}),
          [studentId]: "progress_percent must be between 0 and 100",
        }));
        return;
      }

      const percent = Math.min(100, Math.max(0, numeric));
      const status = deriveStatusFromPercent(percent);

      setSavingProgressForStudent(studentId);

      try {
        const res = await updateEnrollmentProgress(enrollmentId, {
          progress_percent: percent,
          completion_status: status,
        });

        const updated = res?.enrollment;
        if (updated) {
          setEnrollments((prev) =>
            (prev || []).map((item) => {
              const id = item.ENROLLMENT_ID ?? item.enrollment_id;
              return Number(id) === Number(enrollmentId) ? updated : item;
            }),
          );
        }

        setProgressEdits((prev) => ({
          ...(prev || {}),
          [studentId]: String(percent),
        }));

        addToast({
          title: "Progress updated",
          message: `Student ${studentId} progress updated to ${percent}%.`,
          variant: "success",
        });
      } catch (err) {
        const msg =
          err?.response?.data?.message ||
          err?.message ||
          "Failed to update progress";
        setProgressSaveErrors((prev) => ({
          ...(prev || {}),
          [studentId]: msg,
        }));
        addToast({ title: "Update failed", message: msg, variant: "error" });
      } finally {
        setSavingProgressForStudent(null);
      }
    },
    [addToast, deriveStatusFromPercent, enrollmentsByStudentId, progressEdits],
  );

  const submissionsByModuleId = useMemo(() => {
    const map = new Map();
    (submissions || []).forEach((s) => {
      const mid = Number(s.module_id);
      map.set(mid, (map.get(mid) || 0) + 1);
    });
    return map;
  }, [submissions]);

  const reviewsSummary = useMemo(() => {
    const list = reviews || [];
    if (list.length === 0) {
      return { count: 0, avg: null };
    }
    const sum = list.reduce((acc, r) => acc + Number(r.rating || 0), 0);
    return {
      count: list.length,
      avg: Math.round((sum / list.length) * 10) / 10,
    };
  }, [reviews]);

  const buildStudentSubmissionUrl = (moduleId) => {
    const params = new URLSearchParams({
      courseId: String(courseId),
      moduleId: String(moduleId),
    });
    const path = `/student/submit-assignment?${params.toString()}`;
    if (typeof window === "undefined") return path;
    return `${window.location.origin}${path}`;
  };

  const copySubmissionLink = async (moduleId) => {
    const url = buildStudentSubmissionUrl(moduleId);

    try {
      await navigator.clipboard.writeText(url);
      setCopiedModuleId(moduleId);
      window.setTimeout(() => setCopiedModuleId(null), 1500);
    } catch {
      window.prompt("Copy submission link:", url);
    }
  };

  const handleIssueCertificate = useCallback(
    async (studentId) => {
      setCertificateIssueErrors((prev) => ({
        ...(prev || {}),
        [studentId]: "",
      }));

      const enr = enrollmentsByStudentId.get(Number(studentId));
      const enrollmentId = enr?.ENROLLMENT_ID ?? enr?.enrollment_id ?? null;

      if (!enrollmentId) {
        setCertificateIssueErrors((prev) => ({
          ...(prev || {}),
          [studentId]: "Enrollment not found",
        }));
        return;
      }

      const existing = certificatesByEnrollmentId.get(Number(enrollmentId));
      if (existing) {
        setCertificateIssueErrors((prev) => ({
          ...(prev || {}),
          [studentId]: "Certificate already exists for this enrollment",
        }));
        return;
      }

      const status =
        enr?.COMPLETION_STATUS ?? enr?.completion_status ?? undefined;
      const isCompleted = String(status || "").toUpperCase() === "COMPLETED";

      if (!isCompleted) {
        setCertificateIssueErrors((prev) => ({
          ...(prev || {}),
          [studentId]: "Enrollment must be COMPLETED before issuing a certificate",
        }));
        return;
      }

      const baseCode = `COURSE-${courseId}-STUDENT-${studentId}`;
      const uniqueCode = `${baseCode}-${Date.now()}`;

      setIssuingForStudent(studentId);

      try {
        const res = await issueCertificate({
          enrollment_id: Number(enrollmentId),
          certificate_code: uniqueCode.slice(0, 48),
        });

        const created = res?.certification;
        if (created) {
          setCourseCertificates((prev) => [...(prev || []), created]);
        }

        addToast({
          title: "Certificate issued",
          message: `Certificate issued for student ${studentId}.`,
          variant: "success",
        });
      } catch (err) {
        const msg =
          err?.response?.data?.message ||
          err?.message ||
          "Failed to issue certificate";
        setCertificateIssueErrors((prev) => ({
          ...(prev || {}),
          [studentId]: msg,
        }));
        addToast({
          title: "Issue certificate failed",
          message: msg,
          variant: "error",
        });
      } finally {
        setIssuingForStudent(null);
      }
    },
    [
      addToast,
      certificatesByEnrollmentId,
      courseId,
      enrollmentsByStudentId,
    ],
  );

  if (loading) {
    return <PageLoader label="Loading course..." />;
  }

  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">{courseTitle}</h2>
          <p className="mt-2 text-slate-600">Course ID: {courseId}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            to="/instructor/courses"
            className="rounded-lg border bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Back
          </Link>
          <Link
            to={`/courses/${courseId}`}
            className="rounded-lg border bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Public view
          </Link>
        </div>
      </div>

      <Alert variant="error" className="mt-6">
        {error}
      </Alert>

      <div className="mt-6 grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-800">
              Course info
            </h3>
            <dl className="mt-4 grid gap-3 text-sm">
              <div className="flex items-center justify-between">
                <dt className="text-slate-600">Instructor ID</dt>
                <dd className="font-medium text-slate-800">
                  {courseInstructorId ?? "-"}
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-slate-600">Students enrolled</dt>
                <dd className="font-medium text-slate-800">
                  {enrollments.length}
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-slate-600">Reviews</dt>
                <dd className="font-medium text-slate-800">
                  {reviewsSummary.count === 0
                    ? "-"
                    : `${reviewsSummary.avg}/5 (${reviewsSummary.count})`}
                </dd>
              </div>
            </dl>
          </div>

          <div className="mt-6 rounded-2xl border bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-800">Actions</h3>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link
                to={`/instructor/announcements/new?courseId=${encodeURIComponent(
                  String(courseId),
                )}`}
                className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
              >
                Post announcement
              </Link>
              <Link
                to={`/instructor/announcements?courseId=${encodeURIComponent(
                  String(courseId),
                )}`}
                className="rounded-lg border bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                View announcements
              </Link>
              <Link
                to={`/instructor/submissions?courseId=${encodeURIComponent(
                  String(courseId),
                )}`}
                className="rounded-lg border bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                View submissions
              </Link>
              <Link
                to={`/instructor/reviews?courseId=${encodeURIComponent(
                  String(courseId),
                )}`}
                className="rounded-lg border bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                View reviews
              </Link>
            </div>
          </div>
        </div>

        <div className="lg:col-span-3">
          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-800">Modules</h3>
            <p className="mt-2 text-sm text-slate-600">
              Modules double as "assignments" in this app.
            </p>

            <div className="mt-4 rounded-xl border bg-slate-50 p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="text-sm font-semibold text-slate-800">
                  Add module
                </div>
                {!canManageCourse ? (
                  <div className="text-xs text-slate-500">
                    Only the course instructor (or admin) can add modules.
                  </div>
                ) : null}
              </div>

              <Alert variant="success" className="mt-3">
                {createModuleSuccess}
              </Alert>

              <Alert variant="error" className="mt-3">
                {createModuleError}
              </Alert>

              <form onSubmit={handleCreateModule} className="mt-4 space-y-3">
                <div>
                  <label className="text-sm font-medium text-slate-700">
                    Title
                  </label>
                  <input
                    value={moduleTitle}
                    onChange={(e) => setModuleTitle(e.target.value)}
                    className="mt-1 w-full rounded-lg border bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900"
                    disabled={!canManageCourse || creatingModule}
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700">
                    Description
                  </label>
                  <textarea
                    value={moduleDescription}
                    onChange={(e) => setModuleDescription(e.target.value)}
                    className="mt-1 min-h-20 w-full rounded-lg border bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900"
                    disabled={!canManageCourse || creatingModule}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium text-slate-700">
                      Order
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={moduleOrder}
                      onChange={(e) => setModuleOrder(e.target.value)}
                      className="mt-1 w-full rounded-lg border bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900"
                      disabled={!canManageCourse || creatingModule}
                      required
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-700">
                      Duration (hours)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={durationHours}
                      onChange={(e) => setDurationHours(e.target.value)}
                      className="mt-1 w-full rounded-lg border bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900"
                      disabled={!canManageCourse || creatingModule}
                      placeholder="optional"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!canManageCourse || creatingModule}
                  className="w-full rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                >
                  {creatingModule ? "Creating..." : "Create module"}
                </button>
              </form>
            </div>

            {normalizedModules.length === 0 ? (
              <div className="mt-4 text-sm text-slate-600">
                No modules found.
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                {normalizedModules.map((m) => (
                  <div
                    key={m.id}
                    className="rounded-xl border bg-white px-4 py-4"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <div className="font-medium text-slate-800">
                          {m.order ? `Module ${m.order}: ` : ""}
                          {m.title}
                        </div>
                        {m.description ? (
                          <div className="mt-1 text-sm text-slate-600">
                            {m.description}
                          </div>
                        ) : null}
                        <div className="mt-2 text-xs text-slate-500">
                          Module ID: {m.id} | Submissions:{" "}
                          {submissionsByModuleId.get(Number(m.id)) || 0}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 sm:justify-end">
                        <button
                          type="button"
                          onClick={() => copySubmissionLink(m.id)}
                          className="rounded-lg border bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                        >
                          {copiedModuleId === m.id
                            ? "Copied"
                            : "Copy submission link"}
                        </button>
                        <Link
                          to={`/instructor/submissions?courseId=${encodeURIComponent(
                            String(courseId),
                          )}&moduleId=${encodeURIComponent(String(m.id))}`}
                          className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white"
                        >
                          View submissions
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-6 rounded-2xl border bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <h3 className="text-lg font-semibold text-slate-800">Students</h3>
              <div className="text-sm text-slate-600">
                {students.length} students
              </div>
            </div>

            {students.length === 0 ? (
              <div className="mt-4 text-sm text-slate-600">
                No students found.
              </div>
            ) : (
              <div className="mt-4 overflow-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="text-xs uppercase text-slate-500">
                    <tr>
                      <th className="px-3 py-2">Student ID</th>
                      <th className="px-3 py-2">Name</th>
                      <th className="px-3 py-2">Progress</th>
                      <th className="px-3 py-2">Status</th>
                      <th className="px-3 py-2">Certificate</th>
                      <th className="px-3 py-2">Update</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((s) => {
                      const sid = s.STUDENT_ID ?? s.student_id;
                      const name = s.STUDENT_NAME ?? s.student_name ?? "-";
                      const enr = enrollmentsByStudentId.get(Number(sid));
                      const progress =
                        enr?.PROGRESS_PERCENT ?? enr?.progress_percent ?? null;
                      const status =
                        enr?.COMPLETION_STATUS ??
                        enr?.completion_status ??
                        null;

                      const enrollmentId =
                        enr?.ENROLLMENT_ID ?? enr?.enrollment_id ?? null;
                      const certificate = enrollmentId
                        ? certificatesByEnrollmentId.get(
                            Number(enrollmentId),
                          )
                        : null;
                      const isCompleted =
                        String(status || "").toUpperCase() === "COMPLETED";

                      const editValue =
                        progressEdits?.[sid] ??
                        (progress === null || progress === undefined
                          ? ""
                          : String(progress));
                      const saving = savingProgressForStudent === sid;
                      const rowError = progressSaveErrors?.[sid] || "";

                      return (
                        <tr key={sid} className="border-t">
                          <td className="px-3 py-2 font-medium text-slate-800">
                            {sid}
                          </td>
                          <td className="px-3 py-2 text-slate-700">{name}</td>
                          <td className="px-3 py-2 text-slate-700">
                            {progress !== null && progress !== undefined
                              ? `${progress}%`
                              : "-"}
                          </td>
                          <td className="px-3 py-2 text-slate-700">
                            {status || "-"}
                          </td>
                          <td className="px-3 py-2">
                            {certificate ? (
                              <div className="flex flex-col gap-1">
                                <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                                  Certificate Earned
                                </span>
                                <div className="text-xs text-slate-600">
                                  {certificate.certificate_code ||
                                    `ID: ${certificate.certificate_id}`}
                                </div>
                              </div>
                            ) : isCompleted ? (
                              <div className="flex flex-col gap-1">
                                <span className="inline-flex rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                                  Eligible for Certificate
                                </span>
                                {canManageCourse ? (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleIssueCertificate(sid)
                                    }
                                    disabled={issuingForStudent === sid}
                                    className="mt-1 inline-flex rounded-lg bg-slate-900 px-3 py-1 text-xs font-semibold text-white disabled:opacity-60"
                                  >
                                    {issuingForStudent === sid
                                      ? "Issuing..."
                                      : "Issue certificate"}
                                  </button>
                                ) : null}
                              </div>
                            ) : (
                              <span className="text-xs text-slate-500">
                                Not eligible
                              </span>
                            )}
                            {certificateIssueErrors?.[sid] ? (
                              <div className="mt-1 text-xs text-red-700">
                                {certificateIssueErrors[sid]}
                              </div>
                            ) : null}
                          </td>
                          <td className="px-3 py-2">
                            {!enr ? (
                              <div className="text-xs text-slate-500">-</div>
                            ) : (
                              <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-2">
                                  <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={editValue}
                                    onChange={(e) =>
                                      setProgressEdits((prev) => ({
                                        ...(prev || {}),
                                        [sid]: e.target.value,
                                      }))
                                    }
                                    disabled={saving}
                                    className="w-24 rounded-lg border bg-white px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-slate-900"
                                    placeholder="0-100"
                                  />
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleSaveStudentProgress(sid)
                                    }
                                    disabled={saving}
                                    className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white disabled:opacity-60"
                                  >
                                    {saving ? "Saving..." : "Save"}
                                  </button>
                                </div>
                                {rowError ? (
                                  <div className="text-xs text-red-700">
                                    {rowError}
                                  </div>
                                ) : null}
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="mt-6 rounded-2xl border bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <h3 className="text-lg font-semibold text-slate-800">
                Announcements
              </h3>
              <Link
                to={`/instructor/announcements?courseId=${encodeURIComponent(
                  String(courseId),
                )}`}
                className="text-sm font-semibold text-slate-900 underline"
              >
                View all
              </Link>
            </div>

            <label className="mt-4 block text-sm font-medium text-slate-700">
              Filter by module
            </label>
            <select
              value={announcementModuleFilter}
              onChange={(e) => setAnnouncementModuleFilter(e.target.value)}
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900"
            >
              <option value="">All modules</option>
              {normalizedModules.map((m) => (
                <option key={m.id} value={String(m.id)}>
                  {m.order ? `Module ${m.order}: ` : ""}
                  {m.title} (ID: {m.id})
                </option>
              ))}
            </select>

            {announcementError ? (
              <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {announcementError}
              </div>
            ) : null}

            {loadingAnnouncements ? (
              <div className="mt-3 text-sm text-slate-600">Loading...</div>
            ) : announcements.length === 0 ? (
              <div className="mt-3 text-sm text-slate-600">
                No announcements.
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                {announcements.slice(0, 5).map((a) => (
                  <div
                    key={a._id}
                    className="rounded-xl border bg-white px-4 py-3"
                  >
                    <div className="font-medium text-slate-800">{a.title}</div>
                    <div className="mt-1 text-sm text-slate-600">
                      {a.message}
                    </div>
                    <div className="mt-2 text-xs text-slate-500">
                      {a.module_id ? `Module: ${a.module_id} | ` : ""}Posted:{" "}
                      {a.posted_at
                        ? new Date(a.posted_at).toLocaleString()
                        : "-"}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-6 rounded-2xl border bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <h3 className="text-lg font-semibold text-slate-800">
                Submissions
              </h3>
              <Link
                to={`/instructor/submissions?courseId=${encodeURIComponent(
                  String(courseId),
                )}`}
                className="text-sm font-semibold text-slate-900 underline"
              >
                View all
              </Link>
            </div>

            {submissionError ? (
              <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {submissionError}
              </div>
            ) : null}

            {loadingSubmissions ? (
              <div className="mt-3 text-sm text-slate-600">Loading...</div>
            ) : submissions.length === 0 ? (
              <div className="mt-3 text-sm text-slate-600">
                No submissions yet.
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                {submissions.slice(0, 5).map((s) => (
                  <div
                    key={s._id}
                    className="flex items-start justify-between gap-4 rounded-xl border bg-white px-4 py-3"
                  >
                    <div>
                      <div className="text-sm font-semibold text-slate-800">
                        {s.submission_title}
                      </div>
                      <div className="mt-1 text-xs text-slate-500">
                        Student ID: {s.student_id} | Module ID: {s.module_id}
                      </div>
                      <div className="mt-1 text-xs text-slate-500">
                        {s.submitted_at
                          ? new Date(s.submitted_at).toLocaleString()
                          : "-"}
                      </div>
                    </div>
                    <Link
                      to={`/instructor/submissions/${s._id}`}
                      className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white"
                    >
                      View
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-6 rounded-2xl border bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <h3 className="text-lg font-semibold text-slate-800">Reviews</h3>
              <Link
                to={`/instructor/reviews?courseId=${encodeURIComponent(
                  String(courseId),
                )}`}
                className="text-sm font-semibold text-slate-900 underline"
              >
                View all
              </Link>
            </div>

            {reviewsError ? (
              <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {reviewsError}
              </div>
            ) : null}

            {loadingReviews ? (
              <div className="mt-3 text-sm text-slate-600">Loading...</div>
            ) : reviewsSummary.count === 0 ? (
              <div className="mt-3 text-sm text-slate-600">No reviews.</div>
            ) : (
              <div className="mt-4">
                <div className="text-sm text-slate-600">
                  Average rating:{" "}
                  <span className="font-semibold text-slate-900">
                    {reviewsSummary.avg}
                  </span>{" "}
                  / 5<span className="text-slate-400"> · </span>
                  {reviewsSummary.count} reviews
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
