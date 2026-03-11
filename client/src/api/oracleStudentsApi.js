/**
 * Oracle student API - admin management of students.
 * Uses shared axios instance (auth headers attached automatically).
 * Errors propagate with err.response.data.message for UI feedback.
 */
import api from "./axios";

export const getAllStudents = async () => {
  const res = await api.get("/api/oracle/students");
  return res.data;
};

export const getStudentById = async (id) => {
  const res = await api.get(`/api/oracle/students/${id}`);
  return res.data;
};

export const createStudent = async (data) => {
  const res = await api.post("/api/oracle/students", data);
  return res.data;
};

export const deleteStudent = async (id) => {
  const res = await api.delete(`/api/oracle/students/${id}`);
  return res.data;
};
