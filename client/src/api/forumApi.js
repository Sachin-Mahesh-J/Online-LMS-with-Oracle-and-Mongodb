import api from "./axios";

export const getAllForumPosts = async () => {
  const res = await api.get("/api/forum-posts");
  return res.data;
};

export const getForumPostsByCourse = async (courseId) => {
  const res = await api.get(`/api/forum-posts/course/${courseId}`);
  return res.data;
};

export const createForumPost = async (payload) => {
  const res = await api.post("/api/forum-posts", payload);
  return res.data;
};

export const addReplyToPost = async (postId, payload) => {
  const res = await api.post(`/api/forum-posts/${postId}/replies`, payload);
  return res.data;
};

export const getRepliesByPost = async (postId) => {
  const res = await api.get(`/api/forum-posts/${postId}/replies`);
  return res.data;
};
