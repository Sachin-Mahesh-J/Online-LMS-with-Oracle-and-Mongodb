import api from "./axios";

export const getAllReviews = async () => {
  const res = await api.get("/api/reviews");
  return res.data;
};

export const getReviewsByCourse = async (courseId) => {
  const res = await api.get(`/api/reviews/course/${courseId}`);
  return res.data;
};

export const createReview = async (payload) => {
  const res = await api.post("/api/reviews", payload);
  return res.data;
};
