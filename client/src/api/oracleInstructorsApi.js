/**
 * Oracle instructor API - admin management of instructors.
 * Uses shared axios instance (auth headers attached automatically).
 * Errors propagate with err.response.data.message for UI feedback.
 */
import api from "./axios";

export const getAllInstructors = async () => {
  const res = await api.get("/api/oracle/instructors");
  return res.data;
};

export const getInstructorById = async (id) => {
  const res = await api.get(`/api/oracle/instructors/${id}`);
  return res.data;
};

export const createInstructor = async (data) => {
  const res = await api.post("/api/oracle/instructors", data);
  return res.data;
};

export const deleteInstructor = async (id) => {
  const res = await api.delete(`/api/oracle/instructors/${id}`);
  return res.data;
};
