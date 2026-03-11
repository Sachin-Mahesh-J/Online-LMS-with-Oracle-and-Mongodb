import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  addReplyToPost,
  createForumPost,
  getAllForumPosts,
  getForumPostsByCourse,
} from "../api/forumApi";
import {
  getCourses,
  getEnrollmentsByStudentId,
  getModulesByCourse,
} from "../api/oracleApi";
import useAuth from "../hooks/useAuth";

export default function Forum() {
  const { user } = useAuth();
  const role = String(user?.role || "").toUpperCase();

  const [searchParams, setSearchParams] = useSearchParams();
  const initialCourseId = searchParams.get("courseId") || "";

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [posts, setPosts] = useState([]);
  const [expandedPostIds, setExpandedPostIds] = useState(() => new Set());

  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState(initialCourseId);
  const [modules, setModules] = useState([]);

  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const [courseId, setCourseId] = useState(initialCourseId);
  const [moduleId, setModuleId] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tagsText, setTagsText] = useState("");

  const [replyingToPostId, setReplyingToPostId] = useState(null);
  const [replyContent, setReplyContent] = useState("");
  const [replyError, setReplyError] = useState("");

  useEffect(() => {
    const loadMeta = async () => {
      try {
        if (role !== "STUDENT") {
          return;
        }

        const studentId = user?.student_id;
        if (!studentId) {
          setCourses([]);
          setEnrollments([]);
          return;
        }

        const [courseData, enrollmentData] = await Promise.all([
          getCourses(),
          getEnrollmentsByStudentId(studentId),
        ]);
        setCourses(courseData || []);
        setEnrollments(enrollmentData || []);
      } catch (err) {
        console.error(err);
      }
    };

    loadMeta();
  }, [role, user?.student_id]);

  const enrolledCourseIds = useMemo(() => {
    return new Set(
      (enrollments || []).map((e) => Number(e.COURSE_ID ?? e.course_id)),
    );
  }, [enrollments]);

  const courseOptions = useMemo(() => {
    const list = (courses || [])
      .filter((c) => {
        const id = Number(c.COURSE_ID ?? c.course_id);
        return role !== "STUDENT" ? true : enrolledCourseIds.has(id);
      })
      .map((c) => ({
        id: String(c.COURSE_ID ?? c.course_id),
        title: c.COURSE_TITLE ?? c.course_title,
      }));

    list.sort((a, b) => a.title.localeCompare(b.title));
    return list;
  }, [courses, enrolledCourseIds, role]);

  useEffect(() => {
    const loadModules = async () => {
      if (!courseId) {
        setModules([]);
        setModuleId("");
        return;
      }

      try {
        const data = await getModulesByCourse(courseId);
        setModules(data || []);
      } catch {
        setModules([]);
      }
    };

    if (role === "STUDENT") {
      loadModules();
    }
  }, [courseId, role]);

  useEffect(() => {
    const loadPosts = async () => {
      setLoading(true);
      setError("");

      try {
        const data = selectedCourseId
          ? await getForumPostsByCourse(selectedCourseId)
          : await getAllForumPosts();
        setPosts(data || []);
      } catch (err) {
        console.error(err);
        const msg =
          err?.response?.data?.message ||
          err?.message ||
          "Failed to load posts";
        setError(msg);
      } finally {
        setLoading(false);
      }
    };

    loadPosts();
  }, [selectedCourseId]);

  const normalizedModules = useMemo(() => {
    return (modules || []).map((m) => ({
      id: String(m.MODULE_ID ?? m.module_id),
      title: m.MODULE_TITLE ?? m.module_title,
      order: m.MODULE_ORDER ?? m.module_order,
    }));
  }, [modules]);

  const toggleReplies = (postId) => {
    setExpandedPostIds((prev) => {
      const next = new Set(prev);
      if (next.has(postId)) next.delete(postId);
      else next.add(postId);
      return next;
    });
  };

  const onCourseFilterChange = (nextCourseId) => {
    setSelectedCourseId(nextCourseId);
    const nextParams = new URLSearchParams(searchParams);
    if (nextCourseId) nextParams.set("courseId", nextCourseId);
    else nextParams.delete("courseId");
    setSearchParams(nextParams, { replace: true });
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    setCreateError("");

    if (role !== "STUDENT") {
      setCreateError("Only students can create forum posts");
      return;
    }

    if (!courseId || !moduleId || !title.trim() || !content.trim()) {
      setCreateError("Course, module, title, and content are required");
      return;
    }

    if (courseId && !enrolledCourseIds.has(Number(courseId))) {
      setCreateError("You can only post in courses you are enrolled in");
      return;
    }

    setCreating(true);

    try {
      const tags = tagsText
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const res = await createForumPost({
        course_id: Number(courseId),
        module_id: Number(moduleId),
        title: title.trim(),
        content: content.trim(),
        tags,
      });

      const newPost = res?.data || res;

      setPosts((prev) => [newPost, ...(prev || [])]);
      setTitle("");
      setContent("");
      setTagsText("");
      setModuleId("");

      onCourseFilterChange(String(courseId));
    } catch (err) {
      const msg =
        err?.response?.data?.message || err?.message || "Failed to create post";
      setCreateError(msg);
    } finally {
      setCreating(false);
    }
  };

  const handleReply = async (postId) => {
    setReplyError("");

    if (role !== "STUDENT") {
      setReplyError("Only students can reply");
      return;
    }

    if (!replyContent.trim()) {
      setReplyError("Reply content is required");
      return;
    }

    setReplyingToPostId(postId);

    try {
      const res = await addReplyToPost(postId, {
        content: replyContent.trim(),
      });
      const updatedPost = res?.data || res;

      setPosts((prev) =>
        (prev || []).map((p) => (p._id === updatedPost._id ? updatedPost : p)),
      );
      setReplyContent("");
      setExpandedPostIds((prev) => new Set(prev).add(postId));
    } catch (err) {
      const msg =
        err?.response?.data?.message || err?.message || "Failed to add reply";
      setReplyError(msg);
    } finally {
      setReplyingToPostId(null);
    }
  };

  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="mb-2 text-2xl font-bold text-slate-800">Forum</h2>
          <p className="text-sm text-slate-600">
            Browse posts. Students can create posts and reply.
          </p>
        </div>
        {selectedCourseId ? (
          <Link
            to={`/courses/${selectedCourseId}`}
            className="rounded-lg border bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Course details
          </Link>
        ) : null}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-800">Filter</h3>

            <label className="mt-4 block text-sm font-medium text-slate-700">
              Course
            </label>
            <select
              value={selectedCourseId}
              onChange={(e) => onCourseFilterChange(e.target.value)}
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900"
            >
              <option value="">All courses</option>
              {courseOptions.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title} (ID: {c.id})
                </option>
              ))}
            </select>
          </div>

          {role === "STUDENT" ? (
            <div className="mt-6 rounded-2xl border bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-800">
                Create post
              </h3>

              {createError ? (
                <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  {createError}
                </div>
              ) : null}

              <form onSubmit={handleCreatePost} className="mt-4 space-y-3">
                <div>
                  <label className="text-sm font-medium text-slate-700">
                    Course
                  </label>
                  <select
                    value={courseId}
                    onChange={(e) => setCourseId(e.target.value)}
                    className="mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900"
                    required
                  >
                    <option value="">Select course</option>
                    {courseOptions.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title} (ID: {c.id})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700">
                    Module
                  </label>
                  <select
                    value={moduleId}
                    onChange={(e) => setModuleId(e.target.value)}
                    className="mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900"
                    required
                    disabled={!courseId}
                  >
                    <option value="">Select module</option>
                    {normalizedModules.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.order ? `Module ${m.order}: ` : ""}
                        {m.title} (ID: {m.id})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700">
                    Title
                  </label>
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900"
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700">
                    Content
                  </label>
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="mt-1 min-h-24 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900"
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700">
                    Tags (comma-separated)
                  </label>
                  <input
                    value={tagsText}
                    onChange={(e) => setTagsText(e.target.value)}
                    className="mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900"
                    placeholder="e.g. help, assignment"
                  />
                </div>

                <button
                  type="submit"
                  disabled={creating}
                  className="w-full rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                >
                  {creating ? "Posting..." : "Post"}
                </button>
              </form>
            </div>
          ) : null}
        </div>

        <div className="lg:col-span-3">
          {error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          {loading ? (
            <div className="py-10 text-center text-slate-600">Loading...</div>
          ) : posts.length === 0 ? (
            <div className="rounded-2xl border bg-white p-6 text-slate-600 shadow-sm">
              No posts found.
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => {
                const expanded = expandedPostIds.has(post._id);
                const replies = post.replies || [];
                const canReply = role === "STUDENT";

                return (
                  <div
                    key={post._id}
                    className="rounded-2xl border bg-white p-5 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-semibold text-slate-800">
                          {post.title}
                        </h3>
                        <p className="mt-2 text-slate-600">{post.content}</p>
                        <p className="mt-3 text-sm text-slate-500">
                          Course ID: {post.course_id} | Module ID:{" "}
                          {post.module_id}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => toggleReplies(post._id)}
                        className="shrink-0 rounded-lg border bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        {expanded ? "Hide" : "Show"} replies ({replies.length})
                      </button>
                    </div>

                    {expanded ? (
                      <div className="mt-4 rounded-xl border bg-slate-50 p-4">
                        {replies.length === 0 ? (
                          <div className="text-sm text-slate-600">
                            No replies yet.
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {replies.map((r, idx) => (
                              <div
                                key={`${post._id}-${idx}`}
                                className="rounded-lg border bg-white px-3 py-2"
                              >
                                <div className="text-xs text-slate-500">
                                  Student ID: {r.student_id}
                                </div>
                                <div className="mt-1 text-sm text-slate-700">
                                  {r.content}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {canReply ? (
                          <div className="mt-4">
                            {replyError && replyingToPostId === post._id ? (
                              <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                                {replyError}
                              </div>
                            ) : null}

                            <label className="text-sm font-medium text-slate-700">
                              Add a reply
                            </label>
                            <textarea
                              value={
                                replyingToPostId === post._id
                                  ? replyContent
                                  : ""
                              }
                              onChange={(e) => {
                                setReplyError("");
                                setReplyingToPostId(post._id);
                                setReplyContent(e.target.value);
                              }}
                              className="mt-1 min-h-20 w-full rounded-lg border bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900"
                              placeholder="Write a reply..."
                            />
                            <button
                              type="button"
                              onClick={() => handleReply(post._id)}
                              disabled={replyingToPostId === post._id}
                              className="mt-2 rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white disabled:opacity-60"
                            >
                              {replyingToPostId === post._id
                                ? "Posting..."
                                : "Reply"}
                            </button>
                          </div>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
