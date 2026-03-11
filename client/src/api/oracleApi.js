import api from "./axios";

export const getCourses = async () => {
  const res = await api.get("/api/oracle/courses");
  return res.data;
};

export const getCourseById = async (courseId) => {
  const res = await api.get(`/api/oracle/courses/${courseId}`);
  return res.data;
};

export const getModulesByCourse = async (courseId) => {
  const res = await api.get(`/api/oracle/modules/course/${courseId}`);
  return res.data;
};

export const createModule = async (payload) => {
  const res = await api.post("/api/oracle/modules", payload);
  return res.data;
};

export const getEnrollments = async () => {
  const res = await api.get("/api/oracle/enrollments");
  return res.data;
};

export const getEnrollmentsByStudentId = async (studentId) => {
  const res = await api.get(`/api/oracle/enrollments/student/${studentId}`);
  return res.data;
};

export const getEnrollmentsByCourseId = async (courseId) => {
  const res = await api.get(`/api/oracle/enrollments/course/${courseId}`);
  return res.data;
};

export const getEnrollmentByStudentAndCourse = async (studentId, courseId) => {
  const enrollments = await getEnrollmentsByStudentId(studentId);
  const match = (enrollments || []).find(
    (e) => Number(e.COURSE_ID ?? e.course_id) === Number(courseId),
  );
  return match || null;
};

export const updateEnrollmentProgress = async (enrollmentId, payload) => {
  const res = await api.put(`/api/oracle/enrollments/${enrollmentId}`, payload);
  return res.data;
};

export const getStudentsByCourse = async (courseId) => {
  const res = await api.get(`/api/oracle/courses/${courseId}/students`);
  return res.data;
};

export const createEnrollment = async (payload) => {
  const res = await api.post("/api/oracle/enrollments", payload);
  return res.data;
};

export const createCourse = async (payload) => {
  const res = await api.post("/api/oracle/courses", payload);
  return res.data;
};
