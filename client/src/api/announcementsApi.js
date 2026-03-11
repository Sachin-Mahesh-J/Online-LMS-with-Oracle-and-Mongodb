import api from "./axios";

export const getAllAnnouncements = async () => {
  const res = await api.get("/api/announcements");
  return res.data;
};

export const getAnnouncementsByCourse = async (courseId) => {
  const res = await api.get(`/api/announcements/course/${courseId}`);
  return res.data;
};

export const getAnnouncementsByModule = async (moduleId) => {
  const res = await api.get(`/api/announcements/module/${moduleId}`);
  return res.data;
};

export const createAnnouncement = async (payload) => {
  const res = await api.post("/api/announcements", payload);
  return res.data;
};
