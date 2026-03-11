import api from "./axios";

export const getAllSubmissions = async () => {
  const res = await api.get("/api/submissions");
  return res.data;
};

export const getSubmissionsByStudent = async (studentId) => {
  const res = await api.get(`/api/submissions/student/${studentId}`);
  return res.data;
};

export const getSubmissionById = async (id) => {
  const res = await api.get(`/api/submissions/${id}`);
  return res.data;
};

export const getSubmissionsByCourse = async (courseId) => {
  const res = await api.get(`/api/submissions/course/${courseId}`);
  return res.data;
};

export const createSubmission = async (payload) => {
  const res = await api.post("/api/submissions", payload);
  return res.data;
};
